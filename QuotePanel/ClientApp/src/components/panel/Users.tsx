import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Input, List, PageHeader, Select, Space, Table } from "antd";
import { useQuery, gql } from "@apollo/client";
import { QueryType, QueryTypeUsersArgs, UserType } from '../../generated/graphql'
import { RoleTag } from "../comps/DataTags";
import UsersTableDesktop from "../comps/desktop/UserTable";
import UsersTableMobile from "../comps/mobile/UserTable";

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




export const Users: React.FC<{ all?: boolean, isMobile?: boolean }> = ({ all, isMobile }) => {

    const [state, setState] = useState<{
        search?: string,
        role: number
        multipleSelect: UserType[]
    }>({
        search: "",
        multipleSelect: [],
        role: -1
    })
    const { data, loading } = useQuery<QueryType, QueryTypeUsersArgs>(all ? GET_USERS_ALL : GET_USERS, {
        variables: {
            forAdmin: all
        }
    })


    return <React.Fragment>
        <PageHeader
            ghost={true}
            title={!isMobile && "Users"}
            //subTitle={`Всего человек: ${state.pagination.showTotal}`}
            extra={[
                <Input
                key="search"
                    placeholder="Search"
                    onChange={e => {
                        setState({ ...state, search: e.target.value })
                    }}
                    style={{ width: 200 }} />,
                isMobile && <br/>,
                !all && <Select key="radioRoles" onSelect={(e) => setState({ ...state, role: e })} defaultValue={-1}>
                    <Select.Option value={-1}>All</Select.Option>
                    <Select.Option value={0}>User</Select.Option>
                    <Select.Option value={1}>GroupModer</Select.Option>
                    <Select.Option value={2}>GroupAdmin</Select.Option>
                </Select>,
                
                <Link key="link" to={all ? "/panel/admin/users/multiple" : "/panel/users/multiple"}>Multiple Actions</Link>
            ]}
        >
            {isMobile?
              <UsersTableMobile all={all} search={state.search} data={data} loading={loading} role={state.role}/>
            :<UsersTableDesktop all={all} search={state.search} data={data} loading={loading} role={state.role}/>}
        </PageHeader>
    </React.Fragment>

}

export default Users