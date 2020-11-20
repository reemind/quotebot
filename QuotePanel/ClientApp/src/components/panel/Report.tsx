import React, { ReactText, useState } from "react";
import { Redirect, Link, RouteComponentProps, withRouter } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Col, message, PageHeader, Row, Space, Table, Tag, Popconfirm } from "antd";
import { useQuery, gql, useMutation, useApolloClient } from "@apollo/client";
import { MutationType, MutationTypeCloseReportArgs, MutationTypeEditPostInfoArgs, MutationTypeNotifyUsersArgs, QueryType, QueryTypeUserArgs } from '../../generated/graphql'
import './User.sass'
import { SwitchVerification } from "./Quote";
import { ClosedTag, OutTag, RepostTag, VerifiedTag } from "../comps/DataTags";
import { GET_POST, GET_REPORT } from "../../generated/queries";
import { CLOSE_REPORT, EDIT_POST_INFO, NOTIFY_USERS } from "../../generated/mutations";


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

export const Report: React.FC<PostProps> = ({ match }) => {
    const id: number = parseInt(match.params.id)
    const [state, setState] = useState<{ max: number, drawer: boolean, name: string, selected: ReactText[] }>({
        max: 0,
        drawer: false,
        name: "",
        selected: []
    })

    const client = useApolloClient()
    const { data, loading, refetch } = useQuery<QueryType, QueryTypeUserArgs>(GET_REPORT, {
        variables: {
            id
        }
    })

    const [closeReport, mutData] = useMutation<MutationType, MutationTypeCloseReportArgs>(CLOSE_REPORT, {
        onCompleted: (dat) => {
            if (dat.closeReport)
                successMes()
            else
                errorMes()
            refetch()
        },
        onError: () => errorMes()
    })

    if (!id || (data && !data?.report))
        return <Redirect to="/panel/reports" />

    if (!loading && data)
        return <React.Fragment>
            <PageHeader
                ghost={false}
                title={data.report?.name ?? ""}
                subTitle={`${data.reportItems?.totalCount} of ${data.report?.max}`}
                onBack={() => window.history.back()}
                extra={[
                    ((data.reportItems?.totalCount ?? 1) >= (data.report?.max ?? 0)) && <Tag key="tag" color="blue">Full</Tag>,
                    data?.report?.closed && <ClosedTag closed />,
                    (data?.report?.closed ?
                        <Button onClick={() => {
                            fetch("/provider/report/" + data?.report?.id, {
                                method: 'GET',
                                headers: new Headers({
                                    "Authorization": "Bearer " + localStorage.getItem("token")
                                })
                            })
                                .then(response => response.blob())
                                .then(blob => {
                                    var url = window.URL.createObjectURL(blob);
                                    var a = document.createElement('a');
                                    a.href = url;
                                    a.download = "filename.xlsx";
                                    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                                    a.click();
                                    a.remove();  //afterwards we remove the element again         
                                });
                        }}>Make report</Button> :
                        <Popconfirm key="close" title="Do you sure?" placement="bottomRight" onConfirm={() => {
                        closeReport({ variables: { id } })
                    }}>
                        <Button danger>
                            Close
                        </Button>
                    </Popconfirm>),
                ]}
            >
                <p>Max: {data?.report?.max}</p>
            </PageHeader>
            <Table dataSource={data?.reportItems?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
                //setState({...state, sorter, pagination})}} 
                rowKey="id"
                loading={loading}
                pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users` }}>
                <Table.Column key="name" title="Name" dataIndex="user" render={(value) => <Link to={"/panel/user/" + value.id}>{value.name}</Link>} sorter={(a: any, b: any) => a.post.text.localeCompare(b.post.text)} />
                <Table.Column key="room" title="Room" dataIndex="user" render={(value) => value.room} sorter={(a: any, b: any) => a.post.max - b.post.max} />
                <Table.Column key="state" dataIndex="verified" render={value =>
                    <VerifiedTag verified={value} />
                } />


                {!data?.report?.closed && <Table.Column
                    title="Action"
                    key="action"
                    render={(record) => (
                        <Space size="middle">
                            <Button onClick={() => SwitchVerification(client, record.id, () => refetch())}>{record.verified ? "Refute" : "Confirm"}</Button>
                        </Space>
                    )}
                />}

            </Table>
        </React.Fragment>



    return <Row style={{ minHeight: "100%" }} align="middle" justify="center">
        <Col><LoadingOutlined style={{ fontSize: 64 }} /></Col>
    </Row>
}

export default withRouter(Report)