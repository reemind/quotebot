import { gql } from '@apollo/client';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The multiplier path scalar represents a valid GraphQL multiplier path string. */
  MultiplierPath: any;
  PaginationAmount: any;
  /** The `DateTime` scalar represents an ISO-8601 compliant date time type. */
  DateTime: any;
  /** The `Long` scalar type represents non-fractional signed whole 64-bit numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};


export type QueryType = {
  __typename?: 'QueryType';
  authGroups?: Maybe<GroupResponseType>;
  groupInfo?: Maybe<GroupInfoType>;
  groups?: Maybe<GroupInfoTypeConnection>;
  lifetimeToken?: Maybe<Scalars['String']>;
  post?: Maybe<PostType>;
  posts?: Maybe<PostTypeConnection>;
  profile?: Maybe<UserType>;
  qoutes?: Maybe<QuoteTypeConnection>;
  qoutesByPost?: Maybe<QuoteTypeConnection>;
  qoutesByUser?: Maybe<QuoteTypeConnection>;
  quotePoint?: Maybe<QuotePointType>;
  quotePointItems?: Maybe<QuotePointItemTypeConnection>;
  quotePoints?: Maybe<QuotePointTypeConnection>;
  report?: Maybe<ReportType>;
  reportCode?: Maybe<Scalars['String']>;
  reportItems?: Maybe<ReportItemTypeConnection>;
  reports?: Maybe<ReportTypeConnection>;
  stat?: Maybe<StatType>;
  task?: Maybe<ScheludedTaskType>;
  tasks?: Maybe<ScheludedTaskTypeConnection>;
  token?: Maybe<Scalars['String']>;
  user?: Maybe<UserType>;
  userInfo?: Maybe<UserInfoType>;
  userRoles?: Maybe<Array<Maybe<RoleType>>>;
  users?: Maybe<UserTypeConnection>;
};


export type QueryTypeAuthGroupsArgs = {
  code?: Maybe<Scalars['String']>;
  redirectUri?: Maybe<Scalars['String']>;
};


export type QueryTypeGroupInfoArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  newGroup?: Maybe<Scalars['Boolean']>;
};


export type QueryTypeGroupsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypePostArgs = {
  id: Scalars['Int'];
};


export type QueryTypePostsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeQoutesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeQoutesByPostArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  id: Scalars['Int'];
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeQoutesByUserArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeQuotePointArgs = {
  id: Scalars['Int'];
};


export type QueryTypeQuotePointItemsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
  reportId: Scalars['Int'];
};


export type QueryTypeQuotePointsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeReportArgs = {
  id: Scalars['Int'];
};


export type QueryTypeReportCodeArgs = {
  id: Scalars['Int'];
};


export type QueryTypeReportItemsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  id: Scalars['Int'];
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeReportsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeStatArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  groupId?: Maybe<Scalars['Int']>;
};


export type QueryTypeTaskArgs = {
  id: Scalars['Int'];
};


export type QueryTypeTasksArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
};


export type QueryTypeTokenArgs = {
  groupId: Scalars['Long'];
};


export type QueryTypeUserArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
};


export type QueryTypeUserRolesArgs = {
  id: Scalars['Int'];
};


export type QueryTypeUsersArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  forAdmin?: Maybe<Scalars['Boolean']>;
  last?: Maybe<Scalars['PaginationAmount']>;
};

export type MutationType = {
  __typename?: 'MutationType';
  addUsersToPost: Scalars['Int'];
  changePoints: Scalars['Boolean'];
  closeReport: Scalars['Boolean'];
  confirmQrCode?: Maybe<UserType>;
  createFromToken: Scalars['Int'];
  createQuotePoint: Scalars['Boolean'];
  createReport: Scalars['Int'];
  createTask: Scalars['Boolean'];
  deletePost: Scalars['Boolean'];
  editPostInfo: Scalars['Boolean'];
  editUserInfo: Scalars['Boolean'];
  notifyUsers: Scalars['Int'];
  removeRole: Scalars['Boolean'];
  sendQrCode: Scalars['Boolean'];
  sendUsers: Scalars['Boolean'];
  switchQuoteVal: Scalars['Boolean'];
  switchVerificationVal: Scalars['Boolean'];
  updateGroup: Scalars['Boolean'];
};


export type MutationTypeAddUsersToPostArgs = {
  postId: Scalars['Int'];
  usersIds?: Maybe<Array<Scalars['Int']>>;
};


export type MutationTypeChangePointsArgs = {
  keyValuePairs?: Maybe<Array<KeyValuePairOfInt32AndDoubleInput>>;
  quotePointId: Scalars['Int'];
};


export type MutationTypeCloseReportArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
};


export type MutationTypeConfirmQrCodeArgs = {
  eReport?: Maybe<Scalars['String']>;
  eReportItem?: Maybe<Scalars['String']>;
};


export type MutationTypeCreateFromTokenArgs = {
  groupName?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};


export type MutationTypeCreateQuotePointArgs = {
  point: Scalars['Float'];
  reportId: Scalars['Int'];
};


export type MutationTypeCreateReportArgs = {
  postId: Scalars['Int'];
  quoteIds?: Maybe<Array<Scalars['Int']>>;
};


export type MutationTypeCreateTaskArgs = {
  dataJson?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  startTime?: Maybe<Scalars['String']>;
  type: Scalars['Int'];
};


export type MutationTypeDeletePostArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
};


export type MutationTypeEditPostInfoArgs = {
  id: Scalars['Int'];
  newMax?: Maybe<Scalars['Int']>;
  newName?: Maybe<Scalars['String']>;
};


export type MutationTypeEditUserInfoArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  groupId?: Maybe<Scalars['Int']>;
  id: Scalars['Int'];
  newName?: Maybe<Scalars['String']>;
  newType?: Maybe<Scalars['Int']>;
};


export type MutationTypeNotifyUsersArgs = {
  postId: Scalars['Int'];
  quotesId?: Maybe<Array<Scalars['Int']>>;
};


export type MutationTypeRemoveRoleArgs = {
  id: Scalars['Int'];
};


export type MutationTypeSendQrCodeArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
};


export type MutationTypeSendUsersArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  message?: Maybe<Scalars['String']>;
  usersIds?: Maybe<Array<Scalars['Int']>>;
};


export type MutationTypeSwitchQuoteValArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
};


export type MutationTypeSwitchVerificationValArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
};


export type MutationTypeUpdateGroupArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  inputGroup?: Maybe<GroupInfoTypeInput>;
  newGroup?: Maybe<Scalars['Boolean']>;
};

export type UserType = {
  __typename?: 'UserType';
  buildNumber?: Maybe<Scalars['String']>;
  group?: Maybe<Group>;
  id: Scalars['Int'];
  img?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  role: Scalars['Int'];
  room: Scalars['Int'];
  vkId: Scalars['Long'];
};

export type GroupType = {
  __typename?: 'GroupType';
  id: Scalars['Long'];
  name?: Maybe<Scalars['String']>;
  role: Scalars['Int'];
};

export type PostType = {
  __typename?: 'PostType';
  deleted: Scalars['Boolean'];
  id: Scalars['Int'];
  isRepost: Scalars['Boolean'];
  max: Scalars['Int'];
  text?: Maybe<Scalars['String']>;
};

export type QuoteType = {
  __typename?: 'QuoteType';
  id: Scalars['Int'];
  isOut: Scalars['Boolean'];
  post?: Maybe<PostType>;
  user?: Maybe<UserType>;
};

export type ReportType = {
  __typename?: 'ReportType';
  closed: Scalars['Boolean'];
  fromPost?: Maybe<PostType>;
  id: Scalars['Int'];
  max: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
};

export type ReportItemType = {
  __typename?: 'ReportItemType';
  closed?: Maybe<Scalars['Boolean']>;
  fromPost?: Maybe<PostType>;
  id: Scalars['Int'];
  user?: Maybe<UserType>;
  verified: Scalars['Boolean'];
};

export type UserInfoType = {
  __typename?: 'UserInfoType';
  quotes?: Maybe<Array<Maybe<QuoteType>>>;
  reportItems?: Maybe<Array<Maybe<ReportItemType>>>;
};

export type QuotePointType = {
  __typename?: 'QuotePointType';
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  report?: Maybe<ReportType>;
};

export type QuotePointItemType = {
  __typename?: 'QuotePointItemType';
  comment?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  point: Scalars['Float'];
  user?: Maybe<UserType>;
};

export type ScheludedTaskType = {
  __typename?: 'ScheludedTaskType';
  comment?: Maybe<Scalars['String']>;
  completed: Scalars['Boolean'];
  creator?: Maybe<UserType>;
  data?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  startTime: Scalars['DateTime'];
  success: Scalars['Boolean'];
  taskType: Scalars['Int'];
};

export type GroupInfoType = {
  __typename?: 'GroupInfoType';
  buildNumber?: Maybe<Scalars['String']>;
  enabled?: Maybe<Scalars['Boolean']>;
  filterPattern?: Maybe<Scalars['String']>;
  groupId?: Maybe<Scalars['Long']>;
  id?: Maybe<Scalars['Int']>;
  key?: Maybe<Scalars['String']>;
  keyboard?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  withFilter?: Maybe<Scalars['Boolean']>;
  withQrCode?: Maybe<Scalars['Boolean']>;
};


/** A connection to a list of items. */
export type UserTypeConnection = {
  __typename?: 'UserTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<UserTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<UserType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type ScheludedTaskTypeConnection = {
  __typename?: 'ScheludedTaskTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<ScheludedTaskTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<ScheludedTaskType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type QuoteTypeConnection = {
  __typename?: 'QuoteTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<QuoteTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<QuoteType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type PostTypeConnection = {
  __typename?: 'PostTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<PostTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<PostType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type GroupInfoTypeConnection = {
  __typename?: 'GroupInfoTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<GroupInfoTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<GroupInfoType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type ReportTypeConnection = {
  __typename?: 'ReportTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<ReportTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<ReportType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type ReportItemTypeConnection = {
  __typename?: 'ReportItemTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<ReportItemTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<ReportItemType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type QuotePointTypeConnection = {
  __typename?: 'QuotePointTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<QuotePointTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<QuotePointType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** A connection to a list of items. */
export type QuotePointItemTypeConnection = {
  __typename?: 'QuotePointItemTypeConnection';
  /** A list of edges. */
  edges?: Maybe<Array<QuotePointItemTypeEdge>>;
  /** A flattened list of the nodes. */
  nodes?: Maybe<Array<Maybe<QuotePointItemType>>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
  /** Indicates whether more edges exist following the set defined by the clients arguments. */
  hasNextPage: Scalars['Boolean'];
  /** Indicates whether more edges exist prior the set defined by the clients arguments. */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
};

/** An edge in a connection. */
export type UserTypeEdge = {
  __typename?: 'UserTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<UserType>;
};

/** An edge in a connection. */
export type QuotePointItemTypeEdge = {
  __typename?: 'QuotePointItemTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<QuotePointItemType>;
};

/** An edge in a connection. */
export type ScheludedTaskTypeEdge = {
  __typename?: 'ScheludedTaskTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ScheludedTaskType>;
};

/** An edge in a connection. */
export type QuoteTypeEdge = {
  __typename?: 'QuoteTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<QuoteType>;
};

/** An edge in a connection. */
export type PostTypeEdge = {
  __typename?: 'PostTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<PostType>;
};

/** An edge in a connection. */
export type GroupInfoTypeEdge = {
  __typename?: 'GroupInfoTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<GroupInfoType>;
};

/** An edge in a connection. */
export type ReportTypeEdge = {
  __typename?: 'ReportTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ReportType>;
};

/** An edge in a connection. */
export type ReportItemTypeEdge = {
  __typename?: 'ReportItemTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<ReportItemType>;
};

/** An edge in a connection. */
export type QuotePointTypeEdge = {
  __typename?: 'QuotePointTypeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String'];
  /** The item at the end of the edge. */
  node?: Maybe<QuotePointType>;
};


