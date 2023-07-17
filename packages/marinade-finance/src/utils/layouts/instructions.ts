import { EventBase } from '@aleph-indexer/framework'
import * as solita from './solita/index.js'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export enum InstructionType {
  Initialize = 'Initialize',
  ChangeAuthority = 'ChangeAuthority',
  AddValidator = 'AddValidator',
  RemoveValidator = 'RemoveValidator',
  SetValidatorScore = 'SetValidatorScore',
  ConfigValidatorSystem = 'ConfigValidatorSystem',
  Deposit = 'Deposit',
  DepositStakeAccount = 'DepositStakeAccount',
  LiquidUnstake = 'LiquidUnstake',
  AddLiquidity = 'AddLiquidity',
  RemoveLiquidity = 'RemoveLiquidity',
  SetLpParams = 'SetLpParams',
  ConfigMarinade = 'ConfigMarinade',
  OrderUnstake = 'OrderUnstake',
  Claim = 'Claim',
  StakeReserve = 'StakeReserve',
  UpdateActive = 'UpdateActive',
  UpdateDeactivated = 'UpdateDeactivated',
  DeactivateStake = 'DeactivateStake',
  EmergencyUnstake = 'EmergencyUnstake',
  MergeStakes = 'MergeStakes',
}

export type RawInstructionBase = {
  parsed: unknown
  program: string
  programId: string
}

/*-----------------------* CUSTOM RAW INSTRUCTION TYPES *-----------------------*/

export type InitializeAccountsInstruction = {
  creatorAuthority: string
  state: string
  reservePda: string
  stakeList: string
  validatorList: string
  msolMint: string
  operationalSolAccount: string
  liqPool: string
  treasuryMsolAccount: string
  clock: string
  rent: string
}

export type InitializeInfo = solita.InitializeInstructionArgs &
  InitializeAccountsInstruction

export type RawInitialize = RawInstructionBase & {
  parsed: {
    info: InitializeInfo
    type: InstructionType.Initialize
  }
}

export type ChangeAuthorityAccountsInstruction = {
  state: string
  adminAuthority: string
}

export type ChangeAuthorityInfo = solita.ChangeAuthorityInstructionArgs &
  ChangeAuthorityAccountsInstruction

export type RawChangeAuthority = RawInstructionBase & {
  parsed: {
    info: ChangeAuthorityInfo
    type: InstructionType.ChangeAuthority
  }
}

export type AddValidatorAccountsInstruction = {
  state: string
  managerAuthority: string
  validatorList: string
  validatorVote: string
  duplicationFlag: string
  rentPayer: string
  clock: string
  rent: string
  systemProgram: string
}

export type AddValidatorInfo = solita.AddValidatorInstructionArgs &
  AddValidatorAccountsInstruction

export type RawAddValidator = RawInstructionBase & {
  parsed: {
    info: AddValidatorInfo
    type: InstructionType.AddValidator
  }
}

export type RemoveValidatorAccountsInstruction = {
  state: string
  managerAuthority: string
  validatorList: string
  duplicationFlag: string
  operationalSolAccount: string
}

export type RemoveValidatorInfo = solita.RemoveValidatorInstructionArgs &
  RemoveValidatorAccountsInstruction

export type RawRemoveValidator = RawInstructionBase & {
  parsed: {
    info: RemoveValidatorInfo
    type: InstructionType.RemoveValidator
  }
}

export type SetValidatorScoreAccountsInstruction = {
  state: string
  managerAuthority: string
  validatorList: string
}

export type SetValidatorScoreInfo = solita.SetValidatorScoreInstructionArgs &
  SetValidatorScoreAccountsInstruction

export type RawSetValidatorScore = RawInstructionBase & {
  parsed: {
    info: SetValidatorScoreInfo
    type: InstructionType.SetValidatorScore
  }
}

export type ConfigValidatorSystemAccountsInstruction = {
  state: string
  managerAuthority: string
}

export type ConfigValidatorSystemInfo =
  solita.ConfigValidatorSystemInstructionArgs &
    ConfigValidatorSystemAccountsInstruction

