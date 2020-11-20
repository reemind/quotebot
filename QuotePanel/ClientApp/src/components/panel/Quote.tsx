import { message } from "antd";
import { gql, ApolloClient } from "@apollo/client";
import { MutationType, MutationTypeSwitchQuoteValArgs, MutationTypeSwitchVerificationValArgs } from '../../generated/graphql'
import './User.sass'
import { EDIT_QUOTE_TYPE, EDIT_VERIFICATION_TYPE } from "../../generated/mutations";

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



export async function SwitchQuote(client: ApolloClient<object>, id, callback: () => void, all?: boolean) {
    mesloading()
    await client.mutate<MutationType,MutationTypeSwitchQuoteValArgs>({mutation: EDIT_QUOTE_TYPE, variables: { id, forAdmin: all }})
    .then(t => {
        if(t.data?.switchQuoteVal){
                mesSuccess()
                callback()
            }
            else
                mesError()
    }).catch(() => mesError())
}

export async function SwitchVerification(client: ApolloClient<object>, id, callback: () => void, all?: boolean) {
    mesloading()
    await client.mutate<MutationType, MutationTypeSwitchVerificationValArgs>({ mutation: EDIT_VERIFICATION_TYPE, variables: { id, forAdmin: all } })
        .then(t => {
            if (t.data?.switchVerificationVal) {
                mesSuccess()
                callback()
            }
            else
                mesError()
        }).catch(() => mesError())
}