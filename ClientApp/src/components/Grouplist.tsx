import { Card, Space } from "antd";
import { createPublicKey } from "crypto";
import { Maybe } from "graphql/jsutils/Maybe";
import React from "react";
import { GroupType } from "../generated/graphql";
import './Grouplist.sass'
import { RoleTag } from "./comps/DataTags";

interface Group {
    id: number,
    name: string,
    img: string,
    role: number
}

type GrouplistProps = {
    groups?: Maybe<GroupType>[]
    callback: (id: number) => void
}

export class Grouplist extends React.Component<GrouplistProps>{

    render() {

        return (
            <Card title="Select Group">
                {this.props.groups?.map(t =>
                    <div key={t?.id} className="groups-list-item" onClick={() => this.props.callback(t?.id)}>
                        <Space size="small" align="baseline">
                            <RoleTag role={t?.role ?? 0} />
                            {t?.name}
                        </Space>
                    </div>)}
            </Card>
        )
    }
}