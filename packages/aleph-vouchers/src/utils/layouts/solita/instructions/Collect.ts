/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category Collect
 * @category generated
 */
export const CollectStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number
}>([['instructionDiscriminator', beet.u8]], 'CollectInstructionArgs')
/**
 * Accounts required by the _Collect_ instruction
 *
 * @property [_writable_] recipient1
 * @property [_writable_] recipient2
 * @category Instructions
 * @category Collect
 * @category generated
 */
export type CollectInstructionAccounts = {
  recipient1: web3.PublicKey
  recipient2: web3.PublicKey
}

export const collectInstructionDiscriminator = 19

/**
 * Creates a _Collect_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category Collect
 * @category generated
 */
export function createCollectInstruction(
  accounts: CollectInstructionAccounts,
  programId = new web3.PublicKey(
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  ),
) {
  const [data] = CollectStruct.serialize({
    instructionDiscriminator: collectInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.recipient1,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.recipient2,
      isWritable: true,
      isSigner: false,
    },
  ]

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}