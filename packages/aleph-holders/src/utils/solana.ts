import {
  SolanaParsedInnerInstruction,
  AlephParsedParsedInstruction,
  SolanaParsedInstruction,
  SolanaRawInstruction,
  TOKEN_PROGRAM_ID,
  SolanaParsedInstructionContext,
  SolanaParsedTransaction,
  SolanaRPC,
} from '@aleph-indexer/solana'
import {
  AuthorityType,
  SLPTokenInstruction,
  SPLTokenEventType,
  SPLTokenEvent,
} from '../types/solana.js'
import { ParsedAccountData, PublicKey } from '@solana/web3.js'
import {
  SPLTokenEventDALIndex,
  SPLTokenEventStorage,
} from '../dal/solana/splTokenEvent.js'
import { BlockchainId, getBlockchainEnv } from '@aleph-indexer/framework'

const solanaRPC: Record<BlockchainId, SolanaRPC> = {}

function getSolanaRPC(blockchainId: BlockchainId): SolanaRPC {
  let rpc = solanaRPC[blockchainId]
  if (rpc) return rpc

  const privateEnv = getBlockchainEnv(blockchainId, 'RPC', true)

  const [privateUrls, privateRateLimitStr] = privateEnv.split('|')
  const url = privateUrls.split(',')[0]
  const rateLimit = privateRateLimitStr === 'true'

  rpc = new SolanaRPC({ url, rateLimit })
  solanaRPC[blockchainId] = rpc
  return rpc
}

// -----------------------------

export function getAccountsFromEvent(event: SPLTokenEvent): string[] {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      return [event.account, event.toAccount]
    }
    case SPLTokenEventType.Approve: {
      return [event.account, event.delegate]
    }
    default: {
      return event.account ? [event.account] : []
    }
  }
}

export function getOwnerAccountsFromEvent(event: SPLTokenEvent): string[] {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      return event.toOwner ? [event.owner, event.toOwner] : [event.owner]
    }
    case SPLTokenEventType.Approve: {
      return event.delegateOwner
        ? [event.owner, event.delegateOwner]
        : [event.owner]
    }
    default: {
      return event.owner ? [event.owner] : []
    }
  }
}

export function getAllIndexableAccountsFromEvent(
  event: SPLTokenEvent,
): string[] {
  return [...getAccountsFromEvent(event), ...getOwnerAccountsFromEvent(event)]
}

export function getBalanceFromEvent(
  event: SPLTokenEvent,
  account: string,
): string {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount === account) {
        return event.toBalance
      } else {
        return event.balance
      }
    }
    case SPLTokenEventType.Approve: {
      if (event.delegate === account) {
        return event.delegateBalance
      } else {
        return event.balance
      }
    }
    default: {
      return event.balance
    }
  }
}

export function getOwnerFromEvent(
  event: SPLTokenEvent,
  account: string,
): string | undefined {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount === account) {
        return event.toOwner
      } else {
        return event.owner
      }
    }
    case SPLTokenEventType.Approve: {
      if (event.delegate === account) {
        return event.delegateOwner
      } else {
        return event.owner
      }
    }
    default: {
      return event.owner
    }
  }
}

export function eventHasMissingOwner(event: SPLTokenEvent): boolean {
  if (!event.owner) return true

  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (!event.toOwner) return true
      break
    }
    case SPLTokenEventType.Approve: {
      if (!event.delegateOwner) return true
      break
    }
  }

  return false
}

// -----------------------------

export async function getMintFromInstructionContext(
  blockchain: BlockchainId,
  entity: SolanaParsedInstructionContext,
  eventDAL: SPLTokenEventStorage,
  isSiblingnCheck?: boolean,
): Promise<string | undefined> {
  const { instruction: ix } = entity

  if (!isSPLTokenParsedInstruction(ix)) return
  const info = ix.parsed.info

  // @note: Precalculated mint
  if (info._mint) return info._mint

  // @note: Instruction mint (only in some kind of instructions)
  info._mint = getMintFromInstruction(ix)
  if (info._mint) return info._mint

  // @note: Look for the mint in other instructions related with the accounts of the current instruction
  info._mint = await getMintFromInstructionAccounts(
    blockchain,
    entity,
    eventDAL,
    isSiblingnCheck,
  )

  return info._mint
}

async function getMintFromInstructionAccounts(
  blockchain: BlockchainId,
  entity: SolanaParsedInstructionContext,
  eventDAL: SPLTokenEventStorage,
  isSiblingnCheck = false,
): Promise<string | undefined> {
  const { instruction: ix, parentTransaction } = entity
  let mint: string | undefined

  if (!isSPLTokenParsedInstruction(ix)) return
  const accounts = getAccountsFromInstruction(ix)

  // @note: Look for the mint in preTokenBalances and postTokenBalances
  mint = getMintFromTransactionBalances(accounts, parentTransaction)
  if (mint) return mint

  // @note: Look for the mint in a previously saved event
  mint = await getMintFromEventsDatabase(blockchain, accounts, eventDAL)
  if (mint) return mint

  // @note: If we are in a recursive call, stop here
  if (isSiblingnCheck) return
  const siblingTokenInstructions = getSiblingTokenInstructions(
    accounts,
    ix.parsed.type,
    parentTransaction,
    true,
  )

  // @note: Look for the mint in other instructions where the current accounts are participating
  mint = await getMintFromSiblingInstructions(
    blockchain,
    siblingTokenInstructions,
    parentTransaction,
    eventDAL,
  )
  if (mint) return mint

  // @note: Look for the mint doing an RPC call
  mint = await getMintFromAccountInfoRPC(
    blockchain,
    siblingTokenInstructions,
    accounts,
  )
  if (mint) return mint
}

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
      .useIndex(SPLTokenEventDALIndex.BlockchainAccountHeightIndex)
      .getFirstValueFromTo([blockchain, account], [blockchain, account])

    if (dbEvent) return dbEvent.mint
  }
}

