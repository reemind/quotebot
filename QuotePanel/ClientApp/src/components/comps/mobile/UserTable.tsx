import { Space, List } from "antd";
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
    <List dataSource={data?.users?.nodes?.filter(record => (record?.name?.indexOf(search ?? "") !== -1 ||
        record?.room.toString().startsWith(search ?? "") ||
        (all && record?.buildNumber?.startsWith(search ?? ""))) && (role === -1 || record?.role === role)) ?? new Array()}
                rowKey="id"
                loading={loading}
                pagination={{ simple: true }}
                renderItem={(item)=><List.Item actions={[<Link to={(all ? "/panel/admin/user/" : "/panel/user/") + item.id}>View</Link>]}>
                    <List.Item.Meta
                    title={item?.name}
                    description={all?`${item?.buildNumber}(${item?.room})`:item?.room}
                    />
                </List.Item>}>
    </List>
)

export default UsersTable