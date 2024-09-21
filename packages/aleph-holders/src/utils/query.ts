/* eslint-disable prefer-const */
import { EntityStorage } from '@aleph-indexer/core'
import {
  CommonBalance,
  CommonBalanceQueryArgs,
  CommonEvent,
  CommonEventQueryArgs,
} from '../types/common'

export async function getCommonBalances<T extends CommonBalance>(
  args: CommonBalanceQueryArgs,
  balanceDAL: EntityStorage<T>,
  balanceIndexes: {
    BlockchainAccount: string
    BlockchainBalance: string
  },
): Promise<T[]> {
  const { blockchain, account: acc, ...opts } = args

  console.log('QUERY BALANCE ', acc, args)

  opts.reverse = opts.reverse !== undefined ? opts.reverse : true

  let skip = opts.skip || 0
  const limit = opts.limit || 1000
  const result: T[] = []

  let entries

  if (!entries && acc) {
    entries = await balanceDAL
      .useIndex(balanceIndexes.BlockchainAccount)
      .getAllValuesFromTo([blockchain, acc], [blockchain, acc], opts)
  }

  if (!entries) {
    entries = await balanceDAL
      .useIndex(balanceIndexes.BlockchainBalance)
      .getAllValuesFromTo([blockchain], [blockchain], opts)
  }

  for await (const entry of entries) {
    // @note: Skip first N entries
    if (--skip >= 0) continue

    result.push(entry)

    // @note: Stop when after reaching the limit
    if (limit > 0 && result.length >= limit) return result
  }

  return result
}

export async function getCommonEvents<T extends CommonEvent>(
  args: CommonEventQueryArgs,
  eventDAL: EntityStorage<T>,
  eventIndexes: {
    BlockchainAccountTimestamp: string
    BlockchainAccountHeight: string
    BlockchainTimestamp: string
    BlockchainHeight: string
  },
): Promise<T[]> {
  let {
    startDate,
    endDate,
    startHeight,
    endHeight,
    blockchain,
    account: acc,
    ...opts
  } = args

  console.log('QUERY EVENTS ', acc, args)

  opts.reverse = opts.reverse !== undefined ? opts.reverse : true

  let skip = opts.skip || 0
  const limit = opts.limit || 1000
  const result: T[] = []

  let entries

  if (!entries && acc) {
    if (startDate !== undefined || endDate !== undefined) {
      startDate = startDate !== undefined ? startDate : 0
      endDate = endDate !== undefined ? endDate : Date.now()

      entries = await eventDAL
        .useIndex(eventIndexes.BlockchainAccountTimestamp)
        .getAllValuesFromTo(
          [blockchain, acc, startDate],
          [blockchain, acc, endDate],
          opts,
        )
    } else {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      entries = await eventDAL
        .useIndex(eventIndexes.BlockchainAccountHeight)
        .getAllValuesFromTo(
          [blockchain, acc, startHeight],
          [blockchain, acc, endHeight],
          opts,
        )
    }
  }

  if (!entries && (startDate !== undefined || endDate !== undefined)) {
    startDate = startDate !== undefined ? startDate : 0
    endDate = endDate !== undefined ? endDate : Date.now()

    entries = await eventDAL
      .useIndex(eventIndexes.BlockchainTimestamp)
      .getAllValuesFromTo([blockchain, startDate], [blockchain, endDate], opts)
  }

  if (!entries) {
    startHeight = startHeight !== undefined ? startHeight : 0
    endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

    entries = await eventDAL
      .useIndex(eventIndexes.BlockchainHeight)
      .getAllValuesFromTo(
        [blockchain, startHeight],
        [blockchain, endHeight],
        opts,
      )
  }

  for await (const entry of entries) {
    // @note: Skip first N entries
    if (--skip >= 0) continue

    result.push(entry)

    // @note: Stop when after reaching the limit
    if (limit > 0 && result.length >= limit) return result
  }

  return result
}
