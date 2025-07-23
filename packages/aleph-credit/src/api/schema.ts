import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import { APIResolver } from './resolvers.js'
import MainDomain from '../domain/main.js'
import {
  CommonQueryArgs,
  CommonTransferQueryArgs,
  CommonTransfersQueryArgs,
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
          transfers: {
            type: Types.EVMERC20TransferEventList,
            args: Args.TokenTransferQueryArgs,
            resolve: (_, args) =>
              this.resolver.getTransfers(args as CommonTransfersQueryArgs),
          },
          transfer: {
            type: Types.EVMERC20TransferEvent,
            args: Args.TokenTransfeQueryArgs,
            resolve: (_, args) =>
              this.resolver.getTransfer(args as CommonTransferQueryArgs),
          },
          pendingTransfers: {
            type: Types.EVMERC20PendingTransferEventList,
            args: Args.CommonQueryArgs,
            resolve: (_, args) =>
              this.resolver.getPendingTransfers(args as CommonQueryArgs),
          },
        },
      }),
    })
  }
}
