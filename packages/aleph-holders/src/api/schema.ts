import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import { APIResolver } from './resolvers.js'
import MainDomain from '../domain/main.js'
import {
  CommonBalanceQueryArgs,
  CommonEventQueryArgs,
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
          transferEvents: {
            type: Types.EVMERC20TransferEventList,
            args: Args.TokenEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getTransferEvents(args as CommonEventQueryArgs),
          },
          flowUpdatedEvents: {
            type: Types.EVMStreamFlowUpdatedEventList,
            args: Args.TokenEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getFlowUpdatedEvents(args as CommonEventQueryArgs),
          },
          flowUpdatedExtensionEvents: {
            type: Types.EVMStreamFlowUpdatedExtensionEventList,
            args: Args.TokenEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getFlowUpdatedExtensionEvents(
                args as CommonEventQueryArgs,
              ),
          },
          events: {
            type: Types.TokenEventList,
            args: Args.TokenEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getEvents(args as CommonEventQueryArgs),
          },
          erc20Balances: {
            type: Types.EVMERC20BalanceList,
            args: Args.TokenBalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getERC20Balances(args as CommonBalanceQueryArgs),
          },
          streamBalances: {
            type: Types.EVMStreamBalanceList,
            args: Args.TokenBalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getStreamBalances(args as CommonBalanceQueryArgs),
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
