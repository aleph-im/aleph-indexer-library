import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInterfaceType,
} from 'graphql'
import { TokenEvent, tokenEventCommonFields } from './common.js'
import { MPLTokenEventType } from '../../types/solana.js'

export const mplTokenEventCommonFields = {
  ...tokenEventCommonFields,
  asset: { type: new GraphQLNonNull(GraphQLString) },
  collection: { type: GraphQLString },
  owner: { type: GraphQLString },
}

const splTokenTypes = new Set([
  MPLTokenEventType.CreateV1,
  MPLTokenEventType.CreateV2,
  MPLTokenEventType.TransferV1,
  MPLTokenEventType.BurnV1,
])

export const MPLTokenEvent = new GraphQLInterfaceType({
  name: 'MPLTokenEvent',
  interfaces: [TokenEvent],
  fields: {
    ...mplTokenEventCommonFields,
  },
})

export const MPLTokenEventUnknown = new GraphQLObjectType({
  name: 'MPLTokenEventUnknown',
  interfaces: [TokenEvent, MPLTokenEvent],
  isTypeOf: (item) => !splTokenTypes.has(item.type),
  fields: {
    ...mplTokenEventCommonFields,
  },
})

// --------

export const MPLTokenEventCreateV1 = new GraphQLObjectType({
  name: 'MPLTokenEventCreateV1',
  interfaces: [TokenEvent, MPLTokenEvent],
  isTypeOf: (item) => item.type === MPLTokenEventType.CreateV1,
  fields: {
    ...mplTokenEventCommonFields,
    name: { type: new GraphQLNonNull(GraphQLString) },
    uri: { type: new GraphQLNonNull(GraphQLString) },
    owner: { type: GraphQLString },
  },
})

export const MPLTokenEventTransferV1 = new GraphQLObjectType({
  name: 'MPLTokenEventTransferV1',
  interfaces: [TokenEvent, MPLTokenEvent],
  isTypeOf: (item) => item.type === MPLTokenEventType.TransferV1,
  fields: {
    ...mplTokenEventCommonFields,
    owner: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const MPLTokenEventBurnV1 = new GraphQLObjectType({
  name: 'MPLTokenEventBurnV1',
  interfaces: [TokenEvent, MPLTokenEvent],
  isTypeOf: (item) => item.type === MPLTokenEventType.BurnV1,
  fields: {
    ...mplTokenEventCommonFields,
  },
})

export const types = [
  MPLTokenEvent,
  MPLTokenEventUnknown,
  MPLTokenEventCreateV1,
  MPLTokenEventTransferV1,
  MPLTokenEventBurnV1,
]
