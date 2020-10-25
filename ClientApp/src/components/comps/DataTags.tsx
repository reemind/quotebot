import { FC } from "react"
import { Tag } from "antd"
import React from "react"


export const RoleTag: React.FC<{ role: number }> = ({ role }) => {
    switch (role) {
        case 0:
            return (<Tag color="green">User</Tag>)
        case 1:
            return (<Tag color="blue">Moder</Tag>)
        case 2:
            return (<Tag color="red">Admin</Tag>)
        case 3:
            return (<Tag color="blue">MainModer</Tag>)
        case 4:
            return (<Tag color="red">MainAdmin</Tag>)
        default:
            return <div></div>
    }
}

export const OutTag: React.FC<{ isOut: boolean }> = ({ isOut }) => {
    return (<Tag color={isOut ? "red" : "green"}>{isOut?"Out":"In"}</Tag>)
}

export const RepostTag: React.FC = (props) => {
    return <Tag color="warning" {...props}>Repost</Tag>
}