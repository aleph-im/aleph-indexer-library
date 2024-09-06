import { EntityStorage } from '@aleph-indexer/core'
import { StreamBalance } from '../types.js'
import { getBNFormats } from '../utils/index.js'

export type StreamBalanceStorage = EntityStorage<StreamBalance>

export enum StreamBalanceDALIndex {
  BlockchainAccount = 'blockchain_account',
  BlockchainBalance = 'blockchain_balance',
}

const idKey = {
  get: (e: StreamBalance) => e.id,
  length: EntityStorage.VariableLength,
}

const accountKey = {
  get: (e: StreamBalance) => e.account,
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: StreamBalance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

// @todo: Take into account flowRate to sort by total balance (static + real time)
const staticBalanceKey = {
  get: (e: StreamBalance) => e.staticBalance,
  length: 65, // @note: uint256 => 32 bytes => 64 characters + 1 char sign (-) => 65
}

const mapValueFn = async (value: any) => {
  // @note: Indexes sometimes are not synced with main storage
  if (!value) return value

  try {
    // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
    const sb = getBNFormats(value.staticBalance, value.blockchain)
    value.staticBalance = sb.value
    value.staticBalanceBN = sb.valueBN
    value.staticBalanceNum = sb.valueNum

    const fr = getBNFormats(value.flowRate, value.blockchain, 'int96')
    value.flowRate = fr.value
    value.flowRateBN = fr.valueBN
    value.flowRateNum = fr.valueNum

    const d = getBNFormats(value.deposit, value.blockchain)
    value.deposit = d.value
    value.depositBN = d.valueBN
    value.depositNum = d.valueNum
  } catch (e) {
    console.log(e)
    console.log('ERR VAL', value)
  }

  return value
}

export function createStreamBalanceDAL(path: string): StreamBalanceStorage {
  return new EntityStorage<StreamBalance>({
    name: 'stream_balance',
    path,
    key: [blockchainKey, accountKey, idKey],
    indexes: [
      {
        name: StreamBalanceDALIndex.BlockchainAccount,
        key: [blockchainKey, accountKey],
      },
      {
        name: StreamBalanceDALIndex.BlockchainBalance,
        key: [blockchainKey, staticBalanceKey],
      },
    ],
    mapValueFn,
  })
}
