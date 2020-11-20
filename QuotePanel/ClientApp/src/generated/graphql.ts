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
  /** The `Long` scalar type represents non-fractional signed whole 64-bit numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
  /** The `DateTime` scalar represents an ISO-8601 compliant date time type. */
  DateTime: any;
};


export type QueryType = {
  __typename?: 'QueryType';
  authGroups?: Maybe<GroupResponseType>;
  groupInfo?: Maybe<GroupInfoType>;
  groups?: Maybe<GroupInfoTypeConnection>;
  post?: Maybe<PostType>;
  posts?: Maybe<PostTypeConnection>;
  profile?: Maybe<UserType>;
  qoutes?: Maybe<QuoteTypeConnection>;
  qoutesByPost?: Maybe<QuoteTypeConnection>;
  qoutesByUser?: Maybe<QuoteTypeConnection>;
  report?: Maybe<ReportType>;
  reportItems?: Maybe<ReportItemTypeConnection>;
  reports?: Maybe<ReportTypeConnection>;
  stat?: Maybe<StatType>;
  token?: Maybe<Scalars['String']>;
  user?: Maybe<UserType>;
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
  order_by?: Maybe<GroupInfoTypeSort>;
  where?: Maybe<GroupInfoTypeFilter>;
};


export type QueryTypePostArgs = {
  id: Scalars['Int'];
};


export type QueryTypePostsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
  order_by?: Maybe<PostTypeSort>;
  where?: Maybe<PostTypeFilter>;
};


export type QueryTypeQoutesArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
  order_by?: Maybe<QuoteTypeSort>;
  where?: Maybe<QuoteTypeFilter>;
};


export type QueryTypeQoutesByPostArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  id: Scalars['Int'];
  last?: Maybe<Scalars['PaginationAmount']>;
  order_by?: Maybe<QuoteTypeSort>;
  where?: Maybe<QuoteTypeFilter>;
};


export type QueryTypeQoutesByUserArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
  last?: Maybe<Scalars['PaginationAmount']>;
  order_by?: Maybe<QuoteTypeSort>;
  where?: Maybe<QuoteTypeFilter>;
};


export type QueryTypeReportArgs = {
  id: Scalars['Int'];
};


export type QueryTypeReportItemsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  id: Scalars['Int'];
  last?: Maybe<Scalars['PaginationAmount']>;
  order_by?: Maybe<ReportItemTypeSort>;
  where?: Maybe<ReportItemTypeFilter>;
};


export type QueryTypeReportsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['PaginationAmount']>;
  last?: Maybe<Scalars['PaginationAmount']>;
  order_by?: Maybe<ReportTypeSort>;
  where?: Maybe<ReportTypeFilter>;
};


export type QueryTypeStatArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  groupId?: Maybe<Scalars['Int']>;
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
  order_by?: Maybe<UserTypeSort>;
  where?: Maybe<UserTypeFilter>;
};

export type MutationType = {
  __typename?: 'MutationType';
  addUsersToPost: Scalars['Int'];
  closeReport: Scalars['Boolean'];
  createFromToken: Scalars['Int'];
  createReport: Scalars['Int'];
  deletePost: Scalars['Boolean'];
  editPostInfo: Scalars['Boolean'];
  editUserInfo: Scalars['Boolean'];
  notifyUsers: Scalars['Int'];
  removeRole: Scalars['Boolean'];
  sendUsers: Scalars['Boolean'];
  switchQuoteVal: Scalars['Boolean'];
  switchVerificationVal: Scalars['Boolean'];
  updateGroup: Scalars['Boolean'];
};


export type MutationTypeAddUsersToPostArgs = {
  postId: Scalars['Int'];
  usersIds?: Maybe<Array<Scalars['Int']>>;
};


export type MutationTypeCloseReportArgs = {
  forAdmin?: Maybe<Scalars['Boolean']>;
  id: Scalars['Int'];
};


