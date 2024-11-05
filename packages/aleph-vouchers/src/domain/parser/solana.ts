import { SolanaParsedInstructionContext } from '@aleph-indexer/solana'
import { BlockchainId } from '@aleph-indexer/framework'
import { MPLTokenEventStorage } from '../../dal/solana/mplTokenEvent.js'
import {
  SLPTokenInstruction,
  MPLTokenBalance,
  MPLTokenEvent,
  MPLTokenEventBase,
  MPLTokenEventType,
} from '../../types/solana.js'

export class SolanaEventParser {
  constructor(protected eventDAL: MPLTokenEventStorage) {}

  parseBalanceFromEvent(event: MPLTokenEvent): MPLTokenBalance[] {
    const { blockchain, height, collection, timestamp, asset, owner, type } =
      event

    const burned = type === MPLTokenEventType.BurnV1 ? true : undefined
    const name = type === MPLTokenEventType.CreateV1 ? event.name : undefined
    const url = type === MPLTokenEventType.CreateV1 ? event.uri : undefined

    const assetBalance = {
      blockchain,
      height,
      timestamp,
      asset,
      collection,
      owner,
      burned,
      name,
      url,
    }

    return [assetBalance]
  }

  async parseEvent(
    blockchain: BlockchainId,
    ixCtx: SolanaParsedInstructionContext,
  ): Promise<MPLTokenEvent | undefined> {
    const { instruction } = ixCtx
    const parsed = (instruction as SLPTokenInstruction).parsed

    const baseEvent = await this.parseCommonScheme(
      blockchain,
      ixCtx,
      parsed.type,
    )

    switch (parsed.type) {
      case MPLTokenEventType.CreateV1: {
        const {
          asset,
          collection,
          owner,
          createV1Args: { name, uri },
        } = parsed.info

        return {
          ...baseEvent,
          type: MPLTokenEventType.CreateV1,
          asset: asset as unknown as string,
          collection: collection as unknown as string,
          owner: owner as unknown as string,
          name,
          uri,
        }
      }
      case MPLTokenEventType.CreateV2: {
        const {
          asset,
          collection,
          owner,
          createV2Args: { name, uri },
        } = parsed.info

        return {
          ...baseEvent,
          type: MPLTokenEventType.CreateV1,
          asset: asset as unknown as string,
          collection: collection as unknown as string,
          owner: owner as unknown as string,
          name,
          uri,
        }
      }
      case MPLTokenEventType.TransferV1: {
        const { asset, collection, newOwner: owner } = parsed.info

        return {
          ...baseEvent,
          type: MPLTokenEventType.TransferV1,
          asset: asset as unknown as string,
          collection: collection as unknown as string,
          owner: owner as unknown as string,
        }
      }
      case MPLTokenEventType.BurnV1: {
        const { asset, collection } = parsed.info

        return {
          ...baseEvent,
          type: MPLTokenEventType.BurnV1,
          asset: asset as unknown as string,
          collection: collection as unknown as string,
        }
      }

      default: {
        console.log('NOT PARSED IX TYPE', (parsed as any).type)
        console.log(baseEvent.id)
        return
      }
    }
  }

  protected async parseCommonScheme(
    blockchain: BlockchainId,
    ixCtx: SolanaParsedInstructionContext,
    type: MPLTokenEventType,
  ): Promise<MPLTokenEventBase> {
    const { instruction, parentTransaction } = ixCtx
    const parsed = (instruction as SLPTokenInstruction).parsed

    const id = this.parseId(blockchain, ixCtx)
    const timestamp = this.parseTimestamp(ixCtx)
    const height = this.parseSlot(ixCtx)
    const index = this.parseIndex(ixCtx)
    const transaction = parentTransaction.signature
    const { asset, collection } = parsed.info

    return {
      id,
      blockchain,
      timestamp,
      type: type || parsed.type,
      height,
      index,
      transaction,
      asset: asset as unknown as string,
      collection: collection as unknown as string,
    }
  }

  protected parseId(
    blockchain: BlockchainId,
    ixCtx: SolanaParsedInstructionContext,
  ): string {
    const { instruction, parentInstruction, parentTransaction } = ixCtx

    return `${blockchain}_${parentTransaction.signature}${
      parentInstruction
        ? `_${parentInstruction.index.toString().padStart(2, '0')}`
        : ''
    }_${instruction.index.toString().padStart(2, '0')}`
  }

  protected parseIndex(ixCtx: SolanaParsedInstructionContext): number {
    const { instruction, parentInstruction } = ixCtx
    return (parentInstruction?.index || 0) * 100 + instruction.index
  }

  protected parseTimestamp(ixCtx: SolanaParsedInstructionContext): number {
    const { parentTransaction } = ixCtx
    console.log(
      'parentTransaction.timestamp',
      parentTransaction.timestamp,
      parentTransaction.blockTime,
    )
    return parentTransaction.timestamp
  }

  protected parseSlot(ixCtx: SolanaParsedInstructionContext): number {
    const { parentTransaction } = ixCtx
    return parentTransaction.slot
  }
}
