import {
  SolanaParsedInnerInstruction,
  AlephParsedParsedInstruction,
  SolanaParsedInstruction,
  SolanaRawInstruction,
  TOKEN_PROGRAM_ID,
  SolanaParsedInstructionContext,
  solanaPrivateRPCRoundRobin,
  SolanaParsedTransaction,
} from '@aleph-indexer/solana'
import {
  SLPTokenInstruction,
  SPLTokenEventType,
  SPLTokenIncompleteEvent,
} from '../types/solana.js'
import { ParsedAccountData, PublicKey } from '@solana/web3.js'
import {
  SPLTokenEventDALIndex,
  SPLTokenEventStorage,
} from '../dal/solana/splTokenEvent.js'
import { BlockchainId } from '@aleph-indexer/framework'

export function getAccountsFromEvent(event: SPLTokenIncompleteEvent): string[] {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount) {
        return [event.account, event.toAccount]
      } else {
        return [event.account]
      }
    }
    default: {
      return event.account ? [event.account] : []
    }
  }
}

export function getBalanceFromEvent(
  event: SPLTokenIncompleteEvent,
  account: string,
): string | undefined {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount === account) {
        return event.toBalance
      } else {
        return event.balance
      }
    }
    default: {
      return event.balance
    }
  }
}

export async function getMintFromInstructionContext(
  blockchain: BlockchainId,
  entity: SolanaParsedInstructionContext,
  eventDAL: SPLTokenEventStorage,
  isSiblingnCheck?: boolean,
): Promise<string | undefined> {
  const { instruction } = entity
  let mint: string | undefined

  if (!isSPLTokenParsedInstruction(instruction)) return

  // @note: Precalculated mint
  mint = instruction.parsed.info._mint
  if (mint) {
    console.log('mint from _mint', mint)
    return mint
  }

  // @note: Instruction mint (only in some kind of instructions)
  mint = instruction.parsed.info.mint
  if (mint) {
    console.log('mint from mint', mint)
    return mint
  }

  const accounts = getAccountsFromInstruction(instruction)

  return getMintFromInstructionAccounts(
    blockchain,
    accounts,
    entity,
    eventDAL,
    isSiblingnCheck,
  )
}

export async function getMintFromInstructionAccounts(
  blockchain: BlockchainId,
  accounts: string[],
  entity: SolanaParsedInstructionContext,
  eventDAL: SPLTokenEventStorage,
  isSiblingnCheck = false,
): Promise<string | undefined> {
  const { parentTransaction } = entity
  let mint: string | undefined

  // @note: Look for the mint in preTokenBalances and postTokenBalances
  mint = getMintFromTransactionBalances(accounts, parentTransaction)
  if (mint) {
    console.log('mint from balance', mint)
    return mint
  }

  // @note: Look for the mint in a previously saved event
  mint = await getMintFromEventsDatabase(blockchain, accounts, eventDAL)
  if (mint) {
    console.log('mint from database', mint)
    return mint
  }

  if (isSiblingnCheck) return

  // @note: Look for the mint in other instructions where the current accounts are participating
  mint = await getMintFromSiblingInstructions(
    blockchain,
    accounts,
    parentTransaction,
    eventDAL,
  )
  if (mint) {
    console.log('mint from sibling', mint)
    return mint
  }

  // @note: Look for the mint doing an RPC call
  mint = await getMintFromAccountInfoRPC(accounts, parentTransaction)
  if (mint) {
    console.log('mint from accountInfo', mint)
    return mint
  }
}

// -----------------------------

function getMintFromTransactionBalances(
  accounts: string[],
  transaction: SolanaParsedTransaction,
): string | undefined {
  for (const account of accounts) {
    const balanceIndex = transaction.parsed.message.accountKeys.findIndex(
      ({ pubkey }) => pubkey === account,
    )

    const preBalanceInfo = transaction?.meta?.preTokenBalances?.find(
      ({ accountIndex }) => accountIndex === balanceIndex,
    )

    if (preBalanceInfo?.mint) return preBalanceInfo.mint

    const postBalanceInfo = transaction?.meta?.postTokenBalances?.find(
      ({ accountIndex }) => accountIndex === balanceIndex,
    )

    if (postBalanceInfo?.mint) return postBalanceInfo.mint
  }
}

async function getMintFromEventsDatabase(
  blockchain: BlockchainId,
  accounts: string[],
  eventDAL: SPLTokenEventStorage,
): Promise<string | undefined> {
  for (const account of accounts) {
    const dbEvent = await eventDAL
      .useIndex(SPLTokenEventDALIndex.BlockchainAccountHeight)
      .getFirstValueFromTo([blockchain, account], [blockchain, account], {
        atomic: true,
      })

    if (dbEvent) return dbEvent.mint
  }
}

