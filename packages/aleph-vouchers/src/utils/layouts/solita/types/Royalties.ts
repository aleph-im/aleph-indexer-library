/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { Creator, creatorBeet } from './Creator.js'
import { RuleSet, ruleSetBeet } from './RuleSet.js'
export type Royalties = {
  basisPoints: number
  creators: Creator[]
  ruleSet: RuleSet
}

/**
 * @category userTypes
 * @category generated
 */
export const royaltiesBeet = new beet.FixableBeetArgsStruct<Royalties>(
  [
    ['basisPoints', beet.u16],
    ['creators', beet.array(creatorBeet)],
    ['ruleSet', ruleSetBeet],
  ],
  'Royalties',
)
