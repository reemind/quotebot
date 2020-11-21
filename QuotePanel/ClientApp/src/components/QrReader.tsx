import { LoadingOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { message, Row, Col, List, Card, Switch } from "antd";
import Column from "antd/lib/table/Column";
import React, { CSSProperties, useState } from "react";
import { FC } from "react";
import QrReader from 'react-qr-scanner';
import { RouteComponentProps } from "react-router-dom";
import { MutationType, MutationTypeConfirmQrCodeArgs } from "../generated/graphql";
import { CONFIRM_QR_CODE } from "../generated/mutations";


const key = "QrReader"

const mesloading = () => {
    message.loading({ key, content: "Loading..." })
};
const mesError = (content) => {
    message.error({ key, content, duration: 2 })
};
const mesSuccess = (content) => {
    message.success({ key, content, duration: 2 })
};

interface RouterProps { // type for `match.params`
    reportId: string; // must be type `string` since value comes from the URL
}

interface ReaderProps extends RouteComponentProps<RouterProps> {
    // any other props (leave empty if none)
}
const previewStyle: CSSProperties = {
    height: 240,
    maxWidth: 500
}

type User = {
    id: number,
    name: string,
    room: number
}

const QrReaderForm: FC<ReaderProps> = ({ match }) => {
    const reportId = match.params.reportId

    const [state, setState] = useState<{ scanned: string[], loading: boolean, users: User[], cam: "front"|"rear" }>({ scanned: [], loading: true, users: [], cam: "rear" })

    const [confirm] = useMutation<MutationType, MutationTypeConfirmQrCodeArgs>(CONFIRM_QR_CODE, {
        onCompleted: (data) => {
            if (data.confirmQrCode) {
                mesSuccess(`${data.confirmQrCode.name}(${data.confirmQrCode.room})`)
                setState({
                    ...state, users: [...state.users, {
                        id: data?.confirmQrCode?.id,
                        name: data?.confirmQrCode?.name ?? "Oops",
                        room: data.confirmQrCode.room
                    }]
                })
            }
            else
                mesError("Not recognized");
        },
        onError: () => mesError("Not recognized")
    })


    return (
        <div style={{ height: "100vh", backgroundColor: "#d9d9d9" }}>
            <Row align="middle" justify="center" style={{ minHeight: "100%" }}>
                <Col>
                    <Card title="Scanner" bordered={false} extra={
                        <Switch checkedChildren="Front" unCheckedChildren="Rear" onChange={
                            (checked) =>
                                setState({ ...state, cam: checked?"front":"rear" })} />
                    }>
                        <Row align="middle" justify="center">
                            <Col>
                                {state.loading && <LoadingOutlined style={{ fontSize: 64 }} />}
                            </Col>
                        </Row>
                        <QrReader
                            onScan={(data) => {
                                if (data && !state.scanned.includes(data)) {
                                    console.log(data)
                                    setState({ ...state, scanned: [...state.scanned, data] })
                                    confirm({ variables: { eReport: reportId, eReportItem: data } })
                                    mesloading()
                                }

                            }}
                            onLoad={() => setState({ ...state, loading: false })}
                            facingMode={state.cam}
                            onError={() => { }}
                            style={previewStyle}
                        />
                        <List
                            dataSource={state.users.reverse()}
                            renderItem={item => (
                                <List.Item key={item.id}>
                                    <List.Item.Meta
                                        title={item.name}
                                        description={item.room}
                                    />
                                </List.Item>
                            )}
                        >
                        </List>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default QrReaderForm