export type MutationTypeCreateFromTokenArgs = {
  groupName?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};


export type MutationTypeCreateReportArgs = {
  postId: Scalars['Int'];
  quoteIds?: Maybe<Array<Scalars['Int']>>;
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
  id: Scalars['Int'];
  user?: Maybe<UserType>;
  verified: Scalars['Boolean'];
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
};

export type UserTypeFilter = {
  AND?: Maybe<Array<UserTypeFilter>>;
  buildNumber?: Maybe<Scalars['String']>;
  buildNumber_contains?: Maybe<Scalars['String']>;
  buildNumber_ends_with?: Maybe<Scalars['String']>;
  buildNumber_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  buildNumber_not?: Maybe<Scalars['String']>;
  buildNumber_not_contains?: Maybe<Scalars['String']>;
  buildNumber_not_ends_with?: Maybe<Scalars['String']>;
  buildNumber_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  buildNumber_not_starts_with?: Maybe<Scalars['String']>;
  buildNumber_starts_with?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Int']>;
  id_gt?: Maybe<Scalars['Int']>;
  id_gte?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Scalars['Int']>>;
  id_lt?: Maybe<Scalars['Int']>;
  id_lte?: Maybe<Scalars['Int']>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_gt?: Maybe<Scalars['Int']>;
  id_not_gte?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Scalars['Int']>>;
  id_not_lt?: Maybe<Scalars['Int']>;
  id_not_lte?: Maybe<Scalars['Int']>;
  img?: Maybe<Scalars['String']>;
  img_contains?: Maybe<Scalars['String']>;
  img_ends_with?: Maybe<Scalars['String']>;
  img_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  img_not?: Maybe<Scalars['String']>;
  img_not_contains?: Maybe<Scalars['String']>;
  img_not_ends_with?: Maybe<Scalars['String']>;
  img_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  img_not_starts_with?: Maybe<Scalars['String']>;
  img_starts_with?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  OR?: Maybe<Array<UserTypeFilter>>;
  role?: Maybe<Scalars['Int']>;
  role_gt?: Maybe<Scalars['Int']>;
  role_gte?: Maybe<Scalars['Int']>;
  role_in?: Maybe<Array<Scalars['Int']>>;
  role_lt?: Maybe<Scalars['Int']>;
  role_lte?: Maybe<Scalars['Int']>;
  role_not?: Maybe<Scalars['Int']>;
  role_not_gt?: Maybe<Scalars['Int']>;
  role_not_gte?: Maybe<Scalars['Int']>;
  role_not_in?: Maybe<Array<Scalars['Int']>>;
  role_not_lt?: Maybe<Scalars['Int']>;
  role_not_lte?: Maybe<Scalars['Int']>;
  room?: Maybe<Scalars['Int']>;
  room_gt?: Maybe<Scalars['Int']>;
  room_gte?: Maybe<Scalars['Int']>;
  room_in?: Maybe<Array<Scalars['Int']>>;
  room_lt?: Maybe<Scalars['Int']>;
  room_lte?: Maybe<Scalars['Int']>;
  room_not?: Maybe<Scalars['Int']>;
  room_not_gt?: Maybe<Scalars['Int']>;
  room_not_gte?: Maybe<Scalars['Int']>;
  room_not_in?: Maybe<Array<Scalars['Int']>>;
  room_not_lt?: Maybe<Scalars['Int']>;
  room_not_lte?: Maybe<Scalars['Int']>;
  vkId?: Maybe<Scalars['Long']>;
  vkId_gt?: Maybe<Scalars['Long']>;
  vkId_gte?: Maybe<Scalars['Long']>;
  vkId_in?: Maybe<Array<Scalars['Long']>>;
  vkId_lt?: Maybe<Scalars['Long']>;
  vkId_lte?: Maybe<Scalars['Long']>;
  vkId_not?: Maybe<Scalars['Long']>;
  vkId_not_gt?: Maybe<Scalars['Long']>;
  vkId_not_gte?: Maybe<Scalars['Long']>;
  vkId_not_in?: Maybe<Array<Scalars['Long']>>;
  vkId_not_lt?: Maybe<Scalars['Long']>;
  vkId_not_lte?: Maybe<Scalars['Long']>;
};

