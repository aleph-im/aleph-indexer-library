import { BlockchainChain } from '@aleph-indexer/framework'
import { BlockchainWorkerClassI } from '../../types/common.js'
import EVMWorkerDomain from './evm.js'

export const blockchainWorkerClass: Partial<
  Record<BlockchainChain, BlockchainWorkerClassI>
> = {
  [BlockchainChain.Ethereum]: EVMWorkerDomain,
}

export default blockchainWorkerClass
