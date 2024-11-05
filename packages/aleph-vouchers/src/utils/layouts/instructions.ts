import { EventBase } from '@aleph-indexer/framework'
import * as solita from './solita/index.js'

export enum InstructionType {
  CreateV1 = 'CreateV1',
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
  BurnV1 = 'BurnV1',
  BurnCollectionV1 = 'BurnCollectionV1',
  TransferV1 = 'TransferV1',
  UpdateV1 = 'UpdateV1',
  UpdateCollectionV1 = 'UpdateCollectionV1',
  CompressV1 = 'CompressV1',
  DecompressV1 = 'DecompressV1',
  Collect = 'Collect',
  CreateV2 = 'CreateV2',
  CreateCollectionV2 = 'CreateCollectionV2',
  AddExternalPluginAdapterV1 = 'AddExternalPluginAdapterV1',
  AddCollectionExternalPluginAdapterV1 = 'AddCollectionExternalPluginAdapterV1',
  RemoveExternalPluginAdapterV1 = 'RemoveExternalPluginAdapterV1',
  RemoveCollectionExternalPluginAdapterV1 = 'RemoveCollectionExternalPluginAdapterV1',
  UpdateExternalPluginAdapterV1 = 'UpdateExternalPluginAdapterV1',
  UpdateCollectionExternalPluginAdapterV1 = 'UpdateCollectionExternalPluginAdapterV1',
  WriteExternalPluginAdapterDataV1 = 'WriteExternalPluginAdapterDataV1',
  WriteCollectionExternalPluginAdapterDataV1 = 'WriteCollectionExternalPluginAdapterDataV1',
  UpdateV2 = 'UpdateV2',
}

export type RawInstructionBase = {
  parsed: unknown
  program: string
  programId: string
}

/*-----------------------* CUSTOM RAW INSTRUCTION TYPES *-----------------------*/

export type CreateV1AccountsInstruction = {
  asset: string
  collection: string
  authority: string
  payer: string
  owner: string
  updateAuthority: string
  systemProgram: string
  logWrapper: string
}

export type CreateV1Info = solita.CreateV1InstructionArgs &
  CreateV1AccountsInstruction

export type RawCreateV1 = RawInstructionBase & {
  parsed: {
    info: CreateV1Info
    type: InstructionType.CreateV1
  }
}

export type CreateCollectionV1AccountsInstruction = {
  collection: string
  updateAuthority: string
  payer: string
  systemProgram: string
}

export type CreateCollectionV1Info = solita.CreateCollectionV1InstructionArgs &
  CreateCollectionV1AccountsInstruction

export type RawCreateCollectionV1 = RawInstructionBase & {
  parsed: {
    info: CreateCollectionV1Info
    type: InstructionType.CreateCollectionV1
  }
}

export type AddPluginV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type AddPluginV1Info = solita.AddPluginV1InstructionArgs &
  AddPluginV1AccountsInstruction

export type RawAddPluginV1 = RawInstructionBase & {
  parsed: {
    info: AddPluginV1Info
    type: InstructionType.AddPluginV1
  }
}

export type AddCollectionPluginV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type AddCollectionPluginV1Info =
  solita.AddCollectionPluginV1InstructionArgs &
    AddCollectionPluginV1AccountsInstruction

export type RawAddCollectionPluginV1 = RawInstructionBase & {
  parsed: {
    info: AddCollectionPluginV1Info
    type: InstructionType.AddCollectionPluginV1
  }
}

export type RemovePluginV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type RemovePluginV1Info = solita.RemovePluginV1InstructionArgs &
  RemovePluginV1AccountsInstruction

export type RawRemovePluginV1 = RawInstructionBase & {
  parsed: {
    info: RemovePluginV1Info
    type: InstructionType.RemovePluginV1
  }
}

export type RemoveCollectionPluginV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type RemoveCollectionPluginV1Info =
  solita.RemoveCollectionPluginV1InstructionArgs &
    RemoveCollectionPluginV1AccountsInstruction

export type RawRemoveCollectionPluginV1 = RawInstructionBase & {
  parsed: {
    info: RemoveCollectionPluginV1Info
    type: InstructionType.RemoveCollectionPluginV1
  }
}

