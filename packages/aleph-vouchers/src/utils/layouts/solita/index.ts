import { AccountMeta, PublicKey } from '@solana/web3.js'
export * from './accounts/index.js'
export * from './instructions/index.js'
export * from './types/index.js'

import {
  PluginHeaderV1,
  PluginHeaderV1Args,
  PluginRegistryV1,
  PluginRegistryV1Args,
  AssetV1,
  AssetV1Args,
  CollectionV1,
  CollectionV1Args,
  HashedAssetV1,
  HashedAssetV1Args,
} from './accounts/index.js'

import {
  PluginAuthorityPair,
  AddBlocker,
  AppData,
  AppDataInitInfo,
  AppDataUpdateInfo,
  Attribute,
  Attributes,
  AutographSignature,
  Autograph,
  BurnDelegate,
  DataSection,
  DataSectionInitInfo,
  DataSectionUpdateInfo,
  Edition,
  FreezeDelegate,
  ImmutableMetadata,
  ExternalCheckResult,
  LifecycleHook,
  LifecycleHookInitInfo,
  LifecycleHookUpdateInfo,
  LinkedAppData,
  LinkedAppDataInitInfo,
  LinkedAppDataUpdateInfo,
  LinkedLifecycleHook,
  LinkedLifecycleHookInitInfo,
  LinkedLifecycleHookUpdateInfo,
  MasterEdition,
  Oracle,
  OracleInitInfo,
  OracleUpdateInfo,
  PermanentBurnDelegate,
  PermanentFreezeDelegate,
  PermanentTransferDelegate,
  RegistryRecord,
  ExternalRegistryRecord,
  Creator,
  Royalties,
  TransferDelegate,
  UpdateDelegate,
  VerifiedCreatorsSignature,
  VerifiedCreators,
  AddExternalPluginAdapterV1Args,
  AddCollectionExternalPluginAdapterV1Args,
  AddPluginV1Args,
  AddCollectionPluginV1Args,
  ApprovePluginAuthorityV1Args,
  ApproveCollectionPluginAuthorityV1Args,
  BurnV1Args,
  BurnCollectionV1Args,
  CompressV1Args,
  CreateV1Args,
  CreateV2Args,
  CreateCollectionV1Args,
  CreateCollectionV2Args,
  DecompressV1Args,
  RemoveExternalPluginAdapterV1Args,
  RemoveCollectionExternalPluginAdapterV1Args,
  RemovePluginV1Args,
  RemoveCollectionPluginV1Args,
  RevokePluginAuthorityV1Args,
  RevokeCollectionPluginAuthorityV1Args,
  TransferV1Args,
  UpdateV1Args,
  UpdateV2Args,
  UpdateCollectionV1Args,
  UpdateExternalPluginAdapterV1Args,
  UpdateCollectionExternalPluginAdapterV1Args,
  UpdatePluginV1Args,
  UpdateCollectionPluginV1Args,
  WriteExternalPluginAdapterDataV1Args,
  WriteCollectionExternalPluginAdapterDataV1Args,
  CompressionProof,
  HashablePluginSchema,
  HashedAssetSchema,
  Plugin,
  PluginType,
  ExternalPluginAdapterType,
  ExternalPluginAdapter,
  HookableLifecycleEvent,
  ExtraAccount,
  Seed,
  ExternalPluginAdapterSchema,
  ExternalPluginAdapterInitInfo,
  ExternalPluginAdapterUpdateInfo,
  ExternalPluginAdapterKey,
  LinkedDataKey,
  ValidationResult,
  ExternalValidationResult,
  ValidationResultsOffset,
  OracleValidation,
  RuleSet,
  DataState,
  Authority,
  Key,
  UpdateAuthority,
} from './types/index.js'

export type CreateV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const CreateV1Accounts = [
  'asset',
  'collection',
  'authority',
  'payer',
  'owner',
  'updateAuthority',
  'systemProgram',
  'logWrapper',
]

export type CreateCollectionV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const CreateCollectionV1Accounts = [
  'collection',
  'updateAuthority',
  'payer',
  'systemProgram',
]

