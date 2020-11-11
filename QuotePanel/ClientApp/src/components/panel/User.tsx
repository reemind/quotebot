import React, { useState } from "react";
import { Redirect, Link, RouteComponentProps, withRouter } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Input, message, PageHeader, Radio, Row, Space, Table, Modal } from "antd";
import { useQuery, gql, useMutation, useApolloClient, useLazyQuery } from "@apollo/client";
import { QueryType, QueryTypeUserArgs, MutationTypeEditUserInfoArgs, MutationType, QueryTypeUserRolesArgs, QueryTypeGroupsArgs, MutationTypeRemoveRoleArgs } from '../../generated/graphql'
import './User.sass'
import SwitchQuote from "./Quote";
import { OutTag, RoleTag } from "../comps/DataTags";

const GET_USER = gql`
query GetUser($id: Int!, $forAdmin: Boolean) {
    user(id: $id, forAdmin: $forAdmin) {
        id
        name
        room
        role
        vkId
    }
    qoutesByUser(id: $id, forAdmin: $forAdmin) {
        nodes {
            id
            isOut
            post {
                text,
                max
                id
            }
        }
    } 
}`;

const GET_GROUPS = gql`
query GetPosts{
    groups {
        nodes {
            id
            name
buildNumber
        }
    }
}
`;

const GET_ROLES = gql`
query GetRoles($id: Int!) {
  userRoles(id: $id) {
      id
      buildNumber
      role
  }
}
`;

const successMes = () => {
    message.success('Success');
};

const errorMes = () => {
    message.error('Error');
};

const EDIT_USER_TYPE = gql`
mutation EditUserType($id: Int!, $newType: Int, $newName: String, $forAdmin: Boolean, $groupId: Int) {
  editUserInfo(id: $id, newType: $newType, newName: $newName, forAdmin: $forAdmin, groupId: $groupId)
}`;

const DELETE_USER_ROLE = gql`
mutation RemoveRole($id: Int!) {
  removeRole(id: $id)
}`;

interface RouterProps { // type for `match.params`
    id: string; // must be type `string` since value comes from the URL
}

interface UserProps extends RouteComponentProps<RouterProps> {
    all?: boolean,
    profileRole: number
}

