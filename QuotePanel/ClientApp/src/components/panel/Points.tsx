import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Input, InputNumber, message, Modal, PageHeader, Space, Table } from "antd";
import { useQuery, gql, useLazyQuery, useMutation } from "@apollo/client";
import { MutationType, QueryType, MutationTypeCreateQuotePointArgs } from '../../generated/graphql'
import { ClosedTag } from "../comps/DataTags";
import { GET_QUOTE_POINTS, GET_REPORTS } from '../../generated/queries';
import { isNumber } from "util";
import { CREATE_POINTS_REPORT } from "../../generated/mutations";
import { onError } from "@apollo/client/link/error";

export const Points: React.FC = () => {
    const history = useHistory()

    const [state, setState] = useState<{
        isOpen: boolean,
        reportId: number,
        point: number
    }>({
        isOpen: false,
        reportId: -1,
        point: 1
    })

    const { data, loading } = useQuery<QueryType>(GET_QUOTE_POINTS)

    const [loadReports, reportsData] = useLazyQuery<QueryType>(GET_REPORTS) 

    const [createPointReport] = useMutation<MutationType, MutationTypeCreateQuotePointArgs>(CREATE_POINTS_REPORT, {
        onCompleted: (data) => {
            if (data?.createQuotePoint) {
                message.success("Created")
                history.push("/panel/point/" + state.reportId)
            }
            else
                message.error("Error")
        },

        onError: () => {
            message.error("Error")
        }
    })


    return <>
        <PageHeader
            ghost={true}
            title="Points"
            //subTitle={`Всего человек: ${state.pagination.showTotal}`}
            extra={[
                <Button type="link" key="new" onClick={() => {
                loadReports();
                setState({ ...state, isOpen: true})
            }}>New</Button>
            ]}>
            <Table rowKey="id" dataSource={data?.quotePoints?.nodes ?? new Array()}
                loading={loading}
                pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} posts` }}>
                {/*<Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any, b: any) => a.id - b.id} />*/}
                <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.text.localeCompare(b.text)} />
                <Table.Column
                    width={42}
                    title="Action"
                    key="action"
                    render={(record) => (
                        <Space size="middle">
                            <Link to={"/panel/point/" + record.id}>View</Link>
                        </Space>
                    )}
                />
            </Table>
        </PageHeader>
        
        <Modal
            title="New"
            visible={state.isOpen}
            onCancel={() => setState({ ...state, isOpen: false })}
            onOk={() => {
                createPointReport({
                    variables: {
                        point: state.point,
                        reportId: state.reportId
                    } })
            }}
        >
            <InputNumber defaultValue={state.point} onChange={(val) => {
                if (isNumber(val))
                    setState({ ...state, point: val })
            }} />
            <Table rowKey="id" loading={reportsData.loading} rowSelection={{
                type: "radio",
                onSelect: (sel) => {
                    setState({ ...state, reportId: sel.id })
                },
            }} dataSource={reportsData.data?.reports?.nodes?.filter(t => t?.closed && !data?.quotePoints?.nodes?.find(rep => rep?.report?.id == t.id)) ?? new Array()}>
                <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any, b: any) => a.id - b.id} />
                <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} />
            </Table>
        </Modal>
        </>

}

export default Points