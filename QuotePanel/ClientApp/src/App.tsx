import React, { useEffect, useState } from 'react';
import Panel from './components/panel/Panel';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom'
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { gql, useQuery } from '@apollo/client';
import { QueryType } from './generated/graphql';
import { message } from 'antd';
import { GET_PROFILE } from './generated/queries';
import QrReaderForm from './components/QrReader';
import * as serviceWorker from "./serviceWorkerRegistration";

import './App.less';
import UserPanel from './components/userpanel/Panel';
//import 'antd/dist/antd.css';

//if (window.matchMedia("(prefers-color-scheme: dark)").matches)
//    require('./App.dark.less')
//else
//    require('./App.less')

interface AppState {
    code: string,
    redirectUri: string,
    auth: boolean,
    tryAutoAuth: boolean
}

serviceWorker.register({
    onUpdate: registration => {
        if (window.confirm("New version available!  Ready to update?")) {
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        }
    }
});


const App: React.FC = (props) => {
    const history = useHistory()

    const [state, setState] = useState<AppState>({
        code: "",
        redirectUri: "",
        auth: false,
        tryAutoAuth: false
    })

    //useEffect(() => {
    //    serviceWorker.register({
    //        onUpdate: registration => {
    //            Modal.info({
    //                content: "New version available!  Ready to update?",
    //                title: "Update",
    //                onOk: () => {
    //                    if (registration && registration.waiting) {
    //                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    //                    }
    //                    window.location.reload();
    //                }
    //            })  
    //        }
    //    });
    //}, [])

    const { loading, data } = useQuery<QueryType>(GET_PROFILE, {
        onCompleted: (value) => {
            setState({ ...state, tryAutoAuth: true, auth: true })
            message.info(`Dear ${value?.profile?.name}. Welcome back!`)
        },
        onError: () => {
            setState({ ...state, tryAutoAuth: true, auth: false })
            console.log("False")
        }
    })
    return (
        <Switch>
            <Redirect from="/" exact to="/home" />
            {state.auth && (data?.profile?.role == 0 ?? <Redirect from="/home" to="/user" />)}
            {state.auth && <Redirect from="/home" to="/panel" />}
            <Route exact path="/home" component={() => <Home setAuthProps={(code, redirectUri) => setState({ ...state, code, redirectUri })} />} />
            <Route path="/auth" component={() => <Auth code={state.code} redirectUri={state.redirectUri} authResultHandler={(status) => {
                if (status === "success") {
                    setState({ ...state, auth: true })
                    history.push('/home')
                }
            }} />} />
            <Route path="/panel/" component={() => <Panel/>} />
            <Route path="/user/" component={() => <UserPanel />} />
            <Route exact path="/logout" component={() => {
                setState({ ...state, auth: false })
                localStorage["token"] = ""
                return <Redirect from="/logout" exact to="/home" />
            }} />

            <Route path="/qrreader/:reportId" component={(props) => <QrReaderForm {...props} />} />

            <Redirect to="/home" />
        </Switch>
    )
}

export default App;
