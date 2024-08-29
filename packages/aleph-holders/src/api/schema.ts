import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import * as Types from './types.js'
import * as Args from './args.js'
import { APIResolver } from './resolvers.js'
import MainDomain from '../domain/main.js'
import {
  CommonBalanceQueryArgs,
  ERC20BalanceQueryArgs,
  ERC20TransferEventQueryArgs,
  StreamBalanceQueryArgs,
  StreamFlowUpdatedEventQueryArgs,
} from '../types.js'

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
            type: Types.ERC20TransferEventList,
            args: Args.ERC20TransferEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getTransferEvents(
                args as ERC20TransferEventQueryArgs,
              ),
          },
          flowUpdatedEvents: {
            type: Types.StreamFlowUpdatedEventList,
            args: Args.StreamFlowUpdatedEventQueryArgs,
            resolve: (_, args) =>
              this.resolver.getFlowUpdatedEvents(
                args as StreamFlowUpdatedEventQueryArgs,
              ),
          },
          erc20Balances: {
            type: Types.ERC20BalanceList,
            args: Args.ERC20BalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getERC20Balances(args as ERC20BalanceQueryArgs),
          },
          streamBalances: {
            type: Types.StreamBalanceList,
            args: Args.StreamBalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getStreamBalances(args as StreamBalanceQueryArgs),
          },
          balances: {
            type: Types.ERC20BalanceList,
            args: Args.ERC20BalanceQueryArgs,
            resolve: (_, args) =>
              this.resolver.getBalances(args as CommonBalanceQueryArgs),
          },
        },
      }),
    })
  }
}
