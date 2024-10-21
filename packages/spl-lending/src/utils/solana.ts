import { BlockchainId, getBlockchainEnv } from '@aleph-indexer/framework'
import { SolanaRPC } from '@aleph-indexer/solana'

const solanaRPC: Record<BlockchainId, SolanaRPC> = {}

export function getSolanaRPC(blockchainId: BlockchainId): SolanaRPC {
  let rpc = solanaRPC[blockchainId]
  if (rpc) return rpc

  const privateEnv = getBlockchainEnv(blockchainId, 'RPC', true)

  const [privateUrls, privateRateLimitStr] = privateEnv.split('|')
  const url = privateUrls.split(',')[0]
  const rateLimit = privateRateLimitStr === 'true'

  rpc = new SolanaRPC({ url, rateLimit })
  solanaRPC[blockchainId] = rpc
  return rpc
}
