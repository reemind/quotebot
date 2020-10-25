import React, { useState } from "react";
import './Panel.sass'
import { Layout, Menu, Space, Col, Row, Button, Spin, Tag } from 'antd'
import { SettingOutlined, LogoutOutlined, DashboardOutlined, BorderlessTableOutlined, LoadingOutlined, SnippetsOutlined } from "@ant-design/icons";
import { Redirect, useHistory, Switch, Route } from "react-router-dom";
import UsersTable from "./UsersTable";
import User from './User'
import PostsTable from "./PostsTable";
import Post from "./Post";
import { gql, useQuery } from "@apollo/client";
import { QueryType } from "../../generated/graphql";
import Quote from "./Quote";
import Settings from "./Settings";
import Dash from "./Dash";
import MultipleActionsUsers from "./MultipleActionsUsers";
import { RoleTag } from "../comps/DataTags";
import GroupsTable from "./admin/GroupsTable";

const { Header, Content, Sider } = Layout;

const GET_PROFILE = gql`
query GetProfile
{
  profile{
    name
    role
  }
}
`;

type ItemType = {
    path: string,
    key: string,
}

const ContentItems: ItemType[] = [
    {
        path: "/panel/dash",
        key: "dash"
    },
    {
        path: "/panel/users",
        key: "users"
    },
    {
        path: "/panel/posts",
        key: "posts"
    },
    {
        path: "/panel/admin/users",
        key: "adm_users"
    },
    {
        path: "/panel/admin/dash",
        key: "adm_dash"
    },
    {
        key: "adm_groups",
        path: "/panel/admin/groups"
    }
]

const Panel: React.FC = (props) => {
    const [state, setState] = useState<{ collapsed: boolean }>({
        collapsed: false
    })
    const history = useHistory()

    const { data, loading, error } = useQuery<QueryType>(GET_PROFILE)

    if (!loading && data)
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={state.collapsed} onCollapse={(collapsed) => setState({ ...state, collapsed })}>
                    <Menu theme="dark" defaultSelectedKeys={ContentItems.filter(t => history.location.pathname.startsWith(t.path)).map(t => t.key)} mode="vertical" onClick={({ item, key }) => {
                        history.push(ContentItems.find(t => t.key === key)?.path ?? "")
                    }}>
                        <Menu.Item key="dash" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
                        <Menu.Item key="users" icon={<BorderlessTableOutlined />}>Users</Menu.Item>
                        <Menu.Item key="posts" icon={<SnippetsOutlined />}>Posts</Menu.Item>
                        {(data?.profile?.role ?? 0) > 2 &&
                            <Menu.SubMenu title="For Admins">
                                <Menu.Item key="adm_dash" icon={<DashboardOutlined />}>Dashboard</Menu.Item>
                                <Menu.Item key="adm_users" icon={<DashboardOutlined />}>Users</Menu.Item>
                                <Menu.Item key="adm_groups" icon={<DashboardOutlined />}>Groups</Menu.Item>

                            </Menu.SubMenu>
                        }
                    </Menu>
                </Sider>
                <Layout className="site-layout">
                    <Header style={{ padding: 0, alignItems: "end" }}>
                        <Row justify="center" gutter={[20, 24]} style={{ marginLeft: 20, marginRight: 20 }}>
                            <Col flex="auto" className="row-gutter">
                                <Space align="baseline" direction="horizontal">
                                    <h3 style={{ color: "white" }}>QuoteBot Panel</h3>
                                    <RoleTag role={data?.profile?.role ?? 0}/>
                                </Space>
                            </Col>
                            <Col flex="60px" className="row-gutter">
                                <Button shape="circle" onClick={() => history.push("/panel/settings")}><SettingOutlined /></Button>
                            </Col>
                            <Col flex="60px" className="row-gutter">
                                <Button shape="circle" onClick={() => history.push("/logout")}><LogoutOutlined /></Button>
                            </Col>
                        </Row>
                    </Header>
                    <Layout style={{ padding: '36px' }}>
                        <Content
                            className="site-layout-background"
                            style={{
                                padding: 24,
                                margin: 0,
                                minHeight: 280,
                            }}>
                            <Switch>
                                <Redirect exact from="/panel/" to="/panel/dash" />
                                <Route path="/panel/dash" component={() => <Dash />} />

                                <Route exact path="/panel/users" component={() => <UsersTable />} />
                                <Route path="/panel/user/:id" component={() => <User profileRole={data?.profile?.role ?? 0}/>} />
                                <Route path="/panel/users/multiple" component={() => <MultipleActionsUsers />} />

                                <Route path="/panel/posts" component={() => <PostsTable />} />
                                <Route path="/panel/post/:id" component={() => <Post />} />

                                <Route path="/panel/settings" component={(props) => <Settings {...props}/>} />


                                <Route path="/panel/admin/dash" component={() => <Dash all/>} />

                                <Route exact path="/panel/admin/users" component={() => <UsersTable all />} />
                                <Route path="/panel/admin/user/:id" component={() => <User all profileRole={data?.profile?.role ?? 0} />} />
                                <Route path="/panel/admin/users/multiple" component={() => <MultipleActionsUsers all/>} />

                                <Route path="/panel/admin/posts" component={() => <PostsTable all/>} />
                                <Route path="/panel/admin/post/:id" component={() => <Post />} />

                                <Route exact path="/panel/admin/groups" component={() => <GroupsTable />} />
                                <Route path="/panel/admin/group/add" component={(props) => <Settings all newGroup {...props} />} />
                                <Route path="/panel/admin/group/:id" component={(props) => <Settings all {...props}/>} />


                                <Route path="*" component={() => <h3>Not Found</h3>} />
                            </Switch>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        )

    return <Row style={{ minHeight: "100vh" }} align="middle" justify="center">
        <Col><LoadingOutlined style={{ fontSize: 64 }} /></Col>
    </Row>
}

export default Panel