export type RawConfigValidatorSystem = RawInstructionBase & {
  parsed: {
    info: ConfigValidatorSystemInfo
    type: InstructionType.ConfigValidatorSystem
  }
}

export type DepositAccountsInstruction = {
  state: string
  msolMint: string
  liqPoolSolLegPda: string
  liqPoolMsolLeg: string
  liqPoolMsolLegAuthority: string
  reservePda: string
  transferFrom: string
  mintTo: string
  msolMintAuthority: string
  systemProgram: string
  tokenProgram: string
}

export type DepositInfo = solita.DepositInstructionArgs &
  DepositAccountsInstruction

export type RawDeposit = RawInstructionBase & {
  parsed: {
    info: DepositInfo
    type: InstructionType.Deposit
  }
}

export type DepositStakeAccountAccountsInstruction = {
  state: string
  validatorList: string
  stakeList: string
  stakeAccount: string
  stakeAuthority: string
  duplicationFlag: string
  rentPayer: string
  msolMint: string
  mintTo: string
  msolMintAuthority: string
  clock: string
  rent: string
  systemProgram: string
  tokenProgram: string
  stakeProgram: string
}

export type DepositStakeAccountInfo =
  solita.DepositStakeAccountInstructionArgs &
    DepositStakeAccountAccountsInstruction

export type RawDepositStakeAccount = RawInstructionBase & {
  parsed: {
    info: DepositStakeAccountInfo
    type: InstructionType.DepositStakeAccount
  }
}

export type LiquidUnstakeAccountsInstruction = {
  state: string
  msolMint: string
  liqPoolSolLegPda: string
  liqPoolMsolLeg: string
  treasuryMsolAccount: string
  getMsolFrom: string
  getMsolFromAuthority: string
  transferSolTo: string
  systemProgram: string
  tokenProgram: string
}

export type LiquidUnstakeInfo = solita.LiquidUnstakeInstructionArgs &
  LiquidUnstakeAccountsInstruction

export type RawLiquidUnstake = RawInstructionBase & {
  parsed: {
    info: LiquidUnstakeInfo
    type: InstructionType.LiquidUnstake
  }
}

export type AddLiquidityAccountsInstruction = {
  state: string
  lpMint: string
  lpMintAuthority: string
  liqPoolMsolLeg: string
  liqPoolSolLegPda: string
  transferFrom: string
  mintTo: string
  systemProgram: string
  tokenProgram: string
}

export type AddLiquidityInfo = solita.AddLiquidityInstructionArgs &
  AddLiquidityAccountsInstruction

export type RawAddLiquidity = RawInstructionBase & {
  parsed: {
    info: AddLiquidityInfo
    type: InstructionType.AddLiquidity
  }
}

export type RemoveLiquidityAccountsInstruction = {
  state: string
  lpMint: string
  burnFrom: string
  burnFromAuthority: string
  transferSolTo: string
  transferMsolTo: string
  liqPoolSolLegPda: string
  liqPoolMsolLeg: string
  liqPoolMsolLegAuthority: string
  systemProgram: string
  tokenProgram: string
}

export type RemoveLiquidityInfo = solita.RemoveLiquidityInstructionArgs &
  RemoveLiquidityAccountsInstruction

export type RawRemoveLiquidity = RawInstructionBase & {
  parsed: {
    info: RemoveLiquidityInfo
    type: InstructionType.RemoveLiquidity
  }
}

export type SetLpParamsAccountsInstruction = {
  state: string
  adminAuthority: string
}

export type SetLpParamsInfo = solita.SetLpParamsInstructionArgs &
  SetLpParamsAccountsInstruction

export type RawSetLpParams = RawInstructionBase & {
  parsed: {
    info: SetLpParamsInfo
    type: InstructionType.SetLpParams
  }
}

export type ConfigMarinadeAccountsInstruction = {
  state: string
  adminAuthority: string
}

export type ConfigMarinadeInfo = solita.ConfigMarinadeInstructionArgs &
  ConfigMarinadeAccountsInstruction