export type UserTypeSort = {
  buildNumber?: Maybe<SortOperationKind>;
  id?: Maybe<SortOperationKind>;
  img?: Maybe<SortOperationKind>;
  name?: Maybe<SortOperationKind>;
  role?: Maybe<SortOperationKind>;
  room?: Maybe<SortOperationKind>;
  vkId?: Maybe<SortOperationKind>;
};

export type QuoteTypeFilter = {
  AND?: Maybe<Array<QuoteTypeFilter>>;
  id?: Maybe<Scalars['Int']>;
  id_gt?: Maybe<Scalars['Int']>;
  id_gte?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Scalars['Int']>>;
  id_lt?: Maybe<Scalars['Int']>;
  id_lte?: Maybe<Scalars['Int']>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_gt?: Maybe<Scalars['Int']>;
  id_not_gte?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Scalars['Int']>>;
  id_not_lt?: Maybe<Scalars['Int']>;
  id_not_lte?: Maybe<Scalars['Int']>;
  isOut?: Maybe<Scalars['Boolean']>;
  isOut_not?: Maybe<Scalars['Boolean']>;
  OR?: Maybe<Array<QuoteTypeFilter>>;
};

export type QuoteTypeSort = {
  id?: Maybe<SortOperationKind>;
  isOut?: Maybe<SortOperationKind>;
};

export type PostTypeFilter = {
  AND?: Maybe<Array<PostTypeFilter>>;
  deleted?: Maybe<Scalars['Boolean']>;
  deleted_not?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  id_gt?: Maybe<Scalars['Int']>;
  id_gte?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Scalars['Int']>>;
  id_lt?: Maybe<Scalars['Int']>;
  id_lte?: Maybe<Scalars['Int']>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_gt?: Maybe<Scalars['Int']>;
  id_not_gte?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Scalars['Int']>>;
  id_not_lt?: Maybe<Scalars['Int']>;
  id_not_lte?: Maybe<Scalars['Int']>;
  isRepost?: Maybe<Scalars['Boolean']>;
  isRepost_not?: Maybe<Scalars['Boolean']>;
  max?: Maybe<Scalars['Int']>;
  max_gt?: Maybe<Scalars['Int']>;
  max_gte?: Maybe<Scalars['Int']>;
  max_in?: Maybe<Array<Scalars['Int']>>;
  max_lt?: Maybe<Scalars['Int']>;
  max_lte?: Maybe<Scalars['Int']>;
  max_not?: Maybe<Scalars['Int']>;
  max_not_gt?: Maybe<Scalars['Int']>;
  max_not_gte?: Maybe<Scalars['Int']>;
  max_not_in?: Maybe<Array<Scalars['Int']>>;
  max_not_lt?: Maybe<Scalars['Int']>;
  max_not_lte?: Maybe<Scalars['Int']>;
  OR?: Maybe<Array<PostTypeFilter>>;
  text?: Maybe<Scalars['String']>;
  text_contains?: Maybe<Scalars['String']>;
  text_ends_with?: Maybe<Scalars['String']>;
  text_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  text_not?: Maybe<Scalars['String']>;
  text_not_contains?: Maybe<Scalars['String']>;
  text_not_ends_with?: Maybe<Scalars['String']>;
  text_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  text_not_starts_with?: Maybe<Scalars['String']>;
  text_starts_with?: Maybe<Scalars['String']>;
};

