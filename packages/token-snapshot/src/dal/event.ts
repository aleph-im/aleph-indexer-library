import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenEvent } from '../types.js'
import { getBigNumberMapFn } from './common.js'

const mappedProps = ['balance']

export type EventStorage = EntityStorage<SPLTokenEvent>

export enum EventDALIndex {
  AccountTimestamp = 'account_timestamp',
  AccountTypeTimestamp = 'account_type_timestamp',
}

const idKey = {
  get: (e: SPLTokenEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: SPLTokenEvent) => e.account,
  length: EntityStorage.AddressLength,
}

const typeKey = {
  get: (e: SPLTokenEvent) => e.type,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: SPLTokenEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

export function createEventDAL(path: string): EventStorage {
  return new EntityStorage<SPLTokenEvent>({
    name: 'token_event',
    path,
    key: [idKey],
    indexes: [
      {
        name: EventDALIndex.AccountTimestamp,
        key: [accountKey, timestampKey],
      },
      {
        name: EventDALIndex.AccountTypeTimestamp,
        key: [accountKey, typeKey, timestampKey],
      },
    ],
    mapFn: getBigNumberMapFn(mappedProps),
  })
}
