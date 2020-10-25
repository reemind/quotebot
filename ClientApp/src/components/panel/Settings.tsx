import { LoadingOutlined } from "@ant-design/icons";
import { gql, MutationTuple, useMutation, useQuery, useLazyQuery } from "@apollo/client"
import { Button, Col, Form, Input, message, PageHeader, Row, Switch } from "antd"
import { valueFromAST } from "graphql";
import React, { useState } from "react"
import { Link, RouteComponentProps } from "react-router-dom";
import { GroupInfoTypeInput, MutationType, MutationTypeUpdateGroupArgs, QueryType, QueryTypeGroupInfoArgs } from "../../generated/graphql";

const GET_GROUP_INFO = gql`
query GetGroupInfo($id : Int, $forAdmin: Boolean, $newGroup: Boolean) {
  groupInfo(id: $id, forAdmin: $forAdmin, newGroup: $newGroup) {
    name
    enabled
    keyboard
    groupId
    key
    secret
    token
    withFilter
    filterPattern
    buildNumber
  }
}
`;

const UPDATE_GROUP = gql`
mutation UpdateGroup($inputGroup: GroupInfoTypeInput, $id : Int, $forAdmin: Boolean, $newGroup: Boolean) {
  updateGroup(inputGroup: $inputGroup, id : $id, forAdmin: $forAdmin, newGroup: $newGroup)
}
`;

const successMes = () => {
    message.success('Success');
};

const errorMes = () => {
    message.error('Error');
};

interface RouterProps { // type for `match.params`
    id: string; // must be type `string` since value comes from the URL
}

interface GroupProps extends RouteComponentProps<RouterProps> {
    all?: boolean
    newGroup?: boolean
}


const Settings: React.FC<GroupProps> = ({ match, history, all, newGroup }) => {
    const id: number | undefined = all ? parseInt(match.params.id) : undefined

    const [state, setState] = useState<{ withFilter: boolean }>({ withFilter:false })

    const { data, loading, refetch } = useQuery<QueryType, QueryTypeGroupInfoArgs>(GET_GROUP_INFO, {
        variables: {
            forAdmin: all,
            id: id,
            newGroup
        },
        onCompleted: (dat) => setState({ ...state, withFilter: dat?.groupInfo?.withFilter ?? false })
    })

    const [update, mutData] = useMutation<MutationType, MutationTypeUpdateGroupArgs>(UPDATE_GROUP, {
        onCompleted: (value) => {
            if (value?.updateGroup)
                successMes()
            else
                errorMes()
            if (newGroup)
                history.goBack();
            else
            refetch?.()
        },
        onError: () => errorMes(),
        refetchQueries: ["GetGroups"]
    })

    if (!loading)
        return <React.Fragment>
            <PageHeader
                ghost={false}
                title={data?.groupInfo?.name}
                onBack={all ? (() => window.history.back()) : undefined}
                subTitle={`ID: ${data?.groupInfo?.groupId}`}
                extra={<a key="vkLink" target="_blank" rel="noopener noreferrer" href={"https://vk.com/public" + data?.groupInfo?.groupId}>Page</a>} />
            <Row style={{ minHeight: "100%" }} align="middle" justify="center">
                <Col span={8}>
                    <Form onFinish={values => {
                        update({
                            variables: {
                                inputGroup: {
                                    enabled: values.enabled,
                                    name: values.name,
                                    token: values.token,
                                    key: values.key,
                                    secret: values.secret ? values.secret : "",
                                    keyboard: values.keyboard,
                                    withFilter: values.withFilter,
                                    buildNumber: values.buildNumber,
                                    filterPattern: values.filterPattern,
                                    groupId: values.groupId ? parseInt(values.groupId) : undefined
                                },
                                id,
                                forAdmin: all,
                                newGroup
                            }
                        })
                    }}>
                        <Form.Item label="Name" name="name">
                            <Input placeholder="Name" required defaultValue={data?.groupInfo?.name ?? undefined} />
                        </Form.Item>
                        {newGroup && <Form.Item label="GroupId" name="groupId">
                            <Input placeholder="GroupId" required/>
                        </Form.Item>}
                        <Form.Item label="Building" name="buildNumber">
                            <Input placeholder="Building" required defaultValue={data?.groupInfo?.buildNumber ?? undefined} />
                        </Form.Item>
                        <Form.Item label="Token" name="token">
                            <Input placeholder="Token" type="text" required defaultValue={data?.groupInfo?.token ?? undefined} />
                        </Form.Item>
                        <Form.Item label="Key" name="key">
                            <Input placeholder="Key" required defaultValue={data?.groupInfo?.key ?? undefined} />
                        </Form.Item>
                        <Form.Item label="Secret" name="secret">
                            <Input placeholder="Secret" defaultValue={data?.groupInfo?.secret ?? undefined} />
                        </Form.Item>
                        <Form.Item name="enabled" label="Enabled" valuePropName="checked">
                            <Switch defaultChecked={data?.groupInfo?.enabled ?? false} />
                        </Form.Item>
                        <Form.Item name="keyboard" label="Enable Keyboard" valuePropName="checked">
                            <Switch defaultChecked={data?.groupInfo?.keyboard ?? false} />
                        </Form.Item>
                        <Form.Item name="withFilter" label="Enable Filter" valuePropName="checked">
                            <Switch onChange={(val) => setState({ ...state, withFilter: val })} defaultChecked={data?.groupInfo?.withFilter ?? false} />
                        </Form.Item>
                        <Form.Item hidden={!state.withFilter} name="filterPattern" label="Filter Pattern">
                            <Input defaultValue={data?.groupInfo?.filterPattern ?? "[”у]частвую"} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Save Changes</Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </React.Fragment>

    return <Row style={{ minHeight: "100%" }} align="middle" justify="center">
        <Col flex="center">
            <LoadingOutlined style={{ fontSize: 64 }} />
        </Col>
    </Row>
}

export default Settings