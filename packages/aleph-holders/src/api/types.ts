import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
} from 'graphql'
import { GraphQLBigNumber, GraphQLLong } from '@aleph-indexer/core'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

const commonFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  timestamp: { type: new GraphQLNonNull(GraphQLLong) },
  height: { type: new GraphQLNonNull(GraphQLLong) },
  transaction: { type: new GraphQLNonNull(GraphQLString) },
}

export const TransferEvent = new GraphQLObjectType({
  name: 'TransferEvent',
  fields: {
    ...commonFields,
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: new GraphQLNonNull(GraphQLBigNumber) },
    valueNum: { type: GraphQLFloat },
  },
})

export const TransferEventList = new GraphQLList(TransferEvent)

export const Balance = new GraphQLObjectType({
  name: 'Balance',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    balanceNum: { type: GraphQLFloat },
  },
})

export const BalanceList = new GraphQLList(Balance)

export const SolanaBalance = new GraphQLObjectType({
  name: 'SolanaBalance',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    balanceNum: { type: GraphQLFloat },
  },
})

export const SolanaBalanceList = new GraphQLList(SolanaBalance)

export const Snapshot = new GraphQLObjectType({
  name: 'Snapshot',
  fields: {
    timestamp: { type: new GraphQLNonNull(GraphQLString) },
    balances: { type: new GraphQLNonNull(SolanaBalanceList) },
  },
})

export const types = [TransferEvent, Balance, Snapshot]
