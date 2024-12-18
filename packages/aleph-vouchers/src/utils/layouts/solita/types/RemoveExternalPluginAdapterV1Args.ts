/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  ExternalPluginAdapterKey,
  externalPluginAdapterKeyBeet,
} from './ExternalPluginAdapterKey.js'
export type RemoveExternalPluginAdapterV1Args = {
  key: ExternalPluginAdapterKey
}

/**
 * @category userTypes
 * @category generated
 */
export const removeExternalPluginAdapterV1ArgsBeet =
  new beet.FixableBeetArgsStruct<RemoveExternalPluginAdapterV1Args>(
    [['key', externalPluginAdapterKeyBeet]],
    'RemoveExternalPluginAdapterV1Args',
  )
