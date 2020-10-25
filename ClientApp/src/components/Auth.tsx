import React, { useState } from 'react'
import './Auth.sass'
import { Grouplist } from './Grouplist'
import { gql, useQuery } from '@apollo/client'
import { Steps } from 'antd'
import { UnorderedListOutlined, LoginOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons'
import '../generated/graphql'
import { GroupResponseType, GroupType } from '../generated/graphql'
import { Login } from './Login'
import { AuthLoading } from './AuthLoading'
import { Redirect } from 'react-router-dom'
import App from '../App'



const steps : { title: string, key:number, icon: any}[] = [
    {
        title: "Login via Vk",
        key: 1,
        icon: <LoginOutlined/>
    },
    {
        title: "Select Group",
        key: 2,
        icon: <UnorderedListOutlined/>
    },
    {
        title: "Authorization",
        key: 3,
        icon: <SyncOutlined/>
    },
]

export class Auth extends React.Component<{
    code: string,
    redirectUri: string,
    authResultHandler: (status: "success" | "error") => void 
}, { current: number, content: any}>{

    state = {current: 1, content: <div></div>}


    constructor(props){
        super(props)

        this.loginCallback = this.loginCallback.bind(this)
        this.groupSelected = this.groupSelected.bind(this)
        this.authorized = this.authorized.bind(this)


        this.state = { ...this.state, 
            content: <Login callback={this.loginCallback} code={this.props.code} redirectUri={this.props.redirectUri}/>
        }
    }

    authorized(response: string) {
        localStorage["token"] = response
        this.setState({ current: 4 })
        this.props.authResultHandler("success")
    }

    groupSelected(id: number) {
        this.setState({ current: 3,
            content: <AuthLoading id={id} callback={this.authorized}></AuthLoading>,
        })
    }

    loginCallback(response: GroupResponseType){
        localStorage["token"] = response.token ?? ""

        if(response.groups)
        this.setState({ current: 2,
            content: <Grouplist groups={response.groups} callback={this.groupSelected}></Grouplist>
        })
    }

    render(){
        const {current} = this.state

        if (current > steps.length || !this.props.code || !this.props.redirectUri)
            return <Redirect from="/auth" to="/"></Redirect>

        return (
            <div className="back-color fullscreen">
                <Steps current={current-1}>
                    {steps.map((item) =>
                        <Steps.Step key={item.key} title={item.title} icon={
                            (current > item.key)?item.icon:<CheckCircleOutlined style={{font: "4em"}}></CheckCircleOutlined>
                            }/>)}
                </Steps>
                <div className="step-content">
                    {this.state.content}
                </div>
            </div>
            
        )
    }
}