export type UpdatePluginV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type UpdatePluginV1Info = solita.UpdatePluginV1InstructionArgs &
  UpdatePluginV1AccountsInstruction

export type RawUpdatePluginV1 = RawInstructionBase & {
  parsed: {
    info: UpdatePluginV1Info
    type: InstructionType.UpdatePluginV1
  }
}

export type UpdateCollectionPluginV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type UpdateCollectionPluginV1Info =
  solita.UpdateCollectionPluginV1InstructionArgs &
    UpdateCollectionPluginV1AccountsInstruction

export type RawUpdateCollectionPluginV1 = RawInstructionBase & {
  parsed: {
    info: UpdateCollectionPluginV1Info
    type: InstructionType.UpdateCollectionPluginV1
  }
}

export type ApprovePluginAuthorityV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type ApprovePluginAuthorityV1Info =
  solita.ApprovePluginAuthorityV1InstructionArgs &
    ApprovePluginAuthorityV1AccountsInstruction

export type RawApprovePluginAuthorityV1 = RawInstructionBase & {
  parsed: {
    info: ApprovePluginAuthorityV1Info
    type: InstructionType.ApprovePluginAuthorityV1
  }
}

export type ApproveCollectionPluginAuthorityV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type ApproveCollectionPluginAuthorityV1Info =
  solita.ApproveCollectionPluginAuthorityV1InstructionArgs &
    ApproveCollectionPluginAuthorityV1AccountsInstruction

export type RawApproveCollectionPluginAuthorityV1 = RawInstructionBase & {
  parsed: {
    info: ApproveCollectionPluginAuthorityV1Info
    type: InstructionType.ApproveCollectionPluginAuthorityV1
  }
}

export type RevokePluginAuthorityV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type RevokePluginAuthorityV1Info =
  solita.RevokePluginAuthorityV1InstructionArgs &
    RevokePluginAuthorityV1AccountsInstruction

export type RawRevokePluginAuthorityV1 = RawInstructionBase & {
  parsed: {
    info: RevokePluginAuthorityV1Info
    type: InstructionType.RevokePluginAuthorityV1
  }
}

export type RevokeCollectionPluginAuthorityV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type RevokeCollectionPluginAuthorityV1Info =
  solita.RevokeCollectionPluginAuthorityV1InstructionArgs &
    RevokeCollectionPluginAuthorityV1AccountsInstruction

export type RawRevokeCollectionPluginAuthorityV1 = RawInstructionBase & {
  parsed: {
    info: RevokeCollectionPluginAuthorityV1Info
    type: InstructionType.RevokeCollectionPluginAuthorityV1
  }
}

export type BurnV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type BurnV1Info = solita.BurnV1InstructionArgs &
  BurnV1AccountsInstruction

export type RawBurnV1 = RawInstructionBase & {
  parsed: {
    info: BurnV1Info
    type: InstructionType.BurnV1
  }
}

export type BurnCollectionV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  logWrapper: string
}

export type BurnCollectionV1Info = solita.BurnCollectionV1InstructionArgs &
  BurnCollectionV1AccountsInstruction

export type RawBurnCollectionV1 = RawInstructionBase & {
  parsed: {
    info: BurnCollectionV1Info
    type: InstructionType.BurnCollectionV1
  }
}

export type TransferV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  newOwner: string
  systemProgram: string
  logWrapper: string
}

export type TransferV1Info = solita.TransferV1InstructionArgs &
  TransferV1AccountsInstruction

export type RawTransferV1 = RawInstructionBase & {
  parsed: {
    info: TransferV1Info
    type: InstructionType.TransferV1
  }
}

export type UpdateV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type UpdateV1Info = solita.UpdateV1InstructionArgs &
  UpdateV1AccountsInstruction

export type RawUpdateV1 = RawInstructionBase & {
  parsed: {
    info: UpdateV1Info
    type: InstructionType.UpdateV1
  }
}

export type UpdateCollectionV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  newUpdateAuthority: string
  systemProgram: string
  logWrapper: string
}

export type UpdateCollectionV1Info = solita.UpdateCollectionV1InstructionArgs &
  UpdateCollectionV1AccountsInstruction

export type RawUpdateCollectionV1 = RawInstructionBase & {
  parsed: {
    info: UpdateCollectionV1Info
    type: InstructionType.UpdateCollectionV1
  }
}

