import { GroupResponseType, QueryType, QueryTypeAuthGroupsArgs } from '../generated/graphql'
import VKLogin from 'react-vk-login-button'
import React, { useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { Result } from 'antd'
import { Link } from 'react-router-dom'

type LoginProps = {
    callback: (response: GroupResponseType) => void
    code: string,
    redirectUri: string
}

const GET_GROUPS = gql`
    query authGroups($code: String!, $redirectUri: String!){
        authGroups(code: $code, redirectUri: $redirectUri){
        token
        groups{
            id
            name
            role
        }
    }
}`;

export const Login: React.FC<LoginProps> = ({ callback, code, redirectUri }) => {
    const { data, loading, error } = useQuery<QueryType, QueryTypeAuthGroupsArgs>(GET_GROUPS, { variables: { code: code, redirectUri: redirectUri } })
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

