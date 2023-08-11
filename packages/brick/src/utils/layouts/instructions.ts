import { EventBase } from '@aleph-indexer/framework'
import * as solita from './solita/index.js'
import BN from 'bn.js'

export enum InstructionType {
  AcceptAccess = 'AcceptAccess',
  AirdropAccess = 'AirdropAccess',
  EditProduct = 'EditProduct',
  EditMarketplace = 'EditMarketplace',
  InitBounty = 'InitBounty',
  InitMarketplace = 'InitMarketplace',
  InitProductTree = 'InitProductTree',
  InitProduct = 'InitProduct',
  InitRewardVault = 'InitRewardVault',
  InitReward = 'InitReward',
  RegisterBuyCnft = 'RegisterBuyCnft',
  RegisterBuyCounter = 'RegisterBuyCounter',
  RegisterBuyToken = 'RegisterBuyToken',
  RegisterBuy = 'RegisterBuy',
  RequestAccess = 'RequestAccess',
  UpdateTree = 'UpdateTree',
  WithdrawReward = 'WithdrawReward',
}

export type RawInstructionBase = {
  parsed: unknown
  program: string
  programId: string
}

/*-----------------------* CUSTOM RAW INSTRUCTION TYPES *-----------------------*/

export type AcceptAccessAccountsInstruction = {
  systemProgram: string
  tokenProgram2022: string
  associatedTokenProgram: string
  rent: string
  signer: string
  receiver: string
  marketplace: string
  request: string
  accessMint: string
  accessVault: string
}

export type AcceptAccessInfo = AcceptAccessAccountsInstruction

export type RawAcceptAccess = RawInstructionBase & {
  parsed: {
    info: AcceptAccessInfo
    type: InstructionType.AcceptAccess
  }
}

export type AirdropAccessAccountsInstruction = {
  systemProgram: string
  tokenProgram2022: string
  associatedTokenProgram: string
  rent: string
  signer: string
  receiver: string
  marketplace: string
  accessMint: string
  accessVault: string
}

export type AirdropAccessInfo = AirdropAccessAccountsInstruction

export type RawAirdropAccess = RawInstructionBase & {
  parsed: {
    info: AirdropAccessInfo
    type: InstructionType.AirdropAccess
  }
}

export type EditProductAccountsInstruction = {
  signer: string
  product: string
  paymentMint: string
}

export type EditProductInfo = solita.EditProductInstructionArgs &
  EditProductAccountsInstruction

export type RawEditProduct = RawInstructionBase & {
  parsed: {
    info: EditProductInfo
    type: InstructionType.EditProduct
  }
}

export type EditMarketplaceAccountsInstruction = {
  signer: string
  marketplace: string
  rewardMint: string
  discountMint: string
}

export type EditMarketplaceInfo = solita.EditMarketplaceInstructionArgs &
  EditMarketplaceAccountsInstruction

export type RawEditMarketplace = RawInstructionBase & {
  parsed: {
    info: EditMarketplaceInfo
    type: InstructionType.EditMarketplace
  }
}

export type InitBountyAccountsInstruction = {
  systemProgram: string
  tokenProgramV0: string
  associatedTokenProgram: string
  rent: string
  signer: string
  marketplace: string
  rewardMint: string
  bountyVault: string
}

export type InitBountyInfo = InitBountyAccountsInstruction

export type RawInitBounty = RawInstructionBase & {
  parsed: {
    info: InitBountyInfo
    type: InstructionType.InitBounty
  }
}

export type InitMarketplaceAccountsInstruction = {
  systemProgram: string
  tokenProgram2022: string
  tokenProgramV0: string
  rent: string
  signer: string
  marketplace: string
  accessMint: string
  rewardMint: string
  discountMint: string
  bountyVault: string
}

export type InitMarketplaceInfo = solita.InitMarketplaceInstructionArgs &
  InitMarketplaceAccountsInstruction

export type RawInitMarketplace = RawInstructionBase & {
  parsed: {
    info: InitMarketplaceInfo
    type: InstructionType.InitMarketplace
  }
}

