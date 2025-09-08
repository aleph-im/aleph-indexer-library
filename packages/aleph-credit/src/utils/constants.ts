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
    [TokenId.USDC]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    [TokenId.ALEPH]: '0x4b3f52fFF693D898578f132f0222877848E09A8C',
  },
}

export const blockchainAlephCreditContractMap: Record<BlockchainId, string> = {
  [BlockchainId.Ethereum]: '0x3358637Ae744bDf30796fA5147459Bc98E455EeA',
  [BlockchainId.EthereumTestnet]: '0x3358637Ae744bDf30796fA5147459Bc98E455EeA',
}

export const tokenDecimalsMap: Record<string, number> = {
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 18,
  '0x27702a26126e0B3702af63Ee09aC4d1A084EF628': 18,
  '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238': 18,
  '0x4b3f52fFF693D898578f132f0222877848E09A8C': 18,
}

export const providerAddressMap: Record<string, ProviderId> = {
  '0x5930712f5Ad2752D35bAeB2c295F7B49aD459d27': ProviderId.TRANSAK,
  '0x085Ee67132Ec4297b85ed5d1b4C65424D36fDA7d': ProviderId.TRANSAK,
}

export const blackHoleAddressMap: Record<BlockchainId, string> = {
  [BlockchainId.Ethereum]: '0x0000000000000000000000000000000000000000',
  [BlockchainId.EthereumTestnet]: '0x0000000000000000000000000000000000000000',
}

export const alephConfig = {
  host: config.ALEPH_HOST || 'https://api2.aleph.im',
  paymentChannel: config.ALEPH_PAYMENT_CHANNEL || 'ALEPH_CREDIT_STAGING',
  paymentAddress: config.ALEPH_PAYMENT_ADDRESS,
}