export type RawConfigMarinade = RawInstructionBase & {
  parsed: {
    info: ConfigMarinadeInfo
    type: InstructionType.ConfigMarinade
  }
}

export type OrderUnstakeAccountsInstruction = {
  state: string
  msolMint: string
  burnMsolFrom: string
  burnMsolAuthority: string
  newTicketAccount: string
  clock: string
  rent: string
  tokenProgram: string
}

export type OrderUnstakeInfo = solita.OrderUnstakeInstructionArgs &
  OrderUnstakeAccountsInstruction

export type RawOrderUnstake = RawInstructionBase & {
  parsed: {
    info: OrderUnstakeInfo
    type: InstructionType.OrderUnstake
  }
}

export type ClaimAccountsInstruction = {
  state: string
  reservePda: string
  ticketAccount: string
  transferSolTo: string
  clock: string
  systemProgram: string
}

export type ClaimInfo = ClaimAccountsInstruction

export type RawClaim = RawInstructionBase & {
  parsed: {
    info: ClaimInfo
    type: InstructionType.Claim
  }
}

export type StakeReserveAccountsInstruction = {
  state: string
  validatorList: string
  stakeList: string
  validatorVote: string
  reservePda: string
  stakeAccount: string
  stakeDepositAuthority: string
  clock: string
  epochSchedule: string
  rent: string
  stakeHistory: string
  stakeConfig: string
  systemProgram: string
  stakeProgram: string
}

export type StakeReserveInfo = solita.StakeReserveInstructionArgs &
  StakeReserveAccountsInstruction

export type RawStakeReserve = RawInstructionBase & {
  parsed: {
    info: StakeReserveInfo
    type: InstructionType.StakeReserve
  }
}

export type UpdateActiveAccountsInstruction = {
  common: string
  validatorList: string
}

export type UpdateActiveInfo = solita.UpdateActiveInstructionArgs &
  UpdateActiveAccountsInstruction

export type RawUpdateActive = RawInstructionBase & {
  parsed: {
    info: UpdateActiveInfo
    type: InstructionType.UpdateActive
  }
}

export type UpdateDeactivatedAccountsInstruction = {
  common: string
  operationalSolAccount: string
  systemProgram: string
}

export type UpdateDeactivatedInfo = solita.UpdateDeactivatedInstructionArgs &
  UpdateDeactivatedAccountsInstruction

export type RawUpdateDeactivated = RawInstructionBase & {
  parsed: {
    info: UpdateDeactivatedInfo
    type: InstructionType.UpdateDeactivated
  }
}

export type DeactivateStakeAccountsInstruction = {
  state: string
  reservePda: string
  validatorList: string
  stakeList: string
  stakeAccount: string
  stakeDepositAuthority: string
  splitStakeAccount: string
  splitStakeRentPayer: string
  clock: string
  rent: string
  epochSchedule: string
  stakeHistory: string
  systemProgram: string
  stakeProgram: string
}

export type DeactivateStakeInfo = solita.DeactivateStakeInstructionArgs &
  DeactivateStakeAccountsInstruction

export type RawDeactivateStake = RawInstructionBase & {
  parsed: {
    info: DeactivateStakeInfo
    type: InstructionType.DeactivateStake
  }
}

export type EmergencyUnstakeAccountsInstruction = {
  state: string
  validatorManagerAuthority: string
  validatorList: string
  stakeList: string
  stakeAccount: string
  stakeDepositAuthority: string
  clock: string
  stakeProgram: string
}

export type EmergencyUnstakeInfo = solita.EmergencyUnstakeInstructionArgs &
  EmergencyUnstakeAccountsInstruction

export type RawEmergencyUnstake = RawInstructionBase & {
  parsed: {
    info: EmergencyUnstakeInfo
    type: InstructionType.EmergencyUnstake
  }
}

export type MergeStakesAccountsInstruction = {
  state: string
  stakeList: string
  validatorList: string
  destinationStake: string
  sourceStake: string
  stakeDepositAuthority: string
  stakeWithdrawAuthority: string
  operationalSolAccount: string
  clock: string
  stakeHistory: string
  stakeProgram: string
}

