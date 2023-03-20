import {
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLList,
} from 'graphql'
import { GraphQLJSONObject } from 'graphql-type-json'
import { GraphQLLong } from '@aleph-indexer/core'
import { GraphQLBlockchain } from '@aleph-indexer/framework'

const commonFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  blockchain: { type: new GraphQLNonNull(GraphQLBlockchain) },
  timestamp: { type: new GraphQLNonNull(GraphQLLong) },
  address: { type: new GraphQLNonNull(GraphQLString) },
  height: { type: new GraphQLNonNull(GraphQLLong) },
  transaction: { type: new GraphQLNonNull(GraphQLString) },
}

export const MessageEvent = new GraphQLObjectType({
  name: 'MessageEvent',
  fields: {
    ...commonFields,
    type: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLJSONObject) },
  },
})

export const MessageEventList = new GraphQLList(MessageEvent)

export const SyncEvent = new GraphQLObjectType({
  name: 'SyncEvent',
  fields: {
    ...commonFields,
    message: { type: new GraphQLNonNull(GraphQLJSONObject) },
  },
})

export const SyncEventList = new GraphQLList(SyncEvent)

export const types = [MessageEvent, SyncEvent]