async function getMintFromSiblingInstructions(
  blockchain: BlockchainId,
  siblingTokenInstructions: SLPTokenInstruction[],
  transaction: SolanaParsedTransaction,
  eventDAL: SPLTokenEventStorage,
): Promise<string | undefined> {
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
  blockchain: BlockchainId,
  siblingTokenInstructions: SLPTokenInstruction[],
  accounts: string[],
): Promise<string | undefined> {
  const siblingTokenAccounts = siblingTokenInstructions.flatMap((instruction) =>
    getAccountsFromInstruction(instruction),
  )

  const allAccounts = [...new Set([...accounts, ...siblingTokenAccounts])]

  for (const account of allAccounts) {
    try {
      const res = await getSolanaRPC(blockchain)
        .getConnection()
        .getParsedAccountInfo(new PublicKey(account))

      const data = (res?.value?.data as ParsedAccountData)?.parsed?.info

      return data.mint
    } catch (e) {
      console.log('Error checking info for account ' + account)
    }
  }
}

// -----------------------------

export async function getOwnerFromInstructionContext(
  blockchain: BlockchainId,
  account: string,
  entity: SolanaParsedInstructionContext,
  eventDAL: SPLTokenEventStorage,
  isSiblingnCheck?: boolean,
): Promise<string | undefined> {
  const { instruction: ix } = entity
  let owner: string | undefined

  if (!isSPLTokenParsedInstruction(ix)) return

  // @note: Instruction owner (only in some kind of instructions)
  owner = getOwnerFromInstruction(ix, account)
  if (owner) return owner

  // @note: Look for the owner in other instructions related with the accounts of the current instruction
  owner = await getOwnerFromInstructionAccount(
    blockchain,
    account,
    entity,
    eventDAL,
    isSiblingnCheck,
  )

  return owner
}

async function getOwnerFromInstructionAccount(
  blockchain: BlockchainId,
  account: string,
  entity: SolanaParsedInstructionContext,
  eventDAL: SPLTokenEventStorage,
  isSiblingnCheck = false,
): Promise<string | undefined> {
  const { instruction: ix, parentTransaction } = entity
  let owner: string | undefined

  if (!isSPLTokenParsedInstruction(ix)) return

  // @note: Look for the owner in preTokenBalances and postTokenBalances
  owner = getOwnerFromTransactionBalances(account, parentTransaction)
  if (owner) return owner

  // @note: Look for the owner in a previously saved event
  owner = await getOwnerFromEventsDatabase(blockchain, account, eventDAL)
  if (owner) return owner

  // @note: If we are in a recursive call, stop here
  if (isSiblingnCheck) return
  const siblingTokenInstructions = getSiblingTokenInstructions(
    [account],
    ix.parsed.type,
    parentTransaction,
    false,
  )

  // @note: Look for the owner in other instructions where the current accounts are participating
  owner = await getOwnerFromSiblingInstructions(
    blockchain,
    account,
    siblingTokenInstructions,
    parentTransaction,
    eventDAL,
  )
  if (owner) return owner

  // @note: Look for the owner doing an RPC call
  owner = await getOwnerFromAccountInfoRPC(blockchain, account)
  if (owner) return owner
}

function getOwnerFromTransactionBalances(
  account: string,
  transaction: SolanaParsedTransaction,
): string | undefined {
  const balanceIndex = transaction.parsed.message.accountKeys.findIndex(
    ({ pubkey }) => pubkey === account,
  )

  const preBalanceInfo = transaction?.meta?.preTokenBalances?.find(
    ({ accountIndex }) => accountIndex === balanceIndex,
  )

  if (preBalanceInfo?.owner) return preBalanceInfo.owner

  const postBalanceInfo = transaction?.meta?.postTokenBalances?.find(
    ({ accountIndex }) => accountIndex === balanceIndex,
  )

  if (postBalanceInfo?.owner) return postBalanceInfo.owner
}

async function getOwnerFromEventsDatabase(
  blockchain: BlockchainId,
  account: string,
  eventDAL: SPLTokenEventStorage,
): Promise<string | undefined> {
  const dbEvents = await eventDAL
    .useIndex(SPLTokenEventDALIndex.BlockchainAccountHeightIndex)
    .getAllValuesFromTo([blockchain, account], [blockchain, account])

  for await (const event of dbEvents) {
    const owner = getOwnerFromEvent(event, account)
    if (owner) return owner
  }
}

