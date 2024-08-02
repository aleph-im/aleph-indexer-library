import BN from 'bn.js'
import { BlockchainChain, BlockchainId } from '@aleph-indexer/framework'

export const blockchainDecimals: Record<BlockchainId, number> = {
  [BlockchainChain.Ethereum]: 18,
  [BlockchainChain.Bsc]: 18,
  [BlockchainChain.Base]: 18,
  [BlockchainChain.Avalanche]: 18,
}

export const blockchainTotalSupply: Record<BlockchainId, BN> = {
  [BlockchainChain.Ethereum]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Bsc]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Base]: new BN('500000000000000000000000000', 10),
  [BlockchainChain.Avalanche]: new BN('500000000000000000000000000', 10),
}

export const blockchainTokenContract: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
  [BlockchainChain.Bsc]: '0x82D2f8E02Afb160Dd5A480a617692e62de9038C4',
  [BlockchainChain.Base]: '__TODO__',
  [BlockchainChain.Avalanche]: '0xc0Fbc4967259786C743361a5885ef49380473dCF',
}

export const blockchainDeployerAccount: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Bsc]: '0xb6e45ADfa0C7D70886bBFC990790d64620F1BAE8',
  [BlockchainChain.Base]: '__TODO__',
  [BlockchainChain.Avalanche]: '0xBC5Fe50c691D1AF2975E66A15a7e80FC066a8257',
}
