/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'
import * as beet from '@metaplex-foundation/beet'
export type List = {
  account: web3.PublicKey
  itemSize: number
  count: number
  reserved1: web3.PublicKey
  reserved2: number
}

/**
 * @category userTypes
 * @category generated
 */
export const listBeet = new beet.BeetArgsStruct<List>(
  [
    ['account', beetSolana.publicKey],
    ['itemSize', beet.u32],
    ['count', beet.u32],
    ['reserved1', beetSolana.publicKey],
    ['reserved2', beet.u32],
  ],
  'List',
)
