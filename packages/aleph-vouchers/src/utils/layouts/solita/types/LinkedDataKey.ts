/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import { Authority, authorityBeet } from './Authority.js'
/**
 * This type is used to derive the {@link LinkedDataKey} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link LinkedDataKey} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type LinkedDataKeyRecord = {
  LinkedLifecycleHook: { fields: [web3.PublicKey] }
  LinkedAppData: { fields: [Authority] }
}

/**
 * Union type respresenting the LinkedDataKey data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isLinkedDataKey*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type LinkedDataKey = beet.DataEnumKeyAsKind<LinkedDataKeyRecord>

export const isLinkedDataKeyLinkedLifecycleHook = (
  x: LinkedDataKey,
): x is LinkedDataKey & { __kind: 'LinkedLifecycleHook' } =>
  x.__kind === 'LinkedLifecycleHook'
export const isLinkedDataKeyLinkedAppData = (
  x: LinkedDataKey,
): x is LinkedDataKey & { __kind: 'LinkedAppData' } =>
  x.__kind === 'LinkedAppData'

/**
 * @category userTypes
 * @category generated
 */
export const linkedDataKeyBeet = beet.dataEnum<LinkedDataKeyRecord>([
  [
    'LinkedLifecycleHook',
    new beet.BeetArgsStruct<LinkedDataKeyRecord['LinkedLifecycleHook']>(
      [['fields', beet.fixedSizeTuple([beetSolana.publicKey])]],
      'LinkedDataKeyRecord["LinkedLifecycleHook"]',
    ),
  ],
  [
    'LinkedAppData',
    new beet.FixableBeetArgsStruct<LinkedDataKeyRecord['LinkedAppData']>(
      [['fields', beet.tuple([authorityBeet])]],
      'LinkedDataKeyRecord["LinkedAppData"]',
    ),
  ],
]) as beet.FixableBeet<LinkedDataKey, LinkedDataKey>
