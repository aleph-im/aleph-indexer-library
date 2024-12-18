/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'
/**
 * This type is used to derive the {@link RuleSet} type as well as the de/serializer.
 * However don't refer to it in your code but use the {@link RuleSet} type instead.
 *
 * @category userTypes
 * @category enums
 * @category generated
 * @private
 */
export type RuleSetRecord = {
  None: void /* scalar variant */
  ProgramAllowList: { fields: [web3.PublicKey[]] }
  ProgramDenyList: { fields: [web3.PublicKey[]] }
}

/**
 * Union type respresenting the RuleSet data enum defined in Rust.
 *
 * NOTE: that it includes a `__kind` property which allows to narrow types in
 * switch/if statements.
 * Additionally `isRuleSet*` type guards are exposed below to narrow to a specific variant.
 *
 * @category userTypes
 * @category enums
 * @category generated
 */
export type RuleSet = beet.DataEnumKeyAsKind<RuleSetRecord>

export const isRuleSetNone = (x: RuleSet): x is RuleSet & { __kind: 'None' } =>
  x.__kind === 'None'
export const isRuleSetProgramAllowList = (
  x: RuleSet,
): x is RuleSet & { __kind: 'ProgramAllowList' } =>
  x.__kind === 'ProgramAllowList'
export const isRuleSetProgramDenyList = (
  x: RuleSet,
): x is RuleSet & { __kind: 'ProgramDenyList' } =>
  x.__kind === 'ProgramDenyList'

/**
 * @category userTypes
 * @category generated
 */
export const ruleSetBeet = beet.dataEnum<RuleSetRecord>([
  ['None', beet.unit],
  [
    'ProgramAllowList',
    new beet.FixableBeetArgsStruct<RuleSetRecord['ProgramAllowList']>(
      [['fields', beet.tuple([beet.array(beetSolana.publicKey)])]],
      'RuleSetRecord["ProgramAllowList"]',
    ),
  ],
  [
    'ProgramDenyList',
    new beet.FixableBeetArgsStruct<RuleSetRecord['ProgramDenyList']>(
      [['fields', beet.tuple([beet.array(beetSolana.publicKey)])]],
      'RuleSetRecord["ProgramDenyList"]',
    ),
  ],
]) as beet.FixableBeet<RuleSet, RuleSet>
