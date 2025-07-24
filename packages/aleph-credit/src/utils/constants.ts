import { config } from '@aleph-indexer/core'
import { ProviderId } from '../types/provider.js'
import { BlockchainChain } from '@aleph-indexer/framework'

export enum BlockchainId {
  Ethereum = BlockchainChain.Ethereum,
  EthereumTestnet = 'ethereum-sepolia',
}

export enum TokenId {
  USDC = 'USDC',
  ALEPH = 'ALEPH',
}

export const blockchainTokenContractMap: Record<
  BlockchainId,
  Partial<Record<TokenId, string>>
> = {
  [BlockchainChain.Ethereum]: {
    [TokenId.USDC]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    [TokenId.ALEPH]: '0x27702a26126e0B3702af63Ee09aC4d1A084EF628',
  },
  [BlockchainId.EthereumTestnet]: {
    [TokenId.USDC]: '0x0c86A754A29714C4Fe9C6F1359fa7099eD174c0b', // staging TRANSAK // it should be production USDC
  },
}

export const blockchainAlephCreditContractMap: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0xB6B5358493AF8159B17506C5cC85df69193444BC',
  [BlockchainId.EthereumTestnet]: '0xB6B5358493AF8159B17506C5cC85df69193444BC', // staging test address // it should be deployed aleph contract
}

export const tokenDecimalsMap: Record<string, number> = {
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 18,
  '0x27702a26126e0B3702af63Ee09aC4d1A084EF628': 18,
  '0x0c86A754A29714C4Fe9C6F1359fa7099eD174c0b': 18,
}

export const providerAddressMap: Record<string, ProviderId> = {
  '0x5930712f5Ad2752D35bAeB2c295F7B49aD459d27': ProviderId.TRANSAK,
  '0x085Ee67132Ec4297b85ed5d1b4C65424D36fDA7d': ProviderId.TRANSAK,
}

export const blackHoleAddressMap: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0x0000000000000000000000000000000000000000',
  [BlockchainId.EthereumTestnet]: '0x0000000000000000000000000000000000000000',
}

export const alephConfig = {
  host: config.ALEPH_HOST || 'https://api2.aleph.im',
  paymentChannel: config.ALEPH_PAYMENT_CHANNEL || 'TEST_ALEPH_PAYMENT',
  paymentAddress:
    config.ALEPH_PAYMENT_ADDRESS ||
    '0xE73B86DefD3aDAf31643F549fA99caBe39a391dC',
}
