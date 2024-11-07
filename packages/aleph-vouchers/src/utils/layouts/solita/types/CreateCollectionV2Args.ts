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
import {
  ExternalPluginAdapterInitInfo,
  externalPluginAdapterInitInfoBeet,
} from './ExternalPluginAdapterInitInfo.js'
export type CreateCollectionV2Args = {
  name: string
  uri: string
  plugins: beet.COption<PluginAuthorityPair[]>
  externalPluginAdapters: beet.COption<ExternalPluginAdapterInitInfo[]>
}

/**
 * @category userTypes
 * @category generated
 */
export const createCollectionV2ArgsBeet =
  new beet.FixableBeetArgsStruct<CreateCollectionV2Args>(
    [
      ['name', beet.utf8String],
      ['uri', beet.utf8String],
      ['plugins', beet.coption(beet.array(pluginAuthorityPairBeet))],
      [
        'externalPluginAdapters',
        beet.coption(beet.array(externalPluginAdapterInitInfoBeet)),
      ],
    ],
    'CreateCollectionV2Args',
  )