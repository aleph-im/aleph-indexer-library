/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { Royalties, royaltiesBeet } from './Royalties.js'
import { FreezeDelegate, freezeDelegateBeet } from './FreezeDelegate.js'
import { BurnDelegate, burnDelegateBeet } from './BurnDelegate.js'
import { TransferDelegate, transferDelegateBeet } from './TransferDelegate.js'
import { UpdateDelegate, updateDelegateBeet } from './UpdateDelegate.js'
import {
  PermanentFreezeDelegate,
  permanentFreezeDelegateBeet,
} from './PermanentFreezeDelegate.js'
import { Attributes, attributesBeet } from './Attributes.js'
import {
  PermanentTransferDelegate,
  permanentTransferDelegateBeet,
} from './PermanentTransferDelegate.js'
import {
  PermanentBurnDelegate,
  permanentBurnDelegateBeet,
} from './PermanentBurnDelegate.js'
import { Edition, editionBeet } from './Edition.js'
import { MasterEdition, masterEditionBeet } from './MasterEdition.js'
import { AddBlocker, addBlockerBeet } from './AddBlocker.js'
import {
  ImmutableMetadata,
  immutableMetadataBeet,
} from './ImmutableMetadata.js'
import { VerifiedCreators, verifiedCreatorsBeet } from './VerifiedCreators.js'
import { Autograph, autographBeet } from './Autograph.js'
/**
 * This type is used to derive the {@link Plugin} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link Plugin} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type PluginRecord = {
  Royalties: { fields: [Royalties] }
  FreezeDelegate: { fields: [FreezeDelegate] }
  BurnDelegate: { fields: [BurnDelegate] }
  TransferDelegate: { fields: [TransferDelegate] }
  UpdateDelegate: { fields: [UpdateDelegate] }
  PermanentFreezeDelegate: { fields: [PermanentFreezeDelegate] }
  Attributes: { fields: [Attributes] }
  PermanentTransferDelegate: { fields: [PermanentTransferDelegate] }
  PermanentBurnDelegate: { fields: [PermanentBurnDelegate] }
  Edition: { fields: [Edition] }
  MasterEdition: { fields: [MasterEdition] }
  AddBlocker: { fields: [AddBlocker] }
  ImmutableMetadata: { fields: [ImmutableMetadata] }
  VerifiedCreators: { fields: [VerifiedCreators] }
  Autograph: { fields: [Autograph] }
}

/**
 * Union type respresenting the Plugin data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isPlugin*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type Plugin = beet.DataEnumKeyAsKind<PluginRecord>

export const isPluginRoyalties = (
  x: Plugin,
): x is Plugin & { __kind: 'Royalties' } => x.__kind === 'Royalties'
export const isPluginFreezeDelegate = (
  x: Plugin,
): x is Plugin & { __kind: 'FreezeDelegate' } => x.__kind === 'FreezeDelegate'
export const isPluginBurnDelegate = (
  x: Plugin,
): x is Plugin & { __kind: 'BurnDelegate' } => x.__kind === 'BurnDelegate'
export const isPluginTransferDelegate = (
  x: Plugin,
): x is Plugin & { __kind: 'TransferDelegate' } =>
  x.__kind === 'TransferDelegate'
export const isPluginUpdateDelegate = (
  x: Plugin,
): x is Plugin & { __kind: 'UpdateDelegate' } => x.__kind === 'UpdateDelegate'
export const isPluginPermanentFreezeDelegate = (
  x: Plugin,
): x is Plugin & { __kind: 'PermanentFreezeDelegate' } =>
  x.__kind === 'PermanentFreezeDelegate'
export const isPluginAttributes = (
  x: Plugin,
): x is Plugin & { __kind: 'Attributes' } => x.__kind === 'Attributes'
export const isPluginPermanentTransferDelegate = (
  x: Plugin,
): x is Plugin & { __kind: 'PermanentTransferDelegate' } =>
  x.__kind === 'PermanentTransferDelegate'
export const isPluginPermanentBurnDelegate = (
  x: Plugin,
): x is Plugin & { __kind: 'PermanentBurnDelegate' } =>
  x.__kind === 'PermanentBurnDelegate'
export const isPluginEdition = (
  x: Plugin,
): x is Plugin & { __kind: 'Edition' } => x.__kind === 'Edition'
export const isPluginMasterEdition = (
  x: Plugin,
): x is Plugin & { __kind: 'MasterEdition' } => x.__kind === 'MasterEdition'
export const isPluginAddBlocker = (
  x: Plugin,
): x is Plugin & { __kind: 'AddBlocker' } => x.__kind === 'AddBlocker'
export const isPluginImmutableMetadata = (
  x: Plugin,
): x is Plugin & { __kind: 'ImmutableMetadata' } =>
  x.__kind === 'ImmutableMetadata'
export const isPluginVerifiedCreators = (
  x: Plugin,
): x is Plugin & { __kind: 'VerifiedCreators' } =>
  x.__kind === 'VerifiedCreators'
export const isPluginAutograph = (
  x: Plugin,
): x is Plugin & { __kind: 'Autograph' } => x.__kind === 'Autograph'

/**
 * @category userTypes
 * @category generated
 */
