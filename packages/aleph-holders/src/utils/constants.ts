import BN from 'bn.js'
import { BlockchainChain, BlockchainId } from '@aleph-indexer/framework'

export const blockchainDecimals: Record<BlockchainId, number> = {
  [BlockchainChain.Ethereum]: 18,
  [BlockchainChain.Bsc]: 18,
  [BlockchainChain.Solana]: 8,
}

export const blockchainTotalSupply: Record<BlockchainId, BN> = {
  [BlockchainChain.Ethereum]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Bsc]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Solana]: new BN('0', 10),
}

export const blockchainTokenContract: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
  [BlockchainChain.Bsc]: '0x82D2f8E02Afb160Dd5A480a617692e62de9038C4',
  [BlockchainChain.Solana]: '3UCMiSnkcnkPE1pgQ5ggPCBv6dXgVUy16TmMUe1WpG9x',
}

export const blockchainDeployerAccount: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Bsc]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Solana]: 'BCD75RNBHrJJpW4dXVagL5mPjzRLnVZq4YirJdjEYMV7',
}
