import React, { useEffect, useState } from 'react';
import './App.sass';
import Panel from './components/panel/Panel';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom'
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { gql, useQuery } from '@apollo/client';
import { QueryType } from './generated/graphql';
import { message } from 'antd';
import { GET_PROFILE } from './generated/queries';
//import 'antd/dist/antd.css';




const App: React.FC = (props) => {
    const history = useHistory()

    const [state, setState] = useState<{ code: string, redirectUri: string, auth: boolean, tryAutoAuth: boolean, theme: string }>({
        code: "",
        redirectUri: "",
        auth: false,
        tryAutoAuth: false,
        theme: localStorage.getItem("theme") ?? "light"
    })

    const toggleTheme = () => {
        setState({ ...state, theme: state.theme === "dark" ? "light" : "dark" })
        localStorage.setItem("theme", state.theme)
        return state.theme
    }

    useQuery<QueryType>(GET_PROFILE, {
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
            {state.auth && <Redirect from="/home" to="/panel" />}
            <Route exact path="/home" component={() => <Home setAuthProps={(code, redirectUri) => setState({ ...state, code, redirectUri })} />} />
            <Route path="/auth" component={() => <Auth code={state.code} redirectUri={state.redirectUri} authResultHandler={(status) => {
                if (status === "success") {
                    setState({ ...state, auth: true })
                    history.push('/home')
                }
            }} />} />
            <Route path="/panel/" component={() => <Panel onToggleTheme={toggleTheme} theme={state.theme} />} />
            <Route exact path="/logout" component={() => {
                setState({ ...state, auth: false })
                localStorage["token"] = ""
                return <Redirect from="/logout" exact to="/home" />
            }} />
        </Switch>
    )
}

export default App;
