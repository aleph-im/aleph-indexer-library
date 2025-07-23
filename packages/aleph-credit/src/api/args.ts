import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

export const CommonQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  token: { type: new GraphQLNonNull(GraphQLString) },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}

export const TokenEventsQueryArgs = {
  ...CommonQueryArgs,
  account: { type: GraphQLString },
  startDate: { type: GraphQLFloat },
  endDate: { type: GraphQLFloat },
  startUpdate: { type: GraphQLFloat },
  endUpdate: { type: GraphQLFloat },
  startHeight: { type: GraphQLFloat },
  endHeight: { type: GraphQLFloat },
}

export const TokenTransferQueryArgs = { ...TokenEventsQueryArgs }

export const TokenTransfeQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  token: { type: new GraphQLNonNull(GraphQLString) },
  transaction: { type: new GraphQLNonNull(GraphQLString) },
}