export type PostTypeSort = {
  deleted?: Maybe<SortOperationKind>;
  id?: Maybe<SortOperationKind>;
  isRepost?: Maybe<SortOperationKind>;
  max?: Maybe<SortOperationKind>;
  text?: Maybe<SortOperationKind>;
};

export type GroupInfoTypeFilter = {
  AND?: Maybe<Array<GroupInfoTypeFilter>>;
  buildNumber?: Maybe<Scalars['String']>;
  buildNumber_contains?: Maybe<Scalars['String']>;
  buildNumber_ends_with?: Maybe<Scalars['String']>;
  buildNumber_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  buildNumber_not?: Maybe<Scalars['String']>;
  buildNumber_not_contains?: Maybe<Scalars['String']>;
  buildNumber_not_ends_with?: Maybe<Scalars['String']>;
  buildNumber_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  buildNumber_not_starts_with?: Maybe<Scalars['String']>;
  buildNumber_starts_with?: Maybe<Scalars['String']>;
  enabled?: Maybe<Scalars['Boolean']>;
  enabled_not?: Maybe<Scalars['Boolean']>;
  filterPattern?: Maybe<Scalars['String']>;
  filterPattern_contains?: Maybe<Scalars['String']>;
  filterPattern_ends_with?: Maybe<Scalars['String']>;
  filterPattern_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  filterPattern_not?: Maybe<Scalars['String']>;
  filterPattern_not_contains?: Maybe<Scalars['String']>;
  filterPattern_not_ends_with?: Maybe<Scalars['String']>;
  filterPattern_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  filterPattern_not_starts_with?: Maybe<Scalars['String']>;
  filterPattern_starts_with?: Maybe<Scalars['String']>;
  groupId?: Maybe<Scalars['Long']>;
  groupId_gt?: Maybe<Scalars['Long']>;
  groupId_gte?: Maybe<Scalars['Long']>;
  groupId_in?: Maybe<Array<Maybe<Scalars['Long']>>>;
  groupId_lt?: Maybe<Scalars['Long']>;
  groupId_lte?: Maybe<Scalars['Long']>;
  groupId_not?: Maybe<Scalars['Long']>;
  groupId_not_gt?: Maybe<Scalars['Long']>;
  groupId_not_gte?: Maybe<Scalars['Long']>;
  groupId_not_in?: Maybe<Array<Maybe<Scalars['Long']>>>;
  groupId_not_lt?: Maybe<Scalars['Long']>;
  groupId_not_lte?: Maybe<Scalars['Long']>;
  id?: Maybe<Scalars['Int']>;
  id_gt?: Maybe<Scalars['Int']>;
  id_gte?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_lt?: Maybe<Scalars['Int']>;
  id_lte?: Maybe<Scalars['Int']>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_gt?: Maybe<Scalars['Int']>;
  id_not_gte?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  id_not_lt?: Maybe<Scalars['Int']>;
  id_not_lte?: Maybe<Scalars['Int']>;
  key?: Maybe<Scalars['String']>;
  keyboard?: Maybe<Scalars['Boolean']>;
  keyboard_not?: Maybe<Scalars['Boolean']>;
  key_contains?: Maybe<Scalars['String']>;
  key_ends_with?: Maybe<Scalars['String']>;
  key_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  key_not?: Maybe<Scalars['String']>;
  key_not_contains?: Maybe<Scalars['String']>;
  key_not_ends_with?: Maybe<Scalars['String']>;
  key_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  key_not_starts_with?: Maybe<Scalars['String']>;
  key_starts_with?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  OR?: Maybe<Array<GroupInfoTypeFilter>>;
  secret?: Maybe<Scalars['String']>;
  secret_contains?: Maybe<Scalars['String']>;
  secret_ends_with?: Maybe<Scalars['String']>;
  secret_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  secret_not?: Maybe<Scalars['String']>;
  secret_not_contains?: Maybe<Scalars['String']>;
  secret_not_ends_with?: Maybe<Scalars['String']>;
  secret_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  secret_not_starts_with?: Maybe<Scalars['String']>;
  secret_starts_with?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  token_contains?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  token_not?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  token_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  withFilter?: Maybe<Scalars['Boolean']>;
  withFilter_not?: Maybe<Scalars['Boolean']>;
};

