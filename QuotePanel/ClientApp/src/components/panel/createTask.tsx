import React, { useEffect, useState } from "react";
import { Link, RouteComponentProps, useHistory } from "react-router-dom";
import { Button, Col, DatePicker, Form, Input, message, PageHeader, Radio, Row, Space, Table, TimePicker } from "antd";
import { useQuery, gql, useLazyQuery, useMutation } from "@apollo/client";
import { MutationType, MutationTypeCreateTaskArgs, QueryType, QueryTypePostsArgs, QueryTypeReportArgs, QueryTypeReportsArgs, QueryTypeUsersArgs, ScheludedTaskType } from '../../generated/graphql'
import { ClosedTag, RepostTag, TaskTag } from "../comps/DataTags";
import { GET_POSTS, GET_REPORT, GET_REPORTS, GET_TASK, GET_TASKS, GET_USERS } from '../../generated/queries';
import { parseJsonText } from "typescript";
import { UsersTableTransfer } from "./MultipleActionsUsers";
import TextArea from "antd/lib/input/TextArea";
import { CREATE_TASK } from "../../generated/mutations";
import moment from "moment";
import { LoadingOutlined } from "@ant-design/icons";
import { Store } from "antd/lib/form/interface";
import { render } from "@testing-library/react";

interface RouterProps { // type for `match.params`
    id?: string; // must be type `string` since value comes from the URL
}

interface ReportProps extends RouteComponentProps<RouterProps> {
    // any other props (leave empty if none)
}