export type Group = {
  __typename?: 'Group';
  buildNumber?: Maybe<Scalars['String']>;
  configJson?: Maybe<Scalars['String']>;
  configuration?: Maybe<Config>;
  groupId: Scalars['Long'];
  id: Scalars['Int'];
  key?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  posts?: Maybe<Array<Maybe<Post>>>;
  reports?: Maybe<Array<Maybe<Report>>>;
  roles?: Maybe<Array<Maybe<GroupRole>>>;
  secret?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};


export type KeyValuePairOfInt32AndDoubleInput = {
  key: Scalars['Int'];
  value: Scalars['Float'];
};

export type GroupInfoTypeInput = {
  buildNumber?: Maybe<Scalars['String']>;
  enabled?: Maybe<Scalars['Boolean']>;
  filterPattern?: Maybe<Scalars['String']>;
  groupId?: Maybe<Scalars['Long']>;
  id?: Maybe<Scalars['Int']>;
  key?: Maybe<Scalars['String']>;
  keyboard?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  secret?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  withFilter?: Maybe<Scalars['Boolean']>;
  withQrCode?: Maybe<Scalars['Boolean']>;
};

export type GroupResponseType = {
  __typename?: 'GroupResponseType';
  groups?: Maybe<Array<Maybe<GroupType>>>;
  token?: Maybe<Scalars['String']>;
};