async function getMintFromSiblingInstructions(
  blockchain: BlockchainId,
  accounts: string[],
  transaction: SolanaParsedTransaction,
  eventDAL: SPLTokenEventStorage,
): Promise<string | undefined> {
  const siblingTokenInstructions = getSiblingTokenInstructions(
    accounts,
    transaction,
  )

  for (const instruction of siblingTokenInstructions) {
    const mint = await getMintFromInstructionContext(
      blockchain,
      { instruction, parentTransaction: transaction },
      eventDAL,
      true,
    )

    if (mint) return mint
  }
}

async function getMintFromAccountInfoRPC(
  accounts: string[],
  transaction: SolanaParsedTransaction,
): Promise<string | undefined> {
  const siblingTokenInstructions = getSiblingTokenInstructions(
    accounts,
    transaction,
  )

  const siblingTokenAccounts = siblingTokenInstructions.flatMap((instruction) =>
    getAccountsFromInstruction(instruction),
  )

  const allAccounts = [...new Set([...accounts, ...siblingTokenAccounts])]

  for (const account of allAccounts) {
    try {
      const connection = solanaPrivateRPCRoundRobin.getClient()
      const res = await connection
        .getConnection()
        .getParsedAccountInfo(new PublicKey(account))

      const data = (res?.value?.data as ParsedAccountData)?.parsed?.info

      return data.mint
    } catch (e) {
      console.log('Error checking info for account ' + account)
    }
  }
}

/**
 * Returns a list of instructions of kind spl-token from the transaction in which some of the passed accounts are participating and are not the only one
 * @param accounts
 * @param transaction
 * @returns
 */
function getSiblingTokenInstructions(
  accounts: string[],
  transaction: SolanaParsedTransaction,
): (SolanaParsedInstructionContext['instruction'] & SLPTokenInstruction)[] {
  const accountsSet = new Set(accounts)

  return transaction.parsed.message.instructions
    .flatMap((instruction) => [
      instruction,
      ...(instruction.innerInstructions || []),
    ])
    .filter(
      (
        instruction,
      ): instruction is SolanaParsedInstructionContext['instruction'] &
        SLPTokenInstruction => {
        if (!isSPLTokenParsedInstruction(instruction)) return false

        const siblingInstructionAccounts =
          getAccountsFromInstruction(instruction)

        const hasSomeOfTheAccounts = siblingInstructionAccounts.some(
          (account) => accountsSet.has(account),
        )

        const hasAtLeastOneDifferentAccount = siblingInstructionAccounts.some(
          (account) => !accountsSet.has(account),
        )

        return hasSomeOfTheAccounts && hasAtLeastOneDifferentAccount
      },
    )
}

function getAccountsFromInstruction(
  instruction: SLPTokenInstruction,
): string[] {
  switch (instruction.parsed.type) {
    case SPLTokenEventType.MintTo:
    case SPLTokenEventType.MintToChecked:
    case SPLTokenEventType.Burn:
    case SPLTokenEventType.BurnChecked:
    case SPLTokenEventType.InitializeAccount:
    case SPLTokenEventType.InitializeAccount2:
    case SPLTokenEventType.InitializeAccount3:
    case SPLTokenEventType.SetAuthority:
    case SPLTokenEventType.SyncNative:
    case SPLTokenEventType.CloseAccount:
    case SPLTokenEventType.InitializeImmutableOwner: {
      return [instruction.parsed.info.account]
    }
    case SPLTokenEventType.Transfer:
    case SPLTokenEventType.TransferChecked: {
      return [
        instruction.parsed.info.source,
        instruction.parsed.info.destination,
      ]
    }
    case SPLTokenEventType.Approve:
    case SPLTokenEventType.ApproveChecked:
    case SPLTokenEventType.Revoke: {
      return [instruction.parsed.info.source]
    }
    case SPLTokenEventType.InitializeMint:
    case SPLTokenEventType.InitializeMint2:
    case SPLTokenEventType.GetAccountDataSize: {
      return []
    }
    default: {
      console.log('missing ix type 👍', instruction)
      return []
    }
  }
}

// ----------------------

function isSPLTokenInstruction(
  instruction:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): instruction is SLPTokenInstruction {
  return instruction.programId === TOKEN_PROGRAM_ID
}

function isParsedIx(
  instruction:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): instruction is AlephParsedParsedInstruction {
  return 'parsed' in instruction
}

function isSPLTokenParsedInstruction(
  instruction:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): instruction is SLPTokenInstruction {
  return isParsedIx(instruction) && isSPLTokenInstruction(instruction)
}

// -----------------------------
