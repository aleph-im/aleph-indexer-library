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
  ConfigLp = 'ConfigLp',
  ConfigMarinade = 'ConfigMarinade',
  OrderUnstake = 'OrderUnstake',
  Claim = 'Claim',
  StakeReserve = 'StakeReserve',
  UpdateActive = 'UpdateActive',
  UpdateDeactivated = 'UpdateDeactivated',
  DeactivateStake = 'DeactivateStake',
  EmergencyUnstake = 'EmergencyUnstake',
  PartialUnstake = 'PartialUnstake',
  MergeStakes = 'MergeStakes',
  Redelegate = 'Redelegate',
  Pause = 'Pause',
  Resume = 'Resume',
  WithdrawStakeAccount = 'WithdrawStakeAccount',
  ReallocValidatorList = 'ReallocValidatorList',
  ReallocStakeList = 'ReallocStakeList',
}

export type RawInstructionBase = {
  parsed: unknown
  program: string
  programId: string
}

/*-----------------------* CUSTOM RAW INSTRUCTION TYPES *-----------------------*/

export type InitializeAccountsInstruction = {
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

export type ConfigLpAccountsInstruction = {
  state: string
  adminAuthority: string
}

export type ConfigLpInfo = solita.ConfigLpInstructionArgs &
  ConfigLpAccountsInstruction

export type RawConfigLp = RawInstructionBase & {
  parsed: {
    info: ConfigLpInfo
    type: InstructionType.ConfigLp
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
  rentPayer: string
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

export type PartialUnstakeAccountsInstruction = {
  state: string
  validatorManagerAuthority: string
  validatorList: string
  stakeList: string
  stakeAccount: string
  stakeDepositAuthority: string
  reservePda: string
  splitStakeAccount: string
  splitStakeRentPayer: string
  clock: string
  rent: string
  stakeHistory: string
  systemProgram: string
  stakeProgram: string
}

export type PartialUnstakeInfo = solita.PartialUnstakeInstructionArgs &
  PartialUnstakeAccountsInstruction

export type RawPartialUnstake = RawInstructionBase & {
  parsed: {
    info: PartialUnstakeInfo
    type: InstructionType.PartialUnstake
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

export type RedelegateAccountsInstruction = {
  state: string
  validatorList: string
  stakeList: string
  stakeAccount: string
  stakeDepositAuthority: string
  reservePda: string
  splitStakeAccount: string
  splitStakeRentPayer: string
  destValidatorAccount: string
  redelegateStakeAccount: string
  clock: string
  stakeHistory: string
  stakeConfig: string
  systemProgram: string
  stakeProgram: string
}

export type RedelegateInfo = solita.RedelegateInstructionArgs &
  RedelegateAccountsInstruction

export type RawRedelegate = RawInstructionBase & {
  parsed: {
    info: RedelegateInfo
    type: InstructionType.Redelegate
  }
}

export type PauseAccountsInstruction = {
  state: string
  pauseAuthority: string
}

export type PauseInfo = PauseAccountsInstruction

export type RawPause = RawInstructionBase & {
  parsed: {
    info: PauseInfo
    type: InstructionType.Pause
  }
}

export type ResumeAccountsInstruction = {
  state: string
  pauseAuthority: string
}

export type ResumeInfo = ResumeAccountsInstruction

export type RawResume = RawInstructionBase & {
  parsed: {
    info: ResumeInfo
    type: InstructionType.Resume
  }
}

export type WithdrawStakeAccountAccountsInstruction = {
  state: string
  msolMint: string
  burnMsolFrom: string
  burnMsolAuthority: string
  treasuryMsolAccount: string
  validatorList: string
  stakeList: string
  stakeWithdrawAuthority: string
  stakeDepositAuthority: string
  stakeAccount: string
  splitStakeAccount: string
  splitStakeRentPayer: string
  clock: string
  systemProgram: string
  tokenProgram: string
  stakeProgram: string
}

export type WithdrawStakeAccountInfo =
  solita.WithdrawStakeAccountInstructionArgs &
    WithdrawStakeAccountAccountsInstruction

export type RawWithdrawStakeAccount = RawInstructionBase & {
  parsed: {
    info: WithdrawStakeAccountInfo
    type: InstructionType.WithdrawStakeAccount
  }
}

export type ReallocValidatorListAccountsInstruction = {
  state: string
  adminAuthority: string
  validatorList: string
  rentFunds: string
  systemProgram: string
}

export type ReallocValidatorListInfo =
  solita.ReallocValidatorListInstructionArgs &
    ReallocValidatorListAccountsInstruction

export type RawReallocValidatorList = RawInstructionBase & {
  parsed: {
    info: ReallocValidatorListInfo
    type: InstructionType.ReallocValidatorList
  }
}

export type ReallocStakeListAccountsInstruction = {
  state: string
  adminAuthority: string
  stakeList: string
  rentFunds: string
  systemProgram: string
}

export type ReallocStakeListInfo = solita.ReallocStakeListInstructionArgs &
  ReallocStakeListAccountsInstruction

export type RawReallocStakeList = RawInstructionBase & {
  parsed: {
    info: ReallocStakeListInfo
    type: InstructionType.ReallocStakeList
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
  | ConfigLpInfo
  | ConfigMarinadeInfo
  | OrderUnstakeInfo
  | ClaimInfo
  | StakeReserveInfo
  | UpdateActiveInfo
  | UpdateDeactivatedInfo
  | DeactivateStakeInfo
  | EmergencyUnstakeInfo
  | PartialUnstakeInfo
  | MergeStakesInfo
  | RedelegateInfo
  | PauseInfo
  | ResumeInfo
  | WithdrawStakeAccountInfo
  | ReallocValidatorListInfo
  | ReallocStakeListInfo

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
  | RawConfigLp
  | RawConfigMarinade
  | RawOrderUnstake
  | RawClaim
  | RawStakeReserve
  | RawUpdateActive
  | RawUpdateDeactivated
  | RawDeactivateStake
  | RawEmergencyUnstake
  | RawPartialUnstake
  | RawMergeStakes
  | RawRedelegate
  | RawPause
  | RawResume
  | RawWithdrawStakeAccount
  | RawReallocValidatorList
  | RawReallocStakeList

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

export type ConfigLpEvent = EventBase<InstructionType> & {
  info: ConfigLpInfo
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

export type PartialUnstakeEvent = EventBase<InstructionType> & {
  info: PartialUnstakeInfo
  signer: string
  account: string
}

export type MergeStakesEvent = EventBase<InstructionType> & {
  info: MergeStakesInfo
  signer: string
  account: string
}

export type RedelegateEvent = EventBase<InstructionType> & {
  info: RedelegateInfo
  signer: string
  account: string
}

export type PauseEvent = EventBase<InstructionType> & {
  info: PauseInfo
  signer: string
  account: string
}

export type ResumeEvent = EventBase<InstructionType> & {
  info: ResumeInfo
  signer: string
  account: string
}

export type WithdrawStakeAccountEvent = EventBase<InstructionType> & {
  info: WithdrawStakeAccountInfo
  signer: string
  account: string
}

export type ReallocValidatorListEvent = EventBase<InstructionType> & {
  info: ReallocValidatorListInfo
  signer: string
  account: string
}

export type ReallocStakeListEvent = EventBase<InstructionType> & {
  info: ReallocStakeListInfo
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
  | ConfigLpEvent
  | ConfigMarinadeEvent
  | OrderUnstakeEvent
  | ClaimEvent
  | StakeReserveEvent
  | UpdateActiveEvent
  | UpdateDeactivatedEvent
  | DeactivateStakeEvent
  | EmergencyUnstakeEvent
  | PartialUnstakeEvent
  | MergeStakesEvent
  | RedelegateEvent
  | PauseEvent
  | ResumeEvent
  | WithdrawStakeAccountEvent
  | ReallocValidatorListEvent
  | ReallocStakeListEvent
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
    Buffer.from(solita.configLpInstructionDiscriminator).toString('ascii'),
    InstructionType.ConfigLp,
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
    Buffer.from(solita.partialUnstakeInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.PartialUnstake,
  ],
  [
    Buffer.from(solita.mergeStakesInstructionDiscriminator).toString('ascii'),
    InstructionType.MergeStakes,
  ],
  [
    Buffer.from(solita.redelegateInstructionDiscriminator).toString('ascii'),
    InstructionType.Redelegate,
  ],
  [
    Buffer.from(solita.pauseInstructionDiscriminator).toString('ascii'),
    InstructionType.Pause,
  ],
  [
    Buffer.from(solita.resumeInstructionDiscriminator).toString('ascii'),
    InstructionType.Resume,
  ],
  [
    Buffer.from(solita.withdrawStakeAccountInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.WithdrawStakeAccount,
  ],
  [
    Buffer.from(solita.reallocValidatorListInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.ReallocValidatorList,
  ],
  [
    Buffer.from(solita.reallocStakeListInstructionDiscriminator).toString(
      'ascii',
    ),
    InstructionType.ReallocStakeList,
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
  [InstructionType.ConfigLp]: solita.configLpStruct,
  [InstructionType.ConfigMarinade]: solita.configMarinadeStruct,
  [InstructionType.OrderUnstake]: solita.orderUnstakeStruct,
  [InstructionType.Claim]: solita.claimStruct,
  [InstructionType.StakeReserve]: solita.stakeReserveStruct,
  [InstructionType.UpdateActive]: solita.updateActiveStruct,
  [InstructionType.UpdateDeactivated]: solita.updateDeactivatedStruct,
  [InstructionType.DeactivateStake]: solita.deactivateStakeStruct,
  [InstructionType.EmergencyUnstake]: solita.emergencyUnstakeStruct,
  [InstructionType.PartialUnstake]: solita.partialUnstakeStruct,
  [InstructionType.MergeStakes]: solita.mergeStakesStruct,
  [InstructionType.Redelegate]: solita.redelegateStruct,
  [InstructionType.Pause]: solita.pauseStruct,
  [InstructionType.Resume]: solita.resumeStruct,
  [InstructionType.WithdrawStakeAccount]: solita.withdrawStakeAccountStruct,
  [InstructionType.ReallocValidatorList]: solita.reallocValidatorListStruct,
  [InstructionType.ReallocStakeList]: solita.reallocStakeListStruct,
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
  [InstructionType.ConfigLp]: solita.ConfigLpAccounts,
  [InstructionType.ConfigMarinade]: solita.ConfigMarinadeAccounts,
  [InstructionType.OrderUnstake]: solita.OrderUnstakeAccounts,
  [InstructionType.Claim]: solita.ClaimAccounts,
  [InstructionType.StakeReserve]: solita.StakeReserveAccounts,
  [InstructionType.UpdateActive]: solita.UpdateActiveAccounts,
  [InstructionType.UpdateDeactivated]: solita.UpdateDeactivatedAccounts,
  [InstructionType.DeactivateStake]: solita.DeactivateStakeAccounts,
  [InstructionType.EmergencyUnstake]: solita.EmergencyUnstakeAccounts,
  [InstructionType.PartialUnstake]: solita.PartialUnstakeAccounts,
  [InstructionType.MergeStakes]: solita.MergeStakesAccounts,
  [InstructionType.Redelegate]: solita.RedelegateAccounts,
  [InstructionType.Pause]: solita.PauseAccounts,
  [InstructionType.Resume]: solita.ResumeAccounts,
  [InstructionType.WithdrawStakeAccount]: solita.WithdrawStakeAccountAccounts,
  [InstructionType.ReallocValidatorList]: solita.ReallocValidatorListAccounts,
  [InstructionType.ReallocStakeList]: solita.ReallocStakeListAccounts,
}
