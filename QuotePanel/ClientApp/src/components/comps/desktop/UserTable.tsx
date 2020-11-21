import { Space, Table } from "antd";
import React, { FC } from "react";
import { Link } from "react-router-dom";
import { QueryType } from "../../../generated/graphql";
import { RoleTag } from "../DataTags";


type UsersTableProps = {
    data: QueryType | undefined, 
    loading: boolean, 
    all?: boolean, 
    search?: string, 
    role: number
}

const UsersTable : FC<UsersTableProps> = ({data, loading, role, all, search}) => (
    <Table dataSource={data?.users?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
                //setState({...state, sorter, pagination})}} 
                rowKey="id"
                loading={loading}
        pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users` }}>
        <Table.Column key="name" title="Name" filterMultiple filteredValue={[search ?? ""]} onFilter={(value, record) =>
                    record.name.indexOf(value) !== -1 ||
                    record.room.toString().startsWith(value) ||
                    (all && record.buildNumber.startsWith(value))
                } dataIndex="name" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} />
                <Table.Column key="room" title="Room" dataIndex="room" sorter={(a: any, b: any) => a.room - b.room} />
                {all && <Table.Column key="buildNumber" title="House" dataIndex="buildNumber" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} />}
                {all && <Table.Column key="group" title="Group" responsive={['md']} dataIndex="group" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} render={(value) => <Link to={`/panel/admin/group/${value.id}`}>{value.name}</Link>} />}
                {!all && <Table.Column key="role" title="Role" filteredValue={(role!==-1)?[role]:null} dataIndex="role" filterMultiple render={
                    role => (<RoleTag role={role} />)
                } onFilter={
                    (value, record: any) => record.role === value
                } />}
                <Table.Column
                    width={36}
                    title="Action"
                    key="action"
                    render={(record) => (
                        <Space size="middle">
                            <Link to={(all ? "/panel/admin/user/" : "/panel/user/") + record.id}>View</Link>
                        </Space>
                    )}
                />
            </Table>
)

export default UsersTable