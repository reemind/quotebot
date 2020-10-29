import { CSSProperties } from "react"
import { Tag } from "antd"
import React from "react"


export const RoleTag: React.FC<{ role: number, style?: CSSProperties }> = ({role, style}) => {
    switch (role) {
        case 0:
            return (<Tag style={style} color="green">User</Tag>)
        case 1:
            return (<Tag style={style} color="blue">Moder</Tag>)
        case 2:
            return (<Tag style={style} color="red">Admin</Tag>)
        case 3:
            return (<Tag style={style} color="blue">MainModer</Tag>)
        case 4:
            return (<Tag style={style} color="red">MainAdmin</Tag>)
        default:
            return <div></div>
    }
}

export const EnabledTag: React.FC<{ enable: boolean }> = ({ enable }) => {
    return (<Tag color={enable ? "green" : "red"}>{enable?"Enable":"Disable"}</Tag>)
}

export const OutTag: React.FC<{ isOut: boolean }> = ({ isOut }) => {
    return (<Tag color={isOut ? "red" : "green"}>{isOut ? "Out" : "In"}</Tag>)
}

export const RepostTag: React.FC = (props) => {
    return <Tag color="warning" {...props}>Repost</Tag>
}