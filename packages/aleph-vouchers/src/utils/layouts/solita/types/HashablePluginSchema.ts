/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { Authority, authorityBeet } from './Authority.js'
import { Plugin, pluginBeet } from './Plugin.js'
export type HashablePluginSchema = {
  index: beet.bignum
  authority: Authority
  plugin: Plugin
}

/**
 * @category userTypes
 * @category generated
 */
export const hashablePluginSchemaBeet =
  new beet.FixableBeetArgsStruct<HashablePluginSchema>(
    [
      ['index', beet.u64],
      ['authority', authorityBeet],
      ['plugin', pluginBeet],
    ],
    'HashablePluginSchema',
  )
