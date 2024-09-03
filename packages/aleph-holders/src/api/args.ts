import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLString,
} from 'graphql'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

export const commonEventQueryArgs = {
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

export const ERC20TransferEventQueryArgs = {
  ...commonEventQueryArgs,
}

export const StreamFlowUpdatedEventQueryArgs = {
  ...commonEventQueryArgs,
}

export const StreamFlowUpdatedExtensionEventQueryArgs = {
  ...commonEventQueryArgs,
}

// ---------------------

export const ERC20BalanceQueryArgs = {
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  account: { type: GraphQLString },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}

export const StreamBalanceQueryArgs = {
  ...ERC20BalanceQueryArgs,
}
