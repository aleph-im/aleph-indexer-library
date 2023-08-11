import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { EntityStorage } from '@aleph-indexer/core'
import { BrickEvent } from '../utils/layouts/index.js'

export type EventStorage = EntityStorage<BrickEvent>

// in this vector you can include the properties of several
// events that are BN in order to be able to cast them
const mappedBNProps: string[] = ['productPrice']

// in this vector you can include the properties of several
// events that are PublicKey in order to be able to cast them
const mappedPublicKeyProps: string[] = ['programId']

export enum EventDALIndex {
  AccountTimestamp = 'account_timestamp',
  AccountTypeTimestamp = 'account_type_timestamp',
}

const idKey = {
  get: (e: BrickEvent) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: BrickEvent) => e.account,
  length: EntityStorage.AddressLength,
}

const typeKey = {
  get: (e: BrickEvent) => e.type,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: BrickEvent) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

export function createEventDAL(path: string): EventStorage {
  return new EntityStorage<BrickEvent>({
    name: 'event',
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
    mapFn: async function (entry) {
      const { key, value } = entry

      // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
      for (const prop of mappedBNProps) {
        if (!(prop in value)) continue
        if ((value as any)[prop] instanceof BN) continue
        ;(value as any)[prop] = new BN((value as any)[prop], 'hex')
      }

      for (const prop of mappedPublicKeyProps) {
        console.log(value, prop in value)
        if (!(prop in value)) continue
        if ((value as any)[prop] instanceof PublicKey) continue
        ;(value as any)[prop] = new PublicKey((value as any)[prop])
      }

      return { key, value }
    },
  })
}
