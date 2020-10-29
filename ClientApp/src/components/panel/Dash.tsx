import { LoadingOutlined, UserOutlined, CheckOutlined } from "@ant-design/icons";
import { gql, useQuery } from "@apollo/client"
import { Col, PageHeader, Row, Space, Statistic, Select } from "antd"
import React, { useState } from "react"
import { QueryType, QueryTypeStatArgs } from "../../generated/graphql";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, AreaChart, ResponsiveContainer, } from 'recharts'
import { EnabledTag } from "../comps/DataTags";


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
    const [] = useState<{ group?: number }>()
    const { data, loading, refetch } = useQuery<QueryType, QueryTypeStatArgs>(all ? GET_DASHBOARD_INFO_ALL : GET_DASHBOARD_INFO)

    if (!loading)
        return <React.Fragment>
            <PageHeader
                ghost={false}
                title="Dashboard"
                subTitle={
                    <Space>
                        {data?.groupInfo?.name}
                        <EnabledTag enable={data?.groupInfo?.enabled ?? false} />
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

            <Row align="middle" justify="center" >
                <Col flex="12" md={12}>
                    <ResponsiveContainer height={250}>
                        <BarChart data={data?.stat?.statFloor?.map(t => t as object) ?? undefined}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="floor" />
                            <YAxis dataKey="count" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#fa541c" />
                        </BarChart>
                    </ResponsiveContainer>
                </Col>
                <Col flex="12" md={12}>
                    <ResponsiveContainer height={250}>
                        <AreaChart height={250} width={500} data={data?.stat?.statQuotes?.map(t => t as object) ?? undefined}>
                            <XAxis dataKey="date" />
                            <CartesianGrid strokeDasharray="3 3" />
                            <YAxis dataKey="count" />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="count" fill="#722ed1" />
                        </AreaChart>
                    </ResponsiveContainer>
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