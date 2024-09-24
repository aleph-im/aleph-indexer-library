import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
} from 'graphql'
import { GraphQLBigNumber, GraphQLLong } from '@aleph-indexer/core'
import {
  tokenBalanceCommonFields,
  TokenEvent,
  tokenEventCommonFields,
} from './common.js'
import { EVMEventType } from '../../types/evm.js'

// -------------

export const EVMERC20Balance = new GraphQLObjectType({
  name: 'EVMERC20Balance',
  fields: {
    ...tokenBalanceCommonFields,
  },
})

export const EVMStreamBalance = new GraphQLObjectType({
  name: 'EVMStreamBalance',
  fields: {
    ...tokenBalanceCommonFields,
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

export const EVMERC20BalanceList = new GraphQLList(EVMERC20Balance)
export const EVMStreamBalanceList = new GraphQLList(EVMStreamBalance)

// -------------

export const EVMERC20TransferEvent = new GraphQLObjectType({
  name: 'EVMERC20TransferEvent',
  interfaces: [TokenEvent],
  isTypeOf: (item) =>
    item.type === EVMEventType.Transfer && item.value !== undefined,
  fields: {
    ...tokenEventCommonFields,
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: new GraphQLNonNull(GraphQLBigNumber) },
    valueNum: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const EVMStreamFlowUpdatedEvent = new GraphQLObjectType({
  name: 'EVMStreamFlowUpdatedEvent',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === EVMEventType.FlowUpdated,
  fields: {
    ...tokenEventCommonFields,
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    flowRate: { type: new GraphQLNonNull(GraphQLBigNumber) },
    flowRateNum: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const EVMStreamFlowUpdatedExtensionEvent = new GraphQLObjectType({
  name: 'EVMStreamFlowUpdatedExtensionEvent',
  interfaces: [TokenEvent],
  isTypeOf: (item) => item.type === EVMEventType.FlowUpdatedExtension,
  fields: {
    ...tokenEventCommonFields,
    flowOperator: { type: new GraphQLNonNull(GraphQLString) },
    deposit: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const EVMERC20TransferEventList = new GraphQLList(EVMERC20TransferEvent)
export const EVMStreamFlowUpdatedEventList = new GraphQLList(
  EVMStreamFlowUpdatedEvent,
)
export const EVMStreamFlowUpdatedExtensionEventList = new GraphQLList(
  EVMStreamFlowUpdatedExtensionEvent,
)

export const types = [
  EVMERC20TransferEvent,
  EVMStreamFlowUpdatedEvent,
  EVMStreamFlowUpdatedExtensionEvent,
  EVMERC20Balance,
  EVMStreamBalance,
]
