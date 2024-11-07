/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import {
  WriteExternalPluginAdapterDataV1Args,
  writeExternalPluginAdapterDataV1ArgsBeet,
} from '../types/WriteExternalPluginAdapterDataV1Args.js'

/**
 * @category Instructions
 * @category WriteExternalPluginAdapterDataV1
 * @category generated
 */
export type WriteExternalPluginAdapterDataV1InstructionArgs = {
  writeExternalPluginAdapterDataV1Args: WriteExternalPluginAdapterDataV1Args
}
/**
 * @category Instructions
 * @category WriteExternalPluginAdapterDataV1
 * @category generated
 */
export const WriteExternalPluginAdapterDataV1Struct =
  new beet.FixableBeetArgsStruct<
    WriteExternalPluginAdapterDataV1InstructionArgs & {
      instructionDiscriminator: number
    }
  >(
    [
      ['instructionDiscriminator', beet.u8],
      [
        'writeExternalPluginAdapterDataV1Args',
        writeExternalPluginAdapterDataV1ArgsBeet,
      ],
    ],
    'WriteExternalPluginAdapterDataV1InstructionArgs',
  )
/**
 * Accounts required by the _WriteExternalPluginAdapterDataV1_ instruction
 *
 * @property [_writable_] asset
 * @property [_writable_] collection (optional)
 * @property [_writable_, **signer**] payer
 * @property [**signer**] authority (optional)
 * @property [] buffer (optional)
 * @property [] logWrapper (optional)
 * @category Instructions
 * @category WriteExternalPluginAdapterDataV1
 * @category generated
 */
export type WriteExternalPluginAdapterDataV1InstructionAccounts = {
  asset: web3.PublicKey
  collection?: web3.PublicKey
  payer: web3.PublicKey
  authority?: web3.PublicKey
  buffer?: web3.PublicKey
  systemProgram?: web3.PublicKey
  logWrapper?: web3.PublicKey
}

export const writeExternalPluginAdapterDataV1InstructionDiscriminator = 28

/**
 * Creates a _WriteExternalPluginAdapterDataV1_ instruction.
 *
 * Optional accounts that are not provided default to the program ID since
 * this was indicated in the IDL from which this instruction was generated.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WriteExternalPluginAdapterDataV1
 * @category generated
 */
export function createWriteExternalPluginAdapterDataV1Instruction(
  accounts: WriteExternalPluginAdapterDataV1InstructionAccounts,
  args: WriteExternalPluginAdapterDataV1InstructionArgs,
  programId = new web3.PublicKey(
    'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  ),
) {
  const [data] = WriteExternalPluginAdapterDataV1Struct.serialize({
    instructionDiscriminator:
      writeExternalPluginAdapterDataV1InstructionDiscriminator,
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
      isWritable: accounts.collection != null,
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
      pubkey: accounts.buffer ?? programId,
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