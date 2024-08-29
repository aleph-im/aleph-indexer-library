import { EntityStorage, EntityUpdateOp } from '@aleph-indexer/core'
import { StreamBalance } from '../types.js'
import {
  bigNumberToString,
  blockchainDecimals,
  uint256ToBigNumber,
  uint256ToNumber,
} from '../utils/index.js'

export type StreamBalanceStorage = EntityStorage<StreamBalance>

export enum StreamBalanceDALIndex {
  BlockchainBalance = 'blockchain_balance',
}

const accountKey = {
  get: (e: StreamBalance) => e.account,
  length: EntityStorage.EthereumAddressLength,
}

const blockchainKey = {
  get: (e: StreamBalance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

const staticBalanceKey = {
  get: (e: StreamBalance) => e.staticBalance,
  length: 65, // @note: uint256 => 32 bytes => 64 characters + 1 char sign (-) => 65
}

const mapValueFn = async (value: any) => {
  // @note: Indexes sometimes are not synced with main storage
  if (!value) return value

  try {
    // @note: Stored as hex strings (bn.js "toJSON" method), so we need to cast them to BN always
    value.staticBalanceBN = uint256ToBigNumber(value.staticBalance)
    value.staticBalanceNum = uint256ToNumber(
      value.staticBalance,
      blockchainDecimals[value.blockchain],
    )
    value.flowRateBN = uint256ToBigNumber(value.flowRate)
    value.flowRateNum = uint256ToNumber(
      value.flowRate,
      blockchainDecimals[value.blockchain],
    )
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
    key: [blockchainKey, accountKey],
    indexes: [
      {
        name: StreamBalanceDALIndex.BlockchainBalance,
        key: [blockchainKey, staticBalanceKey],
      },
    ],
    mapValueFn,
    updateCheckFn: async (oldEntity, newEntity) => {
      let entity = newEntity

      if (oldEntity) {
        const oldStaticBalance = uint256ToBigNumber(oldEntity.staticBalance)
        const oldFlowRate = uint256ToBigNumber(oldEntity.flowRate)

        const newStaticBalance = uint256ToBigNumber(newEntity.staticBalance)
        const newFlowRate = uint256ToBigNumber(newEntity.flowRate)

        const staticBalance = bigNumberToString(
          oldStaticBalance.add(newStaticBalance),
        )
        const flowRate = bigNumberToString(oldFlowRate.add(newFlowRate))

        entity = {
          ...newEntity,
          staticBalance,
          flowRate,
        }
      }

      const staticBalance = uint256ToBigNumber(entity.staticBalance)
      const flowRate = uint256ToBigNumber(entity.flowRate)

      if (staticBalance.isZero() && flowRate.isZero())
        return { op: EntityUpdateOp.Delete }

      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
