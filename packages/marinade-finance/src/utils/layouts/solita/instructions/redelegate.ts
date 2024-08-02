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
 * @category Redelegate
 * @category generated
 */
export type RedelegateInstructionArgs = {
  stakeIndex: number
  sourceValidatorIndex: number
  destValidatorIndex: number
}
/**
 * @category Instructions
 * @category Redelegate
 * @category generated
 */
export const redelegateStruct = new beet.BeetArgsStruct<
  RedelegateInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['stakeIndex', beet.u32],
    ['sourceValidatorIndex', beet.u32],
    ['destValidatorIndex', beet.u32],
  ],
  'RedelegateInstructionArgs',
)
/**
 * Accounts required by the _redelegate_ instruction
 *
 * @property [_writable_] state
 * @property [_writable_] validatorList
 * @property [_writable_] stakeList
 * @property [_writable_] stakeAccount
 * @property [] stakeDepositAuthority
 * @property [] reservePda
 * @property [_writable_, **signer**] splitStakeAccount
 * @property [_writable_, **signer**] splitStakeRentPayer
 * @property [] destValidatorAccount
 * @property [_writable_, **signer**] redelegateStakeAccount
 * @property [] clock
 * @property [] stakeHistory
 * @property [] stakeConfig
 * @property [] stakeProgram
 * @category Instructions
 * @category Redelegate
 * @category generated
 */
export type RedelegateInstructionAccounts = {
  state: web3.PublicKey
  validatorList: web3.PublicKey
  stakeList: web3.PublicKey
  stakeAccount: web3.PublicKey
  stakeDepositAuthority: web3.PublicKey
  reservePda: web3.PublicKey
  splitStakeAccount: web3.PublicKey
  splitStakeRentPayer: web3.PublicKey
  destValidatorAccount: web3.PublicKey
  redelegateStakeAccount: web3.PublicKey
  clock: web3.PublicKey
  stakeHistory: web3.PublicKey
  stakeConfig: web3.PublicKey
  systemProgram?: web3.PublicKey
  stakeProgram: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const redelegateInstructionDiscriminator = [
  212, 82, 51, 160, 228, 80, 116, 35,
]

/**
 * Creates a _Redelegate_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Redelegate
 * @category generated
 */
export function createRedelegateInstruction(
  accounts: RedelegateInstructionAccounts,
  args: RedelegateInstructionArgs,
  programId = new web3.PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
) {
  const [data] = redelegateStruct.serialize({
    instructionDiscriminator: redelegateInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.state,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.validatorList,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeList,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeDepositAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.reservePda,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.splitStakeAccount,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.splitStakeRentPayer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.destValidatorAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.redelegateStakeAccount,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.clock,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeHistory,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeConfig,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeProgram,
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