import { GraphQLInt, GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import * as Types from './types.js'
import * as Args from './args.js'
import { APIResolver } from './resolvers.js'
import MainDomain from '../domain/main.js'
import { BalanceQueryArgs, TransferEventQueryArgs } from '../types.js'
import { GraphQLLong } from '@aleph-indexer/core'

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
          events: {
            type: Types.TransferEventList,
            args: Args.TransferEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getEvents(args as TransferEventQueryArgs),
          },
          balances: {
            type: Types.BalanceList,
            args: Args.BalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getBalances(args as BalanceQueryArgs),
          },
        },
      }),
    })
  }
}
