import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

export const TokenEventQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: GraphQLString },
  startDate: { type: GraphQLFloat },
  endDate: { type: GraphQLFloat },
  startHeight: { type: GraphQLFloat },
  endHeight: { type: GraphQLFloat },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}

// ---------------------

export const TokenQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: GraphQLString },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}

// ---------------------

export const TokenBalanceQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: GraphQLString },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}
