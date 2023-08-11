import { AccountMeta, PublicKey } from '@solana/web3.js'
export * from './accounts/index.js'
export * from './instructions/index.js'
export * from './types/index.js'

import {
  Marketplace,
  MarketplaceArgs,
  Product,
  ProductArgs,
  Reward,
  RewardArgs,
  Access,
  AccessArgs,
  Payment,
  PaymentArgs,
} from './accounts/index.js'

import {
  EditMarketplaceParams,
  InitMarketplaceParams,
  InitProductTreeParams,
  InitProductParams,
  RegisterBuyCnftParams,
  UpdateProductTreeParams,
  TokenConfig,
  PermissionConfig,
  FeesConfig,
  RewardsConfig,
  MarketplaceBumps,
  SellerConfig,
  ProductBumps,
  RewardBumps,
  PaymentFeePayer,
} from './types/index.js'

export type AcceptAccessInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const AcceptAccessAccounts = [
  'systemProgram',
  'tokenProgram2022',
  'associatedTokenProgram',
  'rent',
  'signer',
  'receiver',
  'marketplace',
  'request',
  'accessMint',
  'accessVault',
]

export type AirdropAccessInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const AirdropAccessAccounts = [
  'systemProgram',
  'tokenProgram2022',
  'associatedTokenProgram',
  'rent',
  'signer',
  'receiver',
  'marketplace',
  'accessMint',
  'accessVault',
]

export type EditProductInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const EditProductAccounts = ['signer', 'product', 'paymentMint']

export type EditMarketplaceInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const EditMarketplaceAccounts = [
  'signer',
  'marketplace',
  'rewardMint',
  'discountMint',
]

export type InitBountyInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const InitBountyAccounts = [
  'systemProgram',
  'tokenProgramV0',
  'associatedTokenProgram',
  'rent',
  'signer',
  'marketplace',
  'rewardMint',
  'bountyVault',
]

export type InitMarketplaceInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const InitMarketplaceAccounts = [
  'systemProgram',
  'tokenProgram2022',
  'tokenProgramV0',
  'rent',
  'signer',
  'marketplace',
  'accessMint',
  'rewardMint',
  'discountMint',
  'bountyVault',
]

export type InitProductTreeInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const InitProductTreeAccounts = [
  'tokenMetadataProgram',
  'logWrapper',
  'systemProgram',
  'bubblegumProgram',
  'compressionProgram',
  'tokenProgramV0',
  'associatedTokenProgram',
  'rent',
  'signer',
  'marketplace',
  'product',
  'productMint',
  'paymentMint',
  'accessMint',
  'productMintVault',
  'accessVault',
  'masterEdition',
  'metadata',
  'merkleTree',
  'treeAuthority',
]

export type InitProductInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const InitProductAccounts = [
  'systemProgram',
  'tokenProgram2022',
  'rent',
  'signer',
  'marketplace',
  'product',
  'productMint',
  'paymentMint',
  'accessMint',
  'accessVault',
]

export type InitRewardVaultInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const InitRewardVaultAccounts = [
  'systemProgram',
  'tokenProgramV0',
  'associatedTokenProgram',
  'rent',
  'signer',
  'marketplace',
  'reward',
  'rewardMint',
  'rewardVault',
]

export type InitRewardInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const InitRewardAccounts = [
  'systemProgram',
  'tokenProgramV0',
  'rent',
  'signer',
  'marketplace',
  'reward',
  'rewardMint',
  'rewardVault',
]

export type RegisterBuyCnftInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RegisterBuyCnftAccounts = [
  'systemProgram',
  'tokenProgramV0',
  'rent',
  'logWrapper',
  'bubblegumProgram',
  'compressionProgram',
  'tokenMetadataProgram',
  'signer',
  'seller',
  'marketplaceAuth',
  'marketplace',
  'product',
  'paymentMint',
  'productMint',
  'buyerTransferVault',
  'sellerTransferVault',
  'marketplaceTransferVault',
  'bountyVault',
  'sellerReward',
  'sellerRewardVault',
  'buyerReward',
  'buyerRewardVault',
  'metadata',
  'masterEdition',
  'treeAuthority',
  'bubblegumSigner',
  'merkleTree',
]

export type RegisterBuyCounterInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RegisterBuyCounterAccounts = [
  'systemProgram',
  'tokenProgramV0',
  'rent',
  'signer',
  'seller',
  'marketplaceAuth',
  'marketplace',
  'product',
  'payment',
  'paymentMint',
  'buyerTransferVault',
  'sellerTransferVault',
  'marketplaceTransferVault',
  'bountyVault',
  'sellerReward',
  'sellerRewardVault',
  'buyerReward',
  'buyerRewardVault',
]

export type RegisterBuyTokenInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RegisterBuyTokenAccounts = [
  'systemProgram',
  'tokenProgramV0',
  'tokenProgram2022',
  'signer',
  'seller',
  'marketplaceAuth',
  'marketplace',
  'product',
  'productMint',
  'paymentMint',
  'buyerTokenVault',
  'buyerTransferVault',
  'sellerTransferVault',
  'marketplaceTransferVault',
  'bountyVault',
  'sellerReward',
  'sellerRewardVault',
  'buyerReward',
  'buyerRewardVault',
]

export type RegisterBuyInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RegisterBuyAccounts = [
  'systemProgram',
  'tokenProgramV0',
  'rent',
  'signer',
  'seller',
  'marketplaceAuth',
  'marketplace',
  'product',
  'payment',
  'paymentMint',
  'buyerTransferVault',
  'sellerTransferVault',
  'marketplaceTransferVault',
  'bountyVault',
  'sellerReward',
  'sellerRewardVault',
  'buyerReward',
  'buyerRewardVault',
]

export type RequestAccessInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RequestAccessAccounts = [
  'systemProgram',
  'rent',
  'signer',
  'marketplace',
  'request',
]

export type UpdateTreeInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdateTreeAccounts = [
  'payer',
  'signer',
  'marketplace',
  'product',
  'treeAuthority',
  'merkleTree',
  'logWrapper',
  'systemProgram',
  'bubblegumProgram',
  'compressionProgram',
]

export type WithdrawRewardInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const WithdrawRewardAccounts = [
  'tokenProgramV0',
  'signer',
  'marketplace',
  'reward',
  'rewardMint',
  'receiverVault',
  'rewardVault',
]

export type ParsedInstructions =
  | AcceptAccessInstruction
  | AirdropAccessInstruction
  | EditProductInstruction
  | EditMarketplaceInstruction
  | InitBountyInstruction
  | InitMarketplaceInstruction
  | InitProductTreeInstruction
  | InitProductInstruction
  | InitRewardVaultInstruction
  | InitRewardInstruction
  | RegisterBuyCnftInstruction
  | RegisterBuyCounterInstruction
  | RegisterBuyTokenInstruction
  | RegisterBuyInstruction
  | RequestAccessInstruction
  | UpdateTreeInstruction
  | WithdrawRewardInstruction
export type ParsedAccounts = Marketplace | Product | Reward | Access | Payment

export type ParsedAccountsData =
  | MarketplaceArgs
  | ProductArgs
  | RewardArgs
  | AccessArgs
  | PaymentArgs

export type ParsedTypes =
  | PaymentFeePayer
  | EditMarketplaceParams
  | InitMarketplaceParams
  | InitProductTreeParams
  | InitProductParams
  | RegisterBuyCnftParams
  | UpdateProductTreeParams
  | TokenConfig
  | PermissionConfig
  | FeesConfig
  | RewardsConfig
  | MarketplaceBumps
  | SellerConfig
  | ProductBumps
  | RewardBumps
