/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import {
  VerifiedCreatorsSignature,
  verifiedCreatorsSignatureBeet,
} from './VerifiedCreatorsSignature.js'
export type VerifiedCreators = {
  signatures: VerifiedCreatorsSignature[]
}

/**
 * @category userTypes
 * @category generated
 */
export const verifiedCreatorsBeet =
  new beet.FixableBeetArgsStruct<VerifiedCreators>(
    [['signatures', beet.array(verifiedCreatorsSignatureBeet)]],
    'VerifiedCreators',
  )