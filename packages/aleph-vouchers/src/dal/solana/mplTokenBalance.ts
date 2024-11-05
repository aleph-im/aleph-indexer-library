import {
  EntityStorage,
  EntityUpdateCheckFnReturn,
  EntityUpdateOp,
} from '@aleph-indexer/core'
import { MPLTokenBalance } from '../../types/solana.js'
import { getAllIndexableAccountsFromEvent } from '../../utils/solana.js'

export enum MPLTokenBalanceDALIndex {
  BlockchainAsset = 'blockchain_asset',
  BlockchainOwner = 'blockchain_owner',
}

export type MPLTokenBalanceStorage = EntityStorage<MPLTokenBalance>

const assetKey = {
  get: (e: MPLTokenBalance) => e.asset,
  length: EntityStorage.AddressLength,
}

const ownerKey = {
  get: (e: MPLTokenBalance) => getAllIndexableAccountsFromEvent(e),
  length: EntityStorage.AddressLength,
}

const blockchainKey = {
  get: (e: MPLTokenBalance) => e.blockchain,
  length: EntityStorage.VariableLength,
}

export function createMPLTokenBalanceDAL(path: string): MPLTokenBalanceStorage {
  return new EntityStorage<MPLTokenBalance>({
    name: 'mpl_token_balance',
    path,
    key: [blockchainKey, assetKey],
    indexes: [
      {
        name: MPLTokenBalanceDALIndex.BlockchainAsset,
        key: [blockchainKey, assetKey],
      },
      {
        name: MPLTokenBalanceDALIndex.BlockchainOwner,
        key: [blockchainKey, ownerKey],
      },
    ],
    async updateCheckFn(
      oldEntity: MPLTokenBalance | undefined,
      newEntity: MPLTokenBalance,
    ): Promise<EntityUpdateCheckFnReturn<MPLTokenBalance>> {
      const entity = newEntity

      if (oldEntity) {
        // @note: Regular token account update
        if (oldEntity.height >= newEntity.height) {
          return { op: EntityUpdateOp.Keep }
        }

        const entity: MPLTokenBalance = {
          ...oldEntity,
          ...newEntity,
        }

        return { op: EntityUpdateOp.Update, entity }
      }

      // @note: We can not delete it, because if an older ix arrives we cant compare dates and the balance will be outdated
      return { op: EntityUpdateOp.Update, entity }
    },
  })
}