export type AddPluginV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const AddPluginV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type AddCollectionPluginV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const AddCollectionPluginV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type RemovePluginV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RemovePluginV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type RemoveCollectionPluginV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RemoveCollectionPluginV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type UpdatePluginV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdatePluginV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type UpdateCollectionPluginV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdateCollectionPluginV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type ApprovePluginAuthorityV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const ApprovePluginAuthorityV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type ApproveCollectionPluginAuthorityV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const ApproveCollectionPluginAuthorityV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type RevokePluginAuthorityV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RevokePluginAuthorityV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type RevokeCollectionPluginAuthorityV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RevokeCollectionPluginAuthorityV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type BurnV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const BurnV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type BurnCollectionV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const BurnCollectionV1Accounts = [
  'collection',
  'payer',
  'authority',
  'logWrapper',
]

export type TransferV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const TransferV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'newOwner',
  'systemProgram',
  'logWrapper',
]

export type UpdateV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdateV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type UpdateCollectionV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdateCollectionV1Accounts = [
  'collection',
  'payer',
  'authority',
  'newUpdateAuthority',
  'systemProgram',
  'logWrapper',
]

export type CompressV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const CompressV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type DecompressV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const DecompressV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type CollectInstruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const CollectAccounts = ['recipient1', 'recipient2']

export type CreateV2Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const CreateV2Accounts = [
  'asset',
  'collection',
  'authority',
  'payer',
  'owner',
  'updateAuthority',
  'systemProgram',
  'logWrapper',
]

export type CreateCollectionV2Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const CreateCollectionV2Accounts = [
  'collection',
  'updateAuthority',
  'payer',
  'systemProgram',
]

export type AddExternalPluginAdapterV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const AddExternalPluginAdapterV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type AddCollectionExternalPluginAdapterV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const AddCollectionExternalPluginAdapterV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type RemoveExternalPluginAdapterV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RemoveExternalPluginAdapterV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type RemoveCollectionExternalPluginAdapterV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const RemoveCollectionExternalPluginAdapterV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type UpdateExternalPluginAdapterV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdateExternalPluginAdapterV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type UpdateCollectionExternalPluginAdapterV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdateCollectionExternalPluginAdapterV1Accounts = [
  'collection',
  'payer',
  'authority',
  'systemProgram',
  'logWrapper',
]

export type WriteExternalPluginAdapterDataV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const WriteExternalPluginAdapterDataV1Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'buffer',
  'systemProgram',
  'logWrapper',
]

export type WriteCollectionExternalPluginAdapterDataV1Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const WriteCollectionExternalPluginAdapterDataV1Accounts = [
  'collection',
  'payer',
  'authority',
  'buffer',
  'systemProgram',
  'logWrapper',
]

export type UpdateV2Instruction = {
  programId: PublicKey
  keys: AccountMeta[]
  data: Buffer
}

export const UpdateV2Accounts = [
  'asset',
  'collection',
  'payer',
  'authority',
  'newCollection',
  'systemProgram',
  'logWrapper',
]

export type ParsedInstructions =
  | CreateV1Instruction
  | CreateCollectionV1Instruction
  | AddPluginV1Instruction
  | AddCollectionPluginV1Instruction
  | RemovePluginV1Instruction
  | RemoveCollectionPluginV1Instruction
  | UpdatePluginV1Instruction
  | UpdateCollectionPluginV1Instruction
  | ApprovePluginAuthorityV1Instruction
  | ApproveCollectionPluginAuthorityV1Instruction
  | RevokePluginAuthorityV1Instruction
  | RevokeCollectionPluginAuthorityV1Instruction
  | BurnV1Instruction
  | BurnCollectionV1Instruction
  | TransferV1Instruction
  | UpdateV1Instruction
  | UpdateCollectionV1Instruction
  | CompressV1Instruction
  | DecompressV1Instruction
  | CollectInstruction
  | CreateV2Instruction
  | CreateCollectionV2Instruction
  | AddExternalPluginAdapterV1Instruction
  | AddCollectionExternalPluginAdapterV1Instruction
  | RemoveExternalPluginAdapterV1Instruction
  | RemoveCollectionExternalPluginAdapterV1Instruction
  | UpdateExternalPluginAdapterV1Instruction
  | UpdateCollectionExternalPluginAdapterV1Instruction
  | WriteExternalPluginAdapterDataV1Instruction
  | WriteCollectionExternalPluginAdapterDataV1Instruction
  | UpdateV2Instruction
