import BN from 'bn.js'
import { BlockchainChain, BlockchainId } from '@aleph-indexer/framework'

export const blockchainDecimals: Record<BlockchainId, number> = {
  [BlockchainChain.Ethereum]: 18,
  [BlockchainChain.Bsc]: 18,
  [BlockchainChain.Base]: 18,
  [BlockchainChain.Avalanche]: 18,
  [BlockchainChain.Solana]: 8,
}

export const blockchainTotalSupply: Record<BlockchainId, BN> = {
  [BlockchainChain.Ethereum]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Bsc]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Base]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Avalanche]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Solana]: new BN('0', 10),
}

export const blockchainTokenContract: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
  [BlockchainChain.Bsc]: '0x82D2f8E02Afb160Dd5A480a617692e62de9038C4',
  [BlockchainChain.Base]: '0xc0Fbc4967259786C743361a5885ef49380473dCF',
  [BlockchainChain.Avalanche]: '0xc0Fbc4967259786C743361a5885ef49380473dCF',
  [BlockchainChain.Solana]: '3UCMiSnkcnkPE1pgQ5ggPCBv6dXgVUy16TmMUe1WpG9x',
}

// @note: https://console.superfluid.finance/base-mainnet/protocol
// @note: Used to track "FlowUpdated" events
// @todo: Refactor
export const blockchainSuperfluidCFAContract: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '',
  [BlockchainChain.Bsc]: '',
  [BlockchainChain.Base]: '0x19ba78B9cDB05A877718841c574325fdB53601bb',
  [BlockchainChain.Avalanche]: '0x6946c5B38Ffea373b0a2340b4AEf0De8F6782e58',
  [BlockchainChain.Solana]: '',
}

export const blockchainDeployerAccount: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Bsc]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Base]: '0xBC5Fe50c691D1AF2975E66A15a7e80FC066a8257',
  [BlockchainChain.Avalanche]: '0xBC5Fe50c691D1AF2975E66A15a7e80FC066a8257',
  [BlockchainChain.Solana]: '6krMGWgeqD4CySfMr94WcfcVbf2TrMzfshAk5DcZ7mbu',
}

export const initialSupplyAccount: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Bsc]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Base]: '0x0000000000000000000000000000000000000000',
  [BlockchainChain.Avalanche]: '0x0000000000000000000000000000000000000000',
  [BlockchainChain.Solana]: '',
}
