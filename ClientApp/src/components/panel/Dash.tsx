import { LoadingOutlined } from "@ant-design/icons";
import { gql, MutationTuple, useMutation, useQuery } from "@apollo/client"
import {Button, Col, Form, Input, message, PageHeader, Row, Space, Switch, Tag} from "antd"
import { valueFromAST } from "graphql";
import React, { useState } from "react"
import { Link } from "react-router-dom";
import { GroupInfoTypeInput, MutationType, MutationTypeUpdateGroupArgs, QueryType } from "../../generated/graphql";
import * as Chart from '@ant-design/charts'

const GET_DASHBOARD_INFO = gql`
query GetGroupInfo {
  groupInfo {
    name
    enabled
    groupId
  }
}
`;


const Dash : React.FC = (props) => {
    const {data, loading, error} = useQuery<QueryType>(GET_DASHBOARD_INFO)

    if(!loading)
    return <React.Fragment>
    <PageHeader
    ghost={false}
    title="Dashboard"
    subTitle={
        <Space>
            {data?.groupInfo?.name} 
            {data?.groupInfo?.enabled?<Tag color="green">Enabled</Tag>:<Tag color="red">Disabled</Tag>}
        </Space>}
    extra={<a key="vkLink" target="_blank" rel="noopener noreferrer" href={"https://vk.com/public"+data?.groupInfo?.groupId}>Page</a>}/>
    <Row align="middle" justify="center">
        <Col style={{height: "100%"}} span={12}>
            
        </Col>
        <Col span={12}>
            
        </Col>
    </Row>
    <Row align="middle" justify="center">
        <Col span={12}>

        </Col>
        <Col span={12}>
            
        </Col>
</Row>
    </React.Fragment>

    
    return <Row style={{minHeight: "100%"}} align="middle" justify="center">
        <Col span={6}>
            <LoadingOutlined style={{fontSize: 64}}/>
        </Col>
    </Row>
}

export default Dash