export type InitProductTreeAccountsInstruction = {
  tokenMetadataProgram: string
  logWrapper: string
  systemProgram: string
  bubblegumProgram: string
  compressionProgram: string
  tokenProgramV0: string
  associatedTokenProgram: string
  rent: string
  signer: string
  marketplace: string
  product: string
  productMint: string
  paymentMint: string
  accessMint: string
  productMintVault: string
  accessVault: string
  masterEdition: string
  metadata: string
  merkleTree: string
  treeAuthority: string
}

export type InitProductTreeInfo = solita.InitProductTreeInstructionArgs &
  InitProductTreeAccountsInstruction

export type RawInitProductTree = RawInstructionBase & {
  parsed: {
    info: InitProductTreeInfo
    type: InstructionType.InitProductTree
  }
}

export type InitProductAccountsInstruction = {
  systemProgram: string
  tokenProgram2022: string
  rent: string
  signer: string
  marketplace: string
  product: string
  productMint: string
  paymentMint: string
  accessMint: string
  accessVault: string
}

export type InitProductInfo = solita.InitProductInstructionArgs &
  InitProductAccountsInstruction

export type RawInitProduct = RawInstructionBase & {
  parsed: {
    info: InitProductInfo
    type: InstructionType.InitProduct
  }
}

export type InitRewardVaultAccountsInstruction = {
  systemProgram: string
  tokenProgramV0: string
  associatedTokenProgram: string
  rent: string
  signer: string
  marketplace: string
  reward: string
  rewardMint: string
  rewardVault: string
}

export type InitRewardVaultInfo = InitRewardVaultAccountsInstruction

export type RawInitRewardVault = RawInstructionBase & {
  parsed: {
    info: InitRewardVaultInfo
    type: InstructionType.InitRewardVault
  }
}

export type InitRewardAccountsInstruction = {
  systemProgram: string
  tokenProgramV0: string
  rent: string
  signer: string
  marketplace: string
  reward: string
  rewardMint: string
  rewardVault: string
}

export type InitRewardInfo = InitRewardAccountsInstruction

export type RawInitReward = RawInstructionBase & {
  parsed: {
    info: InitRewardInfo
    type: InstructionType.InitReward
  }
}

export type RegisterBuyCnftAccountsInstruction = {
  systemProgram: string
  tokenProgramV0: string
  rent: string
  logWrapper: string
  bubblegumProgram: string
  compressionProgram: string
  tokenMetadataProgram: string
  signer: string
  seller: string
  marketplaceAuth: string
  marketplace: string
  product: string
  paymentMint: string
  productMint: string
  buyerTransferVault: string
  sellerTransferVault: string
  marketplaceTransferVault: string
  bountyVault: string
  sellerReward: string
  sellerRewardVault: string
  buyerReward: string
  buyerRewardVault: string
  metadata: string
  masterEdition: string
  treeAuthority: string
  bubblegumSigner: string
  merkleTree: string
}

export type RegisterBuyCnftInfo = solita.RegisterBuyCnftInstructionArgs &
  RegisterBuyCnftAccountsInstruction

export type RawRegisterBuyCnft = RawInstructionBase & {
  parsed: {
    info: RegisterBuyCnftInfo
    type: InstructionType.RegisterBuyCnft
  }
}

export type RegisterBuyCounterAccountsInstruction = {
  systemProgram: string
  tokenProgramV0: string
  rent: string
  signer: string
  seller: string
  marketplaceAuth: string
  marketplace: string
  product: string
  payment: string
  paymentMint: string
  buyerTransferVault: string
  sellerTransferVault: string
  marketplaceTransferVault: string
  bountyVault: string
  sellerReward: string
  sellerRewardVault: string
  buyerReward: string
  buyerRewardVault: string
}

export type RegisterBuyCounterInfo = solita.RegisterBuyCounterInstructionArgs &
  RegisterBuyCounterAccountsInstruction

export type RawRegisterBuyCounter = RawInstructionBase & {
  parsed: {
    info: RegisterBuyCounterInfo
    type: InstructionType.RegisterBuyCounter
  }
}

