import { SolanaParsedInstructionContext } from '@aleph-indexer/solana'
import { AlephEvent, Balance, SLPTokenRawEvent, SPLTokenEventType, TransferEvent } from '../../types.js'
import { BlockchainChain } from '@aleph-indexer/framework'
import { blockchainDeployerAccount } from '../../utils/constants.js'
import { bigNumberToString, stringToHex, uint256ToBigNumber } from '../../utils/index.js'

type ParseResult = {
  parsedEvents: TransferEvent[], 
  parsedBalances: Balance[]
}

type ParsedEvent = {
  eventBase: AlephEvent, 
  from: string, 
  to: string, 
  valueHex: string
}

export class SolanaEventParser {
  constructor() {}

  parse(
    ixsContext: SolanaParsedInstructionContext[],
  ): ParseResult {
    const parsedEvents: TransferEvent[] = []
    const parsedBalances: Balance[] = []

    const addParsedData = (parsedEvent: ParsedEvent) => {
      const { eventBase, from, to, valueHex } = parsedEvent
      const valueNeg = bigNumberToString(uint256ToBigNumber(valueHex).ineg())

      parsedEvents.push({
        ...eventBase,
        from,
        to,
        value: valueHex,
      })
      parsedBalances.push({
        blockchain: eventBase.blockchain,
        account: to,
        balance: valueHex,
      }, {
        blockchain: eventBase.blockchain,
        account: from,
        balance: valueNeg,
      })
    }
  
    for (const ixCtx of ixsContext) {
      const { instruction, parentInstruction, parentTransaction } = ixCtx
      const parsed = (instruction as SLPTokenRawEvent).parsed
  
      const id = `${parentTransaction.signature}${
        parentInstruction ? `:${parentInstruction.index.toString().padStart(2, '0')}` : ''
      }:${instruction.index.toString().padStart(2, '0')}`
  
      const timestamp = parentTransaction.blockTime
        ? parentTransaction.blockTime * 1000
        : parentTransaction.slot
  
      const eventBase = {
        blockchain: BlockchainChain.Solana,
        id,
        timestamp,
        height: parentTransaction.slot,
        transaction: parentTransaction.signature,
      }
  
      const blockchainDeployer = blockchainDeployerAccount[BlockchainChain.Solana]
      const valueHex = this.getHexAmount(parsed.info)

      switch (parsed.type) {
        case SPLTokenEventType.MintTo:
        case SPLTokenEventType.MintToChecked:
          addParsedData({ 
            eventBase, 
            from: blockchainDeployer, 
            to: parsed.info.account, 
            valueHex 
          })
        break
  
        case SPLTokenEventType.Burn:
        case SPLTokenEventType.BurnChecked:
          addParsedData({ 
            eventBase, 
            from: parsed.info.account, 
            to: blockchainDeployer, 
            valueHex 
          })
        break
  
        case SPLTokenEventType.Transfer:
        case SPLTokenEventType.TransferChecked:
          addParsedData({ 
            eventBase, 
            from: parsed.info.source, 
            to: parsed.info.destination, 
            valueHex 
          })
        break

      }
    }

    return { parsedEvents, parsedBalances }
  }

  getHexAmount(info: any) {
    return stringToHex(info.amount || info.tokenAmount.amount)
  }
}