export type ParsedAccounts =
  | PluginHeaderV1
  | PluginRegistryV1
  | AssetV1
  | CollectionV1
  | HashedAssetV1

export type ParsedAccountsData =
  | PluginHeaderV1Args
  | PluginRegistryV1Args
  | AssetV1Args
  | CollectionV1Args
  | HashedAssetV1Args

export type ParsedTypes =
  | Plugin
  | PluginType
  | ExternalPluginAdapterType
  | ExternalPluginAdapter
  | HookableLifecycleEvent
  | ExtraAccount
  | Seed
  | ExternalPluginAdapterSchema
  | ExternalPluginAdapterInitInfo
  | ExternalPluginAdapterUpdateInfo
  | ExternalPluginAdapterKey
  | LinkedDataKey
  | ValidationResult
  | ExternalValidationResult
  | ValidationResultsOffset
  | OracleValidation
  | RuleSet
  | DataState
  | Authority
  | Key
  | UpdateAuthority
  | PluginAuthorityPair
  | AddBlocker
  | AppData
  | AppDataInitInfo
  | AppDataUpdateInfo
  | Attribute
  | Attributes
  | AutographSignature
  | Autograph
  | BurnDelegate
  | DataSection
  | DataSectionInitInfo
  | DataSectionUpdateInfo
  | Edition
  | FreezeDelegate
  | ImmutableMetadata
  | ExternalCheckResult
  | LifecycleHook
  | LifecycleHookInitInfo
  | LifecycleHookUpdateInfo
  | LinkedAppData
  | LinkedAppDataInitInfo
  | LinkedAppDataUpdateInfo
  | LinkedLifecycleHook
  | LinkedLifecycleHookInitInfo
  | LinkedLifecycleHookUpdateInfo
  | MasterEdition
  | Oracle
  | OracleInitInfo
  | OracleUpdateInfo
  | PermanentBurnDelegate
  | PermanentFreezeDelegate
  | PermanentTransferDelegate
  | RegistryRecord
  | ExternalRegistryRecord
  | Creator
  | Royalties
  | TransferDelegate
  | UpdateDelegate
  | VerifiedCreatorsSignature
  | VerifiedCreators
  | AddExternalPluginAdapterV1Args
  | AddCollectionExternalPluginAdapterV1Args
  | AddPluginV1Args
  | AddCollectionPluginV1Args
  | ApprovePluginAuthorityV1Args
  | ApproveCollectionPluginAuthorityV1Args
  | BurnV1Args
  | BurnCollectionV1Args
  | CompressV1Args
  | CreateV1Args
  | CreateV2Args
  | CreateCollectionV1Args
  | CreateCollectionV2Args
  | DecompressV1Args
  | RemoveExternalPluginAdapterV1Args
  | RemoveCollectionExternalPluginAdapterV1Args
  | RemovePluginV1Args
  | RemoveCollectionPluginV1Args
  | RevokePluginAuthorityV1Args
  | RevokeCollectionPluginAuthorityV1Args
  | TransferV1Args
  | UpdateV1Args
  | UpdateV2Args
  | UpdateCollectionV1Args
  | UpdateExternalPluginAdapterV1Args
  | UpdateCollectionExternalPluginAdapterV1Args
  | UpdatePluginV1Args
  | UpdateCollectionPluginV1Args
  | WriteExternalPluginAdapterDataV1Args
  | WriteCollectionExternalPluginAdapterDataV1Args
  | CompressionProof
  | HashablePluginSchema
  | HashedAssetSchema
