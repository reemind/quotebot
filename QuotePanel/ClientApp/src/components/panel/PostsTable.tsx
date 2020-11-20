import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Space, Table } from "antd";
import { useQuery, gql } from "@apollo/client";
import { QueryType, QueryTypePostsArgs } from '../../generated/graphql'
import { RepostTag } from "../comps/DataTags";
import { GET_POSTS_DETAILED } from "../../generated/queries";


export const Posts: React.FC<{ all?: boolean }> = ({ all }) => {
    const { data, loading } = useQuery<QueryType, QueryTypePostsArgs>(GET_POSTS_DETAILED)

    return <React.Fragment>
    <PageHeader
      ghost={true}
      title="Posts"
      //subTitle={`Всего человек: ${state.pagination.showTotal}`}
      extra={[
        
      ]}>
        <Table rowKey="id" dataSource={data?.posts?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
            //setState({...state, sorter, pagination})}} 
            loading={loading} 
            pagination={{showTotal : (total, range) => `${range[0]}-${range[1]} of ${total} posts`}}>
                <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any,b: any) => a.id - b.id}/>
                <Table.Column key="text" title="Text" dataIndex="text" sorter={(a: any, b: any) => a.text.localeCompare(b.text)}
                    render={(value, record) => <div>{record.isRepost && <RepostTag />}{value}</div>} />
                <Table.Column key="max" title="Max" dataIndex="max" sorter={(a: any,b: any) => a.max - b.max}/>
                <Table.Column
      width={36}
      title="Action"
      key="action"
      render={(record) => (
        <Space size="middle">
          <Link to={"/panel/post/"+record.id}>View</Link>
        </Space>
      )}
    />
            </Table>
    </PageHeader>
    </React.Fragment>

}

export default Posts