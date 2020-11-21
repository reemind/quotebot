import { gql } from "@apollo/client";


export const EDIT_USER_TYPE = gql`
mutation EditUserType($id: Int!, $newType: Int, $newName: String, $forAdmin: Boolean, $groupId: Int) {
  editUserInfo(id: $id, newType: $newType, newName: $newName, forAdmin: $forAdmin, groupId: $groupId)
}`;

export const DELETE_USER_ROLE = gql`
mutation RemoveRole($id: Int!) {
  removeRole(id: $id)
}`;

export const UPDATE_GROUP = gql`
mutation UpdateGroup($inputGroup: GroupInfoTypeInput, $id : Int, $forAdmin: Boolean, $newGroup: Boolean) {
  updateGroup(inputGroup: $inputGroup, id : $id, forAdmin: $forAdmin, newGroup: $newGroup)
}
`;

export const EDIT_POST_INFO = gql`
mutation EditPostMax($id: Int!, $newMax: Int, $newName: String) {
  editPostInfo(id: $id, newMax: $newMax, newName: $newName)
}`;

export const NOTIFY_USERS = gql`
mutation NotifyUsers($postId: Int!, $quotesId: [Int!]) {
  notifyUsers(postId: $postId, quotesId: $quotesId)
}`;


export const HANDLE_MASTER = gql`
mutation CreateFromToken($groupName: String, $token: String){
  createFromToken(groupName: $groupName, token: $token)
}`;

export const EDIT_QUOTE_TYPE = gql`
mutation EditUserType($id: Int!, $forAdmin: Boolean) {
    switchQuoteVal(id: $id, forAdmin: $forAdmin)
}`;

export const EDIT_VERIFICATION_TYPE = gql`
mutation EditVerification($id: Int!, $forAdmin: Boolean) {
    switchVerificationVal(id: $id, forAdmin: $forAdmin)
}`;

export const CLOSE_REPORT = gql`
mutation CloseReport($id: Int!, $forAdmin: Boolean) {
    closeReport(id: $id, forAdmin: $forAdmin)
}`;

export const DELETE_POST = gql`
mutation DeletePost($id: Int!, $forAdmin: Boolean) {
    deletePost(id: $id, forAdmin: $forAdmin)
}`;

export const CONFIRM_QR_CODE = gql`
mutation ConfirmQrCode($eReport: String, $eReportItem: String) {
    confirmQrCode(eReport: $eReport, eReportItem: $eReportItem){
        id
        name
        room
    }
}`;

export const SEND_QR_CODE = gql`
mutation SendQrCode($id: Int!) {
    sendQrCode(id: $id)
}`;