export type CompressV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type CompressV1Info = solita.CompressV1InstructionArgs &
  CompressV1AccountsInstruction

export type RawCompressV1 = RawInstructionBase & {
  parsed: {
    info: CompressV1Info
    type: InstructionType.CompressV1
  }
}

export type DecompressV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type DecompressV1Info = solita.DecompressV1InstructionArgs &
  DecompressV1AccountsInstruction

export type RawDecompressV1 = RawInstructionBase & {
  parsed: {
    info: DecompressV1Info
    type: InstructionType.DecompressV1
  }
}

export type CollectAccountsInstruction = {
  recipient1: string
  recipient2: string
}

export type CollectInfo = CollectAccountsInstruction

export type RawCollect = RawInstructionBase & {
  parsed: {
    info: CollectInfo
    type: InstructionType.Collect
  }
}

export type CreateV2AccountsInstruction = {
  asset: string
  collection: string
  authority: string
  payer: string
  owner: string
  updateAuthority: string
  systemProgram: string
  logWrapper: string
}

export type CreateV2Info = solita.CreateV2InstructionArgs &
  CreateV2AccountsInstruction

export type RawCreateV2 = RawInstructionBase & {
  parsed: {
    info: CreateV2Info
    type: InstructionType.CreateV2
  }
}

export type CreateCollectionV2AccountsInstruction = {
  collection: string
  updateAuthority: string
  payer: string
  systemProgram: string
}

export type CreateCollectionV2Info = solita.CreateCollectionV2InstructionArgs &
  CreateCollectionV2AccountsInstruction

export type RawCreateCollectionV2 = RawInstructionBase & {
  parsed: {
    info: CreateCollectionV2Info
    type: InstructionType.CreateCollectionV2
  }
}

export type AddExternalPluginAdapterV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type AddExternalPluginAdapterV1Info =
  solita.AddExternalPluginAdapterV1InstructionArgs &
    AddExternalPluginAdapterV1AccountsInstruction

export type RawAddExternalPluginAdapterV1 = RawInstructionBase & {
  parsed: {
    info: AddExternalPluginAdapterV1Info
    type: InstructionType.AddExternalPluginAdapterV1
  }
}

export type AddCollectionExternalPluginAdapterV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type AddCollectionExternalPluginAdapterV1Info =
  solita.AddCollectionExternalPluginAdapterV1InstructionArgs &
    AddCollectionExternalPluginAdapterV1AccountsInstruction

export type RawAddCollectionExternalPluginAdapterV1 = RawInstructionBase & {
  parsed: {
    info: AddCollectionExternalPluginAdapterV1Info
    type: InstructionType.AddCollectionExternalPluginAdapterV1
  }
}

export type RemoveExternalPluginAdapterV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type RemoveExternalPluginAdapterV1Info =
  solita.RemoveExternalPluginAdapterV1InstructionArgs &
    RemoveExternalPluginAdapterV1AccountsInstruction

export type RawRemoveExternalPluginAdapterV1 = RawInstructionBase & {
  parsed: {
    info: RemoveExternalPluginAdapterV1Info
    type: InstructionType.RemoveExternalPluginAdapterV1
  }
}

export type RemoveCollectionExternalPluginAdapterV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type RemoveCollectionExternalPluginAdapterV1Info =
  solita.RemoveCollectionExternalPluginAdapterV1InstructionArgs &
    RemoveCollectionExternalPluginAdapterV1AccountsInstruction

export type RawRemoveCollectionExternalPluginAdapterV1 = RawInstructionBase & {
  parsed: {
    info: RemoveCollectionExternalPluginAdapterV1Info
    type: InstructionType.RemoveCollectionExternalPluginAdapterV1
  }
}

export type UpdateExternalPluginAdapterV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type UpdateExternalPluginAdapterV1Info =
  solita.UpdateExternalPluginAdapterV1InstructionArgs &
    UpdateExternalPluginAdapterV1AccountsInstruction

export type RawUpdateExternalPluginAdapterV1 = RawInstructionBase & {
  parsed: {
    info: UpdateExternalPluginAdapterV1Info
    type: InstructionType.UpdateExternalPluginAdapterV1
  }
}

