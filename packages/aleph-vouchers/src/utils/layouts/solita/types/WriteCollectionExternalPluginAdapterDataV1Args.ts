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
export type WriteCollectionExternalPluginAdapterDataV1Args = {
  key: ExternalPluginAdapterKey
  data: beet.COption<Uint8Array>
}

/**
 * @category userTypes
 * @category generated
 */
export const writeCollectionExternalPluginAdapterDataV1ArgsBeet =
  new beet.FixableBeetArgsStruct<WriteCollectionExternalPluginAdapterDataV1Args>(
    [
      ['key', externalPluginAdapterKeyBeet],
      ['data', beet.coption(beet.bytes)],
    ],
    'WriteCollectionExternalPluginAdapterDataV1Args',
  )
