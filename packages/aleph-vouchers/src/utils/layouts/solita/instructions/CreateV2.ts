/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { CreateV2Args, createV2ArgsBeet } from '../types/CreateV2Args.js'

/**
 * @category Instructions
 * @category CreateV2
 * @category generated
 */
export type CreateV2InstructionArgs = {
  createV2Args: CreateV2Args
}
/**
 * @category Instructions
 * @category CreateV2
 * @category generated
 */
export const CreateV2Struct = new beet.FixableBeetArgsStruct<
  CreateV2InstructionArgs & {
    instructionDiscriminator: number
  }
>(
  [
    ['instructionDiscriminator', beet.u8],
    ['createV2Args', createV2ArgsBeet],
  ],
  'CreateV2InstructionArgs',
)
/**
 * Accounts required by the _CreateV2_ instruction
 *
 * @property [_writable_, **signer**] asset
 * @property [_writable_] collection (optional)
 * @property [**signer**] authority (optional)
 * @property [_writable_, **signer**] payer
 * @property [] owner (optional)
 * @property [] updateAuthority (optional)
 * @property [] logWrapper (optional)
 * @category Instructions
 * @category CreateV2
 * @category generated
 */
export type CreateV2InstructionAccounts = {
  asset: web3.PublicKey
  collection?: web3.PublicKey
  authority?: web3.PublicKey
  payer: web3.PublicKey
  owner?: web3.PublicKey
  updateAuthority?: web3.PublicKey
  systemProgram?: web3.PublicKey
  logWrapper?: web3.PublicKey
}

export const createV2InstructionDiscriminator = 20

/**
 * Creates a _CreateV2_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateV2
 * @category generated
 */
export function createCreateV2Instruction(
  accounts: CreateV2InstructionAccounts,
  args: CreateV2InstructionArgs,
  programId = new web3.PublicKey(
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  ),
) {
  const [data] = CreateV2Struct.serialize({
    instructionDiscriminator: createV2InstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.asset,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.collection ?? programId,
      isWritable: accounts.collection != null,
      isSigner: false,
    },
    {
      pubkey: accounts.authority ?? programId,
      isWritable: false,
      isSigner: accounts.authority != null,
    },
    {
      pubkey: accounts.payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.owner ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.updateAuthority ?? programId,
      isWritable: false,
      isSigner: false,
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