export type MergeStakesInfo = solita.MergeStakesInstructionArgs &
  MergeStakesAccountsInstruction

export type RawMergeStakes = RawInstructionBase & {
  parsed: {
    info: MergeStakesInfo
    type: InstructionType.MergeStakes
  }
}

export type RawInstructionsInfo =
  | InitializeInfo
  | ChangeAuthorityInfo
  | AddValidatorInfo
  | RemoveValidatorInfo
  | SetValidatorScoreInfo
  | ConfigValidatorSystemInfo
  | DepositInfo
  | DepositStakeAccountInfo
  | LiquidUnstakeInfo
  | AddLiquidityInfo
  | RemoveLiquidityInfo
  | SetLpParamsInfo
  | ConfigMarinadeInfo
  | OrderUnstakeInfo
  | ClaimInfo
  | StakeReserveInfo
  | UpdateActiveInfo
  | UpdateDeactivatedInfo
  | DeactivateStakeInfo
  | EmergencyUnstakeInfo
  | MergeStakesInfo

export type RawInstruction =
  | RawInitialize
  | RawChangeAuthority
  | RawAddValidator
  | RawRemoveValidator
  | RawSetValidatorScore
  | RawConfigValidatorSystem
  | RawDeposit
  | RawDepositStakeAccount
  | RawLiquidUnstake
  | RawAddLiquidity
  | RawRemoveLiquidity
  | RawSetLpParams
  | RawConfigMarinade
  | RawOrderUnstake
  | RawClaim
  | RawStakeReserve
  | RawUpdateActive
  | RawUpdateDeactivated
  | RawDeactivateStake
  | RawEmergencyUnstake
  | RawMergeStakes

export type InitializeEvent = EventBase<InstructionType> & {
  info: InitializeInfo
  signer: string
  account: string
}

export type ChangeAuthorityEvent = EventBase<InstructionType> & {
  info: ChangeAuthorityInfo
  signer: string
  account: string
}

export type AddValidatorEvent = EventBase<InstructionType> & {
  info: AddValidatorInfo
  signer: string
  account: string
}

export type RemoveValidatorEvent = EventBase<InstructionType> & {
  info: RemoveValidatorInfo
  signer: string
  account: string
}

export type SetValidatorScoreEvent = EventBase<InstructionType> & {
  info: SetValidatorScoreInfo
  signer: string
  account: string
}

export type ConfigValidatorSystemEvent = EventBase<InstructionType> & {
  info: ConfigValidatorSystemInfo
  signer: string
  account: string
}

export type DepositEvent = EventBase<InstructionType> & {
  info: DepositInfo
  signer: string
  account: string
}

export type DepositStakeAccountEvent = EventBase<InstructionType> & {
  info: DepositStakeAccountInfo
  signer: string
  account: string
}

export type LiquidUnstakeEvent = EventBase<InstructionType> & {
  info: LiquidUnstakeInfo
  signer: string
  account: string
}

export type AddLiquidityEvent = EventBase<InstructionType> & {
  info: AddLiquidityInfo
  signer: string
  account: string
}

export type RemoveLiquidityEvent = EventBase<InstructionType> & {
  info: RemoveLiquidityInfo
  signer: string
  account: string
}

export type SetLpParamsEvent = EventBase<InstructionType> & {
  info: SetLpParamsInfo
  signer: string
  account: string
}

export type ConfigMarinadeEvent = EventBase<InstructionType> & {
  info: ConfigMarinadeInfo
  signer: string
  account: string
}

export type OrderUnstakeEvent = EventBase<InstructionType> & {
  info: OrderUnstakeInfo
  signer: string
  account: string
}

export type ClaimEvent = EventBase<InstructionType> & {
  info: ClaimInfo
  signer: string
  account: string
}

export type StakeReserveEvent = EventBase<InstructionType> & {
  info: StakeReserveInfo
  signer: string
  account: string
}

