import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
} from 'graphql'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

export const MessageEventQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  startDate: { type: GraphQLFloat },
  endDate: { type: GraphQLFloat },
  startHeight: { type: GraphQLFloat },
  endHeight: { type: GraphQLFloat },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}

export const SyncEventQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  startDate: { type: GraphQLFloat },
  endDate: { type: GraphQLFloat },
  startHeight: { type: GraphQLFloat },
  endHeight: { type: GraphQLFloat },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}
