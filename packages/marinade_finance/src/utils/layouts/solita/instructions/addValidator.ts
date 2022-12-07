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
 * @category AddValidator
 * @category generated
 */
export type AddValidatorInstructionArgs = {
  score: number
}
/**
 * @category Instructions
 * @category AddValidator
 * @category generated
 */
export const addValidatorStruct = new beet.BeetArgsStruct<
  AddValidatorInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['score', beet.u32],
  ],
  'AddValidatorInstructionArgs',
)
/**
 * Accounts required by the _addValidator_ instruction
 *
 * @property [_writable_] state
 * @property [**signer**] managerAuthority
 * @property [_writable_] validatorList
 * @property [] validatorVote
 * @property [_writable_] duplicationFlag
 * @property [_writable_, **signer**] rentPayer
 * @property [] clock
 * @category Instructions
 * @category AddValidator
 * @category generated
 */
export type AddValidatorInstructionAccounts = {
  state: web3.PublicKey
  managerAuthority: web3.PublicKey
  validatorList: web3.PublicKey
  validatorVote: web3.PublicKey
  duplicationFlag: web3.PublicKey
  rentPayer: web3.PublicKey
  clock: web3.PublicKey
  rent?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addValidatorInstructionDiscriminator = [
  250, 113, 53, 54, 141, 117, 215, 185,
]

/**
 * Creates a _AddValidator_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AddValidator
 * @category generated
 */
export function createAddValidatorInstruction(
  accounts: AddValidatorInstructionAccounts,
  args: AddValidatorInstructionArgs,
  programId = new web3.PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
) {
  const [data] = addValidatorStruct.serialize({
    instructionDiscriminator: addValidatorInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.state,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.managerAuthority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: accounts.validatorList,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.validatorVote,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.duplicationFlag,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.rentPayer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.clock,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
