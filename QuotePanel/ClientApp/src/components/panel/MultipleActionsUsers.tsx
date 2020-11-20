import React, { useState } from "react";
import { Button, message, Modal, PageHeader, Table, Transfer } from "antd";
import { useQuery, gql, useMutation, useLazyQuery } from "@apollo/client";
import { MutationType, MutationTypeSendUsersArgs, QueryType, QueryTypeUsersArgs, QueryTypePostsArgs, MutationTypeAddUsersToPostArgs } from '../../generated/graphql'
import difference from 'lodash/difference';
import TextArea from "antd/lib/input/TextArea";
import { RepostTag } from "../comps/DataTags";
import { GET_POSTS, GET_USERS } from "../../generated/queries";

const SEND_MESSAGE_USERS = gql`
mutation SendMessageUsers($message: String!, $usersIds: [Int!], $forAdmin: Boolean) {
    sendUsers(message: $message, usersIds: $usersIds, forAdmin: $forAdmin)
}`;

const ADD_USERS_TO_POST = gql`
mutation AddUsersToPost($postId: Int!, $usersIds: [Int!]) {
    addUsersToPost(postId: $postId, usersIds: $usersIds)
}`;

const successMes = (mess: string = "Success") => {
    message.success(mess);
  };
  
  const errorMes = () => {
    message.error('Error');
  };

const TableTransfer = ({ leftColumns, rightColumns, ...restProps }) => (
    <Transfer {...restProps} showSelectAll={false}>
        {({
            direction,
            filteredItems,
            onItemSelectAll,
            onItemSelect,
            selectedKeys: listSelectedKeys,
            disabled: listDisabled,
        }) => {
            const columns = direction === 'left' ? leftColumns : rightColumns;

            const rowSelection = {
                getCheckboxProps: item => ({ disabled: listDisabled || item.disabled }),
                onSelectAll(selected, selectedRows) {
                    const treeSelectedKeys = selectedRows
                        .filter(item => !item.disabled)
                        .map(({ key }) => key);
                    const diffKeys = selected
                        ? difference(treeSelectedKeys, listSelectedKeys)
                        : difference(listSelectedKeys, treeSelectedKeys);
                    onItemSelectAll(diffKeys, selected);
                },
                onSelect({ key }, selected) {
                    onItemSelect(key, selected);
                },
                selectedRowKeys: listSelectedKeys,
            };

            return (
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={filteredItems}
                    size="small"
                    onRow={({ key, disabled: itemDisabled }) => ({
                        onClick: () => {
                            if (itemDisabled || listDisabled) return;
                            onItemSelect(key, !listSelectedKeys.includes(key));
                        },
                    })}
                />
            );
        }}
    </Transfer>
);

const isEmpty = function(str) {
    return (str.length === 0 || !str.trim());
};


export const MultipleActionsUsers: React.FC<{ all?: boolean }> = ({ all }) => {

    const [state, setState] = useState<{
        search: string | undefined,
        targetKeys: [],
        modal1Visible: boolean,
        modal2Visible: boolean,
        messageText: string,
        postId: number
    }>({
        search: "",
        targetKeys: [],
        modal1Visible: false,
        modal2Visible: false,
        messageText: "",
        postId: 0
    })
    const { data, loading } = useQuery<QueryType, QueryTypeUsersArgs>(GET_USERS, {
        variables: {
            forAdmin: all
        }
    })

    const [loadPosts, postsData] = useLazyQuery<QueryType,QueryTypePostsArgs>(GET_POSTS)

    const [ send ] = useMutation<MutationType,MutationTypeSendUsersArgs>(SEND_MESSAGE_USERS, {
        onCompleted: (dat) => {
            if (dat.sendUsers)
                successMes()
            else
                errorMes()
        },
        onError: () => errorMes()
    })

    const [add] = useMutation<MutationType, MutationTypeAddUsersToPostArgs>(ADD_USERS_TO_POST, {
        onCompleted: (dat) => {
            if (dat.addUsersToPost > -1)
                successMes(`${dat.addUsersToPost} added`)
            else
                errorMes()
        },
        onError: () => errorMes()
    })

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

    if(all)
        columns.push({
            dataIndex: "buildNumber",
            title: "House",
            responsive: ['md'],
            ellipsis: false
        })

    return <React.Fragment>
        <PageHeader
            ghost={true}
            title="Users Actions"
            //subTitle={`Всего человек: ${state.pagination.showTotal}`}
            extra={[
                <Button key="send" disabled={state.targetKeys.length === 0} type="primary" onClick={() => setState({ ...state, modal1Visible: true })}>Send Message</Button>,
                !all && <Button key="add" disabled={state.targetKeys.length === 0} type="primary" onClick={() => {
                    loadPosts()
                    setState({ ...state, modal2Visible: true })
                }}>Add to Post</Button>
            ]}
        >
            <TableTransfer
                onChange={(nextTargetKeys) => setState({ ...state, targetKeys: nextTargetKeys })}
                loading={loading}
                targetKeys={state.targetKeys}
                dataSource={data?.users?.nodes?.map(t => ({ ...t, key: t?.id })) ?? new Array()}
                leftColumns={columns}
                rightColumns={columns}
                filterOption={(inputValue, item) =>
                    item.name.indexOf(inputValue) !== -1 ||
                    item.room.toString().startsWith(inputValue) ||
                    (all && item.buildNumber.startsWith(inputValue))
                }
                showSearch={true}>

            </TableTransfer>
        </PageHeader>

        <Modal
            title="Send Message"
            style={{ top: 20 }}
            visible={state.modal1Visible}
            onOk={() => {
                if(isEmpty(state.messageText))
                    message.warning("Must not be empty")
                    else{
                        setState({ ...state, modal1Visible: false })
                        send({variables: {
                            message: state.messageText,
                            usersIds: state.targetKeys,
                            forAdmin: all
                        }})
                    }
            }}
            onCancel={() => setState({ ...state, modal1Visible: false })}
        >
            <p>Enter Message</p>
            <TextArea rows={4} onChange={e => setState({ ...state, messageText: e.target.value})}/>
        </Modal>
        <Modal
            title="Add to Post"
            style={{ top: 20 }}
            visible={state.modal2Visible}
            onOk={() => {
                if (state.postId < 1)
                    message.warning("Select Post")
                else {
                    setState({ ...state, modal2Visible: false })
                    add({
                        variables: {
                            postId: state.postId,
                            usersIds: state.targetKeys
                        }
                    })
                }
            }}
            onCancel={() => setState({ ...state, modal2Visible: false })}
        >
            <Table rowKey="id" loading={postsData.loading} rowSelection={{
                type: "radio",
                onSelect: (sel) => {
                    setState({ ...state, postId: sel.id })
                },
            }} dataSource={postsData.data?.posts?.nodes?.filter(t => !t?.isRepost) ?? new Array()}>
                <Table.Column key="id" title="Id" dataIndex="id" sorter={(a: any, b: any) => a.id - b.id} />
                <Table.Column key="text" title="Text" dataIndex="text" sorter={(a: any, b: any) => a.text.localeCompare(b.text)}
                    render={(value, record) => <div>{record.isRepost && <RepostTag />}{value}</div>}/>
            </Table>
        </Modal>
    </React.Fragment>

}

export default MultipleActionsUsers