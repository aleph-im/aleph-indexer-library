import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
} from 'graphql'
import { GraphQLBigNumber } from '@aleph-indexer/core'
import { TokenEvent, tokenEventCommonFields } from './common.js'
import { EVMEventType } from '../../types/evm.js'

const tokenTransferEventCommonFields = {
  ...tokenEventCommonFields,
  ref: { type: GraphQLString },
  origin: { type: GraphQLString },
  from: { type: new GraphQLNonNull(GraphQLString) },
  to: { type: new GraphQLNonNull(GraphQLString) },
  value: { type: new GraphQLNonNull(GraphQLBigNumber) },
}

export const EVMERC20TransferEvent = new GraphQLObjectType({
  name: 'EVMERC20TransferEvent',
  interfaces: [TokenEvent],
  isTypeOf: (item) =>
    item.type === EVMEventType.Transfer && item.value !== undefined,
  fields: {
    ...tokenTransferEventCommonFields,
    provider: { type: new GraphQLNonNull(GraphQLString) },
    paymentMethod: { type: new GraphQLNonNull(GraphQLString) },
    valueNum: { type: new GraphQLNonNull(GraphQLFloat) },
  },
})

export const EVMERC20TransferEventList = new GraphQLList(EVMERC20TransferEvent)

export const EVMERC20PendingTransferEvent = new GraphQLObjectType({
  name: 'EVMERC20PendingTransferEvent',
  interfaces: [TokenEvent],
  isTypeOf: (item) =>
    item.type === EVMEventType.Transfer && item.value !== undefined,
  fields: {
    ...tokenTransferEventCommonFields,
  },
})

export const EVMERC20PendingTransferEventList = new GraphQLList(
  EVMERC20PendingTransferEvent,
)

export const types = [EVMERC20TransferEvent, EVMERC20PendingTransferEvent]
