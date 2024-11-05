/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { ExtraAccount, extraAccountBeet } from './ExtraAccount.js'
import { Authority, authorityBeet } from './Authority.js'
import {
  ExternalPluginAdapterSchema,
  externalPluginAdapterSchemaBeet,
} from './ExternalPluginAdapterSchema.js'
export type LinkedLifecycleHook = {
  hookedProgram: web3.PublicKey
  extraAccounts: beet.COption<ExtraAccount[]>
  dataAuthority: beet.COption<Authority>
  schema: ExternalPluginAdapterSchema
}

/**
 * @category userTypes
 * @category generated
 */
export const linkedLifecycleHookBeet =
  new beet.FixableBeetArgsStruct<LinkedLifecycleHook>(
    [
      ['hookedProgram', beetSolana.publicKey],
      ['extraAccounts', beet.coption(beet.array(extraAccountBeet))],
      ['dataAuthority', beet.coption(authorityBeet)],
      ['schema', externalPluginAdapterSchemaBeet],
    ],
    'LinkedLifecycleHook',
  )
