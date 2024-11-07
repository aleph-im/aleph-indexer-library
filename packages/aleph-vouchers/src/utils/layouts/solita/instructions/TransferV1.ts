/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { TransferV1Args, transferV1ArgsBeet } from '../types/TransferV1Args.js'

/**
 * @category Instructions
 * @category TransferV1
 * @category generated
 */
export type TransferV1InstructionArgs = {
  transferV1Args: TransferV1Args
}
/**
 * @category Instructions
 * @category TransferV1
 * @category generated
 */
export const TransferV1Struct = new beet.FixableBeetArgsStruct<
  TransferV1InstructionArgs & {
    instructionDiscriminator: number
  }
>(
  [
    ['instructionDiscriminator', beet.u8],
    ['transferV1Args', transferV1ArgsBeet],
  ],
  'TransferV1InstructionArgs',
)
/**
 * Accounts required by the _TransferV1_ instruction
 *
 * @property [_writable_] asset
 * @property [] collection (optional)
 * @property [_writable_, **signer**] payer
 * @property [**signer**] authority (optional)
 * @property [] newOwner
 * @property [] logWrapper (optional)
 * @category Instructions
 * @category TransferV1
 * @category generated
 */
export type TransferV1InstructionAccounts = {
  asset: web3.PublicKey
  collection?: web3.PublicKey
  payer: web3.PublicKey
  authority?: web3.PublicKey
  newOwner: web3.PublicKey
  systemProgram?: web3.PublicKey
  logWrapper?: web3.PublicKey
}

export const transferV1InstructionDiscriminator = 14

/**
 * Creates a _TransferV1_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category TransferV1
 * @category generated
 */
export function createTransferV1Instruction(
  accounts: TransferV1InstructionAccounts,
  args: TransferV1InstructionArgs,
  programId = new web3.PublicKey(
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  ),
) {
  const [data] = TransferV1Struct.serialize({
    instructionDiscriminator: transferV1InstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.asset,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.collection ?? programId,
      isWritable: false,
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
      pubkey: accounts.newOwner,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? programId,
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