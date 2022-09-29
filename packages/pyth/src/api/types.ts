import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import { GraphQLBigNumber } from '@aleph-indexer/core'
import { GraphQLDateTime } from 'graphql-scalars'

export const CandleInterval = new GraphQLEnumType({
  name: 'CandleInterval',
  values: {
    Min1: { value: '1min' },
    Min5: { value: '5min' },
    Min10: { value: '10min' },
    Min15: { value: '15min' },
    Min30: { value: '30min' },
    Hour1: { value: '1h' },
    Hour2: { value: '2h' },
    Hour3: { value: '3h' },
    Hour4: { value: '4h' },
    Hour6: { value: '6h' },
    Hour8: { value: '8h' },
    Hour12: { value: '12h' },
    Day1: { value: '1d' },
    Week1: { value: '1w' },
    Week2: { value: '2w' },
    Month1: { value: '1m' },
    Month3: { value: '3m' },
    Year1: { value: '1y' },
    All: { value: 'all' },
  },
})

export const PriceStatus = new GraphQLEnumType({
  name: 'PriceStatus',
  values: {
    Unknown: { value: 'Unknown' },
    Trading: { value: 'Trading' },
    Halted: { value: 'Halted' },
    Auction: { value: 'Auction' },
  },
})

export const AssetType = new GraphQLEnumType({
  name: 'AssetType',
  values: {
    Crypto: { value: 'Crypto' },
    Equity: { value: 'Equity' },
    FX: { value: 'FX' },
    Metal: { value: 'Metal' },
  },
})

export const Price = new GraphQLObjectType({
  name: 'Price',
  fields: {
    timestamp: { type: GraphQLNonNull(GraphQLBigNumber) },
    price: { type: GraphQLNonNull(GraphQLFloat) },
    confidence: { type: GraphQLNonNull(GraphQLFloat) },
    status: { type: GraphQLNonNull(PriceStatus) },
  },
})

export const Candle = new GraphQLObjectType({
  name: 'Candle',
  fields: {
    openPrice: { type: GraphQLNonNull(GraphQLFloat) },
    highPrice: { type: GraphQLNonNull(GraphQLFloat) },
    lowPrice: { type: GraphQLNonNull(GraphQLFloat) },
    closePrice: { type: GraphQLNonNull(GraphQLFloat) },
    openConfidence: { type: GraphQLNonNull(GraphQLFloat) },
    highConfidence: { type: GraphQLNonNull(GraphQLFloat) },
    lowConfidence: { type: GraphQLNonNull(GraphQLFloat) },
    closeConfidence: { type: GraphQLNonNull(GraphQLFloat) },
    openTimestamp: { type: GraphQLNonNull(GraphQLDateTime) },
    highTimestamp: { type: GraphQLNonNull(GraphQLDateTime) },
    lowTimestamp: { type: GraphQLNonNull(GraphQLDateTime) },
    closeTimestamp: { type: GraphQLNonNull(GraphQLDateTime) },
  },
})

export const DataFeedInfo = new GraphQLObjectType({
  name: 'DataFeedInfo',
  fields: {
    address: { type: GraphQLNonNull(GraphQLString) },
    symbol: { type: GraphQLNonNull(GraphQLString) },
    assetType: { type: GraphQLNonNull(AssetType) },
    quoteCurrency: { type: GraphQLNonNull(GraphQLString) },
    tenor: { type: GraphQLNonNull(GraphQLString) },
  },
})

export const DataFeedStats = new GraphQLObjectType({
  name: 'DataFeedStats',
  fields: {
    last1h: { type: GraphQLNonNull(Candle) },
    last24h: { type: GraphQLNonNull(Candle) },
    last7d: { type: GraphQLNonNull(Candle) },
    last1m: { type: GraphQLNonNull(Candle) },
    lastYear: { type: GraphQLNonNull(Candle) },
    total: { type: GraphQLNonNull(Candle) },
    markPrice: { type: GraphQLNonNull(GraphQLFloat) },
    confidence: { type: GraphQLNonNull(GraphQLFloat) },
  },
})

export const GlobalStats = new GraphQLObjectType({
  name: 'GlobalStats',
  fields: {
    totalDataFeeds: { type: GraphQLNonNull(GraphQLBigNumber) },
    totalCryptoDataFeeds: { type: GraphQLNonNull(GraphQLBigNumber) },
    totalEquityDataFeeds: { type: GraphQLNonNull(GraphQLBigNumber) },
    totalFXDataFeeds: { type: GraphQLNonNull(GraphQLBigNumber) },
    totalMetalDataFeeds: { type: GraphQLNonNull(GraphQLBigNumber) },
  },
})
