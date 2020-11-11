import React, { ReactText, useState } from "react";
import { Redirect, Link, RouteComponentProps, withRouter } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Drawer, Input, InputNumber, message, PageHeader, Row, Space, Table, Tag } from "antd";
import { useQuery, gql, useMutation, useApolloClient } from "@apollo/client";
import { MutationType, MutationTypeEditPostInfoArgs, MutationTypeNotifyUsersArgs, QueryType, QueryTypeUserArgs } from '../../generated/graphql'
import './User.sass'
import SwitchQuote from "./Quote";
import { OutTag, RepostTag } from "../comps/DataTags";

const GET_POST = gql`
query GetPost($id: Int!) {
  post(id: $id) {
    id
    max
    text
    isRepost
  }
  qoutesByPost(id: $id) {
    nodes {
      id
      isOut
      user {
        name
        room
        id
      }
    }
    totalCount
  }
}
`;

const EDIT_POST_INFO = gql`
mutation EditPostMax($id: Int!, $newMax: Int, $newName: String) {
  editPostInfo(id: $id, newMax: $newMax, newName: $newName)
}`;

const NOTIFY_USERS = gql`
mutation NotifyUsers($postId: Int!, $quotesId: [Int!]) {
  notifyUsers(postId: $postId, quotesId: $quotesId)
}`;

const successMes = () => {
    message.success('Success');
};

const errorMes = () => {
    message.error('Error');
};

const isEmpty = function (str) {
    return (str.length === 0 || !str.trim());
};

interface RouterProps { // type for `match.params`
    id: string; // must be type `string` since value comes from the URL
}

interface PostProps extends RouteComponentProps<RouterProps> {
    // any other props (leave empty if none)
}