export type UpdateActiveEvent = EventBase<InstructionType> & {
  info: UpdateActiveInfo
  signer: string
  account: string
}

export type UpdateDeactivatedEvent = EventBase<InstructionType> & {
  info: UpdateDeactivatedInfo
  signer: string
  account: string
}

export type DeactivateStakeEvent = EventBase<InstructionType> & {
  info: DeactivateStakeInfo
  signer: string
  account: string
}

export type EmergencyUnstakeEvent = EventBase<InstructionType> & {
  info: EmergencyUnstakeInfo
  signer: string
  account: string
}

export type MergeStakesEvent = EventBase<InstructionType> & {
  info: MergeStakesInfo
  signer: string
  account: string
}

export type MarinadeFinanceEvent =
  | InitializeEvent
  | ChangeAuthorityEvent
  | AddValidatorEvent
  | RemoveValidatorEvent
  | SetValidatorScoreEvent
  | ConfigValidatorSystemEvent
  | DepositEvent
  | DepositStakeAccountEvent
  | LiquidUnstakeEvent
  | AddLiquidityEvent
  | RemoveLiquidityEvent
  | SetLpParamsEvent
  | ConfigMarinadeEvent
  | OrderUnstakeEvent
  | ClaimEvent
  | StakeReserveEvent
  | UpdateActiveEvent
  | UpdateDeactivatedEvent
  | DeactivateStakeEvent
  | EmergencyUnstakeEvent
  | MergeStakesEvent
/*----------------------------------------------------------------------*/

export function getInstructionType(data: Buffer): InstructionType | undefined {
  const discriminator = data.slice(0, 8)
  return IX_METHOD_CODE.get(discriminator.toString('ascii'))
}

export const IX_METHOD_CODE: Map<string, InstructionType | undefined> = new Map<
  string,
  InstructionType | undefined