export type RoleType = {
  __typename?: 'RoleType';
  buildNumber?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
  role: Scalars['Int'];
};

export type StatType = {
  __typename?: 'StatType';
  statFloor?: Maybe<Array<Maybe<StatFloorType>>>;
  statQuotes?: Maybe<Array<Maybe<StatQuoteType>>>;
};

export type StatQuoteType = {
  __typename?: 'StatQuoteType';
  count: Scalars['Int'];
  date?: Maybe<Scalars['String']>;
};

export type StatFloorType = {
  __typename?: 'StatFloorType';
  count: Scalars['Int'];
  floor: Scalars['Int'];
};

export type Config = {
  __typename?: 'Config';
  enabled: Scalars['Boolean'];
  filterPattern?: Maybe<Scalars['String']>;
  keyboard: Scalars['Boolean'];
  withFilter: Scalars['Boolean'];
  withQrCode: Scalars['Boolean'];
};

export type Report = {
  __typename?: 'Report';
  closed: Scalars['Boolean'];
  closeTime?: Maybe<Scalars['DateTime']>;
  fromPost?: Maybe<Post>;
  group?: Maybe<Group>;
  id: Scalars['Int'];
  items?: Maybe<Array<Maybe<ReportItem>>>;
  max: Scalars['Int'];
  name?: Maybe<Scalars['String']>;
};

