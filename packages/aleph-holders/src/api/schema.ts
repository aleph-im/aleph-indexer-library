import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import * as Types from './types.js'
import * as Args from './args.js'
import { APIResolver } from './resolvers.js'
import MainDomain from '../domain/main.js'
import { BalanceQueryArgs, ERC20TransferEventQueryArgs } from '../types.js'

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
            type: Types.ERC20TransferEventList,
            args: Args.ERC20TransferEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getEvents(args as ERC20TransferEventQueryArgs),
          },
          balances: {
            type: Types.ERC20BalanceList,
            args: Args.ERC20BalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getBalances(args as BalanceQueryArgs),
          },
        },
      }),
    })
  }
}
