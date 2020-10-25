import { LoadingOutlined, UserOutlined, CheckOutlined } from "@ant-design/icons";
import { gql, MutationTuple, useMutation, useQuery, useLazyQuery } from "@apollo/client"
import { Button, Col, Form, Input, message, PageHeader, Row, Space, Switch, Tag, Statistic, Select } from "antd"
import { valueFromAST } from "graphql";
import React, { useState } from "react"
import { Link } from "react-router-dom";
import { QueryType, QueryTypeStatArgs } from "../../generated/graphql";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LineChart, Area, AreaChart, } from 'recharts'


const GET_DASHBOARD_INFO = gql`
query GetGroupInfo {
  groupInfo {
    name
    enabled
    groupId
  }
  stat{
    statFloor{
      floor
      count
      }
    statQuotes{
      date
      count
      }
  }
}
`;

const GET_DASHBOARD_INFO_ALL = gql`
query GetGroupsInfo($groupId: Int) {
    groupInfo(id: $groupId) {
        id
        name
        enabled
        groupId
      }
      stat(forAdmin: true, groupId: $groupId){
        statFloor{
          floor
          count
          }
        statQuotes{
          date
          count
          }
      }
  groups {
    nodes {
      id
      buildNumber
    }
  }
}`;


const Dash: React.FC<{ all?: boolean }> = ({ all }) => {
    const [state, setState] = useState<{ group?: number }>()
    const { data, loading, error, refetch } = useQuery<QueryType, QueryTypeStatArgs>(all ? GET_DASHBOARD_INFO_ALL : GET_DASHBOARD_INFO)

    if (!loading)
        return <React.Fragment>
            <PageHeader
                ghost={false}
                title="Dashboard"
                subTitle={
                    <Space>
                        {data?.groupInfo?.name}
                        {data?.groupInfo?.enabled ? <Tag color="green">Enabled</Tag> : <Tag color="red">Disabled</Tag>}
                    </Space>}
                extra={[
                    all && <Select
                        style={{ width: 200 }}
                        onChange={(value) => { refetch({ forAdmin: all, groupId: parseInt(value.toString()) }) }}
                        placeholder="Select group">
                        {data?.groups?.nodes?.map(t => <Select.Option value={t?.id?.toString() ?? ""}>{t?.buildNumber}</Select.Option>)}
                    </Select>,
                    <a key="vkLink" target="_blank" rel="noopener noreferrer" href={"https://vk.com/public" + data?.groupInfo?.groupId}>Page</a>
                ]} />
            
            <Row align="middle" justify="center">
                <Col>
                    <BarChart height={250} width={500} data={data?.stat?.statFloor?.map(t => t as object) ?? undefined}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="floor" />
                        <YAxis dataKey="count" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#fa541c" />
                    </BarChart>
                </Col>
                <Col>
                    <AreaChart height={250} width={500} data={data?.stat?.statQuotes?.map(t => t as object) ?? undefined}>
                        <XAxis dataKey="date" />
                        <CartesianGrid strokeDasharray="3 3" />
                        <YAxis dataKey="count" />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="count" fill="#722ed1" />
                    </AreaChart>
                </Col>
            </Row>
            <Row style={{ height: 200 }} gutter={60} align="stretch" justify="center">
                <Col>
                    <Statistic title="All users" value={data?.stat?.statFloor?.reduce((prev, curr) => prev += curr?.count ?? 0, 0)} prefix={<UserOutlined />} />
                </Col>
                <Col >

                </Col><Statistic title="All quotes" value={data?.stat?.statQuotes?.reduce((prev, curr) => prev += curr?.count ?? 0, 0)} prefix={<CheckOutlined />} />
            </Row>
        </React.Fragment>


    return <Row style={{ minHeight: "100%" }} align="middle" justify="center">
        <Col span={6}>
            <LoadingOutlined style={{ fontSize: 64 }} />
        </Col>
    </Row>
}

export default Dash