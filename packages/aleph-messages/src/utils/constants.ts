import { BlockchainId } from '@aleph-indexer/framework'

export enum BlockchainChain {
  Ethereum = 'ethereum',
  Bsc = 'bsc',
  Solana = 'solana',
  OasysTestnet = 'oasys-testnet',
  HomeverseTestnet = 'homeverse-testnet',
}

export const blockchainContract: Record<BlockchainId, string> = {
  [BlockchainChain.Ethereum]: '0x166fd4299364B21c7567e163d85D78d2fb2f8Ad5',
  [BlockchainChain.Bsc]: '0xdF270752C8C71D08acbae4372687DA65AECe2D5D',
  [BlockchainChain.Solana]: 'ALepH1n9jxScbz45aZhBYVa35zxBNbKSvL6rWQpb4snc',
  [BlockchainChain.OasysTestnet]: '0xC0134b5B924c2FCA106eFB33C45446c466FBe03e',
  [BlockchainChain.HomeverseTestnet]:
    '0xC0134b5B924c2FCA106eFB33C45446c466FBe03e',
}