export type UpdateCollectionExternalPluginAdapterV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  systemProgram: string
  logWrapper: string
}

export type UpdateCollectionExternalPluginAdapterV1Info =
  solita.UpdateCollectionExternalPluginAdapterV1InstructionArgs &
    UpdateCollectionExternalPluginAdapterV1AccountsInstruction

export type RawUpdateCollectionExternalPluginAdapterV1 = RawInstructionBase & {
  parsed: {
    info: UpdateCollectionExternalPluginAdapterV1Info
    type: InstructionType.UpdateCollectionExternalPluginAdapterV1
  }
}

export type WriteExternalPluginAdapterDataV1AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  buffer: string
  systemProgram: string
  logWrapper: string
}

export type WriteExternalPluginAdapterDataV1Info =
  solita.WriteExternalPluginAdapterDataV1InstructionArgs &
    WriteExternalPluginAdapterDataV1AccountsInstruction

export type RawWriteExternalPluginAdapterDataV1 = RawInstructionBase & {
  parsed: {
    info: WriteExternalPluginAdapterDataV1Info
    type: InstructionType.WriteExternalPluginAdapterDataV1
  }
}

export type WriteCollectionExternalPluginAdapterDataV1AccountsInstruction = {
  collection: string
  payer: string
  authority: string
  buffer: string
  systemProgram: string
  logWrapper: string
}

export type WriteCollectionExternalPluginAdapterDataV1Info =
  solita.WriteCollectionExternalPluginAdapterDataV1InstructionArgs &
    WriteCollectionExternalPluginAdapterDataV1AccountsInstruction

export type RawWriteCollectionExternalPluginAdapterDataV1 =
  RawInstructionBase & {
    parsed: {
      info: WriteCollectionExternalPluginAdapterDataV1Info
      type: InstructionType.WriteCollectionExternalPluginAdapterDataV1
    }
  }

export type UpdateV2AccountsInstruction = {
  asset: string
  collection: string
  payer: string
  authority: string
  newCollection: string
  systemProgram: string
  logWrapper: string
}

export type UpdateV2Info = solita.UpdateV2InstructionArgs &
  UpdateV2AccountsInstruction

export type RawUpdateV2 = RawInstructionBase & {
  parsed: {
    info: UpdateV2Info
    type: InstructionType.UpdateV2
  }
}

export type RawInstructionsInfo =
  | CreateV1Info
  | CreateCollectionV1Info
  | AddPluginV1Info
  | AddCollectionPluginV1Info
  | RemovePluginV1Info
  | RemoveCollectionPluginV1Info
  | UpdatePluginV1Info
  | UpdateCollectionPluginV1Info
  | ApprovePluginAuthorityV1Info
  | ApproveCollectionPluginAuthorityV1Info
  | RevokePluginAuthorityV1Info
  | RevokeCollectionPluginAuthorityV1Info
  | BurnV1Info
  | BurnCollectionV1Info
  | TransferV1Info
  | UpdateV1Info
  | UpdateCollectionV1Info
  | CompressV1Info
  | DecompressV1Info
  | CollectInfo
  | CreateV2Info
  | CreateCollectionV2Info
  | AddExternalPluginAdapterV1Info
  | AddCollectionExternalPluginAdapterV1Info
  | RemoveExternalPluginAdapterV1Info
  | RemoveCollectionExternalPluginAdapterV1Info
  | UpdateExternalPluginAdapterV1Info
  | UpdateCollectionExternalPluginAdapterV1Info
  | WriteExternalPluginAdapterDataV1Info
  | WriteCollectionExternalPluginAdapterDataV1Info
  | UpdateV2Info

