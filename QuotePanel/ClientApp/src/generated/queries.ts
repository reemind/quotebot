import { gql } from "@apollo/client";

export const GET_PROFILE = gql`
query GetProfile
{
  profile{
    id
    name
    role
  }
}
`;

export const GET_GROUPS_AUTH = gql`
    query authGroups($code: String!, $redirectUri: String!){
        authGroups(code: $code, redirectUri: $redirectUri){
        token
        groups{
            id
            name
            role
        }
    }
}`;

export const GET_TOKEN = gql`
    query GetToken($groupId: Long!){
        token(groupId: $groupId)
}`;

export const GET_USERS = gql`
query GetUsers($forAdmin: Boolean) {
  users(forAdmin: $forAdmin) {
    nodes {
      id
      name
      role
      room
      buildNumber
    }
    totalCount
  }
}`;

export const GET_USERS_ALL = gql`
query GetUsers {
  users(forAdmin : true) {
    nodes {
      id
      name
      room
      buildNumber
      group{
        id
        name
      }
    }
    totalCount
    pageInfo {
      endCursor
    }
  }
}`;

export const GET_USER = gql`
query GetUser($id: Int!, $forAdmin: Boolean) {
    user(id: $id, forAdmin: $forAdmin) {
        id
        name
        room
        role
        vkId
    }
    qoutesByUser(id: $id, forAdmin: $forAdmin) {
        nodes {
            id
            isOut
            post {
                text,
                max
                id
            }
        }
    } 
}`;

export const GET_GROUPS = gql`
query GetPosts{
    groups {
        nodes {
            id
            name
            buildNumber
        }
    }
}
`;

export const GET_ROLES = gql`
query GetRoles($id: Int!) {
  userRoles(id: $id) {
      id
      buildNumber
      role
  }
}
`;

export const GET_GROUPS_DETAILED = gql`
query GetGroups{
  groups {
    nodes {
      id
      groupId
      name
      enabled
      buildNumber
    }
  }
}`;

export const GET_GROUP_INFO = gql`
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
    withQrCode
  }
}
`;

export const GET_POSTS_DETAILED = gql`
query GetPosts{
    posts {
        nodes {
            text
            id
            max
            deleted
            isRepost
        }
    }
}`;

export const GET_POSTS = gql`
query GetPosts{
    posts {
        nodes {
            text
            id
            isRepost
        }
    }
}
`;

export const GET_POST = gql`
query GetPost($id: Int!) {
  post(id: $id) {
    id
    max
    text
    isRepost
  }
  qoutesByPost(id: $id) {
    nodes {
      id
      isOut
      user {
        name
        room
        id
      }
    }
    totalCount
  }
}
`;

export const GET_DASHBOARD_INFO = gql`
query GetGroupInfo {
  groupInfo {
    name
    enabled
    groupId
  }
  stat{
    statFloor{
      floor
      count
      }
    statQuotes{
      date
      count
      }
  }
}
`;

export const GET_DASHBOARD_INFO_ALL = gql`
query GetGroupsInfo($groupId: Int) {
    groupInfo(id: $groupId) {
        id
        name
        enabled
        groupId
      }
      stat(forAdmin: true, groupId: $groupId){
        statFloor{
          floor
          count
          }
        statQuotes{
          date
          count
          }
      }
  groups {
    nodes {
      id
      buildNumber
    }
  }
}`;

export const GET_REPORTS = gql`
query GetReports{
    reports {
        nodes {
            id
            max
            name
            closed
            fromPost {
                id
            }
        }
    }
}
`;

export const GET_REPORT = gql`
query GetReport($id: Int!) {
    report(id: $id) {
        id
        max
        closed
        name
        fromPost {
            id
        }
    }
    reportItems(id: $id){
        nodes{
            id
            verified
            user{
                name
                id
                room
            }
        }
        totalCount
    }
}`;

export const GET_REPORT_CODE = gql`
query GetReportCode($id: Int!) {
    reportCode(id: $id)
}
`;

export const GET_QUOTE_POINTS = gql`
query GetQuotePoints {
  quotePoints {
    nodes {
      id
      name
      report{
        id
      }
    }
  }
}
`;

export const GET_QUOTE_POINT_ITEMS = gql`
query GetQuotePointItems($reportId: Int!) {
quotePoint(id: $reportId) {
      id
      name
      report{
        id
      }
  }
  quotePointItems(reportId: $reportId) {
    nodes {
      id
      user {
        id
        name
        room
      }
      point
      comment
    }
  }
}

`;

export const GET_TASKS = gql`
query GetTasks {
  tasks {
    nodes {
      id
      comment
      completed
      data
      startTime
      success
      taskType
      creator {
        id
        name
      }
    }
  }
}`;

export const GET_TASK = gql`
query GetTask($id: Int!) {
  task(id: $id) {
      id
      comment
      completed
      data
      startTime
      success
      taskType
      creator {
        name
      }
  }
}`;

export const USER_GET_QUERIES = gql`
query GetUserInfo{
    userInfo{
        quotes{
            id
            post{
                text
                max
            }
        }
        reportItems{
            id
            fromPost{
                text
                max
            }
            closed
        }
    }
}
`;

export const GET_LIFETIME_TOKEN = gql`
query GetPost {
    lifetimeToken
}`;