/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  AutographSignature,
  autographSignatureBeet,
} from './AutographSignature.js'
export type Autograph = {
  signatures: AutographSignature[]
}

/**
 * @category userTypes
 * @category generated
 */
export const autographBeet = new beet.FixableBeetArgsStruct<Autograph>(
  [['signatures', beet.array(autographSignatureBeet)]],
  'Autograph',
)
