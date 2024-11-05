import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInterfaceType,
} from 'graphql'
import { GraphQLLong } from '@aleph-indexer/core'
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

export const tokenCommonFields = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: new GraphQLNonNull(GraphQLString) },
  collection: { type: GraphQLString },
  owner: { type: GraphQLString },
  name: { type: GraphQLString },
  url: { type: GraphQLString },
}

export const Token = new GraphQLObjectType({
  name: 'Token',
  fields: {
    ...tokenCommonFields,
  },
})

export const TokenList = new GraphQLList(Token)

// -------------

export const tokenBalanceCommonFields = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: new GraphQLNonNull(GraphQLString) },
  tokens: { type: new GraphQLNonNull(TokenList) },
}

export const TokenBalance = new GraphQLObjectType({
  name: 'TokenBalance',
  fields: {
    ...tokenBalanceCommonFields,
  },
})

export const TokenBalanceList = new GraphQLList(TokenBalance)

// -------------

export const types = [Token, TokenBalance, TokenEvent]
