import { useQuery } from '@apollo/client';
import { Col, List, Row, Table } from 'antd';
import React, { FC } from 'react';
import { QueryType } from '../../generated/graphql';
import { USER_GET_QUERIES } from '../../generated/queries';
import { OutTag } from '../comps/DataTags';


const Queries: FC = () => {
    console.log("Queries")
    const { loading, data } = useQuery<QueryType>(USER_GET_QUERIES)

    return (
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
            <Col span={8}>
                <h2>Application for participation:</h2>
                <List
                    itemLayout="horizontal"
                    dataSource={data?.userInfo?.quotes ?? []}
                    renderItem={item => (
                        <List.Item key={item?.id}>
                            <List.Item.Meta
                                title={item?.post?.text}
                            />
                        </List.Item>
                    )}
                />
            </Col>
            <Col span={8} >
                <h2>Participation:</h2>
                <List
                    itemLayout="horizontal"
                    dataSource={data?.userInfo?.reportItems?.filter((t) => !t?.closed ?? false) ?? []}
                    renderItem={item => (
                        <List.Item key={item?.id}>
                            <List.Item.Meta
                                title={item?.fromPost?.text}
                            />
                        </List.Item>
                    )}
                />
            </Col>
            <Col span={8} >
                <h2>Past:</h2>
                <List
                    itemLayout="horizontal"
                    dataSource={data?.userInfo?.reportItems?.filter((t) => t?.closed ?? false) ?? []}
                    renderItem={item => (
                        <List.Item key={item?.id}>
                            <List.Item.Meta
                                title={item?.fromPost?.text}
                            />
                        </List.Item>
                    )}
                />
            </Col>
        </Row>
    )
}

export default Queries;