export type RawInstruction =
  | RawCreateV1
  | RawCreateCollectionV1
  | RawAddPluginV1
  | RawAddCollectionPluginV1
  | RawRemovePluginV1
  | RawRemoveCollectionPluginV1
  | RawUpdatePluginV1
  | RawUpdateCollectionPluginV1
  | RawApprovePluginAuthorityV1
  | RawApproveCollectionPluginAuthorityV1
  | RawRevokePluginAuthorityV1
  | RawRevokeCollectionPluginAuthorityV1
  | RawBurnV1
  | RawBurnCollectionV1
  | RawTransferV1
  | RawUpdateV1
  | RawUpdateCollectionV1
  | RawCompressV1
  | RawDecompressV1
  | RawCollect
  | RawCreateV2
  | RawCreateCollectionV2
  | RawAddExternalPluginAdapterV1
  | RawAddCollectionExternalPluginAdapterV1
  | RawRemoveExternalPluginAdapterV1
  | RawRemoveCollectionExternalPluginAdapterV1
  | RawUpdateExternalPluginAdapterV1
  | RawUpdateCollectionExternalPluginAdapterV1
  | RawWriteExternalPluginAdapterDataV1
  | RawWriteCollectionExternalPluginAdapterDataV1
  | RawUpdateV2

export type CreateV1Event = EventBase<InstructionType> & {
  info: CreateV1Info
  signer: string
  account: string
}

export type CreateCollectionV1Event = EventBase<InstructionType> & {
  info: CreateCollectionV1Info
  signer: string
  account: string
}

export type AddPluginV1Event = EventBase<InstructionType> & {
  info: AddPluginV1Info
  signer: string
  account: string
}

export type AddCollectionPluginV1Event = EventBase<InstructionType> & {
  info: AddCollectionPluginV1Info
  signer: string
  account: string
}

export type RemovePluginV1Event = EventBase<InstructionType> & {
  info: RemovePluginV1Info
  signer: string
  account: string
}

export type RemoveCollectionPluginV1Event = EventBase<InstructionType> & {
  info: RemoveCollectionPluginV1Info
  signer: string
  account: string
}

export type UpdatePluginV1Event = EventBase<InstructionType> & {
  info: UpdatePluginV1Info
  signer: string
  account: string
}

export type UpdateCollectionPluginV1Event = EventBase<InstructionType> & {
  info: UpdateCollectionPluginV1Info
  signer: string
  account: string
}

export type ApprovePluginAuthorityV1Event = EventBase<InstructionType> & {
  info: ApprovePluginAuthorityV1Info
  signer: string
  account: string
}

export type ApproveCollectionPluginAuthorityV1Event =
  EventBase<InstructionType> & {
    info: ApproveCollectionPluginAuthorityV1Info
    signer: string
    account: string
  }

export type RevokePluginAuthorityV1Event = EventBase<InstructionType> & {
  info: RevokePluginAuthorityV1Info
  signer: string
  account: string
}

export type RevokeCollectionPluginAuthorityV1Event =
  EventBase<InstructionType> & {
    info: RevokeCollectionPluginAuthorityV1Info
    signer: string
    account: string
  }

export type BurnV1Event = EventBase<InstructionType> & {
  info: BurnV1Info
  signer: string
  account: string
}

export type BurnCollectionV1Event = EventBase<InstructionType> & {
  info: BurnCollectionV1Info
  signer: string
  account: string
}

export type TransferV1Event = EventBase<InstructionType> & {
  info: TransferV1Info
  signer: string
  account: string
}

export type UpdateV1Event = EventBase<InstructionType> & {
  info: UpdateV1Info
  signer: string
  account: string
}

export type UpdateCollectionV1Event = EventBase<InstructionType> & {
  info: UpdateCollectionV1Info
  signer: string
  account: string
}

export type CompressV1Event = EventBase<InstructionType> & {
  info: CompressV1Info
  signer: string
  account: string
}

export type DecompressV1Event = EventBase<InstructionType> & {
  info: DecompressV1Info
  signer: string
  account: string
}

export type CollectEvent = EventBase<InstructionType> & {
  info: CollectInfo
  signer: string
  account: string
}

export type CreateV2Event = EventBase<InstructionType> & {
  info: CreateV2Info
  signer: string
  account: string
}

export type CreateCollectionV2Event = EventBase<InstructionType> & {
  info: CreateCollectionV2Info
  signer: string
  account: string
}

export type AddExternalPluginAdapterV1Event = EventBase<InstructionType> & {
  info: AddExternalPluginAdapterV1Info
  signer: string
  account: string
}

export type AddCollectionExternalPluginAdapterV1Event =
  EventBase<InstructionType> & {
    info: AddCollectionExternalPluginAdapterV1Info
    signer: string
    account: string
  }

