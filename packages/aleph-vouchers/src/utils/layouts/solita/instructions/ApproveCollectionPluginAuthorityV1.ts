/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  ApproveCollectionPluginAuthorityV1Args,
  approveCollectionPluginAuthorityV1ArgsBeet,
} from '../types/ApproveCollectionPluginAuthorityV1Args.js'

/**
 * @category Instructions
 * @category ApproveCollectionPluginAuthorityV1
 * @category generated
 */
export type ApproveCollectionPluginAuthorityV1InstructionArgs = {
  approveCollectionPluginAuthorityV1Args: ApproveCollectionPluginAuthorityV1Args
}
/**
 * @category Instructions
 * @category ApproveCollectionPluginAuthorityV1
 * @category generated
 */
export const ApproveCollectionPluginAuthorityV1Struct =
  new beet.FixableBeetArgsStruct<
    ApproveCollectionPluginAuthorityV1InstructionArgs & {
      instructionDiscriminator: number
    }
  >(
    [
      ['instructionDiscriminator', beet.u8],
      [
        'approveCollectionPluginAuthorityV1Args',
        approveCollectionPluginAuthorityV1ArgsBeet,
      ],
    ],
    'ApproveCollectionPluginAuthorityV1InstructionArgs',
  )
/**
 * Accounts required by the _ApproveCollectionPluginAuthorityV1_ instruction
 *
 * @property [_writable_] collection
 * @property [_writable_, **signer**] payer
 * @property [**signer**] authority (optional)
 * @property [] logWrapper (optional)
 * @category Instructions
 * @category ApproveCollectionPluginAuthorityV1
 * @category generated
 */
export type ApproveCollectionPluginAuthorityV1InstructionAccounts = {
  collection: web3.PublicKey
  payer: web3.PublicKey
  authority?: web3.PublicKey
  systemProgram?: web3.PublicKey
  logWrapper?: web3.PublicKey
}

export const approveCollectionPluginAuthorityV1InstructionDiscriminator = 9

/**
 * Creates a _ApproveCollectionPluginAuthorityV1_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ApproveCollectionPluginAuthorityV1
 * @category generated
 */
export function createApproveCollectionPluginAuthorityV1Instruction(
  accounts: ApproveCollectionPluginAuthorityV1InstructionAccounts,
  args: ApproveCollectionPluginAuthorityV1InstructionArgs,
  programId = new web3.PublicKey(
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  ),
) {
  const [data] = ApproveCollectionPluginAuthorityV1Struct.serialize({
    instructionDiscriminator:
      approveCollectionPluginAuthorityV1InstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.collection,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.authority ?? programId,
      isWritable: false,
      isSigner: accounts.authority != null,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.logWrapper ?? programId,
      isWritable: false,
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
