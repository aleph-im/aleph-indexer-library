import {
  SolanaParsedInstructionContext,
  SolanaParsedEvent,
} from '@aleph-indexer/solana'

import {
  ParsedEvents,
  ParsedEventsInfo,
  InstructionType,
  InitializeEvent,
  ChangeAuthorityEvent,
  AddValidatorEvent,
  RemoveValidatorEvent,
  SetValidatorScoreEvent,
  ConfigValidatorSystemEvent,
  DepositEvent,
  DepositStakeAccountEvent,
  LiquidUnstakeEvent,
  AddLiquidityEvent,
  RemoveLiquidityEvent,
  SetLpParamsEvent,
  ConfigMarinadeEvent,
  OrderUnstakeEvent,
  ClaimEvent,
  StakeReserveEvent,
  UpdateActiveEvent,
  UpdateDeactivatedEvent,
  DeactivateStakeEvent,
  EmergencyUnstakeEvent,
  MergeStakesEvent,
} from '../utils/layouts/index.js'

export class EventParser {
  parse(
    ixCtx: SolanaParsedInstructionContext,
    ctx: { account: string; startDate: number; endDate: number },
  ): ParsedEvents {
    const { instruction, parentInstruction, parentTransaction } = ixCtx
    const parsed = (
      instruction as SolanaParsedEvent<InstructionType, ParsedEventsInfo>
    ).parsed

    const id = `${parentTransaction.signature}${
      parentInstruction
        ? ` :${parentInstruction.index.toString().padStart(2, '0')}`
        : ''
    }:${instruction.index.toString().padStart(2, '0')}`

    const timestamp = parentTransaction.blockTime
      ? parentTransaction.blockTime * 1000
      : parentTransaction.slot

    const baseEvent = {
      ...parsed.info,
      id,
      timestamp,
      type: parsed.type,
      account: ctx.account,
      signer: parentTransaction.parsed.message.accountKeys[0].pubkey,
    }

    try {
      switch (parsed.type) {
        case InstructionType.Initialize:
          return {
            ...baseEvent,
          } as InitializeEvent
        case InstructionType.ChangeAuthority:
          return {
            ...baseEvent,
          } as ChangeAuthorityEvent
        case InstructionType.AddValidator:
          return {
            ...baseEvent,
          } as AddValidatorEvent
        case InstructionType.RemoveValidator:
          return {
            ...baseEvent,
          } as RemoveValidatorEvent
        case InstructionType.SetValidatorScore:
          return {
            ...baseEvent,
          } as SetValidatorScoreEvent
        case InstructionType.ConfigValidatorSystem:
          return {
            ...baseEvent,
          } as ConfigValidatorSystemEvent
        case InstructionType.Deposit:
          return {
            ...baseEvent,
          } as DepositEvent
        case InstructionType.DepositStakeAccount:
          return {
            ...baseEvent,
          } as DepositStakeAccountEvent
        case InstructionType.LiquidUnstake:
          return {
            ...baseEvent,
          } as LiquidUnstakeEvent
        case InstructionType.AddLiquidity:
          return {
            ...baseEvent,
          } as AddLiquidityEvent
        case InstructionType.RemoveLiquidity:
          return {
            ...baseEvent,
          } as RemoveLiquidityEvent
        case InstructionType.SetLpParams:
          return {
            ...baseEvent,
          } as SetLpParamsEvent
        case InstructionType.ConfigMarinade:
          return {
            ...baseEvent,
          } as ConfigMarinadeEvent
        case InstructionType.OrderUnstake:
          return {
            ...baseEvent,
          } as OrderUnstakeEvent
        case InstructionType.Claim:
          return {
            ...baseEvent,
          } as ClaimEvent
        case InstructionType.StakeReserve:
          return {
            ...baseEvent,
          } as StakeReserveEvent
        case InstructionType.UpdateActive:
          return {
            ...baseEvent,
          } as UpdateActiveEvent
        case InstructionType.UpdateDeactivated:
          return {
            ...baseEvent,
          } as UpdateDeactivatedEvent
        case InstructionType.DeactivateStake:
          return {
            ...baseEvent,
          } as DeactivateStakeEvent
        case InstructionType.EmergencyUnstake:
          return {
            ...baseEvent,
          } as EmergencyUnstakeEvent
        case InstructionType.MergeStakes:
          return {
            ...baseEvent,
          } as MergeStakesEvent

        default: {
          console.log('default -> ', parsed.type, id)
          return baseEvent as ParsedEvents
        }
      }
    } catch (e) {
      console.log('error -> ', parsed.type, id, e)
      throw e
    }
  }
}

export const eventParser = new EventParser()
export default eventParser