export const CreateTask: React.FC<ReportProps> = ({ match }) => {

    let id = Number.parseInt(match.params.id ?? "0")

    const history = useHistory()
    const [state, setState] = useState<{
        type: string,
        targetKeys: [],
        postId: number,
        reportId: number,
        initialValues?: Store
    }>({
        type: "0",
        targetKeys: [],
        postId: -1,
        reportId: -1,
    })


    const [form] = Form.useForm()

    useEffect(() => {
        form.setFieldsValue(state.initialValues)
    }, [form, state.initialValues])

    const [loadUsers, usersData] = useLazyQuery<QueryType, QueryTypeUsersArgs>(GET_USERS, {
        variables: {
        }
    })

    const [loadPosts, postsData] = useLazyQuery<QueryType, QueryTypePostsArgs>(GET_POSTS)
    const [loadReports, reportsData] = useLazyQuery<QueryType, QueryTypeReportsArgs>(GET_REPORTS)
    const [loadTask, taskData] = useLazyQuery<QueryType, QueryTypeReportArgs>(GET_TASK, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            let dataJson = JSON.parse(taskData.data?.task?.data ?? "{}")
            console.log(data.task)
            console.log(moment(taskData.data?.task?.startTime))
            setState({
                ...state,
                postId: dataJson.PostId ?? -1,
                reportId: dataJson.ReportId ?? -1,
                type: (data?.task?.taskType ?? 0).toString(),
                targetKeys: dataJson.UserIds,
                initialValues: {
                    message: dataJson.Message,
                    date: moment.utc(taskData.data?.task?.startTime).local(),
                    time: moment.utc(taskData.data?.task?.startTime).local()
                }
            })
        }
    })

    const [createTask] = useMutation<MutationType, MutationTypeCreateTaskArgs>(CREATE_TASK, {
        refetchQueries: ["GetTasks"],
        onCompleted: (data) => {
            if (data.createTask) {
                message.success("Added")
                history.goBack()
            }
            else
                message.error("Error")
        },
        onError: (error) => {
            message.error("Error")

        }
    })


    if (id && !taskData.called && !taskData.loading) {
        loadTask({ variables: { id } })
    }

    if (taskData.loading)
        return <Row style={{ minHeight: "100%" }} align="middle" justify="center">
            <Col><LoadingOutlined style={{ fontSize: 64 }} /></Col>
        </Row>

    if (state.type == "1" && !reportsData.called && !reportsData.loading)
        loadReports();
    if (state.type == "2" && !usersData.called && !usersData.loading)
        loadUsers();
    if (state.type == "0" && !postsData.called && !postsData.loading)
        loadPosts();

    const columns = [
        {
            dataIndex: 'name',
            title: 'Name',
            responsive: undefined,
            ellipsis: true
        },
        {
            dataIndex: 'room',
            title: 'Room',
            responsive: ['sm'],
            ellipsis: true
        }
    ]

    return <React.Fragment>
        <PageHeader
            ghost={false}
            title={taskData.data?.task?`Task with id=${taskData.data?.task?.id}`:"New Task"}
            onBack={() => window.history.back()}
        />
        <Row style={{ padding: 20 }} justify="center">
            <Col>
                <Radio.Group defaultValue="0" value={state.type} buttonStyle="solid"
                    onChange={(val) => setState({ ...state, type: val.target.value })}>
                    <Radio.Button value="0">Notify</Radio.Button>
                    <Radio.Button value="1">Close report</Radio.Button>
                    <Radio.Button value="2">Send message</Radio.Button>
                </Radio.Group>
                </Col>
        </Row>
        <Row justify="center">
            <Col>
                <Form
                    form={form}
                    initialValues={state.initialValues}
                    layout="vertical"
                    onFinish={values => {
                        values.date.set('hour', values.time.get('hour'))
                            .set('minute', values.time.get('minute'))
                            .set('second', values.time.get('second'))
                        if (values.time && values.date)
                            createTask({
                                variables: {
                                    id: id > 0?id:null,
                                    type: Number.parseInt(state.type),
                                    startTime: moment.utc(values.date).format('DD.MM.YYYY HH:mm:ss'),
                                    dataJson: JSON.stringify({
                                        postId: state.postId,
                                        userIds: state.targetKeys.map(t => Number.parseInt(t)),
                                        reportId: state.reportId,
                                        message: values.message
                                    })
                                } })
                    }}
                >
                    <Form.Item name="date" required label="Date" initialValue={state.initialValues?.date}>
                        <DatePicker />
                    </Form.Item>
                    <Form.Item name="time" required label="Time">
                        <TimePicker />
                </Form.Item>
                {state.type == "0" &&
                        <>
                            <Form.Item required label="Post">
                    <Table rowKey="id" loading={postsData.loading} rowSelection={{
                        type: "radio",
                        onSelect: (sel) => {
                            setState({ ...state, postId: sel.id })
                        },
                    }} dataSource={postsData.data?.posts?.nodes?.filter(t => !t?.isRepost) ?? new Array()}>
                        <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any, b: any) => a.id - b.id} />
                        <Table.Column key="text" title="Text" dataIndex="text" sorter={(a: any, b: any) => a.text.localeCompare(b.text)}
                            render={(value, record) => <div>{record.isRepost && <RepostTag />}{value}</div>} />
                    </Table>
                </Form.Item>
                    </>
                }
                    {state.type == "1" &&
                        <Form.Item required label="Report">
                        <Table rowKey="id" loading={reportsData.loading} rowSelection={{
                        type: "radio",
                        onSelect: (sel) => {
                            setState({ ...state, reportId: sel.id })
                        },
                    }} dataSource={reportsData.data?.reports?.nodes ?? new Array()}>
                        <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any, b: any) => a.id - b.id} />
                        <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.name.localeCompare(b.name)}/>
                        </Table>
                        </Form.Item>
                }
                {state.type == "2" &&
                    <>
                        <Form.Item label="Users" required>
                            <UsersTableTransfer
                                onChange={(nextTargetKeys) => setState({ ...state, targetKeys: nextTargetKeys })}
                                loading={usersData.loading}
                                targetKeys={state.targetKeys}
                                dataSource={usersData.data?.users?.nodes?.map(t => ({ ...t, key: t?.id })) ?? new Array()}
                                leftColumns={columns}
                                rightColumns={columns}
                                filterOption={(inputValue, item) =>
                                    item.name.indexOf(inputValue) !== -1 ||
                                    item.room.toString().startsWith(inputValue)
                                }
                                showSearch={true}>
                            </UsersTableTransfer>
                        </Form.Item>
                        <Form.Item required name="message" label="Message">
                            <Input.TextArea />
                        </Form.Item>
                    </>   
                }
                    <Button htmlType="submit">Create</Button>
                </Form>
            </Col>
        </Row>
    </React.Fragment>

}

export default CreateTask