import React, { ReactText, useState } from "react";
import { Redirect, Link, RouteComponentProps, withRouter } from "react-router-dom";
import { LoadingOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Button, Col, message, PageHeader, Row, Space, Table, Tag, Popconfirm, Modal, Dropdown, Menu } from "antd";
import { useQuery, gql, useMutation, useApolloClient, useLazyQuery } from "@apollo/client";
import { MutationType, MutationTypeCloseReportArgs, QueryType, QueryTypeUserArgs, QueryTypeReportCodeArgs, MutationTypeSendQrCodeArgs } from '../../generated/graphql'
import './User.sass'
import { SwitchVerification } from "./Quote";
import { ClosedTag, OutTag, RepostTag, VerifiedTag } from "../comps/DataTags";
import { GET_POST, GET_REPORT, GET_REPORT_CODE } from "../../generated/queries";
import { CLOSE_REPORT, EDIT_POST_INFO, NOTIFY_USERS, SEND_QR_CODE } from "../../generated/mutations";


const key = "Report"

const mesloading = () => {
    message.loading({ key, content: "Loading..." })
};
const mesError = () => {
    message.error({ key, content: "Error", duration: 2 })
};
const mesSuccess = () => {
    message.success({ key, content: "Success", duration: 2 })
};

const isEmpty = function (str) {
    return (str.length === 0 || !str.trim());
};

interface RouterProps { // type for `match.params`
    id: string; // must be type `string` since value comes from the URL
}

interface ReportProps extends RouteComponentProps<RouterProps> {
    // any other props (leave empty if none)
}

interface ReportState {
    QrVisible: boolean
}

export const Report: React.FC<ReportProps> = ({ match }) => {
    const id: number = parseInt(match.params.id)
    const [state, setState] = useState<ReportState>({
        QrVisible: false
    })

    const client = useApolloClient()
    const { data, loading, refetch } = useQuery<QueryType, QueryTypeUserArgs>(GET_REPORT, {
        variables: {
            id
        }
    })

    const [closeReport] = useMutation<MutationType, MutationTypeCloseReportArgs>(CLOSE_REPORT, {
        onCompleted: (dat) => {
            if (dat.closeReport)
                mesSuccess()
            else
                mesError()
            refetch()
        },
        onError: () => mesError()
    })

    const [sendCodes] = useMutation<MutationType, MutationTypeSendQrCodeArgs>(SEND_QR_CODE, {
        onCompleted: (dat) => {
            if (dat.sendQrCode)
                mesSuccess()
            else
                mesError()
        },
        onError: () => mesError()
    })

    const [getLink] = useLazyQuery<QueryType, QueryTypeReportCodeArgs>(GET_REPORT_CODE, {
        onCompleted: (dat) => {
            if (dat.reportCode) {
                const link = "https://vds.nexagon.ru/qrreader/" + dat.reportCode;
                message.destroy(key)
                Modal.info({
                    title: "Link",
                    content: (<a href={link}>{link}</a>)
                })
            }    
            else
                mesError()
        },
        onError: () => mesError()
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
                    data?.report?.closed ?
                        <ClosedTag closed /> :
                        <Dropdown
                            visible={state.QrVisible} onVisibleChange={(vis) => setState({ ...state, QrVisible: vis})}
                            overlay={(
                                <Menu onClick={(e) => {
                                    switch (e.key) {
                                        case "getLink":
                                            getLink({ variables: { id } });
                                            mesloading()
                                            break;
                                        case "sendCodes":
                                            sendCodes({ variables: { id } })
                                            mesloading()
                                            break;
                                    }
                                }}>
                                    <Menu.Item key="getLink">Get link</Menu.Item>
                                    <Menu.Item key="sendCodes">Send Qr-codes</Menu.Item>
                                </Menu>
                            )}><Button onClick={() => setState({ ...state, QrVisible: !state.QrVisible })}><QrcodeOutlined /></Button>
                        </Dropdown>,
                    (data?.report?.closed ?
                        <Button onClick={() => {
                            mesloading()
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