import { GraphQLBoolean, GraphQLInt } from 'graphql'
import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLUnionType,
} from 'graphql'
import { GraphQLBigNumber, GraphQLLong, GraphQLJSON } from '@aleph-indexer/core'
import { InstructionType } from '../utils/layouts/index.js'

// ------------------- TYPES ---------------------------

export const PaymentFeePayer = new GraphQLEnumType({
  name: 'PaymentFeePayer',
  values: {
    Buyer: { value: 0 },
    Seller: { value: 1 },
  },
})

export const EditMarketplaceParams = new GraphQLObjectType({
  name: 'EditMarketplaceParams',
  fields: {
    fee: { type: new GraphQLNonNull(GraphQLInt) },
    feeReduction: { type: new GraphQLNonNull(GraphQLInt) },
    sellerReward: { type: new GraphQLNonNull(GraphQLInt) },
    buyerReward: { type: new GraphQLNonNull(GraphQLInt) },
    useCnfts: { type: new GraphQLNonNull(GraphQLBoolean) },
    deliverToken: { type: new GraphQLNonNull(GraphQLBoolean) },
    transferable: { type: new GraphQLNonNull(GraphQLBoolean) },
    chainCounter: { type: new GraphQLNonNull(GraphQLBoolean) },
    permissionless: { type: new GraphQLNonNull(GraphQLBoolean) },
    rewardsEnabled: { type: new GraphQLNonNull(GraphQLBoolean) },
    feePayer: { type: new GraphQLNonNull(PaymentFeePayer) },
  },
})

export const InitMarketplaceParams = new GraphQLObjectType({
  name: 'InitMarketplaceParams',
  fields: {
    fee: { type: new GraphQLNonNull(GraphQLInt) },
    feeReduction: { type: new GraphQLNonNull(GraphQLInt) },
    sellerReward: { type: new GraphQLNonNull(GraphQLInt) },
    buyerReward: { type: new GraphQLNonNull(GraphQLInt) },
    useCnfts: { type: new GraphQLNonNull(GraphQLBoolean) },
    deliverToken: { type: new GraphQLNonNull(GraphQLBoolean) },
    transferable: { type: new GraphQLNonNull(GraphQLBoolean) },
    chainCounter: { type: new GraphQLNonNull(GraphQLBoolean) },
    permissionless: { type: new GraphQLNonNull(GraphQLBoolean) },
    rewardsEnabled: { type: new GraphQLNonNull(GraphQLBoolean) },
    accessMintBump: { type: new GraphQLNonNull(GraphQLInt) },
    feePayer: { type: new GraphQLNonNull(PaymentFeePayer) },
  },
})