export type RegisterBuyTokenAccountsInstruction = {
  systemProgram: string
  tokenProgramV0: string
  tokenProgram2022: string
  signer: string
  seller: string
  marketplaceAuth: string
  marketplace: string
  product: string
  productMint: string
  paymentMint: string
  buyerTokenVault: string
  buyerTransferVault: string
  sellerTransferVault: string
  marketplaceTransferVault: string
  bountyVault: string
  sellerReward: string
  sellerRewardVault: string
  buyerReward: string
  buyerRewardVault: string
}

export type RegisterBuyTokenInfo = solita.RegisterBuyTokenInstructionArgs &
  RegisterBuyTokenAccountsInstruction

export type RawRegisterBuyToken = RawInstructionBase & {
  parsed: {
    info: RegisterBuyTokenInfo
    type: InstructionType.RegisterBuyToken
  }
}

export type RegisterBuyAccountsInstruction = {
  systemProgram: string
  tokenProgramV0: string
  rent: string
  signer: string
  seller: string
  marketplaceAuth: string
  marketplace: string
  product: string
  payment: string
  paymentMint: string
  buyerTransferVault: string
  sellerTransferVault: string
  marketplaceTransferVault: string
  bountyVault: string
  sellerReward: string
  sellerRewardVault: string
  buyerReward: string
  buyerRewardVault: string
}

export type RegisterBuyInfo = solita.RegisterBuyInstructionArgs &
  RegisterBuyAccountsInstruction

export type RawRegisterBuy = RawInstructionBase & {
  parsed: {
    info: RegisterBuyInfo
    type: InstructionType.RegisterBuy
  }
}

export type RequestAccessAccountsInstruction = {
  systemProgram: string
  rent: string
  signer: string
  marketplace: string
  request: string
}

export type RequestAccessInfo = RequestAccessAccountsInstruction

export type RawRequestAccess = RawInstructionBase & {
  parsed: {
    info: RequestAccessInfo
    type: InstructionType.RequestAccess
  }
}

export type UpdateTreeAccountsInstruction = {
  payer: string
  signer: string
  marketplace: string
  product: string
  treeAuthority: string
  merkleTree: string
  logWrapper: string
  systemProgram: string
  bubblegumProgram: string
  compressionProgram: string
}

export type UpdateTreeInfo = solita.UpdateTreeInstructionArgs &
  UpdateTreeAccountsInstruction

export type RawUpdateTree = RawInstructionBase & {
  parsed: {
    info: UpdateTreeInfo
    type: InstructionType.UpdateTree
  }
}

export type WithdrawRewardAccountsInstruction = {
  tokenProgramV0: string
  signer: string
  marketplace: string
  reward: string
  rewardMint: string
  receiverVault: string
  rewardVault: string
}

export type WithdrawRewardInfo = WithdrawRewardAccountsInstruction

export type RawWithdrawReward = RawInstructionBase & {
  parsed: {
    info: WithdrawRewardInfo
    type: InstructionType.WithdrawReward
  }
}

export type RawInstructionsInfo =
  | AcceptAccessInfo
  | AirdropAccessInfo
  | EditProductInfo
  | EditMarketplaceInfo
  | InitBountyInfo
  | InitMarketplaceInfo
  | InitProductTreeInfo
  | InitProductInfo
  | InitRewardVaultInfo
  | InitRewardInfo
  | RegisterBuyCnftInfo
  | RegisterBuyCounterInfo
  | RegisterBuyTokenInfo
  | RegisterBuyInfo
  | RequestAccessInfo
  | UpdateTreeInfo
  | WithdrawRewardInfo

export type RawInstruction =
  | RawAcceptAccess
  | RawAirdropAccess
  | RawEditProduct
  | RawEditMarketplace
  | RawInitBounty
  | RawInitMarketplace
  | RawInitProductTree
  | RawInitProduct
  | RawInitRewardVault
  | RawInitReward
  | RawRegisterBuyCnft
  | RawRegisterBuyCounter
  | RawRegisterBuyToken
  | RawRegisterBuy
  | RawRequestAccess
  | RawUpdateTree
  | RawWithdrawReward

