import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Input, message, Modal, PageHeader, Space, Table, Tag } from "antd";
import { useQuery, gql, useLazyQuery, useMutation } from "@apollo/client";
import { QueryType, QueryTypeGroupsArgs, MutationTypeCreateFromTokenArgs, MutationType } from '../../../generated/graphql'
import { onError } from "@apollo/client/link/error";
import { GET_GROUPS_DETAILED } from "../../../generated/queries";
import { HANDLE_MASTER } from "../../../generated/mutations";
import { ClosedTag } from "../../comps/DataTags";


export const GroupsTable: React.FC = () => {
    const [state, setState] = useState<{ masterDialog: boolean, token?: string, id?: string }>({ masterDialog: false });
    const { data, loading } = useQuery<QueryType, QueryTypeGroupsArgs>(GET_GROUPS_DETAILED)
    const history = useHistory()

    const [handler, masterData] = useMutation<MutationType, MutationTypeCreateFromTokenArgs>(HANDLE_MASTER, {
        onCompleted: (dat) => {
            if (dat.createFromToken === 0)
                message.error("Error")
            else {
                message.success("Success")
                history.push(`/panel/admin/group/${dat.createFromToken}`)
            }
        },
        onError: () => {
            message.error("Error")
        }
    })

    const handleMaster = () => {
        if (!state.token || !state.id || (state.token && state.token.length < 10) || (state.id && state.id.length < 1))
            message.warn("Enter values")
        else {
            handler({
                variables: { token: state.token, groupName: state.id },
            })
            setState({ masterDialog: false })
        }
    }

    return <React.Fragment>
    <PageHeader
      ghost={true}
      title="Groups"
      //subTitle={`Всего человек: ${state.pagination.showTotal}`}
            extra={[
                <Button onClick={() => setState({ masterDialog: true })}>Add Master</Button>,
                <Link to="/panel/admin/group/add">Add Group</Link>
            ]}>
            <Table rowKey="id" dataSource={data?.groups?.nodes ?? new Array()} //onChange={(pagination, filters, sorter) => {
            //setState({...state, sorter, pagination})}} 
            loading={loading} 
            pagination={{showTotal : (total, range) => `${range[0]}-${range[1]} of ${total} posts`}}>
                <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any,b: any) => a.id - b.id}/>
                <Table.Column key="name" title="Name" dataIndex="name" sorter={(a: any, b: any) => a.text.localeCompare(b.text)} />
                <Table.Column key="enabled" dataIndex="enabled" sorter={(a: any, b: any) => a.name?.localeCompare(b.name) ?? 1}
                    render={(value) => <Tag color={value ? "green" : "red"}>{value ? "Enabled" : "Disabled"}</Tag>} />
                <Table.Column key="buildNumber" title="House" dataIndex="buildNumber" sorter={(a: any, b: any) => a.name?.localeCompare(b.name) ?? 1}/>
                <Table.Column
      width={36}
      title="Action"
      key="action"
      render={(record) => (
          <Space size="middle">
          <Link to={"/panel/admin/group/"+record.id}>View</Link>
        </Space>
      )}
    />
            </Table>
        </PageHeader>

        <Modal
            visible={state.masterDialog}
            title="Master"
            onOk={() => handleMaster()}
            onCancel={() => {
                setState({masterDialog: false})
            }}
            footer={[
                <Button key="back" onClick={() => {
                    setState({ masterDialog: false })
                }}>
                    Return
            </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => handleMaster()}>
                    Submit
            </Button>,
            ]}
        >
            <p>Group name or id:</p>
            <Input onChange={(e) => setState({ ...state, id: e.target.value })} />
            <p>Token:</p>
            <Input onChange={(e) => setState({ ...state, token: e.target.value })} />
        </Modal>
    </React.Fragment>

}

export default GroupsTable