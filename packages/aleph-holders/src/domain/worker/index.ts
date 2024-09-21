import { BlockchainChain } from '@aleph-indexer/framework'
import { BlockchainWorkerClassI } from '../../types/common.js'
import EVMWorkerDomain from './evm.js'
import SolanaWorkerDomain from './solana.js'

export const blockchainWorkerClass: Partial<
  Record<BlockchainChain, BlockchainWorkerClassI>
> = {
  [BlockchainChain.Ethereum]: EVMWorkerDomain,
  [BlockchainChain.Bsc]: EVMWorkerDomain,
  [BlockchainChain.Base]: EVMWorkerDomain,
  [BlockchainChain.Avalanche]: EVMWorkerDomain,
  [BlockchainChain.Solana]: SolanaWorkerDomain,
}

export default blockchainWorkerClass
