import BN from 'bn.js'
import { EntityStorage } from '@aleph-indexer/core'
import { SPLTokenEvent } from '../types.js'

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

export function createSolanaEventDAL(path: string): EventStorage {
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
    mapFn: async function (entry: { key: any; value: any }) {
      const { key, value } = entry

      // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
      for (const prop of mappedProps) {
        if (!(prop in value)) continue
        if ((value as any)[prop] instanceof BN) continue
        ;(value as any)[prop] = new BN((value as any)[prop], 'hex')
      }

      return { key, value }
    },
  })
}
