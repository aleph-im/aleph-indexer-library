import { ViewInstructions } from './types.js'

export function renderDALFiles(
  instructionsView: ViewInstructions | undefined,
): [string, string][] {
  const files: [string, string][] = [];
  
  files.push(['event', generateEventDal(instructionsView)]);

  return files;
}

function generateEventDal(
  instructionsView: ViewInstructions | undefined,
): string {
  const bigNum: Set<string> = new Set([
    'u64',
    'u128',
    'u256',
    'u512',
    'i64',
    'i128',
    'i256',
    'i512',
  ])

  const uniqueBNProp: Set<string> = new Set()
  const uniquePubkeyProp: Set<string> = new Set()

  if (instructionsView) {
    for (const ix of instructionsView.instructions) {
      for (const arg of ix.args) {
        if (typeof arg.type === 'string') {
          if (arg.type === 'publicKey') {
            uniquePubkeyProp.add(arg.name)
          }
          if (bigNum.has(arg.type)) {
            uniqueBNProp.add(arg.name)
          }
        }
      }
    }
  }

  const stringifySet = (set: Set<string>): string => {
    return Array.from(set)
      .map(prop => `  '${prop}',\n`)
      .join('');
  }

  return `import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { EntityStorage } from '@aleph-indexer/core'
import { ParsedEvents } from '../utils/layouts/index.js'

export type EventStorage = EntityStorage<ParsedEvents>

// in this vector you can include the properties of several
// events that are BN in order to be able to cast them
const mappedBNProps: string[] = [
  ${stringifySet(uniqueBNProp)}
]

// in this vector you can include the properties of several
// events that are PublicKey in order to be able to cast them
const mappedPublicKeyProps: string[] = [
  'programId',
  ${stringifySet(uniquePubkeyProp)}
]

export enum EventDALIndex {
  AccountTimestamp = 'account_timestamp',
  AccountTypeTimestamp = 'account_type_timestamp',
}

const idKey = {
  get: (e: ParsedEvents) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: ParsedEvents) => e.account,
  length: EntityStorage.AddressLength,
}

const typeKey = {
  get: (e: ParsedEvents) => e.type,
  length: EntityStorage.VariableLength,
}

const timestampKey = {
  get: (e: ParsedEvents) => e.timestamp,
  length: EntityStorage.TimestampLength,
}

export function createEventDAL(path: string): EventStorage {
  return new EntityStorage<ParsedEvents>({
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
        if (!(prop in value)) continue
        if ((value as any)[prop] instanceof PublicKey) continue
        ;(value as any)[prop] = new PublicKey((value as any)[prop])
      }

      return { key, value }
    },
  })
}
`
}