export type RemoveExternalPluginAdapterV1Event = EventBase<InstructionType> & {
  info: RemoveExternalPluginAdapterV1Info
  signer: string
  account: string
}

export type RemoveCollectionExternalPluginAdapterV1Event =
  EventBase<InstructionType> & {
    info: RemoveCollectionExternalPluginAdapterV1Info
    signer: string
    account: string
  }

export type UpdateExternalPluginAdapterV1Event = EventBase<InstructionType> & {
  info: UpdateExternalPluginAdapterV1Info
  signer: string
  account: string
}

export type UpdateCollectionExternalPluginAdapterV1Event =
  EventBase<InstructionType> & {
    info: UpdateCollectionExternalPluginAdapterV1Info
    signer: string
    account: string
  }

export type WriteExternalPluginAdapterDataV1Event =
  EventBase<InstructionType> & {
    info: WriteExternalPluginAdapterDataV1Info
    signer: string
    account: string
  }

export type WriteCollectionExternalPluginAdapterDataV1Event =
  EventBase<InstructionType> & {
    info: WriteCollectionExternalPluginAdapterDataV1Info
    signer: string
    account: string
  }

export type UpdateV2Event = EventBase<InstructionType> & {
  info: UpdateV2Info
  signer: string
  account: string
}

export type MplCoreProgramEvent =
  | CreateV1Event
  | CreateCollectionV1Event
  | AddPluginV1Event
  | AddCollectionPluginV1Event
  | RemovePluginV1Event
  | RemoveCollectionPluginV1Event
  | UpdatePluginV1Event
  | UpdateCollectionPluginV1Event
  | ApprovePluginAuthorityV1Event
  | ApproveCollectionPluginAuthorityV1Event
  | RevokePluginAuthorityV1Event
  | RevokeCollectionPluginAuthorityV1Event
  | BurnV1Event
  | BurnCollectionV1Event
  | TransferV1Event
  | UpdateV1Event
  | UpdateCollectionV1Event
  | CompressV1Event
  | DecompressV1Event
  | CollectEvent
  | CreateV2Event
  | CreateCollectionV2Event
  | AddExternalPluginAdapterV1Event
  | AddCollectionExternalPluginAdapterV1Event
  | RemoveExternalPluginAdapterV1Event
  | RemoveCollectionExternalPluginAdapterV1Event
  | UpdateExternalPluginAdapterV1Event
  | UpdateCollectionExternalPluginAdapterV1Event
  | WriteExternalPluginAdapterDataV1Event
  | WriteCollectionExternalPluginAdapterDataV1Event
  | UpdateV2Event
/*----------------------------------------------------------------------*/

export function getInstructionType(data: Buffer): InstructionType | undefined {
  const discriminator = data.subarray(0, 1).toString('hex').padStart(2, '0')
  return IX_METHOD_CODE.get(discriminator)
}

export const IX_METHOD_CODE: Map<string, InstructionType | undefined> = new Map<
  string,
  InstructionType | undefined
