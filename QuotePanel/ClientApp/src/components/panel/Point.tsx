import React, { ReactText, useState } from "react";
import { Redirect, Link, RouteComponentProps, withRouter } from "react-router-dom";
import { LoadingOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Button, Col, message, PageHeader, Row, Space, Table, Tag, Popconfirm, Modal, Dropdown, Menu, InputNumber } from "antd";
import { useQuery, gql, useMutation, useApolloClient, useLazyQuery } from "@apollo/client";
import { KeyValuePairOfInt32AndDoubleInput, MutationType, MutationTypeChangePointsArgs, QueryType, QueryTypeQuotePointItemsArgs, QuotePointItemType } from '../../generated/graphql'
import './User.sass'
import { VerifiedTag } from "../comps/DataTags";
import { GET_QUOTE_POINT_ITEMS } from "../../generated/queries";
import { isNumber } from "util";
import { CHANGE_POINTS } from "../../generated/mutations";
import { onError } from "@apollo/client/link/error";
import GetReportButton from "../comps/GetReportButton";


const key = "Point"

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

export const Point: React.FC<ReportProps> = ({ match }) => {
    const id: number = parseInt(match.params.id)

    const [state, setState] = useState<{
        keyValuePairs: Map<number, number>
    }>({
        keyValuePairs: new Map<number, number>()
    })

    const { data, loading, refetch } = useQuery<QueryType, QueryTypeQuotePointItemsArgs>(GET_QUOTE_POINT_ITEMS, {
        variables: {
            reportId: id
        }
    })

    const [changePoints] = useMutation<MutationType, MutationTypeChangePointsArgs>(CHANGE_POINTS, {
        onCompleted: (data) => {
            if (data.changePoints) {
                mesSuccess()
            }
            else
                mesError();
        },
        onError: () => {
            mesError();
        },
        refetchQueries: ["GetQuotePointItems"]
    })

    if (!id || (data && !data?.quotePointItems))
        return <Redirect to="/panel/points" />

    if (!loading && data)
        return <React.Fragment>
            <PageHeader
                ghost={false}
                title={data?.quotePoint?.name}
                onBack={() => window.history.back()}
                extra={[
                    <Button key="save" type="primary" disabled={!state.keyValuePairs.size} onClick={() => {
                        changePoints({
                            variables: {
                                quotePointId: data?.quotePoint?.id ?? 0,
                                keyValuePairs: Array.from<[number, number], KeyValuePairOfInt32AndDoubleInput>(state.keyValuePairs,
                                    ([key, value]) => { return { key, value } })
                            }
                        })
                        mesloading()
                    }}>Save Changes</Button>,
                    <GetReportButton url={"/provider/point_report/" + data?.quotePoint?.id}
                        filename={"points_" + data?.quotePoint?.id}/>
                ]}
            >
            </PageHeader>
            <Table dataSource={data?.quotePointItems?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
                //setState({...state, sorter, pagination})}} 
                rowKey="id"
                loading={loading}
                pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users` }}>
                <Table.Column key="name" title="Name" dataIndex="user" render={(value) => <Link to={"/panel/user/" + value.id}>{value.name}</Link>} sorter={(a: any, b: any) => a.post.text.localeCompare(b.post.text)} />
                <Table.Column key="room" title="Room" dataIndex="user" render={(value) => value.room} sorter={(a: any, b: any) => a.post.max - b.post.max} />
                <Table.Column key="point" title="Point" render={(record: QuotePointItemType) =>
                (<InputNumber defaultValue={record.point} onChange={(value) => {
                        if(isNumber(value))
                            setState({ ...state, keyValuePairs: state.keyValuePairs.set(record?.id ,value) })
                    }} />)} />

            </Table>
        </React.Fragment>



    return <Row style={{ minHeight: "100%" }} align="middle" justify="center">
        <Col><LoadingOutlined style={{ fontSize: 64 }} /></Col>
    </Row>
}

export default withRouter(Point)