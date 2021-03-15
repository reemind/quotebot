import React, { FC } from 'react';
import { Layout, Menu } from 'antd';
import { Switch, Redirect, Route, useHistory } from 'react-router-dom';
import Queries from './Queries';

const { Header, Content, Footer } = Layout;

type ItemType = {
    path: string,
    key: string,
}

const ContentItems: ItemType[] = [
    {
        path: "/user/queries",
        key: "queries"
    },
    {
        path: "/user/reports",
        key: "reports"
    },
    {
        path: "/user/verified",
        key: "verified"
    },
]

const UserPanel: FC = (props) => {

    const history = useHistory();

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header>
                
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} onClick={({ key }) => {
                    history.push(ContentItems.find(t => t.key === key)?.path ?? "")
                }}>
                    <Menu.Item key="queries">In query</Menu.Item>
                    <Menu.Item key="reports">Meetups</Menu.Item>
                    <Menu.Item key="verified">Completed</Menu.Item>
                </Menu>
            </Header>
            <Layout style={{ padding: '36px' }} >
                <Content
                    className="site-layout-background"
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                    }}>
                    <Switch>
                        <Redirect exact from="/user/" to="/user/queries" />

                        <Route path="/user/queries" component={() => <Queries/>} />
                        <Route path="/user/reports" component={() => <Queries />} />
                        <Route path="/user/verified" component={() => <Queries />} />
                    </Switch>
                </Content>
                </Layout>
            <Footer style={{ textAlign: 'center' }}>help@nexagon.ru    QuoteSystem 2020 </Footer>
        </Layout>
    )
}

export default UserPanel