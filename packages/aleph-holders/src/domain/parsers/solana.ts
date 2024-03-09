import { SolanaParsedInstructionContext } from '@aleph-indexer/solana'
import {
  AlephEvent,
  Balance,
  SLPTokenRawEvent,
  SPLTokenEventType,
  TransferEvent,
} from '../../types.js'
import { BlockchainChain } from '@aleph-indexer/framework'
import { blockchainDeployerAccount } from '../../utils/constants.js'
import {
  bigNumberToString,
  stringToHex,
  uint256ToBigNumber,
} from '../../utils/index.js'
import BN from 'bn.js'

type ParseResult = {
  parsedEvents: TransferEvent[]
  parsedBalances: Balance[]
}

type ParsedEvent = {
  eventBase: AlephEvent
  from: string
  to: string
  valueHex: string
}

export class SolanaEventParser {
  constructor() {}

  parse(ixsContext: SolanaParsedInstructionContext[]): ParseResult {
    const parsedEvents: TransferEvent[] = []
    const parsedBalances: Balance[] = []

    const addParsedData = (parsedEvent: ParsedEvent) => {
      const { eventBase, from, to, valueHex } = parsedEvent
      const value = uint256ToBigNumber(valueHex)
      const valueNeg = uint256ToBigNumber(valueHex).ineg()

      parsedEvents.push({
        ...eventBase,
        from,
        to,
        value: valueHex,
      })

      const computeBalance = (account: string, amount: BN) => {
        const balanceIndex = parsedBalances.findIndex(
          (b) => b.account === account,
        )
        if (balanceIndex !== -1) {
          const currentBalance = uint256ToBigNumber(
            parsedBalances[balanceIndex].balance,
          )
          const newBalance = currentBalance.add(amount)
          parsedBalances[balanceIndex].balance = bigNumberToString(newBalance)
        } else {
          parsedBalances.push({
            blockchain: eventBase.blockchain,
            account,
            balance: bigNumberToString(amount),
          })
        }
      }

      computeBalance(to, value)
      computeBalance(from, valueNeg)
    }

    for (const ixCtx of ixsContext) {
      const { instruction, parentInstruction, parentTransaction } = ixCtx
      const parsed = (instruction as SLPTokenRawEvent).parsed

      const id = `${parentTransaction.signature}${
        parentInstruction
          ? `:${parentInstruction.index.toString().padStart(2, '0')}`
          : ''
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

      const mintAuthority = blockchainDeployerAccount[BlockchainChain.Solana]
      const valueHex = this.getHexAmount(parsed.info)

      switch (parsed.type) {
        case SPLTokenEventType.MintTo:
        case SPLTokenEventType.MintToChecked:
          addParsedData({
            eventBase,
            from: mintAuthority,
            to: parsed.info.account,
            valueHex,
          })
          break

        case SPLTokenEventType.Burn:
        case SPLTokenEventType.BurnChecked:
          addParsedData({
            eventBase,
            from: parsed.info.account,
            to: mintAuthority,
            valueHex,
          })
          break

        case SPLTokenEventType.Transfer:
        case SPLTokenEventType.TransferChecked:
          if (parsed.type === SPLTokenEventType.Transfer) {
            console.log('Evento transfer', {
              eventBase,
              from: parsed.info.source,
              to: parsed.info.destination,
              valueHex: parsed.info.amount,
            })
          }
          addParsedData({
            eventBase,
            from: parsed.info.source,
            to: parsed.info.destination,
            valueHex,
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
