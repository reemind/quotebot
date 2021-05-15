import { LoadingOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { Col, Row, Typography } from 'antd'
import React from 'react'
import { QueryType } from '../../generated/graphql'
import { GET_PROFILE } from '../../generated/queries'

const { Title, Paragraph, Text, Link } = Typography;

const Help: React.FC = () => {
    const { data, loading } = useQuery<QueryType>(GET_PROFILE)

    if (!loading && data)
        return <Typography>
            <Title>Hi, {data?.profile?.name}</Title>
            <Paragraph>Это краткое руководство по QuoteSystem</Paragraph>
            <Paragraph>
                <ul>
                    <li>
                        <a target="_blank" href="https://vk.com/reemind">Мой профиль</a>
                    </li>
                    <li>
                        <a target="_blank" href="https://vk.com/quotebot_du">Группа бота</a>
                    </li>
                    <li>
                        <a target="_blank" href="https://vk.me/join/oJGHjbvx45FRoFpFuCssDM2yExDHEE4TxHE=">Ссылка на беседу</a>
                    </li>
                </ul>
            </Paragraph>
        </Typography>

    return <Row style={{ minHeight: "100vh" }} align="middle" justify="center">
        <Col><LoadingOutlined style={{ fontSize: 64 }} /></Col>
    </Row>
}

export default Help