import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import { APIResolver } from './resolvers.js'
import MainDomain from '../domain/main.js'
import {
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
  CommonTokenQueryArgs,
} from '../types/common.js'
import * as Args from './args.js'
import * as Types from './types/index.js'

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
            type: Types.TokenEventList,
            args: Args.TokenEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getEvents(args as CommonEventQueryArgs),
          },

          tokens: {
            type: Types.TokenList,
            args: Args.TokenQueryArgs,
            resolve: (_, args) =>
              this.resolver.getTokens(args as CommonTokenQueryArgs),
          },

          balances: {
            type: Types.TokenBalanceList,
            args: Args.TokenBalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getBalances(args as CommonBalanceQueryArgs),
          },
        },
      }),
    })
  }
}
