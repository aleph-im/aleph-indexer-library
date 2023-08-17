import { BlockchainId } from '@aleph-indexer/framework'
import { EthereumParsedLog } from '@aleph-indexer/ethereum'
import { AlephEvent, Balance, ERC20TransferEvent } from '../types.js'
import {
  bigNumberToString,
  uint256ToBigNumber,
  uint256ToString,
} from '../utils/index.js'

export class EventParser {
  parseERC20TransferEvent(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): ERC20TransferEvent {
    const parsedEvent = this.parseCommonScheme(blockchain, entity)

    const [rawFrom, rawTo, rawValue] = entity.parsed?.args || []

    const from = String(rawFrom)
    const to = String(rawTo)
    const value = uint256ToString(rawValue.hex)

    return {
      ...parsedEvent,
      from,
      to,
      value,
    }
  }

  parseBalance(blockchain: BlockchainId, entity: EthereumParsedLog): Balance[] {
    const { from, to, value } = this.parseERC20TransferEvent(blockchain, entity)

    const balances = [
      {
        blockchain,
        account: from,
        balance: bigNumberToString(uint256ToBigNumber(value).ineg()),
      },
      {
        blockchain,
        account: to,
        balance: value,
      },
    ]

    return balances
  }

  protected parseCommonScheme(
    blockchain: BlockchainId,
    entity: EthereumParsedLog,
  ): AlephEvent {
    const timestamp = entity.timestamp
    const id = `${blockchain}_${entity.id}`
    const { height, transactionHash: transaction } = entity

    return {
      blockchain,
      id,
      timestamp,
      height,
      transaction,
    }
  }
}
