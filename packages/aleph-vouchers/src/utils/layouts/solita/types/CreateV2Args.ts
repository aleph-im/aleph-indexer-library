/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { DataState, dataStateBeet } from './DataState.js'
import {
  PluginAuthorityPair,
  pluginAuthorityPairBeet,
} from './PluginAuthorityPair.js'
import {
  ExternalPluginAdapterInitInfo,
  externalPluginAdapterInitInfoBeet,
} from './ExternalPluginAdapterInitInfo.js'
export type CreateV2Args = {
  dataState: DataState
  name: string
  uri: string
  plugins: beet.COption<PluginAuthorityPair[]>
  externalPluginAdapters: beet.COption<ExternalPluginAdapterInitInfo[]>
}

/**
 * @category userTypes
 * @category generated
 */
export const createV2ArgsBeet = new beet.FixableBeetArgsStruct<CreateV2Args>(
  [
    ['dataState', dataStateBeet],
    ['name', beet.utf8String],
    ['uri', beet.utf8String],
    ['plugins', beet.coption(beet.array(pluginAuthorityPairBeet))],
    [
      'externalPluginAdapters',
      beet.coption(beet.array(externalPluginAdapterInitInfoBeet)),
    ],
  ],
  'CreateV2Args',
)