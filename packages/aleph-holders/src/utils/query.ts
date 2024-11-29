/* eslint-disable prefer-const */
import { EntityStorage } from '@aleph-indexer/core'
import {
  CommonBalance,
  CommonEvent,
  CommonBalanceQueryArgs,
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
  const { blockchain, account, skip = 0, limit = 1000, ...opts } = args

  console.log('QUERY BALANCE ', account, args)

  opts.reverse = opts.reverse !== undefined ? opts.reverse : true

  let s = skip
  let l = limit
  const result: T[] = []

  let entries

  if (!entries && account) {
    entries = await balanceDAL
      .useIndex(balanceIndexes.BlockchainAccount)
      .getAllValuesFromTo([blockchain, account], [blockchain, account], opts)
  }

  if (!entries) {
    entries = await balanceDAL
      .useIndex(balanceIndexes.BlockchainBalance)
      .getAllValuesFromTo([blockchain], [blockchain], opts)
  }

  for await (const entry of entries) {
    if (entry.balanceBN?.isZero()) continue

    // @note: Skip first N entries
    if (--s >= 0) continue

    result.push(entry)

    // @note: Stop when after reaching the limit
    if (l > 0 && result.length >= l) return result
  }

  return result
}

export async function getCommonEvents<T extends CommonEvent>(
  args: CommonEventQueryArgs,
  eventDAL: EntityStorage<T>,
  eventIndexes: {
    BlockchainAccountTimestampIndex: string
    BlockchainAccountHeightIndex: string
    BlockchainTimestampIndex: string
    BlockchainHeightIndex: string
  },
): Promise<T[]> {
  let {
    startDate,
    endDate,
    startHeight,
    endHeight,
    blockchain,
    account,
    skip = 0,
    limit = 1000,
    ...opts
  } = args

  console.log('QUERY EVENTS ', account, args)

  opts.reverse = opts.reverse !== undefined ? opts.reverse : true

  let s = skip
  let l = limit
  const result: T[] = []

  let entries

  if (!entries && account) {
    if (startDate !== undefined || endDate !== undefined) {
      startDate = startDate !== undefined ? startDate : 0
      endDate = endDate !== undefined ? endDate : Date.now()

      entries = await eventDAL
        .useIndex(eventIndexes.BlockchainAccountTimestampIndex)
        .getAllValuesFromTo(
          [blockchain, account, startDate],
          [blockchain, account, endDate],
          opts,
        )
    } else {
      startHeight = startHeight !== undefined ? startHeight : 0
      endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

      entries = await eventDAL
        .useIndex(eventIndexes.BlockchainAccountHeightIndex)
        .getAllValuesFromTo(
          [blockchain, account, startHeight],
          [blockchain, account, endHeight],
          opts,
        )
    }
  }

  if (!entries && (startDate !== undefined || endDate !== undefined)) {
    startDate = startDate !== undefined ? startDate : 0
    endDate = endDate !== undefined ? endDate : Date.now()

    entries = await eventDAL
      .useIndex(eventIndexes.BlockchainTimestampIndex)
      .getAllValuesFromTo([blockchain, startDate], [blockchain, endDate], opts)
  }

  if (!entries) {
    startHeight = startHeight !== undefined ? startHeight : 0
    endHeight = endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER

    entries = await eventDAL
      .useIndex(eventIndexes.BlockchainHeightIndex)
      .getAllValuesFromTo(
        [blockchain, startHeight],
        [blockchain, endHeight],
        opts,
      )
  }

  for await (const entry of entries) {
    // @note: Skip first N entries
    if (--s >= 0) continue

    result.push(entry)

    // @note: Stop when after reaching the limit
    if (l > 0 && result.length >= l) return result
  }

  return result
}
