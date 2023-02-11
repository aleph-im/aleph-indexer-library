import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import * as Types from './types.js'
import * as Args from './args.js'
import { APIResolver } from './resolvers.js'
import MainDomain from '../domain/main.js'
import { MessageEventQueryArgs, SyncEventQueryArgs } from '../types.js'

export default class APISchema extends IndexerAPISchema {
  constructor(
    protected domain: MainDomain,
    protected resolver: APIResolver = new APIResolver(domain),
  ) {
    super(domain, {
      types: Types.types,

      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          messageEvents: {
            type: Types.MessageEventList,
            args: Args.MessageEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getMessageEvents(args as MessageEventQueryArgs),
          },
          syncEvents: {
            type: Types.SyncEventList,
            args: Args.SyncEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getSyncEvents(args as SyncEventQueryArgs),
          },
        },
      }),
    })
  }
}