async function getOwnerFromSiblingInstructions(
  blockchain: BlockchainId,
  account: string,
  siblingTokenInstructions: SLPTokenInstruction[],
  transaction: SolanaParsedTransaction,
  eventDAL: SPLTokenEventStorage,
): Promise<string | undefined> {
  for (const instruction of siblingTokenInstructions) {
    const owner = await getOwnerFromInstructionContext(
      blockchain,
      account,
      { instruction, parentTransaction: transaction },
      eventDAL,
      true,
    )

    if (owner) return owner
  }
}

async function getOwnerFromAccountInfoRPC(
  blockchain: BlockchainId,
  account: string,
): Promise<string | undefined> {
  try {
    const res = await getSolanaRPC(blockchain)
      .getConnection()
      .getParsedAccountInfo(new PublicKey(account))

    const data = (res?.value?.data as ParsedAccountData)?.parsed?.info

    return data.owner
  } catch (e) {
    console.log('Error checking info for account ' + account)
  }
}

// -----------------------------

export async function getOwnerFromEventAccount(
  blockchain: BlockchainId,
  account: string,
  eventDAL: SPLTokenEventStorage,
): Promise<string | undefined> {
  let owner: string | undefined

  // @note: Look for the owner in a previously saved event
  owner = await getOwnerFromEventsDatabase(blockchain, account, eventDAL)
  if (owner) return owner

  // @note: Look for the owner doing an RPC call
  owner = await getOwnerFromAccountInfoRPC(blockchain, account)
  if (owner) return owner
}
// -----------------------------

/**
 * Returns a list of instructions of kind spl-token from the transaction in which some of the passed accounts are participating and are not the only one
 */
function getSiblingTokenInstructions(
  accounts: string[],
  type: SPLTokenEventType,
  transaction: SolanaParsedTransaction,
  searchingMint: boolean,
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

        const isOfDifferentType = instruction.parsed.type !== type

        const hasAtLeastOneDifferentAccount =
          searchingMint &&
          !isOfDifferentType &&
          siblingInstructionAccounts.some(
            (account) => !accountsSet.has(account),
          )

        return (
          hasSomeOfTheAccounts &&
          (isOfDifferentType || hasAtLeastOneDifferentAccount)
        )
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
    case SPLTokenEventType.ApproveChecked: {
      return [instruction.parsed.info.source, instruction.parsed.info.delegate]
    }
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

function getMintFromInstruction(
  instruction: SLPTokenInstruction,
): string | undefined {
  switch (instruction.parsed.type) {
    case SPLTokenEventType.MintTo:
    case SPLTokenEventType.MintToChecked:
    case SPLTokenEventType.Burn:
    case SPLTokenEventType.BurnChecked:
    case SPLTokenEventType.InitializeAccount:
    case SPLTokenEventType.InitializeAccount2:
    case SPLTokenEventType.InitializeAccount3:
    case SPLTokenEventType.TransferChecked:
    case SPLTokenEventType.ApproveChecked:
    case SPLTokenEventType.InitializeMint:
    case SPLTokenEventType.InitializeMint2:
    case SPLTokenEventType.GetAccountDataSize: {
      return instruction.parsed.info.mint
    }
    default: {
      // @todo: Try to read "mint" on unknown events
      return (instruction.parsed.info as any)?.mint
    }
  }
}

function getOwnerFromInstruction(
  instruction: SLPTokenInstruction,
  account: string,
): string | undefined {
  switch (instruction.parsed.type) {
    case SPLTokenEventType.InitializeAccount:
    case SPLTokenEventType.InitializeAccount2:
    case SPLTokenEventType.InitializeAccount3: {
      if (account !== instruction.parsed.info.account) return
      return instruction.parsed.info.owner
    }
    case SPLTokenEventType.Burn:
    case SPLTokenEventType.BurnChecked: {
      if (account !== instruction.parsed.info.account) return
      return instruction.parsed.info.authority
    }
    case SPLTokenEventType.Approve:
    case SPLTokenEventType.ApproveChecked: {
      if (account !== instruction.parsed.info.source) return
      return instruction.parsed.info.owner
    }
    case SPLTokenEventType.Revoke: {
      if (account !== instruction.parsed.info.source) return
      return instruction.parsed.info.owner
    }
    case SPLTokenEventType.CloseAccount: {
      if (account !== instruction.parsed.info.account) return
      return 'owner' in instruction.parsed.info
        ? instruction.parsed.info.owner
        : instruction.parsed.info.multisigOwner
    }
    case SPLTokenEventType.Transfer:
    case SPLTokenEventType.TransferChecked: {
      if (account !== instruction.parsed.info.source) return
      return 'authority' in instruction.parsed.info
        ? instruction.parsed.info.authority
        : instruction.parsed.info.multisigAuthority
    }
    case SPLTokenEventType.SetAuthority: {
      if (account !== instruction.parsed.info.account) return
      return instruction.parsed.info.authorityType ===
        AuthorityType.AccountOwner
        ? instruction.parsed.info.newAuthority
        : instruction.parsed.info.authority
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
