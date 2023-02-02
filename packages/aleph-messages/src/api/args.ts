import { GraphQLFloat, GraphQLInt, GraphQLBoolean } from 'graphql'

export const MessageEventQueryArgs = {
  startDate: { type: GraphQLFloat },
  endDate: { type: GraphQLFloat },
  startHeight: { type: GraphQLFloat },
  endHeight: { type: GraphQLFloat },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}

export const SyncEventQueryArgs = {
  startDate: { type: GraphQLFloat },
  endDate: { type: GraphQLFloat },
  startHeight: { type: GraphQLFloat },
  endHeight: { type: GraphQLFloat },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}
