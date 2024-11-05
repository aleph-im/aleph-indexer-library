/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { Plugin, pluginBeet } from './Plugin.js'
export type UpdateCollectionPluginV1Args = {
  plugin: Plugin
}

/**
 * @category userTypes
 * @category generated
 */
export const updateCollectionPluginV1ArgsBeet =
  new beet.FixableBeetArgsStruct<UpdateCollectionPluginV1Args>(
    [['plugin', pluginBeet]],
    'UpdateCollectionPluginV1Args',
  )
