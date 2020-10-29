import { message } from "antd";
import { gql, ApolloClient } from "@apollo/client";
import { MutationType, MutationTypeSwitchQuoteValArgs } from '../../generated/graphql'
import './User.sass'

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


async function SwitchQuote(client: ApolloClient<object>, id, callback: () => void, all?: boolean) {
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

export default SwitchQuote