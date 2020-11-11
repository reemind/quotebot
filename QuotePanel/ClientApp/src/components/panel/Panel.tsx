import React, { useState } from "react";
import './Panel.sass'
import { Layout, Menu, Space, Col, Row, Button } from 'antd'
import { SettingOutlined, LogoutOutlined, DashboardOutlined, BorderlessTableOutlined, LoadingOutlined, SnippetsOutlined, MenuOutlined } from "@ant-design/icons";
import { Redirect, useHistory, Switch, Route } from "react-router-dom";
import Users from "./Users";
import User from './User'
import PostsTable from "./PostsTable";
import Post from "./Post";
import { gql, useQuery } from "@apollo/client";
import { QueryType } from "../../generated/graphql";
import Settings from "./Settings";
import Dash from "./Dash";
import MultipleActionsUsers from "./MultipleActionsUsers";
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


const Panel: React.FC = () => {
    const [state, setState] = useState<{ collapsed: boolean }>({
        collapsed: false
    })
    const history = useHistory()

    const isMobile = window.innerWidth < 560;


    const { data, loading } = useQuery<QueryType>(GET_PROFILE)

    if (!loading && data)
        return (
            <Layout style={{ minHeight: '100vh'}}>
                <Sider collapsible breakpoint="lg" collapsed={state.collapsed} onCollapse={(collapsed) => setState({ collapsed })} collapsedWidth="0" trigger={null}>
                            <div className="logo"/>
                    <Menu theme="dark" defaultSelectedKeys={ContentItems.filter(t => history.location.pathname.startsWith(t.path)).map(t => t.key)} mode="vertical" onClick={({ key }) => {
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
                    <Header className="site-layout-sub-header-background" style={{ padding: 0, alignItems: "end", backgroundColor: "white"}}>
                        <Row justify="center" gutter={[20, 24]} style={{ marginLeft: 20, marginRight: 20 }}>
                        <Col flex="60px" className="row-gutter">
                        <MenuOutlined onClick={() => setState({ collapsed: !state.collapsed })}/>
                        </Col>
                            <Col flex="auto" className="row-gutter">
                                <Space align="baseline" direction="horizontal">
                                    
                                    <h3>QuoteBot Panel</h3>
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

                                <Route exact path="/panel/users" component={() => <Users isMobile={isMobile}/>} />
                                <Route path="/panel/user/:id" component={() => <User profileRole={data?.profile?.role ?? 0} />} />
                                <Route path="/panel/users/multiple" component={() => <MultipleActionsUsers />} />

                                <Route path="/panel/posts" component={() => <PostsTable />} />
                                <Route path="/panel/post/:id" component={() => <Post />} />

                                <Route path="/panel/settings" component={(props) => <Settings {...props} />} />


                                <Route path="/panel/admin/dash" component={() => <Dash all />} />

                                <Route exact path="/panel/admin/users" component={() => <Users all isMobile={isMobile} />} />
                                <Route path="/panel/admin/user/:id" component={() => <User all profileRole={data?.profile?.role ?? 0} />} />
                                <Route path="/panel/admin/users/multiple" component={() => <MultipleActionsUsers all />} />

                                <Route path="/panel/admin/posts" component={() => <PostsTable all />} />
                                <Route path="/panel/admin/post/:id" component={() => <Post />} />

                                <Route exact path="/panel/admin/groups" component={() => <GroupsTable />} />
                                <Route path="/panel/admin/group/add" component={(props) => <Settings all newGroup {...props} />} />
                                <Route path="/panel/admin/group/:id" component={(props) => <Settings all {...props} />} />


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