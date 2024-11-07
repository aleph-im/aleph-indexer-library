/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type MasterEdition = {
  maxSupply: beet.COption<number>
  name: beet.COption<string>
  uri: beet.COption<string>
}

/**
 * @category userTypes
 * @category generated
 */
export const masterEditionBeet = new beet.FixableBeetArgsStruct<MasterEdition>(
  [
    ['maxSupply', beet.coption(beet.u32)],
    ['name', beet.coption(beet.utf8String)],
    ['uri', beet.coption(beet.utf8String)],
  ],
  'MasterEdition',
)