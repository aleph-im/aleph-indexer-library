import { BlockchainChain } from '@aleph-indexer/framework'
import { BlockchainWorkerClassI } from '../../types/common.js'
import SolanaWorkerDomain from './solana.js'

export const blockchainWorkerClass: Partial<
  Record<BlockchainChain, BlockchainWorkerClassI>
> = {
  [BlockchainChain.Solana]: SolanaWorkerDomain,
}

export default blockchainWorkerClass