export type Post = {
  __typename?: 'Post';
  bindTo?: Maybe<Post>;
  deleted: Scalars['Boolean'];
  group?: Maybe<Group>;
  id: Scalars['Int'];
  max: Scalars['Int'];
  postId: Scalars['Long'];
  quotes?: Maybe<Array<Maybe<Quote>>>;
  text?: Maybe<Scalars['String']>;
  time: Scalars['DateTime'];
};

export type GroupRole = {
  __typename?: 'GroupRole';
  group: Group;
  id: Scalars['Int'];
  role: UserRole;
  user: User;
};

export type User = {
  __typename?: 'User';
  house?: Maybe<Group>;
  id: Scalars['Int'];
  img?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  quotes?: Maybe<Array<Maybe<Quote>>>;
  roles?: Maybe<Array<Maybe<GroupRole>>>;
  room: Scalars['Int'];
  vkId: Scalars['Long'];
};

export enum UserRole {
  User = 'USER',
  Groupmoder = 'GROUPMODER',
  Groupadmin = 'GROUPADMIN',
  Moder = 'MODER',
  Admin = 'ADMIN'
}

export type Quote = {
  __typename?: 'Quote';
  commentId: Scalars['Long'];
  id: Scalars['Int'];
  isOut: Scalars['Boolean'];
  post?: Maybe<Post>;
  time: Scalars['DateTime'];
  user?: Maybe<User>;
};

export type ReportItem = {
  __typename?: 'ReportItem';
  fromQuote?: Maybe<Quote>;
  id: Scalars['Int'];
  report?: Maybe<Report>;
  user?: Maybe<User>;
  verified: Scalars['Boolean'];
};
