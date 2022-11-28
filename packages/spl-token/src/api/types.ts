import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLInt,
} from 'graphql'
import { GraphQLLong } from '@aleph-indexer/core'
import { GraphQLBigNumber, TokenType } from '@aleph-indexer/core'
import { SPLTokenEventType } from '../types.js'

// ------------------- TOKENS --------------------------

export const TokenMint = new GraphQLObjectType({
  name: 'TokenMint',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    address: { type: new GraphQLNonNull(GraphQLString) },
    programId: { type: new GraphQLNonNull(GraphQLString) },
    tokenInfo: { type: TokenType },
  },
})

export const TokenMints = new GraphQLList(TokenMint)

// ------------------- EVENTS --------------------------

export const TokenEventType = new GraphQLEnumType({
  name: 'TokenEventType',
  values: {
    mintTo: { value: 'mintTo' },
    burn: { value: 'burn' },
    initializeAccount: { value: 'initializeAccount' },
    closeAccount: { value: 'closeAccount' },
    transfer: { value: 'transfer' },
    setAuthority: { value: 'setAuthority' },
    approve: { value: 'approve' },
    revoke: { value: 'revoke' },
    syncNative: { value: 'syncNative' },
  },
})

const commonTokenEventFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  timestamp: { type: GraphQLLong },
  type: { type: new GraphQLNonNull(TokenEventType) },
  mint: { type: new GraphQLNonNull(GraphQLString) },
  account: { type: new GraphQLNonNull(GraphQLString) },
  owner: { type: GraphQLString },
  balance: { type: new GraphQLNonNull(GraphQLString) },
}

const TokenEvent = new GraphQLInterfaceType({
  name: 'TokenEvent',
  fields: {
    ...commonTokenEventFields,
  },
})

export const TokenEventMintTo = new GraphQLObjectType({
  name: 'TokenEventMintTo',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.MintTo,
  fields: {
    ...commonTokenEventFields,
    amount: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const TokenEventBurn = new GraphQLObjectType({
  name: 'TokenEventBurn',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.Burn,
  fields: {
    ...commonTokenEventFields,
    amount: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const TokenEventInitializeAccount = new GraphQLObjectType({
  name: 'TokenEventInitializeAccount',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.InitializeAccount,
  fields: {
    ...commonTokenEventFields,
  },
})

export const TokenEventCloseAccount = new GraphQLObjectType({
  name: 'TokenEventCloseAccount',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.CloseAccount,
  fields: {
    ...commonTokenEventFields,
    toAccount: { type: GraphQLString },
  },
})

export const TokenEventTransfer = new GraphQLObjectType({
  name: 'TokenEventTransfer',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.Transfer,
  fields: {
    ...commonTokenEventFields,
    amount: { type: new GraphQLNonNull(GraphQLString) },
    toAccount: { type: GraphQLString },
    toOwner: { type: GraphQLString },
    toBalance: { type: GraphQLString },
  },
})

export const TokenEventSetAuthority = new GraphQLObjectType({
  name: 'TokenEventSetAuthority',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.SetAuthority,
  fields: {
    ...commonTokenEventFields,
    newOwner: { type: new GraphQLNonNull(GraphQLString) },
    authorityType: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const TokenEventApprove = new GraphQLObjectType({
  name: 'TokenEventApprove',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.Approve,
  fields: {
    ...commonTokenEventFields,
    amount: { type: new GraphQLNonNull(GraphQLString) },
    delegate: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const TokenEventRevoke = new GraphQLObjectType({
  name: 'TokenEventRevoke',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.Revoke,
  fields: {
    ...commonTokenEventFields,
  },
})

export const TokenEventSyncNative = new GraphQLObjectType({
  name: 'TokenEventSyncNative',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.SyncNative,
  fields: {
    ...commonTokenEventFields,
  },
})

export const TokenEvents = new GraphQLList(TokenEvent)

export const types = [
  TokenEventMintTo,
  TokenEventBurn,
  TokenEventInitializeAccount,
  TokenEventCloseAccount,
  TokenEventTransfer,
  TokenEventSetAuthority,
  TokenEventApprove,
  TokenEventRevoke,
  TokenEventSyncNative,
]

// ------------------- HOLDINGS --------------------------

export const AccountHoldings = new GraphQLObjectType({
  name: 'AccountHoldings',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: GraphQLString },
    balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    max: { type: new GraphQLNonNull(GraphQLBigNumber) },
    min: { type: new GraphQLNonNull(GraphQLBigNumber) },
    avg: { type: new GraphQLNonNull(GraphQLBigNumber) },
    events: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const AccountsHoldings = new GraphQLList(AccountHoldings)

// ------------------- HOLDERS --------------------------

export const TokenHolder = new GraphQLObjectType({
  name: 'TokenHolder',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: GraphQLString },
    balance: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const TokenHolders = new GraphQLList(TokenHolder)
