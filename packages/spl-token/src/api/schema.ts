import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import * as Types from './types.js'
import {
  APIResolver,
  AccountHoldingsFilters,
  TokenEventsFilters,
} from './resolvers.js'
import MainDomain from '../domain/main.js'

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
          tokenMints: {
            type: Types.TokenMints,
            args: {
              mint: { type: new GraphQLList(GraphQLString) },
            },
            resolve: (_, ctx) => this.resolver.getTokens(ctx.mint),
          },
          accountHoldings: {
            type: Types.AccountsHoldings,
            args: {
              mint: { type: new GraphQLNonNull(GraphQLString) },
              account: { type: GraphQLString },
              startDate: { type: GraphQLFloat },
              endDate: { type: GraphQLFloat },
              gte: { type: GraphQLString },
            },
            resolve: (_, ctx) =>
              this.resolver.getAccountHoldings(ctx as AccountHoldingsFilters),
          },
          tokenEvents: {
            type: Types.TokenEvents,
            args: {
              mint: { type: new GraphQLNonNull(GraphQLString) },
              account: { type: GraphQLString },
              types: { type: new GraphQLList(Types.TokenEventType) },
              startDate: { type: GraphQLFloat },
              endDate: { type: GraphQLFloat },
              limit: { type: GraphQLInt },
              skip: { type: GraphQLInt },
              reverse: { type: GraphQLBoolean },
            },
            resolve: (_, ctx) =>
              this.resolver.getTokenEvents(ctx as TokenEventsFilters),
          },
          tokenHolders: {
            type: Types.TokenHolders,
            args: {
              mint: { type: new GraphQLNonNull(GraphQLString) },
              limit: { type: GraphQLInt },
              skip: { type: GraphQLInt },
              reverse: { type: GraphQLBoolean },
              gte: { type: GraphQLString },
              lte: { type: GraphQLString },
            },
            resolve: (_, ctx) =>
              this.resolver.getTokenHolders(ctx as TokenEventsFilters),
          },
        },
      }),
    })
  }
}