export type AcceptAccessEvent = EventBase<InstructionType> & {
  info: AcceptAccessInfo
  signer: string
  account: string
}

export type AirdropAccessEvent = EventBase<InstructionType> & {
  info: AirdropAccessInfo
  signer: string
  account: string
}

export type EditProductEvent = EventBase<InstructionType> & {
  info: EditProductInfo
  signer: string
  account: string
}

export type EditMarketplaceEvent = EventBase<InstructionType> & {
  info: EditMarketplaceInfo
  signer: string
  account: string
}

export type InitBountyEvent = EventBase<InstructionType> & {
  info: InitBountyInfo
  signer: string
  account: string
}

export type InitMarketplaceEvent = EventBase<InstructionType> & {
  info: InitMarketplaceInfo
  signer: string
  account: string
}

export type InitProductTreeEvent = EventBase<InstructionType> & {
  info: InitProductTreeInfo
  signer: string
  account: string
}

export type InitProductEvent = EventBase<InstructionType> & {
  info: InitProductInfo
  signer: string
  account: string
}

export type InitRewardVaultEvent = EventBase<InstructionType> & {
  info: InitRewardVaultInfo
  signer: string
  account: string
}

export type InitRewardEvent = EventBase<InstructionType> & {
  info: InitRewardInfo
  signer: string
  account: string
}

export type RegisterBuyCnftEvent = EventBase<InstructionType> & {
  info: RegisterBuyCnftInfo
  signer: string
  account: string
}

export type RegisterBuyCounterEvent = EventBase<InstructionType> & {
  info: RegisterBuyCounterInfo
  signer: string
  account: string
}

export type RegisterBuyTokenEvent = EventBase<InstructionType> & {
  info: RegisterBuyTokenInfo
  signer: string
  account: string
}

export type RegisterBuyEvent = EventBase<InstructionType> & {
  info: RegisterBuyInfo
  signer: string
  account: string
}

export type RequestAccessEvent = EventBase<InstructionType> & {
  info: RequestAccessInfo
  signer: string
  account: string
}

export type UpdateTreeEvent = EventBase<InstructionType> & {
  info: UpdateTreeInfo
  signer: string
  account: string
}

export type WithdrawRewardEvent = EventBase<InstructionType> & {
  info: WithdrawRewardInfo
  signer: string
  account: string
}

export type BrickEvent =
  | AcceptAccessEvent
  | AirdropAccessEvent
  | EditProductEvent
  | EditMarketplaceEvent
  | InitBountyEvent
  | InitMarketplaceEvent
  | InitProductTreeEvent
  | InitProductEvent
  | InitRewardVaultEvent
  | InitRewardEvent
  | RegisterBuyCnftEvent
  | RegisterBuyCounterEvent
  | RegisterBuyTokenEvent
  | RegisterBuyEvent
  | RequestAccessEvent
  | UpdateTreeEvent
  | WithdrawRewardEvent
/*----------------------------------------------------------------------*/

export function getInstructionType(data: Buffer): InstructionType | undefined {
  const discriminator = data.slice(0, 8)
  return IX_METHOD_CODE.get(discriminator.toString('ascii'))
}

export const IX_METHOD_CODE: Map<string, InstructionType | undefined> = new Map<
  string,
  InstructionType | undefined