>([
  [
    solita.createV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.CreateV1,
  ],
  [
    solita.createCollectionV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.CreateCollectionV1,
  ],
  [
    solita.addPluginV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.AddPluginV1,
  ],
  [
    solita.addCollectionPluginV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.AddCollectionPluginV1,
  ],
  [
    solita.removePluginV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.RemovePluginV1,
  ],
  [
    solita.removeCollectionPluginV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.RemoveCollectionPluginV1,
  ],
  [
    solita.updatePluginV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.UpdatePluginV1,
  ],
  [
    solita.updateCollectionPluginV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.UpdateCollectionPluginV1,
  ],
  [
    solita.approvePluginAuthorityV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.ApprovePluginAuthorityV1,
  ],
  [
    solita.approveCollectionPluginAuthorityV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.ApproveCollectionPluginAuthorityV1,
  ],
  [
    solita.revokePluginAuthorityV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.RevokePluginAuthorityV1,
  ],
  [
    solita.revokeCollectionPluginAuthorityV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.RevokeCollectionPluginAuthorityV1,
  ],
  [
    solita.burnV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.BurnV1,
  ],
  [
    solita.burnCollectionV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.BurnCollectionV1,
  ],
  [
    solita.transferV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.TransferV1,
  ],
  [
    solita.updateV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.UpdateV1,
  ],
  [
    solita.updateCollectionV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.UpdateCollectionV1,
  ],
  [
    solita.compressV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.CompressV1,
  ],
  [
    solita.decompressV1InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.DecompressV1,
  ],
  [
    solita.collectInstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.Collect,
  ],
  [
    solita.createV2InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.CreateV2,
  ],
  [
    solita.createCollectionV2InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.CreateCollectionV2,
  ],
  [
    solita.addExternalPluginAdapterV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.AddExternalPluginAdapterV1,
  ],
  [
    solita.addCollectionExternalPluginAdapterV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.AddCollectionExternalPluginAdapterV1,
  ],
  [
    solita.removeExternalPluginAdapterV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.RemoveExternalPluginAdapterV1,
  ],
  [
    solita.removeCollectionExternalPluginAdapterV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.RemoveCollectionExternalPluginAdapterV1,
  ],
  [
    solita.updateExternalPluginAdapterV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.UpdateExternalPluginAdapterV1,
  ],
  [
    solita.updateCollectionExternalPluginAdapterV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.UpdateCollectionExternalPluginAdapterV1,
  ],
  [
    solita.writeExternalPluginAdapterDataV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.WriteExternalPluginAdapterDataV1,
  ],
  [
    solita.writeCollectionExternalPluginAdapterDataV1InstructionDiscriminator
      .toString(16)
      .padStart(2, '0'),
    InstructionType.WriteCollectionExternalPluginAdapterDataV1,
  ],
  [
    solita.updateV2InstructionDiscriminator.toString(16).padStart(2, '0'),
    InstructionType.UpdateV2,
  ],
])

export const IX_DATA_LAYOUT: Partial<Record<InstructionType, any>> = {
  [InstructionType.CreateV1]: solita.CreateV1Struct,
  [InstructionType.CreateCollectionV1]: solita.CreateCollectionV1Struct,
  [InstructionType.AddPluginV1]: solita.AddPluginV1Struct,
  [InstructionType.AddCollectionPluginV1]: solita.AddCollectionPluginV1Struct,
  [InstructionType.RemovePluginV1]: solita.RemovePluginV1Struct,
  [InstructionType.RemoveCollectionPluginV1]:
    solita.RemoveCollectionPluginV1Struct,
  [InstructionType.UpdatePluginV1]: solita.UpdatePluginV1Struct,
  [InstructionType.UpdateCollectionPluginV1]:
    solita.UpdateCollectionPluginV1Struct,
  [InstructionType.ApprovePluginAuthorityV1]:
    solita.ApprovePluginAuthorityV1Struct,
  [InstructionType.ApproveCollectionPluginAuthorityV1]:
    solita.ApproveCollectionPluginAuthorityV1Struct,
  [InstructionType.RevokePluginAuthorityV1]:
    solita.RevokePluginAuthorityV1Struct,
  [InstructionType.RevokeCollectionPluginAuthorityV1]:
    solita.RevokeCollectionPluginAuthorityV1Struct,
  [InstructionType.BurnV1]: solita.BurnV1Struct,
  [InstructionType.BurnCollectionV1]: solita.BurnCollectionV1Struct,
  [InstructionType.TransferV1]: solita.TransferV1Struct,
  [InstructionType.UpdateV1]: solita.UpdateV1Struct,
  [InstructionType.UpdateCollectionV1]: solita.UpdateCollectionV1Struct,
  [InstructionType.CompressV1]: solita.CompressV1Struct,
  [InstructionType.DecompressV1]: solita.DecompressV1Struct,
  [InstructionType.Collect]: solita.CollectStruct,
  [InstructionType.CreateV2]: solita.CreateV2Struct,
  [InstructionType.CreateCollectionV2]: solita.CreateCollectionV2Struct,
  [InstructionType.AddExternalPluginAdapterV1]:
    solita.AddExternalPluginAdapterV1Struct,
  [InstructionType.AddCollectionExternalPluginAdapterV1]:
    solita.AddCollectionExternalPluginAdapterV1Struct,
  [InstructionType.RemoveExternalPluginAdapterV1]:
    solita.RemoveExternalPluginAdapterV1Struct,
  [InstructionType.RemoveCollectionExternalPluginAdapterV1]:
    solita.RemoveCollectionExternalPluginAdapterV1Struct,
  [InstructionType.UpdateExternalPluginAdapterV1]:
    solita.UpdateExternalPluginAdapterV1Struct,
  [InstructionType.UpdateCollectionExternalPluginAdapterV1]:
    solita.UpdateCollectionExternalPluginAdapterV1Struct,
  [InstructionType.WriteExternalPluginAdapterDataV1]:
    solita.WriteExternalPluginAdapterDataV1Struct,
  [InstructionType.WriteCollectionExternalPluginAdapterDataV1]:
    solita.WriteCollectionExternalPluginAdapterDataV1Struct,
  [InstructionType.UpdateV2]: solita.UpdateV2Struct,
}