>([
  [
    Buffer.from(solita.initializeInstructionDiscriminator).toString('ascii'),
    InstructionType.Initialize,
  ],
  [
    Buffer.from(solita.changeAuthorityInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.ChangeAuthority,
  ],
  [
    Buffer.from(solita.addValidatorInstructionDiscriminator).toString('ascii'),
    InstructionType.AddValidator,
  ],
  [
    Buffer.from(solita.removeValidatorInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.RemoveValidator,
  ],
  [
    Buffer.from(solita.setValidatorScoreInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.SetValidatorScore,
  ],
  [
    Buffer.from(solita.configValidatorSystemInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.ConfigValidatorSystem,
  ],
  [
    Buffer.from(solita.depositInstructionDiscriminator).toString('ascii'),
    InstructionType.Deposit,
  ],
  [
    Buffer.from(solita.depositStakeAccountInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.DepositStakeAccount,
  ],
  [
    Buffer.from(solita.liquidUnstakeInstructionDiscriminator).toString('ascii'),
    InstructionType.LiquidUnstake,
  ],
  [
    Buffer.from(solita.addLiquidityInstructionDiscriminator).toString('ascii'),
    InstructionType.AddLiquidity,
  ],
  [
    Buffer.from(solita.removeLiquidityInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.RemoveLiquidity,
  ],
  [
    Buffer.from(solita.setLpParamsInstructionDiscriminator).toString('ascii'),
    InstructionType.SetLpParams,
  ],
  [
    Buffer.from(solita.configMarinadeInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.ConfigMarinade,
  ],
  [
    Buffer.from(solita.orderUnstakeInstructionDiscriminator).toString('ascii'),
    InstructionType.OrderUnstake,
  ],
  [
    Buffer.from(solita.claimInstructionDiscriminator).toString('ascii'),
    InstructionType.Claim,
  ],
  [
    Buffer.from(solita.stakeReserveInstructionDiscriminator).toString('ascii'),
    InstructionType.StakeReserve,
  ],
  [
    Buffer.from(solita.updateActiveInstructionDiscriminator).toString('ascii'),
    InstructionType.UpdateActive,
  ],
  [
    Buffer.from(solita.updateDeactivatedInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.UpdateDeactivated,
  ],
  [
    Buffer.from(solita.deactivateStakeInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.DeactivateStake,
  ],
  [
    Buffer.from(solita.emergencyUnstakeInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.EmergencyUnstake,
  ],
  [
    Buffer.from(solita.mergeStakesInstructionDiscriminator).toString('ascii'),
    InstructionType.MergeStakes,
  ],
])
export const IX_DATA_LAYOUT: Partial<Record<InstructionType, any>> = {
  [InstructionType.Initialize]: solita.initializeStruct,
  [InstructionType.ChangeAuthority]: solita.changeAuthorityStruct,
  [InstructionType.AddValidator]: solita.addValidatorStruct,
  [InstructionType.RemoveValidator]: solita.removeValidatorStruct,
  [InstructionType.SetValidatorScore]: solita.setValidatorScoreStruct,
  [InstructionType.ConfigValidatorSystem]: solita.configValidatorSystemStruct,
  [InstructionType.Deposit]: solita.depositStruct,
  [InstructionType.DepositStakeAccount]: solita.depositStakeAccountStruct,
  [InstructionType.LiquidUnstake]: solita.liquidUnstakeStruct,
  [InstructionType.AddLiquidity]: solita.addLiquidityStruct,
  [InstructionType.RemoveLiquidity]: solita.removeLiquidityStruct,
  [InstructionType.SetLpParams]: solita.setLpParamsStruct,
  [InstructionType.ConfigMarinade]: solita.configMarinadeStruct,
  [InstructionType.OrderUnstake]: solita.orderUnstakeStruct,
  [InstructionType.Claim]: solita.claimStruct,
  [InstructionType.StakeReserve]: solita.stakeReserveStruct,
  [InstructionType.UpdateActive]: solita.updateActiveStruct,
  [InstructionType.UpdateDeactivated]: solita.updateDeactivatedStruct,
  [InstructionType.DeactivateStake]: solita.deactivateStakeStruct,
  [InstructionType.EmergencyUnstake]: solita.emergencyUnstakeStruct,
  [InstructionType.MergeStakes]: solita.mergeStakesStruct,
}

export const IX_ACCOUNTS_LAYOUT: Partial<Record<InstructionType, any>> = {
  [InstructionType.Initialize]: solita.InitializeAccounts,
  [InstructionType.ChangeAuthority]: solita.ChangeAuthorityAccounts,
  [InstructionType.AddValidator]: solita.AddValidatorAccounts,
  [InstructionType.RemoveValidator]: solita.RemoveValidatorAccounts,
  [InstructionType.SetValidatorScore]: solita.SetValidatorScoreAccounts,
  [InstructionType.ConfigValidatorSystem]: solita.ConfigValidatorSystemAccounts,
  [InstructionType.Deposit]: solita.DepositAccounts,
  [InstructionType.DepositStakeAccount]: solita.DepositStakeAccountAccounts,
  [InstructionType.LiquidUnstake]: solita.LiquidUnstakeAccounts,
  [InstructionType.AddLiquidity]: solita.AddLiquidityAccounts,
  [InstructionType.RemoveLiquidity]: solita.RemoveLiquidityAccounts,
  [InstructionType.SetLpParams]: solita.SetLpParamsAccounts,
  [InstructionType.ConfigMarinade]: solita.ConfigMarinadeAccounts,
  [InstructionType.OrderUnstake]: solita.OrderUnstakeAccounts,
  [InstructionType.Claim]: solita.ClaimAccounts,
  [InstructionType.StakeReserve]: solita.StakeReserveAccounts,
  [InstructionType.UpdateActive]: solita.UpdateActiveAccounts,
  [InstructionType.UpdateDeactivated]: solita.UpdateDeactivatedAccounts,
  [InstructionType.DeactivateStake]: solita.DeactivateStakeAccounts,
  [InstructionType.EmergencyUnstake]: solita.EmergencyUnstakeAccounts,
  [InstructionType.MergeStakes]: solita.MergeStakesAccounts,
}