>([
  [
    Buffer.from(solita.acceptAccessInstructionDiscriminator).toString('ascii'),
    InstructionType.AcceptAccess,
  ],
  [
    Buffer.from(solita.airdropAccessInstructionDiscriminator).toString('ascii'),
    InstructionType.AirdropAccess,
  ],
  [
    Buffer.from(solita.editProductInstructionDiscriminator).toString('ascii'),
    InstructionType.EditProduct,
  ],
  [
    Buffer.from(solita.editMarketplaceInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.EditMarketplace,
  ],
  [
    Buffer.from(solita.initBountyInstructionDiscriminator).toString('ascii'),
    InstructionType.InitBounty,
  ],
  [
    Buffer.from(solita.initMarketplaceInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.InitMarketplace,
  ],
  [
    Buffer.from(solita.initProductTreeInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.InitProductTree,
  ],
  [
    Buffer.from(solita.initProductInstructionDiscriminator).toString('ascii'),
    InstructionType.InitProduct,
  ],
  [
    Buffer.from(solita.initRewardVaultInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.InitRewardVault,
  ],
  [
    Buffer.from(solita.initRewardInstructionDiscriminator).toString('ascii'),
    InstructionType.InitReward,
  ],
  [
    Buffer.from(solita.registerBuyCnftInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.RegisterBuyCnft,
  ],
  [
    Buffer.from(solita.registerBuyCounterInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.RegisterBuyCounter,
  ],
  [
    Buffer.from(solita.registerBuyTokenInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.RegisterBuyToken,
  ],
  [
    Buffer.from(solita.registerBuyInstructionDiscriminator).toString('ascii'),
    InstructionType.RegisterBuy,
  ],
  [
    Buffer.from(solita.requestAccessInstructionDiscriminator).toString('ascii'),
    InstructionType.RequestAccess,
  ],
  [
    Buffer.from(solita.updateTreeInstructionDiscriminator).toString('ascii'),
    InstructionType.UpdateTree,
  ],
  [
    Buffer.from(solita.withdrawRewardInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.WithdrawReward,
  ],
])
export const IX_DATA_LAYOUT: Partial<Record<InstructionType, any>> = {
  [InstructionType.AcceptAccess]: solita.acceptAccessStruct,
  [InstructionType.AirdropAccess]: solita.airdropAccessStruct,
  [InstructionType.EditProduct]: solita.editProductStruct,
  [InstructionType.EditMarketplace]: solita.editMarketplaceStruct,
  [InstructionType.InitBounty]: solita.initBountyStruct,
  [InstructionType.InitMarketplace]: solita.initMarketplaceStruct,
  [InstructionType.InitProductTree]: solita.initProductTreeStruct,
  [InstructionType.InitProduct]: solita.initProductStruct,
  [InstructionType.InitRewardVault]: solita.initRewardVaultStruct,
  [InstructionType.InitReward]: solita.initRewardStruct,
  [InstructionType.RegisterBuyCnft]: solita.registerBuyCnftStruct,
  [InstructionType.RegisterBuyCounter]: solita.registerBuyCounterStruct,
  [InstructionType.RegisterBuyToken]: solita.registerBuyTokenStruct,
  [InstructionType.RegisterBuy]: solita.registerBuyStruct,
  [InstructionType.RequestAccess]: solita.requestAccessStruct,
  [InstructionType.UpdateTree]: solita.updateTreeStruct,
  [InstructionType.WithdrawReward]: solita.withdrawRewardStruct,
}

export const IX_ACCOUNTS_LAYOUT: Partial<Record<InstructionType, any>> = {
  [InstructionType.AcceptAccess]: solita.AcceptAccessAccounts,
  [InstructionType.AirdropAccess]: solita.AirdropAccessAccounts,
  [InstructionType.EditProduct]: solita.EditProductAccounts,
  [InstructionType.EditMarketplace]: solita.EditMarketplaceAccounts,
  [InstructionType.InitBounty]: solita.InitBountyAccounts,
  [InstructionType.InitMarketplace]: solita.InitMarketplaceAccounts,
  [InstructionType.InitProductTree]: solita.InitProductTreeAccounts,
  [InstructionType.InitProduct]: solita.InitProductAccounts,
  [InstructionType.InitRewardVault]: solita.InitRewardVaultAccounts,
  [InstructionType.InitReward]: solita.InitRewardAccounts,
  [InstructionType.RegisterBuyCnft]: solita.RegisterBuyCnftAccounts,
  [InstructionType.RegisterBuyCounter]: solita.RegisterBuyCounterAccounts,
  [InstructionType.RegisterBuyToken]: solita.RegisterBuyTokenAccounts,
  [InstructionType.RegisterBuy]: solita.RegisterBuyAccounts,
  [InstructionType.RequestAccess]: solita.RequestAccessAccounts,
  [InstructionType.UpdateTree]: solita.UpdateTreeAccounts,
  [InstructionType.WithdrawReward]: solita.WithdrawRewardAccounts,
}
