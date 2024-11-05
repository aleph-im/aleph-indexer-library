/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  PluginAuthorityPair,
  pluginAuthorityPairBeet,
} from './PluginAuthorityPair.js'
export type CreateCollectionV1Args = {
  name: string
  uri: string
  plugins: beet.COption<PluginAuthorityPair[]>
}

/**
 * @category userTypes
 * @category generated
 */
export const createCollectionV1ArgsBeet =
  new beet.FixableBeetArgsStruct<CreateCollectionV1Args>(
    [
      ['name', beet.utf8String],
      ['uri', beet.utf8String],
      ['plugins', beet.coption(beet.array(pluginAuthorityPairBeet))],
    ],
    'CreateCollectionV1Args',
  )
