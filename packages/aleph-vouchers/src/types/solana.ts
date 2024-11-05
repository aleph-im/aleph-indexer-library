import { BlockchainId } from '@aleph-indexer/framework'
import { CommonEvent } from './common'
import {
  CreateV1InstructionAccounts,
  BurnV1InstructionAccounts,
  CreateV2InstructionAccounts,
  TransferV1InstructionAccounts,
  CreateV1InstructionArgs,
  BurnV1InstructionArgs,
  CreateV2InstructionArgs,
  TransferV1InstructionArgs,
} from '../utils/layouts/solita'

export enum MPLTokenEventType {
  CreateV1 = 'CreateV1',
  CreateV2 = 'CreateV2',
  TransferV1 = 'TransferV1',
  BurnV1 = 'BurnV1',

  // @todo:
  UpdateV1 = 'UpdateV1',
  UpdateV2 = 'UpdateV2',
  CreateCollectionV1 = 'CreateCollectionV1',
  AddPluginV1 = 'AddPluginV1',
  AddCollectionPluginV1 = 'AddCollectionPluginV1',
  RemovePluginV1 = 'RemovePluginV1',
  RemoveCollectionPluginV1 = 'RemoveCollectionPluginV1',
  UpdatePluginV1 = 'UpdatePluginV1',
  UpdateCollectionPluginV1 = 'UpdateCollectionPluginV1',
  ApprovePluginAuthorityV1 = 'ApprovePluginAuthorityV1',
  ApproveCollectionPluginAuthorityV1 = 'ApproveCollectionPluginAuthorityV1',
  RevokePluginAuthorityV1 = 'RevokePluginAuthorityV1',
  RevokeCollectionPluginAuthorityV1 = 'RevokeCollectionPluginAuthorityV1',
  BurnCollectionV1 = 'BurnCollectionV1',
  UpdateCollectionV1 = 'UpdateCollectionV1',
  CompressV1 = 'CompressV1',
  DecompressV1 = 'DecompressV1',
  Collect = 'Collect',
  CreateCollectionV2 = 'CreateCollectionV2',
  AddExternalPluginAdapterV1 = 'AddExternalPluginAdapterV1',
  AddCollectionExternalPluginAdapterV1 = 'AddCollectionExternalPluginAdapterV1',
  RemoveExternalPluginAdapterV1 = 'RemoveExternalPluginAdapterV1',
  RemoveCollectionExternalPluginAdapterV1 = 'RemoveCollectionExternalPluginAdapterV1',
  UpdateExternalPluginAdapterV1 = 'UpdateExternalPluginAdapterV1',
  UpdateCollectionExternalPluginAdapterV1 = 'UpdateCollectionExternalPluginAdapterV1',
  WriteExternalPluginAdapterDataV1 = 'WriteExternalPluginAdapterDataV1',
  WriteCollectionExternalPluginAdapterDataV1 = 'WriteCollectionExternalPluginAdapterDataV1',
}

export type MPLTokenInstructionBase = {
  program: string
  programId: string
  index: number
}

export type MPLTokenInstructionCreateV1 = MPLTokenInstructionBase & {
  parsed: {
    info: CreateV1InstructionArgs & CreateV1InstructionAccounts
    type: MPLTokenEventType.CreateV1
  }
}

export type MPLTokenInstructionCreateV2 = MPLTokenInstructionBase & {
  parsed: {
    info: CreateV2InstructionArgs & CreateV2InstructionAccounts
    type: MPLTokenEventType.CreateV2
  }
}

export type MPLTokenInstructionTransferV1 = MPLTokenInstructionBase & {
  parsed: {
    info: TransferV1InstructionArgs & TransferV1InstructionAccounts
    type: MPLTokenEventType.TransferV1
  }
}

export type MPLTokenInstructionBurnV1 = MPLTokenInstructionBase & {
  parsed: {
    info: BurnV1InstructionArgs & BurnV1InstructionAccounts
    type: MPLTokenEventType.BurnV1
  }
}

export type SLPTokenInstruction =
  | MPLTokenInstructionCreateV1
  | MPLTokenInstructionCreateV2
  | MPLTokenInstructionTransferV1
  | MPLTokenInstructionBurnV1

// ------------------- PARSED ------------------

export type MPLTokenEventBase = CommonEvent & {
  id: string
  blockchain: BlockchainId
  timestamp: number
  type: MPLTokenEventType
  height: number
  transaction: string
  asset: string
  collection?: string
  owner?: string
}

export type MPLTokenEventCreateV1 = MPLTokenEventBase & {
  type: MPLTokenEventType.CreateV1
  name: string
  uri: string
  owner?: string
}

export type MPLTokenEventCreateV2 = MPLTokenEventCreateV1

export type MPLTokenEventTransferV1 = MPLTokenEventBase & {
  type: MPLTokenEventType.TransferV1
  owner: string
}

export type MPLTokenEventBurnV1 = MPLTokenEventBase & {
  type: MPLTokenEventType.BurnV1
}

export type MPLTokenEvent =
  | MPLTokenEventCreateV1
  | MPLTokenEventCreateV2
  | MPLTokenEventTransferV1
  | MPLTokenEventBurnV1

// ----------------------------- HOLDINGS -----------------------------------

export type MPLTokenBalance = {
  blockchain: BlockchainId
  height: number
  timestamp: number
  asset: string
  collection?: string
  owner?: string
  burned?: boolean
  name?: string
  url?: string
}

// ------------------------

export type CollectionEventsFilters = {
  account?: string
  startDate?: number
  endDate?: number
  types?: string[]
  limit?: number
  reverse?: boolean
  skip?: number
}

export type AccountEventsFilters = {
  startDate?: number
  endDate?: number
  types?: string[]
  limit?: number
  reverse?: boolean
  skip?: number
}

export type AccountHoldingsOptions = {
  startDate?: number
  endDate?: number
  reverse?: boolean
  limit?: number
  skip?: number
}

export type MPLTokenTrackAccount = {
  blockchain: BlockchainId
  account: string
  collection: string
  completeHeight?: number
}

// -------------------------
