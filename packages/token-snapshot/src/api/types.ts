import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql'
import { TokenType } from '@aleph-indexer/core'

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

// ------------------- HOLDERS --------------------------

export const TokenBalances = new GraphQLObjectType({
  name: 'TokenBalances',
  fields: {
    wallet: { type: new GraphQLNonNull(GraphQLString) },
    solend: { type: GraphQLString },
    port: { type: GraphQLString },
    larix: { type: GraphQLString },
    total: { type: GraphQLString },
  },
})

// ------------------- HOLDERS --------------------------

export const TokenHolder = new GraphQLObjectType({
  name: 'TokenHolder',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: new GraphQLNonNull(GraphQLString) },
    tokenMint: { type: new GraphQLNonNull(GraphQLString) },
    balances: { type: new GraphQLNonNull(TokenBalances) },
    timestamp: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const TokenHolders = new GraphQLList(TokenHolder)
