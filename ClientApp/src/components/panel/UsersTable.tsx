import React, { ReactText, useState } from "react";
import { Redirect, useHistory, Switch, Route, Link } from "react-router-dom";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, PageHeader, Radio, Row, Space, Table, Tag } from "antd";
import { useQuery, gql } from "@apollo/client";
import { QueryType, QueryTypeUsersArgs, UserType } from '../../generated/graphql'
import Search from "antd/lib/transfer/search";
import { TablePaginationConfig } from "antd/lib/table";
import { SorterResult } from "antd/lib/table/interface";
import { RoleTag } from "../comps/DataTags";

const GET_USERS = gql`
query GetUsers {
  users {
    nodes {
      id
      name
      room
      role
      buildNumber
      group{
        id
        name
      }
    }
    totalCount
    pageInfo {
      endCursor
    }
  }
}`;

const GET_USERS_ALL = gql`
query GetUsers {
  users(forAdmin : true) {
    nodes {
      id
      name
      room
      buildNumber
      group{
        id
        name
      }
    }
    totalCount
    pageInfo {
      endCursor
    }
  }
}`;




export const UsersTable: React.FC<{ all?: boolean }> = ({ all }) => {

    const [state, setState] = useState<{
        search: string | undefined,
        role: number
        multipleSelect: UserType[]
    }>({
        search: "",
        multipleSelect: [],
        role: -1
    })
    const { data, loading, error, refetch } = useQuery<QueryType, QueryTypeUsersArgs>(all ? GET_USERS_ALL : GET_USERS, {
        variables: {
            forAdmin: all
        }
    })


    return <React.Fragment>
        <PageHeader
            ghost={true}
            title="Users"
            //subTitle={`Всего человек: ${state.pagination.showTotal}`}
            extra={[
                <Input
                key="search"
                    placeholder="Search"
                    onChange={e => {
                        setState({ ...state, search: e.target.value })
                    }}
                    style={{ width: 200 }} />,
                !all && <Radio.Group key="radioRoles" onChange={(e) => setState({ ...state, role: e.target.value })} defaultValue={-1} buttonStyle="solid">
                    <Radio.Button value={-1}>All</Radio.Button>
                    <Radio.Button value={0}>User</Radio.Button>
                    <Radio.Button value={1}>GroupModer</Radio.Button>
                    <Radio.Button value={2}>GroupAdmin</Radio.Button>
                </Radio.Group>,
                
                <Link key="link" to={all ? "/panel/admin/users/multiple" : "/panel/users/multiple"}>Multiple Actions</Link>
            ]}
        >
            <Table dataSource={data?.users?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
                //setState({...state, sorter, pagination})}} 
                rowKey="id"
                loading={loading}
                pagination={{ showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users` }}>
                <Table.Column key="name" title="Name" filteredValue={[state.search ?? ""]} onFilter={(value, record) =>
                    record.name.indexOf(value) !== -1 ||
                    record.room.toString().startsWith(value) ||
                    (all && record.buildNumber.startsWith(value))
                } dataIndex="name" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} />
                <Table.Column key="room" title="Room" dataIndex="room" sorter={(a: any, b: any) => a.room - b.room} />
                {all && <Table.Column key="buildNumber" title="House" dataIndex="buildNumber" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} />}
                {all && <Table.Column key="group" title="Group" dataIndex="group" sorter={(a: any, b: any) => a.name.localeCompare(b.name)} render={(value) => <Link to={`/panel/admin/group/${value.id}`}>{value.name}</Link>} />}
                {!all && <Table.Column key="role" title="Role" filteredValue={(state.role!=-1)?[state.role?.toString()]:null} dataIndex="role" filterMultiple={true} render={
                    role => (<RoleTag role={role} />)
                } onFilter={
                    (value, record: any) => record.role == value
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
        </PageHeader>
    </React.Fragment>

}

export default UsersTable