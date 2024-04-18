import { SolanaParsedInstructionContext } from '@aleph-indexer/solana'
import {
  SPLTokenEvent,
  SPLTokenEventType,
  SPLTokenRawEvent,
} from '../../types.js'
import { getEventBase } from '../../utils/solana.js'
import { blockchainDeployerAccount } from '../../utils/constants.js'
import { BlockchainChain } from '@aleph-indexer/framework'

export class SolanaEventParser {
  constructor() {}

  parseEvent(entity: SolanaParsedInstructionContext): SPLTokenEvent {
    const instruction = entity.instruction as SPLTokenRawEvent
    const eventBase = getEventBase(entity)
    const transferInfo = this.getTransferInfo(instruction)

    return {
      ...eventBase,
      ...transferInfo
    }
  }

  getTransferInfo(instruction: SPLTokenRawEvent) {
    const parsed = instruction.parsed
    switch (parsed.type) {
      case SPLTokenEventType.MintTo: {
        const { account, amount } = parsed.info
        
        return {
          type: SPLTokenEventType.MintTo,
          to: account,
          from: blockchainDeployerAccount[BlockchainChain.Solana],
          amount,
        }
      }

      case SPLTokenEventType.MintToChecked: {
        const { tokenAmount, account } = parsed.info
        return {
          type: SPLTokenEventType.MintTo,
          to: account,
          from: blockchainDeployerAccount[BlockchainChain.Solana],
          amount: tokenAmount.amount,
        }
      }

      case SPLTokenEventType.Burn: {
        const { account, amount } = parsed.info
        return {
          type: SPLTokenEventType.Burn,
          to: blockchainDeployerAccount[BlockchainChain.Solana],
          from: account,
          amount,
        }
      }

      case SPLTokenEventType.BurnChecked: {
        const { account, tokenAmount } = parsed.info
        return {
          type: SPLTokenEventType.Burn,
          to: blockchainDeployerAccount[BlockchainChain.Solana],
          from: account,
          amount: tokenAmount.amount,
        }
      }

      case SPLTokenEventType.Transfer: {
        return {
          type: SPLTokenEventType.Transfer,
          to: parsed.info.destination,
          from: parsed.info.source,
          amount: parsed.info.amount,
        }
      }

      case SPLTokenEventType.TransferChecked: {
        return {
          type: SPLTokenEventType.Transfer,
          to: parsed.info.destination,
          from: parsed.info.source,
          amount: parsed.info.tokenAmount.amount,
        }
      }

      default: {
        throw new Error(`Unexpected event type: ${parsed.type}`)
      }
    }
  }
}