export type GroupInfoTypeSort = {
  buildNumber?: Maybe<SortOperationKind>;
  enabled?: Maybe<SortOperationKind>;
  filterPattern?: Maybe<SortOperationKind>;
  groupId?: Maybe<SortOperationKind>;
  id?: Maybe<SortOperationKind>;
  key?: Maybe<SortOperationKind>;
  keyboard?: Maybe<SortOperationKind>;
  name?: Maybe<SortOperationKind>;
  secret?: Maybe<SortOperationKind>;
  token?: Maybe<SortOperationKind>;
  withFilter?: Maybe<SortOperationKind>;
};

export type ReportTypeFilter = {
  AND?: Maybe<Array<ReportTypeFilter>>;
  closed?: Maybe<Scalars['Boolean']>;
  closed_not?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['Int']>;
  id_gt?: Maybe<Scalars['Int']>;
  id_gte?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Scalars['Int']>>;
  id_lt?: Maybe<Scalars['Int']>;
  id_lte?: Maybe<Scalars['Int']>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_gt?: Maybe<Scalars['Int']>;
  id_not_gte?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Scalars['Int']>>;
  id_not_lt?: Maybe<Scalars['Int']>;
  id_not_lte?: Maybe<Scalars['Int']>;
  max?: Maybe<Scalars['Int']>;
  max_gt?: Maybe<Scalars['Int']>;
  max_gte?: Maybe<Scalars['Int']>;
  max_in?: Maybe<Array<Scalars['Int']>>;
  max_lt?: Maybe<Scalars['Int']>;
  max_lte?: Maybe<Scalars['Int']>;
  max_not?: Maybe<Scalars['Int']>;
  max_not_gt?: Maybe<Scalars['Int']>;
  max_not_gte?: Maybe<Scalars['Int']>;
  max_not_in?: Maybe<Array<Scalars['Int']>>;
  max_not_lt?: Maybe<Scalars['Int']>;
  max_not_lte?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  OR?: Maybe<Array<ReportTypeFilter>>;
};

export type ReportTypeSort = {
  closed?: Maybe<SortOperationKind>;
  id?: Maybe<SortOperationKind>;
  max?: Maybe<SortOperationKind>;
  name?: Maybe<SortOperationKind>;
};

export type ReportItemTypeFilter = {
  AND?: Maybe<Array<ReportItemTypeFilter>>;
  id?: Maybe<Scalars['Int']>;
  id_gt?: Maybe<Scalars['Int']>;
  id_gte?: Maybe<Scalars['Int']>;
  id_in?: Maybe<Array<Scalars['Int']>>;
  id_lt?: Maybe<Scalars['Int']>;
  id_lte?: Maybe<Scalars['Int']>;
  id_not?: Maybe<Scalars['Int']>;
  id_not_gt?: Maybe<Scalars['Int']>;
  id_not_gte?: Maybe<Scalars['Int']>;
  id_not_in?: Maybe<Array<Scalars['Int']>>;
  id_not_lt?: Maybe<Scalars['Int']>;
  id_not_lte?: Maybe<Scalars['Int']>;
  OR?: Maybe<Array<ReportItemTypeFilter>>;
  verified?: Maybe<Scalars['Boolean']>;
  verified_not?: Maybe<Scalars['Boolean']>;
};

export type ReportItemTypeSort = {
  id?: Maybe<SortOperationKind>;
  verified?: Maybe<SortOperationKind>;
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

export enum SortOperationKind {
  Asc = 'ASC',
  Desc = 'DESC'
}

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
};

export type Report = {
  __typename?: 'Report';
  closed: Scalars['Boolean'];
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
