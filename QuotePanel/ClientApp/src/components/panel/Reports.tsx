import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Space, Table } from "antd";
import { useQuery, gql } from "@apollo/client";
import { QueryType } from '../../generated/graphql'
import { ClosedTag, RepostTag } from "../comps/DataTags";
import { GET_REPORTS } from '../../generated/queries';

export const Reports: React.FC = () => {
    const { data, loading } = useQuery<QueryType>(GET_REPORTS)

    return <React.Fragment>
        <PageHeader
            ghost={true}
            title="Reports"
            //subTitle={`Всего человек: ${state.pagination.showTotal}`}
            extra={[

            ]}>
            <Table rowKey="id" dataSource={data?.reports?.nodes ?? new Array()}
                loading={loading}
                pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} posts` }}>
                <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any, b: any) => a.id - b.id} />
                <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.text.localeCompare(b.text)}
                    render={(item, record) => (<p><ClosedTag closed={record.closed} /> {record.name}</p>)}/>
                <Table.Column key="max" title="Max" dataIndex="max" sorter={(a: any, b: any) => a.max - b.max} />
                <Table.Column
                    width={42}
                    title="Action"
                    key="action"
                    render={(record) => (
                        <Space size="middle">
                            {!record.closed && <Link to={"/panel/post/" + record.fromPost.id}>Post</Link>}
                            <Link to={"/panel/report/" + record.id}>View</Link>
                        </Space>
                    )}
                />
            </Table>
        </PageHeader>
    </React.Fragment>

}

export default Reports