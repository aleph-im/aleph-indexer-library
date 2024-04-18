import {
  AlephParsedInstruction,
  AlephParsedInnerInstruction,
  TOKEN_PROGRAM_ID,
  RawParsedInstruction,
  SolanaParsedInstructionContext,
  solanaPrivateRPC,
} from '@aleph-indexer/solana'
import {
  SPLTokenRawEvent,
  SPLTokenEventType,
  TokenAccountInfo,
} from '../types.js'
import { blockchainTokenContract } from './constants.js'
import { BlockchainChain } from '@aleph-indexer/framework'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { struct, publicKey, u64 } from '@coral-xyz/borsh'

export function isInitInstruction(parsed: any, alephMint: string): boolean {
  const isInitInstruction = [
    SPLTokenEventType.InitializeAccount,
    SPLTokenEventType.InitializeAccount2,
    SPLTokenEventType.InitializeAccount3,
  ].includes(parsed.type)

  return isInitInstruction && parsed.info.mint === alephMint 
}

export function isMovementWithMint(parsed: any, alephMint: string): boolean {
  return [
    SPLTokenEventType.TransferChecked,
    SPLTokenEventType.MintTo,
    SPLTokenEventType.MintToChecked,
    SPLTokenEventType.Burn,
    SPLTokenEventType.BurnChecked,
  ].includes(parsed.type) && parsed.info.mint === alephMint
}

export function validateExpectedAta(parsed: any, alephMint: string): boolean {
  const owner = (parsed.info.authority || parsed.info.multisigAuthority || parsed.info.owner || parsed.info.multisigOwner)
  const ownerPublicKey = new PublicKey(owner)
  const alephPubkey = new PublicKey(alephMint)
  const expectedAta = getAssociatedTokenAddressSync(alephPubkey, ownerPublicKey, true)

  return expectedAta.toString() === parsed.info.account
}

export function isSPLTokenInstruction(
  ix:
    | RawParsedInstruction
    | AlephParsedInstruction
    | AlephParsedInnerInstruction,
): ix is SPLTokenRawEvent {
  return ix.programId === TOKEN_PROGRAM_ID
}

export interface DataSlice {
  owner: PublicKey
  amount: bigint
}

const DataSliceLayout = struct<DataSlice>([
  publicKey('owner'), 
  u64('amount'),
])

export async function solanaSnapshot(): Promise<TokenAccountInfo[]> {
  const connection = solanaPrivateRPC.getConnection()
  const response = await connection.getProgramAccounts(
    new PublicKey(TOKEN_PROGRAM_ID), {
      dataSlice: {
        offset: 32,
        length: 64,
      },
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 0,
            bytes: blockchainTokenContract[BlockchainChain.Solana]
          }
        }
      ]
    }
  )

  return response.map((accountResponse) => {
    const data = DataSliceLayout.decode(accountResponse.account.data)
    const balance = data.amount.toString(16)

    return {
      address: accountResponse.pubkey.toString(),
      owner: data.owner.toString(),
      balance,
    }
  })
}

export function getEventBase(entity: SolanaParsedInstructionContext) {
  const { instruction, parentInstruction, parentTransaction } = entity

  const id = `${parentTransaction.signature}${
    parentInstruction
      ? `:${parentInstruction.index.toString().padStart(2, '0')}`
      : ''
  }:${instruction.index.toString().padStart(2, '0')}`

  const timestamp = parentTransaction.blockTime
    ? parentTransaction.blockTime * 1000
    : parentTransaction.slot

  return {
    blockchain: BlockchainChain.Solana,
    id,
    timestamp,
    height: parentTransaction.slot,
    transaction: parentTransaction.signature,
  }
}