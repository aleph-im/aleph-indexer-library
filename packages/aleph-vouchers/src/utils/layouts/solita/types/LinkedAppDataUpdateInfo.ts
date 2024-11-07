/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  ExternalPluginAdapterSchema,
  externalPluginAdapterSchemaBeet,
} from './ExternalPluginAdapterSchema.js'
export type LinkedAppDataUpdateInfo = {
  schema: beet.COption<ExternalPluginAdapterSchema>
}

/**
 * @category userTypes
 * @category generated
 */
export const linkedAppDataUpdateInfoBeet =
  new beet.FixableBeetArgsStruct<LinkedAppDataUpdateInfo>(
    [['schema', beet.coption(externalPluginAdapterSchemaBeet)]],
    'LinkedAppDataUpdateInfo',
  )