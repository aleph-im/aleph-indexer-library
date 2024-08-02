/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import { Fee, feeBeet } from './Fee.js'
export type FeeValueChange = {
  old: Fee
  new: Fee
}

/**
 * @category userTypes
 * @category generated
 */
export const feeValueChangeBeet = new beet.BeetArgsStruct<FeeValueChange>(
  [
    ['old', feeBeet],
    ['new', feeBeet],
  ],
  'FeeValueChange',
)