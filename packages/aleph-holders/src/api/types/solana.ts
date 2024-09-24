import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLInterfaceType,
} from 'graphql'
import { TokenEvent, tokenEventCommonFields } from './common.js'
import { SPLTokenEventType } from '../../types/solana.js'
import { GraphQLBigNumber } from '@aleph-indexer/core'

export const splTokenEventCommonFields = {
  ...tokenEventCommonFields,
  account: { type: new GraphQLNonNull(GraphQLString) },
  balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
  balanceNum: { type: new GraphQLNonNull(GraphQLFloat) },
  owner: { type: GraphQLString },
}

const splTokenTypes = new Set([
  SPLTokenEventType.MintTo,
  SPLTokenEventType.Burn,
  SPLTokenEventType.InitializeAccount,
  SPLTokenEventType.CloseAccount,
  SPLTokenEventType.Transfer,
  SPLTokenEventType.SetAuthority,
  SPLTokenEventType.Approve,
  SPLTokenEventType.Revoke,
  SPLTokenEventType.SyncNative,
  SPLTokenEventType.InitializeMint,
  SPLTokenEventType.InitializeImmutableOwner,
])

export const SPLTokenEvent = new GraphQLInterfaceType({
  name: 'SPLTokenEvent',
  interfaces: [TokenEvent],
  fields: {
    ...splTokenEventCommonFields,
  },
})

export const SPLTokenEventUnknown = new GraphQLObjectType({
  name: 'SPLTokenEventUnknown',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => !splTokenTypes.has(item.type),
  fields: {
    ...splTokenEventCommonFields,
  },
})

// --------

export const SPLTokenEventMintTo = new GraphQLObjectType({
  name: 'SPLTokenEventMintTo',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.MintTo,
  fields: {
    ...splTokenEventCommonFields,
    amount: { type: new GraphQLNonNull(GraphQLBigNumber) },
    amountNum: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const SPLTokenEventBurn = new GraphQLObjectType({
  name: 'SPLTokenEventBurn',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.Burn,
  fields: {
    ...splTokenEventCommonFields,
    amount: { type: new GraphQLNonNull(GraphQLBigNumber) },
    amountNum: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const SPLTokenEventInitializeAccount = new GraphQLObjectType({
  name: 'SPLTokenEventInitializeAccount',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.InitializeAccount,
  fields: {
    ...splTokenEventCommonFields,
  },
})

export const SPLTokenEventCloseAccount = new GraphQLObjectType({
  name: 'SPLTokenEventCloseAccount',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.CloseAccount,
  fields: {
    ...splTokenEventCommonFields,
    toAccount: { type: new GraphQLNonNull(GraphQLString) },
    toBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    toBalanceNum: { type: new GraphQLNonNull(GraphQLFloat) },
    owner: { type: GraphQLString },
    toOwner: { type: GraphQLString },
  },
})

export const SPLTokenEventTransfer = new GraphQLObjectType({
  name: 'SPLTokenEventTransfer',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) =>
    item.type === SPLTokenEventType.Transfer && item.amount !== undefined,
  fields: {
    ...splTokenEventCommonFields,
    amount: { type: new GraphQLNonNull(GraphQLBigNumber) },
    amountNum: { type: new GraphQLNonNull(GraphQLFloat) },
    toAccount: { type: new GraphQLNonNull(GraphQLString) },
    toBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    toBalanceNum: { type: new GraphQLNonNull(GraphQLFloat) },
    toOwner: { type: GraphQLString },
  },
})

export const SPLTokenEventSetAuthority = new GraphQLObjectType({
  name: 'SPLTokenEventSetAuthority',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.SetAuthority,
  fields: {
    ...splTokenEventCommonFields,
    newOwner: { type: new GraphQLNonNull(GraphQLString) },
    authorityType: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const SPLTokenEventApprove = new GraphQLObjectType({
  name: 'SPLTokenEventApprove',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.Approve,
  fields: {
    ...splTokenEventCommonFields,
    amount: { type: new GraphQLNonNull(GraphQLBigNumber) },
    amountNum: { type: new GraphQLNonNull(GraphQLFloat) },
    delegate: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const SPLTokenEventRevoke = new GraphQLObjectType({
  name: 'SPLTokenEventRevoke',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.Revoke,
  fields: {
    ...splTokenEventCommonFields,
    owner: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const SPLTokenEventSyncNative = new GraphQLObjectType({
  name: 'SPLTokenEventSyncNative',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.SyncNative,
  fields: {
    ...splTokenEventCommonFields,
  },
})

export const SPLTokenEventInitializeMint = new GraphQLObjectType({
  name: 'SPLTokenEventInitializeMint',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.InitializeMint,
  fields: {
    ...splTokenEventCommonFields,
  },
})

export const SPLTokenEventInitializeImmutableOwner = new GraphQLObjectType({
  name: 'SPLTokenEventInitializeImmutableOwner',
  interfaces: [TokenEvent, SPLTokenEvent],
  isTypeOf: (item) => item.type === SPLTokenEventType.InitializeImmutableOwner,
  fields: {
    ...splTokenEventCommonFields,
  },
})

export const types = [
  SPLTokenEvent,
  SPLTokenEventUnknown,
  SPLTokenEventMintTo,
  SPLTokenEventBurn,
  SPLTokenEventInitializeAccount,
  SPLTokenEventCloseAccount,
  SPLTokenEventTransfer,
  SPLTokenEventSetAuthority,
  SPLTokenEventApprove,
  SPLTokenEventRevoke,
  SPLTokenEventSyncNative,
  SPLTokenEventInitializeMint,
  SPLTokenEventInitializeImmutableOwner,
]
