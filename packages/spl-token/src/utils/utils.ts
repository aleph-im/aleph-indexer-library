import {
  SolanaParsedInnerInstruction,
  AlephParsedParsedInstruction,
  SolanaParsedInstruction,
  SolanaRawInstruction,
} from '@aleph-indexer/solana'
import { TOKEN_PROGRAM_ID } from '../constants.js'
import {
  SLPTokenRawEvent,
  SPLTokenEvent,
  SPLTokenEventType,
  SPLTokenIncompleteEvent,
} from '../types.js'

export function isSPLTokenInstruction(
  ix:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): ix is SLPTokenRawEvent {
  return ix.programId === TOKEN_PROGRAM_ID
}

export function isParsedIx(
  ix:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): ix is AlephParsedParsedInstruction {
  return 'parsed' in ix
}

export function isSPLTokenParsedInstruction(
  ix:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
): ix is SLPTokenRawEvent {
  if (!isParsedIx(ix) || !isSPLTokenInstruction(ix)) return false
  return true
}

export function isSPLTokenMintInstruction(
  ix:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
  mint: string,
): ix is SLPTokenRawEvent {
  if (!isSPLTokenParsedInstruction(ix)) return false
  return getIxMint(ix) === mint
}

export function isSPLTokenAccountInstruction(
  ix:
    | SolanaRawInstruction
    | SolanaParsedInstruction
    | SolanaParsedInnerInstruction,
  account: string,
): ix is SLPTokenRawEvent {
  if (!isSPLTokenParsedInstruction(ix)) return false
  return getIxAccounts(ix).includes(account)
}

export function getIxMint(ix: SLPTokenRawEvent): string | undefined {
  switch (ix.parsed.type) {
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
    case SPLTokenEventType.InitializeMint2: {
      return ix.parsed.info.mint
    }
  }
}

export function getIxAccounts(ix: SLPTokenRawEvent): string[] {
  switch (ix.parsed.type) {
    case SPLTokenEventType.MintTo:
    case SPLTokenEventType.MintToChecked:
    case SPLTokenEventType.Burn:
    case SPLTokenEventType.BurnChecked:
    case SPLTokenEventType.InitializeAccount:
    case SPLTokenEventType.InitializeAccount2:
    case SPLTokenEventType.InitializeAccount3:
    case SPLTokenEventType.SetAuthority:
    case SPLTokenEventType.SyncNative:
    case SPLTokenEventType.CloseAccount: {
      return [ix.parsed.info.account]
    }
    case SPLTokenEventType.Transfer:
    case SPLTokenEventType.TransferChecked: {
      return [ix.parsed.info.source, ix.parsed.info.destination]
    }
    case SPLTokenEventType.Approve:
    case SPLTokenEventType.ApproveChecked:
    case SPLTokenEventType.Revoke: {
      return [ix.parsed.info.source]
    }
  }

  return []
}

export function getEventAccounts(event: SPLTokenIncompleteEvent): string[] {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount) {
        return [event.account, event.toAccount]
      } else {
        return [event.account]
      }
    }
    default: {
      return [event.account]
    }
  }
}

export function getBalanceFromEvent(
  event: SPLTokenIncompleteEvent,
  account: string,
): string {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount === account) {
        return event.toBalance as string
      } else {
        return event.balance
      }
    }
    default: {
      return event.balance
    }
  }
}

export function getMintAndOwnerFromEvent(
  event: SPLTokenEvent,
  account: string,
): { mint: string; owner?: string } {
  switch (event.type) {
    case SPLTokenEventType.Transfer: {
      if (event.toAccount === account) {
        return { mint: event.mint, owner: event.toOwner }
      } else {
        return { mint: event.mint, owner: event.owner }
      }
    }
    default: {
      return { mint: event.mint, owner: event.owner }
    }
  }
}

// export function setOwnerAndMintToEvent(
//   event: SPLTokenIncompleteEvent,
//   account: string,
//   owner: string,
//   mint: string,
// ): void {
//   switch (event.type) {
//     case SPLTokenEventType.Transfer: {
//       event.mint = mint

//       if (event.account === account) {
//         event.owner = owner
//       } else if (event.toAccount === account) {
//         event.toOwner = owner
//       }

//       return
//     }
//     default: {
//       event.mint = mint
//       event.owner = owner
//     }
//   }
// }

// export function isSPLTokenCompletedEvent(
//   event: SPLTokenEvent | SPLTokenIncompleteEvent,
// ): event is SPLTokenEvent {
//   const { mint, type, owner } = event

//   if (!mint) return false

//   switch (type) {
//     case SPLTokenEventType.Transfer: {
//       return Boolean(owner && event.toOwner)
//     }
//     case SPLTokenEventType.SetAuthority: {
//       return Boolean(owner && event.newOwner)
//     }
//     default: {
//       return Boolean(owner)
//     }
//   }
// }
