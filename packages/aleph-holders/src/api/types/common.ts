import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLFloat,
  GraphQLInterfaceType,
} from 'graphql'
import { GraphQLBigNumber, GraphQLLong } from '@aleph-indexer/core'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

export const tokenEventCommonFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  timestamp: { type: new GraphQLNonNull(GraphQLLong) },
  height: { type: new GraphQLNonNull(GraphQLLong) },
  transaction: { type: new GraphQLNonNull(GraphQLString) },
  type: { type: new GraphQLNonNull(GraphQLString) },
}

export const TokenEvent = new GraphQLInterfaceType({
  name: 'TokenEvent',
  fields: {
    ...tokenEventCommonFields,
  },
})

export const TokenEventList = new GraphQLList(TokenEvent)

// -------------

export const tokenBalanceCommonFields = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: new GraphQLNonNull(GraphQLString) },
  balance: { type: new GraphQLNonNull(GraphQLBigNumber) },
  balanceNum: { type: new GraphQLNonNull(GraphQLFloat) },
}

export const TokenBalance = new GraphQLObjectType({
  name: 'TokenBalance',
  fields: {
    ...tokenBalanceCommonFields,
  },
})

export const TokenBalanceList = new GraphQLList(TokenBalance)

// -------------

export const types = [TokenBalance, TokenEvent]
