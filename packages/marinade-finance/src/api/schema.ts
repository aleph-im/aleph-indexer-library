import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import * as Types from './types.js'
import {
  EventsFilters,
  GlobalStatsFilters,
  APIResolvers,
  AccountsFilters,
} from './resolvers.js'
import MainDomain from '../domain/main.js'

export default class APISchema extends IndexerAPISchema {
  constructor(
    protected domain: MainDomain,
    protected resolver: APIResolvers = new APIResolvers(domain),
  ) {
    super(domain, {
      types: Types.types,

      customTimeSeriesTypesMap: { access: Types.AccessTimeStats },
      customStatsType: Types.Stats,

      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          accounts: {
            type: Types.AccountInfoList,
            args: Types.AccountsArgs,
            resolve: (_, ctx, __, info) => {
              ctx.includeStats =
                !!info.fieldNodes[0].selectionSet?.selections.find(
                  (item) =>
                    item.kind === 'Field' && item.name.value === 'stats',
                )

              return this.resolver.getAccounts(ctx as AccountsFilters)
            },
          },

          events: {
            type: Types.EventsList,
            args: Types.AccountEventsArgs,
            resolve: (_, ctx) => this.resolver.getAccountEvents(ctx as EventsFilters),
          },

          globalStats: {
            type: Types.GlobalStats,
            args: Types.AccountsArgs,
            resolve: (_, ctx) =>
              resolver.getGlobalStats(ctx as GlobalStatsFilters),
          },
        },
      }),
    })
  }
}
