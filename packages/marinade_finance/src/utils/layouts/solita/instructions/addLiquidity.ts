/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export type AddLiquidityInstructionArgs = {
  lamports: beet.bignum
}
/**
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export const addLiquidityStruct = new beet.BeetArgsStruct<
  AddLiquidityInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['lamports', beet.u64],
  ],
  'AddLiquidityInstructionArgs',
)
/**
 * Accounts required by the _addLiquidity_ instruction
 *
 * @property [_writable_] state
 * @property [_writable_] lpMint
 * @property [] lpMintAuthority
 * @property [] liqPoolMsolLeg
 * @property [_writable_] liqPoolSolLegPda
 * @property [_writable_, **signer**] transferFrom
 * @property [_writable_] mintTo
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export type AddLiquidityInstructionAccounts = {
  state: web3.PublicKey
  lpMint: web3.PublicKey
  lpMintAuthority: web3.PublicKey
  liqPoolMsolLeg: web3.PublicKey
  liqPoolSolLegPda: web3.PublicKey
  transferFrom: web3.PublicKey
  mintTo: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addLiquidityInstructionDiscriminator = [
  181, 157, 89, 67, 143, 182, 52, 72,
]

/**
 * Creates a _AddLiquidity_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AddLiquidity
 * @category generated
 */
export function createAddLiquidityInstruction(
  accounts: AddLiquidityInstructionAccounts,
  args: AddLiquidityInstructionArgs,
  programId = new web3.PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
) {
  const [data] = addLiquidityStruct.serialize({
    instructionDiscriminator: addLiquidityInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.state,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lpMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.lpMintAuthority,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.liqPoolMsolLeg,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.liqPoolSolLegPda,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.transferFrom,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.mintTo,
      isWritable: true,
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
