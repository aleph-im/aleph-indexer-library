import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
} from 'graphql'
import { GraphQLBigNumber, GraphQLLong } from '@aleph-indexer/core'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

const eventCommonFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  timestamp: { type: new GraphQLNonNull(GraphQLLong) },
  height: { type: new GraphQLNonNull(GraphQLLong) },
  transaction: { type: new GraphQLNonNull(GraphQLString) },
}

// -------------

export const ERC20TransferEvent = new GraphQLObjectType({
  name: 'ERC20TransferEvent',
  fields: {
    ...eventCommonFields,
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: new GraphQLNonNull(GraphQLBigNumber) },
    valueNum: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const ERC20TransferEventList = new GraphQLList(ERC20TransferEvent)

export const StreamFlowUpdatedEvent = new GraphQLObjectType({
  name: 'StreamFlowUpdatedEvent',
  fields: {
    ...eventCommonFields,
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    flowRate: { type: new GraphQLNonNull(GraphQLBigNumber) },
    flowRateNum: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const StreamFlowUpdatedEventList = new GraphQLList(
  StreamFlowUpdatedEvent,
)

export const StreamFlowUpdatedExtensionEvent = new GraphQLObjectType({
  name: 'StreamFlowUpdatedExtensionEvent',
  fields: {
    ...eventCommonFields,
    flowOperator: { type: new GraphQLNonNull(GraphQLString) },
    deposit: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const StreamFlowUpdatedExtensionEventList = new GraphQLList(
  StreamFlowUpdatedExtensionEvent,
)

// -------------

const balanceCommonFields = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: new GraphQLNonNull(GraphQLString) },
  balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
  balanceNum: { type: new GraphQLNonNull(GraphQLFloat) },
}

export const ERC20Balance = new GraphQLObjectType({
  name: 'ERC20Balance',
  fields: {
    ...balanceCommonFields,
  },
})

export const ERC20BalanceList = new GraphQLList(ERC20Balance)

export const StreamBalance = new GraphQLObjectType({
  name: 'StreamBalance',
  fields: {
    ...balanceCommonFields,
    id: { type: new GraphQLNonNull(GraphQLString) },
    staticBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    staticBalanceNum: { type: new GraphQLNonNull(GraphQLFloat) },
    realTimeBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    realTimeBalanceNum: { type: new GraphQLNonNull(GraphQLFloat) },
    deposit: { type: new GraphQLNonNull(GraphQLBigNumber) },
    depositNum: { type: new GraphQLNonNull(GraphQLFloat) },
    flowRate: { type: new GraphQLNonNull(GraphQLBigNumber) },
    flowRateNum: { type: new GraphQLNonNull(GraphQLFloat) },
    timestamp: { type: new GraphQLNonNull(GraphQLLong) },
    updates: { type: GraphQLInt },
  },
})

export const StreamBalanceList = new GraphQLList(StreamBalance)

// -------------

export const types = [
  ERC20TransferEvent,
  StreamFlowUpdatedEvent,
  StreamFlowUpdatedExtensionEvent,
  ERC20Balance,
  StreamBalance,
]
