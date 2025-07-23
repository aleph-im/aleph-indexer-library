import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInterfaceType,
} from 'graphql'
import { GraphQLLong } from '@aleph-indexer/core'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

export const tokenEventCommonFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  token: { type: new GraphQLNonNull(GraphQLString) },
  timestamp: { type: new GraphQLNonNull(GraphQLLong) },
  updated: { type: new GraphQLNonNull(GraphQLLong) },
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

// -------------

export const types = [TokenEvent]
