import React, { ReactText, useState } from "react";
import { Redirect, useHistory, Switch, Route, Link, RouteComponentProps, withRouter } from "react-router-dom";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, message, PageHeader, Radio, Row, Space, Table, Tag } from "antd";
import { useQuery, gql, useMutation, ApolloClient, InMemoryCache } from "@apollo/client";
import { MutationType, MutationTypeSwitchQuoteValArgs } from '../../generated/graphql'
import './User.sass'
import Avatar from "antd/lib/avatar/avatar";
import userEvent from "@testing-library/user-event";
import { callbackify } from "util";
import { ArgsProps } from "antd/lib/message";

const key = "SwitchMes"

const mesloading = () => {
    message.loading({ key, content: "Loading..." })
};
const mesError = () => {
    message.error({ key, content: "Error", duration: 2 })
};
const mesSuccess = () => {
    message.success({ key, content: "Success", duration: 2 })
};

const EDIT_QUOTE_TYPE = gql`
mutation EditUserType($id: Int!, $forAdmin: Boolean) {
    switchQuoteVal(id: $id, forAdmin: $forAdmin)
}`;


async function SwitchQuote(client: ApolloClient<object>, id, action: "in" | "out", callback: () => void, all?: boolean) {
    mesloading()
    await client.mutate<MutationType,MutationTypeSwitchQuoteValArgs>({mutation: EDIT_QUOTE_TYPE, variables: { id, forAdmin: all }})
    .then(t => {
        if(t.data?.switchQuoteVal){
                mesSuccess()
                callback()
            }
            else
                mesError()
    }).catch(t => mesError())
}

export default SwitchQuote