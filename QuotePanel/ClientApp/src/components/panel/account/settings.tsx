import { useLazyQuery, useQuery } from '@apollo/client'
import { Button, message, Modal } from 'antd'
import React from 'react'
import { QueryType } from '../../../generated/graphql'
import { GET_LIFETIME_TOKEN, GET_PROFILE } from '../../../generated/queries'
import * as serviceWorker from "../../../serviceWorkerRegistration";


const AccountSettings: React.FC = () => {

    const { data, loading } = useQuery<QueryType>(GET_PROFILE)


    const [loadToken] = useLazyQuery<QueryType>(GET_LIFETIME_TOKEN, {
        onCompleted: (data) => Modal.info({
            title: 'Your lifetime token',
            content: (
                <div>
                    <p>{data.lifetimeToken}</p>
                    <Button onClick={() => {
                        localStorage["token"] = data.lifetimeToken
                    }}>Use in App</Button>
                </div>
            ),
            onOk() { },
        }),
        onError: () => message.error("Error")
    })

    return (<>
        {(data?.profile?.role ?? -1) >= 2 &&
                <Button onClick={() =>
                    loadToken()
                }>Lifetime token</Button>
        }
        <Button onClick={() => {
            serviceWorker.unregister();
            window.location.reload();
        }}>Update App</Button>
    </>)
}

export default AccountSettings