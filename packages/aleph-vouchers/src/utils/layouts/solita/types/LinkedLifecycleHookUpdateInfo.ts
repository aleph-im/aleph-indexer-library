/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  HookableLifecycleEvent,
  hookableLifecycleEventBeet,
} from './HookableLifecycleEvent.js'
import {
  ExternalCheckResult,
  externalCheckResultBeet,
} from './ExternalCheckResult.js'
import { ExtraAccount, extraAccountBeet } from './ExtraAccount.js'
import {
  ExternalPluginAdapterSchema,
  externalPluginAdapterSchemaBeet,
} from './ExternalPluginAdapterSchema.js'
export type LinkedLifecycleHookUpdateInfo = {
  lifecycleChecks: beet.COption<[HookableLifecycleEvent, ExternalCheckResult][]>
  extraAccounts: beet.COption<ExtraAccount[]>
  schema: beet.COption<ExternalPluginAdapterSchema>
}

/**
 * @category userTypes
 * @category generated
 */
export const linkedLifecycleHookUpdateInfoBeet =
  new beet.FixableBeetArgsStruct<LinkedLifecycleHookUpdateInfo>(
    [
      [
        'lifecycleChecks',
        beet.coption(
          beet.array(
            beet.fixedSizeTuple([
              hookableLifecycleEventBeet,
              externalCheckResultBeet,
            ]),
          ),
        ),
      ],
      ['extraAccounts', beet.coption(beet.array(extraAccountBeet))],
      ['schema', beet.coption(externalPluginAdapterSchemaBeet)],
    ],
    'LinkedLifecycleHookUpdateInfo',
  )
