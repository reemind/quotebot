import { QueryTypeTokenArgs } from '../generated/graphql'
import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { LoadingOutlined } from '@ant-design/icons'
import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'
import { GET_TOKEN } from '../generated/queries'

type AuthLoadingProps = {
    callback: (response: string) => void
    id: number,
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({ callback, id }) => {
    const {data, loading, error} = useQuery<{token: string},QueryTypeTokenArgs>(GET_TOKEN, { variables: { groupId: id } })

    if(!loading && data)
    {
        return <Result
            status="success"
            title="Successfully Logged In"
            subTitle="Now you can enter to Panel"
            extra={
                <Button type="primary" key="console" onClick={() => callback(data.token) }>
                    Go to Panel
                </Button>
            }
        />

    }

    if(!loading && error)
    {
        return <Result
            status="error"
            title="Authorization Error"
            subTitle="Please, try again"
            extra={
                <Link to="/home">Back</Link>
            }
        />

    }

    return <LoadingOutlined style={{fontSize: 64}}/>
}