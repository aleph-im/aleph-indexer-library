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

export const ERC20TransferEvent = new GraphQLObjectType({
  name: 'ERC20TransferEvent',
  fields: {
    ...commonFields,
    from: { type: new GraphQLNonNull(GraphQLString) },
    to: { type: new GraphQLNonNull(GraphQLString) },
    value: { type: new GraphQLNonNull(GraphQLBigNumber) },
    valueNum: { type: GraphQLFloat },
  },
})

export const ERC20TransferEventList = new GraphQLList(ERC20TransferEvent)

export const ERC20Balance = new GraphQLObjectType({
  name: 'ERC20Balance',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    balanceNum: { type: GraphQLFloat },
  },
})

export const ERC20BalanceList = new GraphQLList(ERC20Balance)

export const types = [ERC20TransferEvent, ERC20Balance]
