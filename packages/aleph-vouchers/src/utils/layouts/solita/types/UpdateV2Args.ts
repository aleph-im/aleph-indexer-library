/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { UpdateAuthority, updateAuthorityBeet } from './UpdateAuthority.js'
export type UpdateV2Args = {
  newName: beet.COption<string>
  newUri: beet.COption<string>
  newUpdateAuthority: beet.COption<UpdateAuthority>
}

/**
 * @category userTypes
 * @category generated
 */
export const updateV2ArgsBeet = new beet.FixableBeetArgsStruct<UpdateV2Args>(
  [
    ['newName', beet.coption(beet.utf8String)],
    ['newUri', beet.coption(beet.utf8String)],
    ['newUpdateAuthority', beet.coption(updateAuthorityBeet)],
  ],
  'UpdateV2Args',
)
