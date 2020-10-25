import React, { ReactText, useState } from "react";
import { Redirect, useHistory, Switch, Route, Link } from "react-router-dom";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, PageHeader, Space, Table, Tag } from "antd";
import { useQuery, gql } from "@apollo/client";
import { QueryType, QueryTypePostsArgs, QueryTypeUsersArgs, UserType } from '../../generated/graphql'
import Search from "antd/lib/transfer/search";
import { TablePaginationConfig } from "antd/lib/table";
import { SorterResult } from "antd/lib/table/interface";
import { RepostTag } from "../comps/DataTags";

const GET_POSTS = gql`
query GetPosts{
    posts {
        nodes {
            text
            id
            max
            deleted
            isRepost
        }
    }
}`;


export const PostsTable: React.FC<{ all?: boolean }> = ({ all }) => {
    const { data, loading, error } = useQuery<QueryType, QueryTypePostsArgs>(GET_POSTS)

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

export default PostsTable