export const User: React.FC<UserProps> = ({ match, all, profileRole }) => {
    const id: number = parseInt(match.params.id)
    const [state, setState] = useState<{
        type: number,
        msg: boolean,
        maker: any,
        name: string,
        groupId: number,
        modal2Visible: boolean
    }>({
        type: -1,
        msg: false,
        maker: null,
        name: "",
        groupId: 0,
        modal2Visible: false
    })

    const client = useApolloClient()
    const { data, loading, refetch } = useQuery<QueryType, QueryTypeUserArgs>(GET_USER, {
        variables: {
            id: id,
            forAdmin: all
        }
    })

    const [loadGroups, groupsData] = useLazyQuery<QueryType, QueryTypeGroupsArgs>(GET_GROUPS)

    const [loadRoles, rolesData] = useLazyQuery<QueryType, QueryTypeUserRolesArgs>(GET_ROLES, {
        variables: {
            id
        }
    })

    if (all && !rolesData.called)
        loadRoles()

    const [editInfo, mutData] = useMutation<MutationType, MutationTypeEditUserInfoArgs>(EDIT_USER_TYPE, {
        onCompleted: (dat) => {
            if (dat.editUserInfo)
                successMes()
            else
                errorMes()
            refetch()
            if (all)
                rolesData?.refetch?.()
        },
        onError: () => errorMes(),
        refetchQueries: ["GetUsers"]
    })

    const [removeRole] = useMutation<MutationType, MutationTypeRemoveRoleArgs>(DELETE_USER_ROLE, {
        onCompleted: (dat) => {
            if (dat.removeRole)
                successMes()
            else
                errorMes()
            rolesData?.refetch?.()
        },
        onError: () => errorMes()
    })

    if (!id || (data && !data?.user))
        return <Redirect to={(all ? "/panel/admin/" : "/panel/") + "users"} />

    if (!loading && data)
        return <React.Fragment>
            <PageHeader
                ghost={false}
                title={<Input style={{ fontSize: 20 }} onChange={(e) => { if (e.target.value !== "") setState({ ...state, name: e.target.value }) }} bordered={false} defaultValue={data.user?.name ?? ""} />}
                onBack={() => window.history.back()}
                avatar={{ src: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png", shape: "circle" }}
                subTitle={`Комната: ${data.user?.room}`}
                extra={[
                    <a key="vkLink" target="_blank" rel="noopener noreferrer" href={`https://vk.com/id${data.user?.vkId}`}>Vk Profile</a>,
                    <Button type="primary" icon={mutData.loading && <LoadingOutlined />} key="2" disabled={(((state?.type ?? data.user?.role) === data.user?.role) && state.name === "") || mutData.loading} onClick={() => {
                        editInfo({
                            variables: {
                                id,
                                newType: state?.type ?? 0,
                                newName: state.name,
                                forAdmin: all
                            }
                        })
                    }}>Sibmit Changes</Button>,
                    <Button key="1">
                        Block
            </Button>,
                ]}
            >
                {!all ? <Radio.Group disabled={(data.user?.role ?? 0) >= profileRole} onChange={(e) => setState({ ...state, type: e.target.value })} defaultValue={data.user?.role} buttonStyle="solid">
                    <Radio.Button value={0}>User</Radio.Button>
                    <Radio.Button value={1}>GroupModer</Radio.Button>
                    <Radio.Button value={2}>GroupAdmin</Radio.Button>
                </Radio.Group> :
                    <Button onClick={() => {
                        setState({ ...state, modal2Visible: true })
                        loadGroups()
                    }}>Set Role</Button>}
            </PageHeader>
            <Row style={{ width: "100%" }} gutter={10}>
                <Col span={all?16:24}>
                    <Table dataSource={data?.qoutesByUser?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
                        //setState({...state, sorter, pagination})}} 
                        loading={loading}
                        rowKey="id"
                        pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users` }}>
                        <Table.Column key="state" dataIndex="isOut" render={value =>
                            <OutTag isOut={value}/>
                        } />
                        <Table.Column key="post" title="Post" dataIndex="post" render={(value) => <Link to={"/panel/post/" + value.id}>{value.text}</Link>} sorter={(a: any, b: any) => a.post.text.localeCompare(b.post.text)} />
                        <Table.Column key="max" title="Max" dataIndex="post" render={(value) => value.max} sorter={(a: any, b: any) => a.post.max - b.post.max} />

                        <Table.Column
                            title="Action"
                            key="action"
                            render={(record) => (
                                <Space size="middle">
                                    <Button onClick={() => SwitchQuote(client, record.id, () => refetch(), all)}>{record.isOut ? "MakeIn" : "MakeOut"}</Button>
                                </Space>
                            )}
                        />

                    </Table>
                </Col>
                {all && <Col span={8}>
                    <Table rowKey="id" loading={rolesData.loading} dataSource={rolesData.data?.userRoles ?? new Array()}>
                        <Table.Column key="buildNumber" title="House" dataIndex="buildNumber" sorter={(a: any, b: any) => a.text.localeCompare(b.text)} />
                        <Table.Column key="role" title="Role" dataIndex="role" render={(role) => <RoleTag role={role} />} />
                        <Table.Column key="delete" title="Action" render={(record) => <Button onClick={() => removeRole({ variables: { id: record.id} })}>Delete</Button>} />
                    </Table>
                </Col>}
            </Row>
            

            <Modal
                title="Add to Post"
                style={{ top: 20 }}
                visible={state.modal2Visible}
                onOk={() => {
                    if (state.groupId < 1)
                        message.warning("Select Group")
                    else {
                        setState({ ...state, modal2Visible: false })
                        editInfo({
                            variables: {
                                groupId: state.groupId,
                                newType: state.type,
                                forAdmin: all,
                                id
                            }
                        })
                    }
                }}
                onCancel={() => setState({ ...state, modal2Visible: false })}
            >
                <Radio.Group onChange={(e) => setState({ ...state, type: e.target.value })} buttonStyle="solid">
                    <Radio.Button value={0}>User</Radio.Button>
                    <Radio.Button value={1}>GroupModer</Radio.Button>
                    <Radio.Button value={2}>GroupAdmin</Radio.Button>
                    <Radio.Button value={3}>Moder</Radio.Button>
                    <Radio.Button value={4}>Admin</Radio.Button>
                </Radio.Group>
                <Table rowKey="id" loading={groupsData.loading} rowSelection={{
                    type: "radio",
                    onSelect: (sel) => {
                        setState({ ...state, groupId: sel.id })
                    }
                }} dataSource={groupsData.data?.groups?.nodes ?? new Array()}>
                    <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} />
                    <Table.Column key="buildNumber" title="House" dataIndex="buildNumber" sorter={(a: any, b: any) => a.buildNumber.localeCompare(b.buildNumber)} />
                </Table>
            </Modal>
        </React.Fragment>

    return <Row style={{ minHeight: "100%" }} align="middle" justify="center">
        <Col><LoadingOutlined style={{ fontSize: 64 }} /></Col>
    </Row>
}

//{ all && <Radio.Button value={3}>Moder</Radio.Button> }
//{ all && <Radio.Button value={4}>Admin</Radio.Button> }

export default withRouter(User)