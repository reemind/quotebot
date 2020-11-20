import { GroupResponseType, QueryType, QueryTypeAuthGroupsArgs } from '../generated/graphql'
import { GET_GROUPS_AUTH } from '../generated/queries'
import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Result } from 'antd'
import { Link } from 'react-router-dom'

type LoginProps = {
    callback: (response: GroupResponseType) => void
    code: string,
    redirectUri: string
}



export const Login: React.FC<LoginProps> = ({ callback, code, redirectUri }) => {
    const { data, loading, error } = useQuery<QueryType, QueryTypeAuthGroupsArgs>(GET_GROUPS_AUTH, { variables: { code: code, redirectUri: redirectUri } })
    if (!loading && data?.authGroups)
    {
        callback(data.authGroups)
    }

    return (loading ? <LoadingOutlined style={{ fontSize: 64 }} /> : (error?
        <Result
            status="error"
            title="Authorization Error"
            subTitle="Please, try again"
            extra={
                <Link to="/home">Back</Link>
            }
        />
        : <CheckCircleOutlined style = {{ fontSize: 64 }}/>))
}