export const pluginBeet = beet.dataEnum<PluginRecord>([
  [
    'Royalties',
    new beet.FixableBeetArgsStruct<PluginRecord['Royalties']>(
      [['fields', beet.tuple([royaltiesBeet])]],
      'PluginRecord["Royalties"]',
    ),
  ],
  [
    'FreezeDelegate',
    new beet.BeetArgsStruct<PluginRecord['FreezeDelegate']>(
      [['fields', beet.fixedSizeTuple([freezeDelegateBeet])]],
      'PluginRecord["FreezeDelegate"]',
    ),
  ],
  [
    'BurnDelegate',
    new beet.FixableBeetArgsStruct<PluginRecord['BurnDelegate']>(
      [['fields', beet.tuple([burnDelegateBeet])]],
      'PluginRecord["BurnDelegate"]',
    ),
  ],
  [
    'TransferDelegate',
    new beet.FixableBeetArgsStruct<PluginRecord['TransferDelegate']>(
      [['fields', beet.tuple([transferDelegateBeet])]],
      'PluginRecord["TransferDelegate"]',
    ),
  ],
  [
    'UpdateDelegate',
    new beet.FixableBeetArgsStruct<PluginRecord['UpdateDelegate']>(
      [['fields', beet.tuple([updateDelegateBeet])]],
      'PluginRecord["UpdateDelegate"]',
    ),
  ],
  [
    'PermanentFreezeDelegate',
    new beet.BeetArgsStruct<PluginRecord['PermanentFreezeDelegate']>(
      [['fields', beet.fixedSizeTuple([permanentFreezeDelegateBeet])]],
      'PluginRecord["PermanentFreezeDelegate"]',
    ),
  ],
  [
    'Attributes',
    new beet.FixableBeetArgsStruct<PluginRecord['Attributes']>(
      [['fields', beet.tuple([attributesBeet])]],
      'PluginRecord["Attributes"]',
    ),
  ],
  [
    'PermanentTransferDelegate',
    new beet.FixableBeetArgsStruct<PluginRecord['PermanentTransferDelegate']>(
      [['fields', beet.tuple([permanentTransferDelegateBeet])]],
      'PluginRecord["PermanentTransferDelegate"]',
    ),
  ],
  [
    'PermanentBurnDelegate',
    new beet.FixableBeetArgsStruct<PluginRecord['PermanentBurnDelegate']>(
      [['fields', beet.tuple([permanentBurnDelegateBeet])]],
      'PluginRecord["PermanentBurnDelegate"]',
    ),
  ],
  [
    'Edition',
    new beet.BeetArgsStruct<PluginRecord['Edition']>(
      [['fields', beet.fixedSizeTuple([editionBeet])]],
      'PluginRecord["Edition"]',
    ),
  ],
  [
    'MasterEdition',
    new beet.FixableBeetArgsStruct<PluginRecord['MasterEdition']>(
      [['fields', beet.tuple([masterEditionBeet])]],
      'PluginRecord["MasterEdition"]',
    ),
  ],
  [
    'AddBlocker',
    new beet.FixableBeetArgsStruct<PluginRecord['AddBlocker']>(
      [['fields', beet.tuple([addBlockerBeet])]],
      'PluginRecord["AddBlocker"]',
    ),
  ],
  [
    'ImmutableMetadata',
    new beet.FixableBeetArgsStruct<PluginRecord['ImmutableMetadata']>(
      [['fields', beet.tuple([immutableMetadataBeet])]],
      'PluginRecord["ImmutableMetadata"]',
    ),
  ],
  [
    'VerifiedCreators',
    new beet.FixableBeetArgsStruct<PluginRecord['VerifiedCreators']>(
      [['fields', beet.tuple([verifiedCreatorsBeet])]],
      'PluginRecord["VerifiedCreators"]',
    ),
  ],
  [
    'Autograph',
    new beet.FixableBeetArgsStruct<PluginRecord['Autograph']>(
      [['fields', beet.tuple([autographBeet])]],
      'PluginRecord["Autograph"]',
    ),
  ],
]) as beet.FixableBeet<Plugin, Plugin>