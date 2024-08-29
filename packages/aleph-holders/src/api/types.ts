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
    valueNum: { type: GraphQLFloat },
  },
})

export const ERC20TransferEventList = new GraphQLList(ERC20TransferEvent)

export const StreamFlowUpdatedEvent = new GraphQLObjectType({
  name: 'StreamFlowUpdatedEvent',
  fields: {
    ...eventCommonFields,
    // token: { type: new GraphQLNonNull(GraphQLString) },
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    flowRate: { type: new GraphQLNonNull(GraphQLBigNumber) },
    flowRateNum: { type: GraphQLFloat },
    // totalSenderFlowRate: { type: new GraphQLNonNull(GraphQLBigNumber) },
    // totalReceiverFlowRate: { type: new GraphQLNonNull(GraphQLBigNumber) },
    // userData: { type: GraphQLString },
  },
})

export const StreamFlowUpdatedEventList = new GraphQLList(
  StreamFlowUpdatedEvent,
)

// -------------

const balanceCommonFields = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: new GraphQLNonNull(GraphQLString) },
}

export const ERC20Balance = new GraphQLObjectType({
  name: 'ERC20Balance',
  fields: {
    ...balanceCommonFields,
    balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    balanceNum: { type: GraphQLFloat },
  },
})

export const ERC20BalanceList = new GraphQLList(ERC20Balance)

export const StreamBalance = new GraphQLObjectType({
  name: 'StreamBalance',
  fields: {
    ...balanceCommonFields,
    staticBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    staticBalanceNum: { type: GraphQLFloat },
    flowRate: { type: new GraphQLNonNull(GraphQLBigNumber) },
    flowRateNum: { type: GraphQLFloat },
    realTimeBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    realTimeBalanceNum: { type: GraphQLFloat },
    balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    balanceNum: { type: GraphQLFloat },
    timestamp: { type: new GraphQLNonNull(GraphQLLong) },
    updates: { type: GraphQLInt },
  },
})

export const StreamBalanceList = new GraphQLList(StreamBalance)

// -------------

export const types = [
  ERC20TransferEvent,
  StreamFlowUpdatedEvent,
  ERC20Balance,
  StreamBalance,
]
