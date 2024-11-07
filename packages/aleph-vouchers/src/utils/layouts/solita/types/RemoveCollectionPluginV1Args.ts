/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { PluginType, pluginTypeBeet } from './PluginType.js'
export type RemoveCollectionPluginV1Args = {
  pluginType: PluginType
}

/**
 * @category userTypes
 * @category generated
 */
export const removeCollectionPluginV1ArgsBeet =
  new beet.BeetArgsStruct<RemoveCollectionPluginV1Args>(
    [['pluginType', pluginTypeBeet]],
    'RemoveCollectionPluginV1Args',
  )