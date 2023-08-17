/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type RegisterBuyCnftParams = {
  amount: number
  name: string
  symbol: string
  uri: string
}

/**
 * @category userTypes
 * @category generated
 */
export const registerBuyCnftParamsBeet =
  new beet.FixableBeetArgsStruct<RegisterBuyCnftParams>(
    [
      ['amount', beet.u32],
      ['name', beet.utf8String],
      ['symbol', beet.utf8String],
      ['uri', beet.utf8String],
    ],
    'RegisterBuyCnftParams',
  )