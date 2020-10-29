import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Space, Table, Tag } from "antd";
import { useQuery, gql } from "@apollo/client";
import { QueryType, QueryTypeGroupsArgs } from '../../../generated/graphql'

const GET_GROUPS = gql`
query GetGroups{
  groups {
    nodes {
      id
      groupId
      name
      enabled
      buildNumber
    }
  }
}`;


export const GroupsTable: React.FC = () => {
    const { data, loading } = useQuery<QueryType, QueryTypeGroupsArgs>(GET_GROUPS)
    console.log(data)
    return <React.Fragment>
    <PageHeader
      ghost={true}
      title="Groups"
      //subTitle={`Всего человек: ${state.pagination.showTotal}`}
      extra={<Link to="/panel/admin/group/add">Add Group</Link>}>
            <Table rowKey="id" dataSource={data?.groups?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
            //setState({...state, sorter, pagination})}} 
            loading={loading} 
            pagination={{showTotal : (total, range) => `${range[0]}-${range[1]} of ${total} posts`}}>
                <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any,b: any) => a.id - b.id}/>
                <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.text.localeCompare(b.text)} />
                <Table.Column key="enabled" dataIndex="enabled" sorter={(a: any, b: any) => a.name?.localeCompare(b.name) ?? 1}
                    render={(value) => <Tag color={value ? "green" : "red"}>{value ? "Enabled" : "Disabled"}</Tag>} />
                <Table.Column key="buildNumber" title="House" dataIndex="buildNumber" sorter={(a: any, b: any) => a.name?.localeCompare(b.name) ?? 1}/>
                <Table.Column
      width={36}
      title="Action"
      key="action"
      render={(record) => (
          <Space size="middle">
          <Link to={"/panel/admin/group/"+record.id}>View</Link>
        </Space>
      )}
    />
            </Table>
    </PageHeader>
    </React.Fragment>

}

export default GroupsTable