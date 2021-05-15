import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Space, Table } from "antd";
import { useQuery, gql } from "@apollo/client";
import { QueryType, ScheludedTaskType } from '../../generated/graphql'
import { TaskTag } from "../comps/DataTags";
import { GET_TASKS } from '../../generated/queries';
import moment from "moment";

function convertTaskType(task: ScheludedTaskType) {
    switch (task.taskType) {
        case 0:
            return `Notify post with id=${JSON.parse(task.data ?? "{}").PostId}`
        case 1:
            return `Close report with id=${JSON.parse(task.data ?? "{}").ReportId}`
        case 2:
            return `Send messages ${JSON.parse(task.data ?? "{}").UserIds.length} users`
    }
}

export const Tasks: React.FC = () => {

    const { data, loading } = useQuery<QueryType>(GET_TASKS)

    return (
        <PageHeader
            ghost={true}
            title="Tasks"
            //subTitle={`Всего человек: ${state.pagination.showTotal}`}
            extra={[
                <Link key="new" to="/panel/task">New</Link>
            ]}>
            <Table rowKey="id" dataSource={data?.tasks?.nodes ?? new Array()}
                loading={loading}
                pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} posts` }}>
                <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.text.localeCompare(b.text)}
                    render={(item, record) => (<p><TaskTag completed={record.completed} success={record.success} /> {convertTaskType(record)}</p>)} />
                <Table.Column key="startTime" title="Start time" dataIndex="startTime"
                    render={(tm) => moment.utc(tm).local().format("DD.MM.YYYY HH:mm:ss")} />
                <Table.Column key="comment" title="Comment" dataIndex="comment" />
                <Table.Column key="creator" title="Creator" dataIndex="creator" render={(item) => <Link to={"/panel/user/"+item.id}>{item.name}</Link>} />

                <Table.Column
                    width={42}
                    title="Action"
                    key="action"
                    render={(record) => (
                        <Space size="middle">
                            <Link to={"/panel/task/" + record.id}>View</Link>
                        </Space>
                    )}
                />
            </Table>
        </PageHeader>)

}

export default Tasks