export const IX_ACCOUNTS_LAYOUT: Partial<Record<InstructionType, any>> = {
  [InstructionType.CreateV1]: solita.CreateV1Accounts,
  [InstructionType.CreateCollectionV1]: solita.CreateCollectionV1Accounts,
  [InstructionType.AddPluginV1]: solita.AddPluginV1Accounts,
  [InstructionType.AddCollectionPluginV1]: solita.AddCollectionPluginV1Accounts,
  [InstructionType.RemovePluginV1]: solita.RemovePluginV1Accounts,
  [InstructionType.RemoveCollectionPluginV1]:
    solita.RemoveCollectionPluginV1Accounts,
  [InstructionType.UpdatePluginV1]: solita.UpdatePluginV1Accounts,
  [InstructionType.UpdateCollectionPluginV1]:
    solita.UpdateCollectionPluginV1Accounts,
  [InstructionType.ApprovePluginAuthorityV1]:
    solita.ApprovePluginAuthorityV1Accounts,
  [InstructionType.ApproveCollectionPluginAuthorityV1]:
    solita.ApproveCollectionPluginAuthorityV1Accounts,
  [InstructionType.RevokePluginAuthorityV1]:
    solita.RevokePluginAuthorityV1Accounts,
  [InstructionType.RevokeCollectionPluginAuthorityV1]:
    solita.RevokeCollectionPluginAuthorityV1Accounts,
  [InstructionType.BurnV1]: solita.BurnV1Accounts,
  [InstructionType.BurnCollectionV1]: solita.BurnCollectionV1Accounts,
  [InstructionType.TransferV1]: solita.TransferV1Accounts,
  [InstructionType.UpdateV1]: solita.UpdateV1Accounts,
  [InstructionType.UpdateCollectionV1]: solita.UpdateCollectionV1Accounts,
  [InstructionType.CompressV1]: solita.CompressV1Accounts,
  [InstructionType.DecompressV1]: solita.DecompressV1Accounts,
  [InstructionType.Collect]: solita.CollectAccounts,
  [InstructionType.CreateV2]: solita.CreateV2Accounts,
  [InstructionType.CreateCollectionV2]: solita.CreateCollectionV2Accounts,
  [InstructionType.AddExternalPluginAdapterV1]:
    solita.AddExternalPluginAdapterV1Accounts,
  [InstructionType.AddCollectionExternalPluginAdapterV1]:
    solita.AddCollectionExternalPluginAdapterV1Accounts,
  [InstructionType.RemoveExternalPluginAdapterV1]:
    solita.RemoveExternalPluginAdapterV1Accounts,
  [InstructionType.RemoveCollectionExternalPluginAdapterV1]:
    solita.RemoveCollectionExternalPluginAdapterV1Accounts,
  [InstructionType.UpdateExternalPluginAdapterV1]:
    solita.UpdateExternalPluginAdapterV1Accounts,
  [InstructionType.UpdateCollectionExternalPluginAdapterV1]:
    solita.UpdateCollectionExternalPluginAdapterV1Accounts,
  [InstructionType.WriteExternalPluginAdapterDataV1]:
    solita.WriteExternalPluginAdapterDataV1Accounts,
  [InstructionType.WriteCollectionExternalPluginAdapterDataV1]:
    solita.WriteCollectionExternalPluginAdapterDataV1Accounts,
  [InstructionType.UpdateV2]: solita.UpdateV2Accounts,
}
