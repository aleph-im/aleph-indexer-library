/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * @category Instructions
 * @category WithdrawStakeAccount
 * @category generated
 */
export type WithdrawStakeAccountInstructionArgs = {
  stakeIndex: number
  validatorIndex: number
  msolAmount: beet.bignum
  beneficiary: web3.PublicKey
}
/**
 * @category Instructions
 * @category WithdrawStakeAccount
 * @category generated
 */
export const withdrawStakeAccountStruct = new beet.BeetArgsStruct<
  WithdrawStakeAccountInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['stakeIndex', beet.u32],
    ['validatorIndex', beet.u32],
    ['msolAmount', beet.u64],
    ['beneficiary', beetSolana.publicKey],
  ],
  'WithdrawStakeAccountInstructionArgs',
)
/**
 * Accounts required by the _withdrawStakeAccount_ instruction
 *
 * @property [_writable_] state
 * @property [_writable_] msolMint
 * @property [_writable_] burnMsolFrom
 * @property [_writable_, **signer**] burnMsolAuthority
 * @property [_writable_] treasuryMsolAccount
 * @property [_writable_] validatorList
 * @property [_writable_] stakeList
 * @property [] stakeWithdrawAuthority
 * @property [] stakeDepositAuthority
 * @property [_writable_] stakeAccount
 * @property [_writable_, **signer**] splitStakeAccount
 * @property [_writable_, **signer**] splitStakeRentPayer
 * @property [] clock
 * @property [] stakeProgram
 * @category Instructions
 * @category WithdrawStakeAccount
 * @category generated
 */
export type WithdrawStakeAccountInstructionAccounts = {
  state: web3.PublicKey
  msolMint: web3.PublicKey
  burnMsolFrom: web3.PublicKey
  burnMsolAuthority: web3.PublicKey
  treasuryMsolAccount: web3.PublicKey
  validatorList: web3.PublicKey
  stakeList: web3.PublicKey
  stakeWithdrawAuthority: web3.PublicKey
  stakeDepositAuthority: web3.PublicKey
  stakeAccount: web3.PublicKey
  splitStakeAccount: web3.PublicKey
  splitStakeRentPayer: web3.PublicKey
  clock: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  stakeProgram: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const withdrawStakeAccountInstructionDiscriminator = [
  211, 85, 184, 65, 183, 177, 233, 217,
]

/**
 * Creates a _WithdrawStakeAccount_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WithdrawStakeAccount
 * @category generated
 */
export function createWithdrawStakeAccountInstruction(
  accounts: WithdrawStakeAccountInstructionAccounts,
  args: WithdrawStakeAccountInstructionArgs,
  programId = new web3.PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
) {
  const [data] = withdrawStakeAccountStruct.serialize({
    instructionDiscriminator: withdrawStakeAccountInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.state,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.msolMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.burnMsolFrom,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.burnMsolAuthority,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.treasuryMsolAccount,
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
      pubkey: accounts.stakeWithdrawAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeDepositAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeAccount,
      isWritable: true,
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
      pubkey: accounts.clock,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
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