export const Post: React.FC<PostProps> = ({ match }) => {
    const id: number = parseInt(match.params.id)
    const [state, setState] = useState<{ max: number, drawer: boolean, name: string, selected: ReactText[] }>({
        max: 0,
        drawer: false,
        name: "",
        selected: []
    })

    const client = useApolloClient()
    const { data, loading, refetch } = useQuery<QueryType, QueryTypeUserArgs>(GET_POST, {
        variables: {
            id
        }
    })

    const [editInfo, mutData] = useMutation<MutationType, MutationTypeEditPostInfoArgs>(EDIT_POST_INFO, {
        onCompleted: (dat) => {
            if (dat.editPostInfo)
                successMes()
            else
                errorMes()
            refetch()
        },
        onError: () => errorMes()
    })

    const [notify] = useMutation<MutationType, MutationTypeNotifyUsersArgs>(NOTIFY_USERS, {
        onCompleted: (value) => {
            if (value?.notifyUsers)
                successMes()
            else
                errorMes()
            refetch()
        },
        onError: () => errorMes()
    })

    if (!id || (data && !data?.post))
        return <Redirect to="/panel/posts" />

    if (!loading && data)
        return <React.Fragment>
            <PageHeader
                ghost={false}
                title={<Input key="name" style={{ fontSize: 20 }} onChange={(e) => { if (e.target.value !== "") setState({ ...state, name: e.target.value }) }} bordered={false} defaultValue={data.post?.text ?? ""} />}
                subTitle={`${data.qoutesByPost?.totalCount} of ${data.post?.max}`}
                onBack={() => window.history.back()}
                extra={[
                    data?.post?.isRepost && <RepostTag />,
                    ((data.qoutesByPost?.totalCount ?? 1) >= (data.post?.max ?? 0)) && <Tag key="tag" color="blue">Full</Tag>,
                    <Button type="primary" disabled={(state.max === 0 || data?.post?.max === state.max) && (isEmpty(state.name) || state.name === data?.post?.text)} icon={mutData.loading && <LoadingOutlined />} key="submit" onClick={() => {
                        editInfo({
                            variables: {
                                id,
                                newMax: state?.max ?? 0,
                                newName: state.name
                            }
                        })
                    }}>Sibmit Changes</Button>,
                    <Button disabled={data?.post?.isRepost} key="notify" onClick={() => {
                        setState({ ...state, drawer: true, selected: [] })
                    }}>
                        Notify
            </Button>,
                ]}
            >
                <Space align="baseline" size="large">
                    <p>Max: </p>
                    <InputNumber defaultValue={data.post?.max} min={0} max={200} step={1} onChange={(value: any) => setState({ ...state, max: parseInt(value) })} />
                </Space>
            </PageHeader>
            <Table dataSource={data?.qoutesByPost?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
                //setState({...state, sorter, pagination})}} 
                rowKey="id"
                loading={loading}
                pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users` }}>
                <Table.Column key="name" title="Name" dataIndex="user" render={(value) => <Link to={"/panel/user/" + value.id}>{value.name}</Link>} sorter={(a: any, b: any) => a.post.text.localeCompare(b.post.text)} />
                <Table.Column key="room" title="Room" dataIndex="user" render={(value) => value.room} sorter={(a: any, b: any) => a.post.max - b.post.max} />
                <Table.Column key="state" dataIndex="isOut" render={value =>
                    <OutTag isOut={value} />
                } />


                <Table.Column
                    title="Action"
                    key="action"
                    render={(record) => (
                        <Space size="middle">
                            <Button onClick={() => SwitchQuote(client, record.id, () => refetch())}>{record.isOut ? "MakeIn" : "MakeOut"}</Button>
                        </Space>
                    )}
                />

            </Table>
            <Drawer
                title="Select Users"
                width={720}
                onClose={() => setState({ ...state, drawer: false })}
                visible={state.drawer}
                bodyStyle={{ paddingBottom: 80 }}
                footer={
                    <div
                        style={{
                            textAlign: 'right',
                        }}
                    >
                        {`Total: ${state.selected.length}   `}
                        <Button onClick={() => setState({ ...state, drawer: false })} style={{ marginRight: 8 }}>
                            Cancel
              </Button>
                        <Button onClick={() => {
                            if (state.selected.length === 0)
                                message.warning("Select Users")
                            else {
                                setState({ ...state, drawer: false })
                                notify({ variables: { postId: data?.post?.id ?? 0, quotesId: state.selected.map(t => parseInt(t.toString())) } })
                            }

                        }} type="primary">
                            Notify
              </Button>
                    </div>
                }
            >
                <Table dataSource={data?.qoutesByPost?.nodes?.filter(t => !t?.isOut) ?? new Array()} rowKey={record => record.id}
                    loading={loading}
                    pagination={false}
                    rowSelection={{
                        type: "checkbox",
                        selectedRowKeys: state.selected,
                        onChange: (sel) => setState({ ...state, selected: sel }),
                        selections: [{
                            key: 'auto',
                            text: 'Auto Select',
                            onSelect: (changableRowKeys) => {
                                let rows = data?.qoutesByPost?.nodes?.filter(t => !t?.isOut)
                                    .map(t => (t?.id.toString() ?? "")).slice(0, data?.post?.max ?? 1)
                                setState({
                                    ...state, selected: changableRowKeys.filter(key => rows?.find(t => t === key.toString()))
                                })
                            },
                        },]
                    }}>
                    <Table.Column key="name" title="Name" dataIndex="user" render={(value) => <Link to={"/panel/user/" + value.id}>{value.name}</Link>} sorter={(a: any, b: any) => a.post.text.localeCompare(b.post.text)} />
                    <Table.Column key="room" title="Room" dataIndex="user" render={(value) => value.room} sorter={(a: any, b: any) => a.post.max - b.post.max} />
                </Table>
            </Drawer>
        </React.Fragment>



    return <Row style={{ minHeight: "100%" }} align="middle" justify="center">
        <Col><LoadingOutlined style={{ fontSize: 64 }} /></Col>
    </Row>
}

export default withRouter(Post)