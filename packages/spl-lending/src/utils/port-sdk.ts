import { Port } from '@port.finance/port-sdk'
import { getSolanaRPC } from './solana'
import { BlockchainChain } from '@aleph-indexer/framework'

const connection = getSolanaRPC(BlockchainChain.Solana).getConnection()

export const PORT_SDK = Port.forMainNet({
  connection,
})
