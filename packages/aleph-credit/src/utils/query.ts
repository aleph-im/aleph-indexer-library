/* eslint-disable prefer-const */
import { EntityStorage, PendingWorkStorage } from '@aleph-indexer/core'
import {
  CommonEvent,
  CommonEventQueryArgs,
  CommonEventsQueryArgs,
  CommonQueryArgs,
} from '../types/common'

export async function getCommonEvents<T extends CommonEvent>(
  args: CommonEventsQueryArgs,
  eventDAL: EntityStorage<T>,
  eventIndexes: {
    BlockchainTokenTimestampIndex: string
    BlockchainTokenUpdatedIndex: string
    BlockchainTokenHeightIndex: string
    BlockchainTokenAccountTimestampIndex: string
    BlockchainTokenAccountUpdatedIndex: string
    BlockchainTokenAccountHeightIndex: string
  },
): Promise<T[]> {
  console.log('QUERY EVENTS ', args)

  let { skip = 0, limit = 1000, ...opts } = args
  opts.reverse = opts.reverse !== undefined ? opts.reverse : true

  let s = skip
  let l = limit

  const result: T[] = []

  const { index, from, to } = getQueryArgs(args, eventIndexes)

  const entries = await eventDAL
    .useIndex(index)
    .getAllValuesFromTo(from, to, opts)

  for await (const entry of entries) {
    // @note: Skip first N entries
    if (--s >= 0) continue

    result.push(entry)

    // @note: Stop when after reaching the limit
    if (l > 0 && result.length >= l) return result
  }

  return result
}

export async function getCommonEvent<T extends CommonEvent>(
  args: CommonEventQueryArgs,
  eventDAL: EntityStorage<T>,
  eventIndexes: {
    BlockchainTokenTransaction: string
  },
): Promise<T | undefined> {
  console.log('QUERY EVENT ', args)

  let { blockchain, token, transaction } = args

  const result = await eventDAL
    .useIndex(eventIndexes.BlockchainTokenTransaction)
    .getFirstValueFromTo(
      [blockchain, token, transaction],
      [blockchain, token, transaction],
    )

  return result
}

export async function getPendingEvents<T extends CommonEvent>(
  args: CommonQueryArgs,
  eventDAL: PendingWorkStorage<T>,
): Promise<T[]> {
  console.log('QUERY PENDING EVENTS ', args)

  let { skip = 0, limit = 1000, ...opts } = args
  opts.reverse = opts.reverse !== undefined ? opts.reverse : true

  let s = skip
  let l = limit

  const result: T[] = []

  const entries = await eventDAL.getAllValues(opts)

  for await (const entry of entries) {
    // @note: Skip first N entries
    if (--s >= 0) continue

    result.push(entry.payload)

    // @note: Stop when after reaching the limit
    if (l > 0 && result.length >= l) return result
  }

  return result
}

function getQueryArgs(
  args: CommonEventsQueryArgs,
  eventIndexes: {
    BlockchainTokenTimestampIndex: string
    BlockchainTokenUpdatedIndex: string
    BlockchainTokenHeightIndex: string
    BlockchainTokenAccountTimestampIndex: string
    BlockchainTokenAccountUpdatedIndex: string
    BlockchainTokenAccountHeightIndex: string
  },
) {
  let {
    startDate,
    endDate,
    startUpdate,
    endUpdate,
    startHeight,
    endHeight,
    account,
    blockchain,
    token,
  } = args

  const { index, start, end } =
    startUpdate !== undefined || endUpdate !== undefined
      ? {
          index: account
            ? eventIndexes.BlockchainTokenAccountUpdatedIndex
            : eventIndexes.BlockchainTokenUpdatedIndex,
          start: startUpdate !== undefined ? startUpdate : 0,
          end: endUpdate !== undefined ? endUpdate : Date.now(),
        }
      : startDate !== undefined || endDate !== undefined
      ? {
          index: account
            ? eventIndexes.BlockchainTokenAccountTimestampIndex
            : eventIndexes.BlockchainTokenTimestampIndex,
          start: startDate !== undefined ? startDate : 0,
          end: endDate !== undefined ? endDate : Date.now(),
        }
      : {
          index: account
            ? eventIndexes.BlockchainTokenAccountHeightIndex
            : eventIndexes.BlockchainTokenHeightIndex,
          start: startHeight !== undefined ? startHeight : 0,
          end: endHeight !== undefined ? endHeight : Number.MIN_SAFE_INTEGER,
        }

  const from = account
    ? [blockchain, token, account, start]
    : [blockchain, token, start]

  const to = account
    ? [blockchain, token, account, end]
    : [blockchain, token, end]

  return { index, from, to }
}
