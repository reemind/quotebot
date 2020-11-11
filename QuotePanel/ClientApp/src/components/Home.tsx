import React from "react";
import { useHistory } from "react-router-dom";
import VKLogin from 'react-vk-login-button'
import { Row, Col } from 'antd'


export const Home: React.FC<{ setAuthProps: (code, redirect) => void }> = ({ setAuthProps }) => {
    const history = useHistory()

    return (
        <div style={{ minHeight: '100vh' }} className="du-about">
            <Row>
                <Col span={6}>
                    <div className="logo"/>
                </Col>
            </Row>
            <Row >
                
            </Row>
            <Row justify="center">
                <Col>
                <VKLogin
                clientId='7423484'
                callback={({ code, redirectUri }) => {
                    setAuthProps(code, redirectUri)
                    history.push("/auth")
                }}
                redirect
                render={renderProps => (
                    <div className="vk-button" onClick={renderProps.onClick}>
                        Login via <img src="./img/iconfinder_vkontakte_306170.svg" alt=""></img>
                    </div>
                )}></VKLogin>
                </Col>
            </Row>
        </div>)
}