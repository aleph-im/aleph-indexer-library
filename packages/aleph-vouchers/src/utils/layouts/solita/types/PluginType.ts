/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
/**
 * @category enums
 * @category generated
 */
export enum PluginType {
  Royalties,
  FreezeDelegate,
  BurnDelegate,
  TransferDelegate,
  UpdateDelegate,
  PermanentFreezeDelegate,
  Attributes,
  PermanentTransferDelegate,
  PermanentBurnDelegate,
  Edition,
  MasterEdition,
  AddBlocker,
  ImmutableMetadata,
  VerifiedCreators,
  Autograph,
}

/**
 * @category userTypes
 * @category generated
 */
export const pluginTypeBeet = beet.fixedScalarEnum(
  PluginType,
) as beet.FixedSizeBeet<PluginType, PluginType>