export const InitProductTreeParams = new GraphQLObjectType({
  name: 'InitProductTreeParams',
  fields: {
    firstId: { type: new GraphQLNonNull(GraphQLString) },
    secondId: { type: new GraphQLNonNull(GraphQLString) },
    productPrice: { type: new GraphQLNonNull(GraphQLBigNumber) },
    maxDepth: { type: new GraphQLNonNull(GraphQLInt) },
    maxBufferSize: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    metadataUrl: { type: new GraphQLNonNull(GraphQLString) },
    feeBasisPoints: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const InitProductParams = new GraphQLObjectType({
  name: 'InitProductParams',
  fields: {
    firstId: { type: new GraphQLNonNull(GraphQLString) },
    secondId: { type: new GraphQLNonNull(GraphQLString) },
    productPrice: { type: new GraphQLNonNull(GraphQLBigNumber) },
    productMintBump: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const RegisterBuyCnftParams = new GraphQLObjectType({
  name: 'RegisterBuyCnftParams',
  fields: {
    amount: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    symbol: { type: new GraphQLNonNull(GraphQLString) },
    uri: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const UpdateProductTreeParams = new GraphQLObjectType({
  name: 'UpdateProductTreeParams',
  fields: {
    maxDepth: { type: new GraphQLNonNull(GraphQLInt) },
    maxBufferSize: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const TokenConfig = new GraphQLObjectType({
  name: 'TokenConfig',
  fields: {
    useCnfts: { type: new GraphQLNonNull(GraphQLBoolean) },
    deliverToken: { type: new GraphQLNonNull(GraphQLBoolean) },
    transferable: { type: new GraphQLNonNull(GraphQLBoolean) },
    chainCounter: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
})

export const PermissionConfig = new GraphQLObjectType({
  name: 'PermissionConfig',
  fields: {
    accessMint: { type: new GraphQLNonNull(GraphQLString) },
    permissionless: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
})

export const FeesConfig = new GraphQLObjectType({
  name: 'FeesConfig',
  fields: {
    discountMint: { type: new GraphQLNonNull(GraphQLString) },
    fee: { type: new GraphQLNonNull(GraphQLInt) },
    feeReduction: { type: new GraphQLNonNull(GraphQLInt) },
    feePayer: { type: new GraphQLNonNull(PaymentFeePayer) },
  },
})

export const RewardsConfig = new GraphQLObjectType({
  name: 'RewardsConfig',
  fields: {
    rewardMint: { type: new GraphQLNonNull(GraphQLString) },
    bountyVaults: { type: new GraphQLNonNull(GraphQLList(GraphQLString)) },
    sellerReward: { type: new GraphQLNonNull(GraphQLInt) },
    buyerReward: { type: new GraphQLNonNull(GraphQLInt) },
    rewardsEnabled: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
})

export const MarketplaceBumps = new GraphQLObjectType({
  name: 'MarketplaceBumps',
  fields: {
    bump: { type: new GraphQLNonNull(GraphQLInt) },
    vaultBumps: { type: new GraphQLNonNull(GraphQLString) },
    accessMintBump: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const SellerConfig = new GraphQLObjectType({
  name: 'SellerConfig',
  fields: {
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    productPrice: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const ProductBumps = new GraphQLObjectType({
  name: 'ProductBumps',
  fields: {
    bump: { type: new GraphQLNonNull(GraphQLInt) },
    mintBump: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const RewardBumps = new GraphQLObjectType({
  name: 'RewardBumps',
  fields: {
    bump: { type: new GraphQLNonNull(GraphQLInt) },
    vaultBumps: { type: new GraphQLNonNull(GraphQLString) },
  },
})

// ------------------- STATS ---------------------------

export const AccessTimeStats = new GraphQLObjectType({
  name: 'AccessTimeStats',
  fields: {
    accesses: { type: new GraphQLNonNull(GraphQLInt) },
    accessesByProgramId: { type: new GraphQLNonNull(GraphQLJSON) },
    startTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
    endTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
  },
})

export const TotalAccounts = new GraphQLObjectType({
  name: 'TotalAccounts',
  fields: {
    Marketplace: { type: new GraphQLNonNull(GraphQLInt) },
    Product: { type: new GraphQLNonNull(GraphQLInt) },
    Reward: { type: new GraphQLNonNull(GraphQLInt) },
    Access: { type: new GraphQLNonNull(GraphQLInt) },
    Payment: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const GlobalBrickStats = new GraphQLObjectType({
  name: 'GlobalBrickStats',
  fields: {
    totalAccounts: { type: new GraphQLNonNull(TotalAccounts) },
    totalAccesses: { type: new GraphQLNonNull(GraphQLInt) },
    totalAccessesByProgramId: { type: new GraphQLNonNull(GraphQLJSON) },
    startTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
    endTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
  },
})

export const BrickStats = new GraphQLObjectType({
  name: 'BrickStats',
  fields: {
    last1h: { type: AccessTimeStats },
    last24h: { type: AccessTimeStats },
    last7d: { type: AccessTimeStats },
    total: { type: AccessTimeStats },
  },
})

// ------------------- ACCOUNTS ---------------------------

export const AccountsEnum = new GraphQLEnumType({
  name: 'AccountsEnum',
  values: {
    Marketplace: { value: 'Marketplace' },
    Product: { value: 'Product' },
    Reward: { value: 'Reward' },
    Access: { value: 'Access' },
    Payment: { value: 'Payment' },
  },
})

export const Marketplace = new GraphQLObjectType({
  name: 'Marketplace',
  fields: {
    authority: { type: new GraphQLNonNull(GraphQLString) },
    tokenConfig: { type: new GraphQLNonNull(TokenConfig) },
    permissionConfig: { type: new GraphQLNonNull(PermissionConfig) },
    feesConfig: { type: new GraphQLNonNull(FeesConfig) },
    rewardsConfig: { type: new GraphQLNonNull(RewardsConfig) },
    bumps: { type: new GraphQLNonNull(MarketplaceBumps) },
  },
})

export const Product = new GraphQLObjectType({
  name: 'Product',
  fields: {
    authority: { type: new GraphQLNonNull(GraphQLString) },
    firstId: { type: new GraphQLNonNull(GraphQLString) },
    secondId: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    productMint: { type: new GraphQLNonNull(GraphQLString) },
    merkleTree: { type: new GraphQLNonNull(GraphQLString) },
    sellerConfig: { type: new GraphQLNonNull(SellerConfig) },
    bumps: { type: new GraphQLNonNull(ProductBumps) },
  },
})

export const Reward = new GraphQLObjectType({
  name: 'Reward',
  fields: {
    authority: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    rewardVaults: { type: new GraphQLNonNull(GraphQLString) },
    bumps: { type: new GraphQLNonNull(RewardBumps) },
  },
})

export const Access = new GraphQLObjectType({
  name: 'Access',
  fields: {
    authority: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    bump: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const Payment = new GraphQLObjectType({
  name: 'Payment',
  fields: {
    units: { type: new GraphQLNonNull(GraphQLInt) },
    bump: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const ParsedAccountsData = new GraphQLUnionType({
  name: 'ParsedAccountsData',
  types: [Marketplace, Product, Reward, Access, Payment],
  resolveType: (obj) => {
    // here is selected a unique property of each account to discriminate between types
    if (obj.bumps) {
      return 'Marketplace'
    }
    if (obj.bumps) {
      return 'Product'
    }
    if (obj.bumps) {
      return 'Reward'
    }
    if (obj.bump) {
      return 'Access'
    }
    if (obj.bump) {
      return 'Payment'
    }
  },
})

const commonAccountInfoFields = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  programId: { type: new GraphQLNonNull(GraphQLString) },
  address: { type: new GraphQLNonNull(GraphQLString) },
  type: { type: new GraphQLNonNull(AccountsEnum) },
}

const Account = new GraphQLInterfaceType({
  name: 'Account',
  fields: {
    ...commonAccountInfoFields,
  },
})

export const BrickAccountsInfo = new GraphQLObjectType({
  name: 'BrickAccountsInfo',
  interfaces: [Account],
  fields: {
    ...commonAccountInfoFields,
    data: { type: new GraphQLNonNull(ParsedAccountsData) },
  },
})

export const AccountsInfo = new GraphQLList(BrickAccountsInfo)

// ------------------- EVENTS --------------------------

export const BrickEvent = new GraphQLEnumType({
  name: 'BrickEvent',
  values: {
    AcceptAccess: { value: 'AcceptAccess' },
    AirdropAccess: { value: 'AirdropAccess' },
    EditProduct: { value: 'EditProduct' },
    EditMarketplace: { value: 'EditMarketplace' },
    InitBounty: { value: 'InitBounty' },
    InitMarketplace: { value: 'InitMarketplace' },
    InitProductTree: { value: 'InitProductTree' },
    InitProduct: { value: 'InitProduct' },
    InitRewardVault: { value: 'InitRewardVault' },
    InitReward: { value: 'InitReward' },
    RegisterBuyCnft: { value: 'RegisterBuyCnft' },
    RegisterBuyCounter: { value: 'RegisterBuyCounter' },
    RegisterBuyToken: { value: 'RegisterBuyToken' },
    RegisterBuy: { value: 'RegisterBuy' },
    RequestAccess: { value: 'RequestAccess' },
    UpdateTree: { value: 'UpdateTree' },
    WithdrawReward: { value: 'WithdrawReward' },
  },
})

const commonEventFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  timestamp: { type: GraphQLLong },
  type: { type: new GraphQLNonNull(BrickEvent) },
  account: { type: new GraphQLNonNull(GraphQLString) },
  signer: { type: new GraphQLNonNull(GraphQLString) },
}

const Event = new GraphQLInterfaceType({
  name: 'Event',
  fields: {
    ...commonEventFields,
  },
})

/*-----------------------* CUSTOM EVENTS TYPES *-----------------------*/

export const AcceptAccessInfo = new GraphQLObjectType({
  name: 'AcceptAccessInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram2022: { type: new GraphQLNonNull(GraphQLString) },
    associatedTokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    receiver: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    request: { type: new GraphQLNonNull(GraphQLString) },
    accessMint: { type: new GraphQLNonNull(GraphQLString) },
    accessVault: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const AcceptAccessEvent = new GraphQLObjectType({
  name: 'AcceptAccessEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.AcceptAccess,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(AcceptAccessInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const AirdropAccessInfo = new GraphQLObjectType({
  name: 'AirdropAccessInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram2022: { type: new GraphQLNonNull(GraphQLString) },
    associatedTokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    receiver: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    accessMint: { type: new GraphQLNonNull(GraphQLString) },
    accessVault: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const AirdropAccessEvent = new GraphQLObjectType({
  name: 'AirdropAccessEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.AirdropAccess,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(AirdropAccessInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const EditProductInfo = new GraphQLObjectType({
  name: 'EditProductInfo',
  fields: {
    signer: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    productPrice: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const EditProductEvent = new GraphQLObjectType({
  name: 'EditProductEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.EditProduct,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(EditProductInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const EditMarketplaceInfo = new GraphQLObjectType({
  name: 'EditMarketplaceInfo',
  fields: {
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    rewardMint: { type: new GraphQLNonNull(GraphQLString) },
    discountMint: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(EditMarketplaceParams) },
  },
})

export const EditMarketplaceEvent = new GraphQLObjectType({
  name: 'EditMarketplaceEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.EditMarketplace,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(EditMarketplaceInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const InitBountyInfo = new GraphQLObjectType({
  name: 'InitBountyInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    associatedTokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    rewardMint: { type: new GraphQLNonNull(GraphQLString) },
    bountyVault: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const InitBountyEvent = new GraphQLObjectType({
  name: 'InitBountyEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.InitBounty,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(InitBountyInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const InitMarketplaceInfo = new GraphQLObjectType({
  name: 'InitMarketplaceInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram2022: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    accessMint: { type: new GraphQLNonNull(GraphQLString) },
    rewardMint: { type: new GraphQLNonNull(GraphQLString) },
    discountMint: { type: new GraphQLNonNull(GraphQLString) },
    bountyVault: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(InitMarketplaceParams) },
  },
})

export const InitMarketplaceEvent = new GraphQLObjectType({
  name: 'InitMarketplaceEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.InitMarketplace,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(InitMarketplaceInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const InitProductTreeInfo = new GraphQLObjectType({
  name: 'InitProductTreeInfo',
  fields: {
    tokenMetadataProgram: { type: new GraphQLNonNull(GraphQLString) },
    logWrapper: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    bubblegumProgram: { type: new GraphQLNonNull(GraphQLString) },
    compressionProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    associatedTokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    productMint: { type: new GraphQLNonNull(GraphQLString) },
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    accessMint: { type: new GraphQLNonNull(GraphQLString) },
    productMintVault: { type: new GraphQLNonNull(GraphQLString) },
    accessVault: { type: new GraphQLNonNull(GraphQLString) },
    masterEdition: { type: new GraphQLNonNull(GraphQLString) },
    metadata: { type: new GraphQLNonNull(GraphQLString) },
    merkleTree: { type: new GraphQLNonNull(GraphQLString) },
    treeAuthority: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(InitProductTreeParams) },
  },
})

export const InitProductTreeEvent = new GraphQLObjectType({
  name: 'InitProductTreeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.InitProductTree,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(InitProductTreeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const InitProductInfo = new GraphQLObjectType({
  name: 'InitProductInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram2022: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    productMint: { type: new GraphQLNonNull(GraphQLString) },
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    accessMint: { type: new GraphQLNonNull(GraphQLString) },
    accessVault: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(InitProductParams) },
  },
})

export const InitProductEvent = new GraphQLObjectType({
  name: 'InitProductEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.InitProduct,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(InitProductInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const InitRewardVaultInfo = new GraphQLObjectType({
  name: 'InitRewardVaultInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    associatedTokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    reward: { type: new GraphQLNonNull(GraphQLString) },
    rewardMint: { type: new GraphQLNonNull(GraphQLString) },
    rewardVault: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const InitRewardVaultEvent = new GraphQLObjectType({
  name: 'InitRewardVaultEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.InitRewardVault,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(InitRewardVaultInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const InitRewardInfo = new GraphQLObjectType({
  name: 'InitRewardInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    reward: { type: new GraphQLNonNull(GraphQLString) },
    rewardMint: { type: new GraphQLNonNull(GraphQLString) },
    rewardVault: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const InitRewardEvent = new GraphQLObjectType({
  name: 'InitRewardEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.InitReward,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(InitRewardInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RegisterBuyCnftInfo = new GraphQLObjectType({
  name: 'RegisterBuyCnftInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    logWrapper: { type: new GraphQLNonNull(GraphQLString) },
    bubblegumProgram: { type: new GraphQLNonNull(GraphQLString) },
    compressionProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenMetadataProgram: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    seller: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceAuth: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    productMint: { type: new GraphQLNonNull(GraphQLString) },
    buyerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    bountyVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerReward: { type: new GraphQLNonNull(GraphQLString) },
    sellerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    buyerReward: { type: new GraphQLNonNull(GraphQLString) },
    buyerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    metadata: { type: new GraphQLNonNull(GraphQLString) },
    masterEdition: { type: new GraphQLNonNull(GraphQLString) },
    treeAuthority: { type: new GraphQLNonNull(GraphQLString) },
    bubblegumSigner: { type: new GraphQLNonNull(GraphQLString) },
    merkleTree: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(RegisterBuyCnftParams) },
  },
})

export const RegisterBuyCnftEvent = new GraphQLObjectType({
  name: 'RegisterBuyCnftEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.RegisterBuyCnft,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RegisterBuyCnftInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RegisterBuyCounterInfo = new GraphQLObjectType({
  name: 'RegisterBuyCounterInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    seller: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceAuth: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    payment: { type: new GraphQLNonNull(GraphQLString) },
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    buyerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    bountyVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerReward: { type: new GraphQLNonNull(GraphQLString) },
    sellerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    buyerReward: { type: new GraphQLNonNull(GraphQLString) },
    buyerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const RegisterBuyCounterEvent = new GraphQLObjectType({
  name: 'RegisterBuyCounterEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.RegisterBuyCounter,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RegisterBuyCounterInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RegisterBuyTokenInfo = new GraphQLObjectType({
  name: 'RegisterBuyTokenInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram2022: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    seller: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceAuth: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    productMint: { type: new GraphQLNonNull(GraphQLString) },
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    buyerTokenVault: { type: new GraphQLNonNull(GraphQLString) },
    buyerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    bountyVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerReward: { type: new GraphQLNonNull(GraphQLString) },
    sellerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    buyerReward: { type: new GraphQLNonNull(GraphQLString) },
    buyerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const RegisterBuyTokenEvent = new GraphQLObjectType({
  name: 'RegisterBuyTokenEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.RegisterBuyToken,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RegisterBuyTokenInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RegisterBuyInfo = new GraphQLObjectType({
  name: 'RegisterBuyInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    seller: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceAuth: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    payment: { type: new GraphQLNonNull(GraphQLString) },
    paymentMint: { type: new GraphQLNonNull(GraphQLString) },
    buyerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    marketplaceTransferVault: { type: new GraphQLNonNull(GraphQLString) },
    bountyVault: { type: new GraphQLNonNull(GraphQLString) },
    sellerReward: { type: new GraphQLNonNull(GraphQLString) },
    sellerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    buyerReward: { type: new GraphQLNonNull(GraphQLString) },
    buyerRewardVault: { type: new GraphQLNonNull(GraphQLString) },
    amount: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const RegisterBuyEvent = new GraphQLObjectType({
  name: 'RegisterBuyEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.RegisterBuy,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RegisterBuyInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RequestAccessInfo = new GraphQLObjectType({
  name: 'RequestAccessInfo',
  fields: {
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    request: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const RequestAccessEvent = new GraphQLObjectType({
  name: 'RequestAccessEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.RequestAccess,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RequestAccessInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const UpdateTreeInfo = new GraphQLObjectType({
  name: 'UpdateTreeInfo',
  fields: {
    payer: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    product: { type: new GraphQLNonNull(GraphQLString) },
    treeAuthority: { type: new GraphQLNonNull(GraphQLString) },
    merkleTree: { type: new GraphQLNonNull(GraphQLString) },
    logWrapper: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    bubblegumProgram: { type: new GraphQLNonNull(GraphQLString) },
    compressionProgram: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(UpdateProductTreeParams) },
  },
})

export const UpdateTreeEvent = new GraphQLObjectType({
  name: 'UpdateTreeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.UpdateTree,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(UpdateTreeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const WithdrawRewardInfo = new GraphQLObjectType({
  name: 'WithdrawRewardInfo',
  fields: {
    tokenProgramV0: { type: new GraphQLNonNull(GraphQLString) },
    signer: { type: new GraphQLNonNull(GraphQLString) },
    marketplace: { type: new GraphQLNonNull(GraphQLString) },
    reward: { type: new GraphQLNonNull(GraphQLString) },
    rewardMint: { type: new GraphQLNonNull(GraphQLString) },
    receiverVault: { type: new GraphQLNonNull(GraphQLString) },
    rewardVault: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const WithdrawRewardEvent = new GraphQLObjectType({
  name: 'WithdrawRewardEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.WithdrawReward,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(WithdrawRewardInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const Events = new GraphQLList(Event)

export const types = [
  AcceptAccessEvent,
  AirdropAccessEvent,
  EditProductEvent,
  EditMarketplaceEvent,
  InitBountyEvent,
  InitMarketplaceEvent,
  InitProductTreeEvent,
  InitProductEvent,
  InitRewardVaultEvent,
  InitRewardEvent,
  RegisterBuyCnftEvent,
  RegisterBuyCounterEvent,
  RegisterBuyTokenEvent,
  RegisterBuyEvent,
  RequestAccessEvent,
  UpdateTreeEvent,
  WithdrawRewardEvent,
]
