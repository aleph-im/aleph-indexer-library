/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { InitializeData, initializeDataBeet } from '../types/InitializeData.js'

/**
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export type InitializeInstructionArgs = {
  data: InitializeData
}
/**
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export const initializeStruct = new beet.BeetArgsStruct<
  InitializeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['data', initializeDataBeet],
  ],
  'InitializeInstructionArgs',
)
/**
 * Accounts required by the _initialize_ instruction
 *
 * @property [_writable_] state
 * @property [] reservePda
 * @property [_writable_] stakeList
 * @property [_writable_] validatorList
 * @property [] msolMint
 * @property [] operationalSolAccount
 * @property [] liqPoolItemLpMint
 * @property [] liqPoolItemSolLegPda
 * @property [] liqPoolItemMsolLeg
 * @property [] treasuryMsolAccount
 * @property [] clock
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export type InitializeInstructionAccounts = {
  state: web3.PublicKey
  reservePda: web3.PublicKey
  stakeList: web3.PublicKey
  validatorList: web3.PublicKey
  msolMint: web3.PublicKey
  operationalSolAccount: web3.PublicKey
  liqPoolItemLpMint: web3.PublicKey
  liqPoolItemSolLegPda: web3.PublicKey
  liqPoolItemMsolLeg: web3.PublicKey
  treasuryMsolAccount: web3.PublicKey
  clock: web3.PublicKey
  rent?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeInstructionDiscriminator = [
  175, 175, 109, 31, 13, 152, 155, 237,
]

/**
 * Creates a _Initialize_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export function createInitializeInstruction(
  accounts: InitializeInstructionAccounts,
  args: InitializeInstructionArgs,
  programId = new web3.PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
) {
  const [data] = initializeStruct.serialize({
    instructionDiscriminator: initializeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.state,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.reservePda,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.stakeList,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.validatorList,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.msolMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.operationalSolAccount,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.liqPoolItemLpMint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.liqPoolItemSolLegPda,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.liqPoolItemMsolLeg,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.treasuryMsolAccount,
      isWritable: false,
      isSigner: false,
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
