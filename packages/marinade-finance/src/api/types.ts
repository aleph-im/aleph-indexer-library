import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInterfaceType,
  GraphQLUnionType,
} from 'graphql'
import { GraphQLBigNumber, GraphQLLong, GraphQLJSON } from '@aleph-indexer/core'
import { InstructionType } from '../utils/layouts/index.js'

// ------------------- TYPES ---------------------------

export const SplitStakeAccountInfo = new GraphQLObjectType({
  name: 'SplitStakeAccountInfo',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    index: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const U64ValueChange = new GraphQLObjectType({
  name: 'U64ValueChange',
  fields: {
    old: { type: new GraphQLNonNull(GraphQLBigNumber) },
    new: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})
export const U32ValueChange = new GraphQLObjectType({
  name: 'U32ValueChange',
  fields: {
    old: { type: new GraphQLNonNull(GraphQLInt) },
    new: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const Fee = new GraphQLObjectType({
  name: 'Fee',
  fields: {
    basisPoints: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const FeeCents = new GraphQLObjectType({
  name: 'FeeCents',
  fields: {
    bpCents: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const PubkeyValueChange = new GraphQLObjectType({
  name: 'PubkeyValueChange',
  fields: {
    old: { type: new GraphQLNonNull(GraphQLString) },
    new: { type: new GraphQLNonNull(GraphQLString) },
  },
})
export const BoolValueChange = new GraphQLObjectType({
  name: 'BoolValueChange',
  fields: {
    old: { type: new GraphQLNonNull(GraphQLBoolean) },
    new: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
})
export const ChangeAuthorityData = new GraphQLObjectType({
  name: 'ChangeAuthorityData',
  fields: {
    admin: { type: new GraphQLNonNull(GraphQLString) },
    validatorManager: { type: new GraphQLNonNull(GraphQLString) },
    operationalSolAccount: { type: new GraphQLNonNull(GraphQLString) },
    treasuryMsolAccount: { type: new GraphQLNonNull(GraphQLString) },
    pauseAuthority: { type: new GraphQLNonNull(GraphQLString) },
  },
})
export const ConfigLpParams = new GraphQLObjectType({
  name: 'ConfigLpParams',
  fields: {
    minFee: { type: new GraphQLNonNull(Fee) },
    maxFee: { type: new GraphQLNonNull(Fee) },
    liquidityTarget: { type: new GraphQLNonNull(GraphQLBigNumber) },
    treasuryCut: { type: new GraphQLNonNull(Fee) },
  },
})
export const ConfigMarinadeParams = new GraphQLObjectType({
  name: 'ConfigMarinadeParams',
  fields: {
    rewardsFee: { type: new GraphQLNonNull(Fee) },
    slotsForStakeDelta: { type: new GraphQLNonNull(GraphQLBigNumber) },
    minStake: { type: new GraphQLNonNull(GraphQLBigNumber) },
    minDeposit: { type: new GraphQLNonNull(GraphQLBigNumber) },
    minWithdraw: { type: new GraphQLNonNull(GraphQLBigNumber) },
    stakingSolCap: { type: new GraphQLNonNull(GraphQLBigNumber) },
    liquiditySolCap: { type: new GraphQLNonNull(GraphQLBigNumber) },
    withdrawStakeAccountEnabled: { type: new GraphQLNonNull(GraphQLBoolean) },
    delayedUnstakeFee: { type: new GraphQLNonNull(FeeCents) },
    withdrawStakeAccountFee: { type: new GraphQLNonNull(FeeCents) },
    maxStakeMovedPerEpoch: { type: new GraphQLNonNull(Fee) },
  },
})
export const LiqPoolInitializeData = new GraphQLObjectType({
  name: 'LiqPoolInitializeData',
  fields: {
    lpLiquidityTarget: { type: new GraphQLNonNull(GraphQLBigNumber) },
    lpMaxFee: { type: new GraphQLNonNull(Fee) },
    lpMinFee: { type: new GraphQLNonNull(Fee) },
    lpTreasuryCut: { type: new GraphQLNonNull(Fee) },
  },
})
export const InitializeData = new GraphQLObjectType({
  name: 'InitializeData',
  fields: {
    adminAuthority: { type: new GraphQLNonNull(GraphQLString) },
    validatorManagerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    minStake: { type: new GraphQLNonNull(GraphQLBigNumber) },
    rewardsFee: { type: new GraphQLNonNull(Fee) },
    liqPool: { type: new GraphQLNonNull(LiqPoolInitializeData) },
    additionalStakeRecordSpace: { type: new GraphQLNonNull(GraphQLInt) },
    additionalValidatorRecordSpace: { type: new GraphQLNonNull(GraphQLInt) },
    slotsForStakeDelta: { type: new GraphQLNonNull(GraphQLBigNumber) },
    pauseAuthority: { type: new GraphQLNonNull(GraphQLString) },
  },
})
export const FeeValueChange = new GraphQLObjectType({
  name: 'FeeValueChange',
  fields: {
    old: { type: new GraphQLNonNull(Fee) },
    new: { type: new GraphQLNonNull(Fee) },
  },
})
export const FeeCentsValueChange = new GraphQLObjectType({
  name: 'FeeCentsValueChange',
  fields: {
    old: { type: new GraphQLNonNull(FeeCents) },
    new: { type: new GraphQLNonNull(FeeCents) },
  },
})
export const LiqPool = new GraphQLObjectType({
  name: 'LiqPool',
  fields: {
    lpMint: { type: new GraphQLNonNull(GraphQLString) },
    lpMintAuthorityBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
    solLegBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
    msolLegAuthorityBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
    msolLeg: { type: new GraphQLNonNull(GraphQLString) },
    lpLiquidityTarget: { type: new GraphQLNonNull(GraphQLBigNumber) },
    lpMaxFee: { type: new GraphQLNonNull(Fee) },
    lpMinFee: { type: new GraphQLNonNull(Fee) },
    treasuryCut: { type: new GraphQLNonNull(Fee) },
    lpSupply: { type: new GraphQLNonNull(GraphQLBigNumber) },
    lentFromSolLeg: { type: new GraphQLNonNull(GraphQLBigNumber) },
    liquiditySolCap: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})
export const List = new GraphQLObjectType({
  name: 'List',
  fields: {
    account: { type: new GraphQLNonNull(GraphQLString) },
    itemSize: { type: new GraphQLNonNull(GraphQLInt) },
    count: { type: new GraphQLNonNull(GraphQLInt) },
    reserved1: { type: new GraphQLNonNull(GraphQLString) },
    reserved2: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const StakeRecord = new GraphQLObjectType({
  name: 'StakeRecord',
  fields: {
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    lastUpdateDelegatedLamports: { type: new GraphQLNonNull(GraphQLBigNumber) },
    lastUpdateEpoch: { type: new GraphQLNonNull(GraphQLBigNumber) },
    isEmergencyUnstaking: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const StakeSystem = new GraphQLObjectType({
  name: 'StakeSystem',
  fields: {
    stakeList: { type: new GraphQLNonNull(List) },
    delayedUnstakeCoolingDown: { type: new GraphQLNonNull(GraphQLBigNumber) },
    stakeDepositBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
    stakeWithdrawBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
    slotsForStakeDelta: { type: new GraphQLNonNull(GraphQLBigNumber) },
    lastStakeDeltaEpoch: { type: new GraphQLNonNull(GraphQLBigNumber) },
    minStake: { type: new GraphQLNonNull(GraphQLBigNumber) },
    extraStakeDeltaRuns: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const ValidatorRecord = new GraphQLObjectType({
  name: 'ValidatorRecord',
  fields: {
    validatorAccount: { type: new GraphQLNonNull(GraphQLString) },
    activeBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    score: { type: new GraphQLNonNull(GraphQLInt) },
    lastStakeDeltaEpoch: { type: new GraphQLNonNull(GraphQLBigNumber) },
    duplicationFlagBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
  },
})
export const ValidatorSystem = new GraphQLObjectType({
  name: 'ValidatorSystem',
  fields: {
    validatorList: { type: new GraphQLNonNull(List) },
    managerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    totalValidatorScore: { type: new GraphQLNonNull(GraphQLInt) },
    totalActiveBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    autoAddValidatorEnabled: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

// ------------------- STATS ---------------------------

export const AccessTimeStats = new GraphQLObjectType({
  name: 'AccessTimeStats',
  fields: {
    accesses: { type: new GraphQLNonNull(GraphQLInt) },
    accessesByProgramId: { type: new GraphQLNonNull(GraphQLJSON) },
    startTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
    endTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
  },
})

export const TotalAccounts = new GraphQLObjectType({
  name: 'TotalAccounts',
  fields: {
    TicketAccountData: { type: new GraphQLNonNull(GraphQLInt) },
    State: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const GlobalStats = new GraphQLObjectType({
  name: 'GlobalStats',
  fields: {
    totalAccounts: { type: new GraphQLNonNull(TotalAccounts) },
    totalAccesses: { type: new GraphQLNonNull(GraphQLInt) },
    totalAccessesByProgramId: { type: new GraphQLNonNull(GraphQLJSON) },
    startTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
    endTimestamp: { type: new GraphQLNonNull(GraphQLLong) },
  },
})

export const Stats = new GraphQLObjectType({
  name: 'Stats',
  fields: {
    last1h: { type: AccessTimeStats },
    last24h: { type: AccessTimeStats },
    last7d: { type: AccessTimeStats },
    total: { type: AccessTimeStats },
  },
})

// ------------------- ACCOUNTS ---------------------------

export const AccountsEnum = new GraphQLEnumType({
  name: 'AccountsEnum',
  values: {
    TicketAccountData: { value: 'TicketAccountData' },
    State: { value: 'State' },
  },
})
export const TicketAccountDataData = new GraphQLObjectType({
  name: 'TicketAccountDataData',
  fields: {
    stateAddress: { type: new GraphQLNonNull(GraphQLString) },
    beneficiary: { type: new GraphQLNonNull(GraphQLString) },
    lamportsAmount: { type: new GraphQLNonNull(GraphQLBigNumber) },
    createdEpoch: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})
export const StateData = new GraphQLObjectType({
  name: 'StateData',
  fields: {
    msolMint: { type: new GraphQLNonNull(GraphQLString) },
    adminAuthority: { type: new GraphQLNonNull(GraphQLString) },
    operationalSolAccount: { type: new GraphQLNonNull(GraphQLString) },
    treasuryMsolAccount: { type: new GraphQLNonNull(GraphQLString) },
    reserveBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
    msolMintAuthorityBumpSeed: { type: new GraphQLNonNull(GraphQLInt) },
    rentExemptForTokenAcc: { type: new GraphQLNonNull(GraphQLBigNumber) },
    rewardFee: { type: new GraphQLNonNull(Fee) },
    stakeSystem: { type: new GraphQLNonNull(StakeSystem) },
    validatorSystem: { type: new GraphQLNonNull(ValidatorSystem) },
    liqPool: { type: new GraphQLNonNull(LiqPool) },
    availableReserveBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    msolSupply: { type: new GraphQLNonNull(GraphQLBigNumber) },
    msolPrice: { type: new GraphQLNonNull(GraphQLBigNumber) },
    circulatingTicketCount: { type: new GraphQLNonNull(GraphQLBigNumber) },
    circulatingTicketBalance: { type: new GraphQLNonNull(GraphQLBigNumber) },
    lentFromReserve: { type: new GraphQLNonNull(GraphQLBigNumber) },
    minDeposit: { type: new GraphQLNonNull(GraphQLBigNumber) },
    minWithdraw: { type: new GraphQLNonNull(GraphQLBigNumber) },
    stakingSolCap: { type: new GraphQLNonNull(GraphQLBigNumber) },
    emergencyCoolingDown: { type: new GraphQLNonNull(GraphQLBigNumber) },
    pauseAuthority: { type: new GraphQLNonNull(GraphQLString) },
    paused: { type: new GraphQLNonNull(GraphQLBoolean) },
    delayedUnstakeFee: { type: new GraphQLNonNull(FeeCents) },
    withdrawStakeAccountFee: { type: new GraphQLNonNull(FeeCents) },
    withdrawStakeAccountEnabled: { type: new GraphQLNonNull(GraphQLBoolean) },
    lastStakeMoveEpoch: { type: new GraphQLNonNull(GraphQLBigNumber) },
    stakeMoved: { type: new GraphQLNonNull(GraphQLBigNumber) },
    maxStakeMovedPerEpoch: { type: new GraphQLNonNull(Fee) },
  },
})
export const ParsedAccountsData = new GraphQLUnionType({
  name: 'ParsedAccountsData',
  types: [TicketAccountDataData, StateData],
  resolveType: (obj) => {
    // here is selected a unique property of each account to discriminate between types
    if (obj.createdEpoch) {
      return 'TicketAccountDataData'
    }
    if (obj.maxStakeMovedPerEpoch) {
      return 'StateData'
    }
  },
})

const commonAccountInfoFields = {
  name: { type: new GraphQLNonNull(GraphQLString) },
  programId: { type: new GraphQLNonNull(GraphQLString) },
  address: { type: new GraphQLNonNull(GraphQLString) },
  type: { type: new GraphQLNonNull(AccountsEnum) },
}

const Account = new GraphQLInterfaceType({
  name: 'Account',
  fields: {
    ...commonAccountInfoFields,
  },
})

export const AccountInfo = new GraphQLObjectType({
  name: 'AccountInfo',
  interfaces: [Account],
  fields: {
    ...commonAccountInfoFields,
    data: { type: new GraphQLNonNull(ParsedAccountsData) },
  },
})

export const AccountInfoList = new GraphQLList(AccountInfo)

// ------------------- EVENTS --------------------------

export const MarinadeFinanceEvent = new GraphQLEnumType({
  name: 'MarinadeFinanceEvent',
  values: {
    Initialize: { value: 'Initialize' },
    ChangeAuthority: { value: 'ChangeAuthority' },
    AddValidator: { value: 'AddValidator' },
    RemoveValidator: { value: 'RemoveValidator' },
    SetValidatorScore: { value: 'SetValidatorScore' },
    ConfigValidatorSystem: { value: 'ConfigValidatorSystem' },
    Deposit: { value: 'Deposit' },
    DepositStakeAccount: { value: 'DepositStakeAccount' },
    LiquidUnstake: { value: 'LiquidUnstake' },
    AddLiquidity: { value: 'AddLiquidity' },
    RemoveLiquidity: { value: 'RemoveLiquidity' },
    ConfigLp: { value: 'ConfigLp' },
    ConfigMarinade: { value: 'ConfigMarinade' },
    OrderUnstake: { value: 'OrderUnstake' },
    Claim: { value: 'Claim' },
    StakeReserve: { value: 'StakeReserve' },
    UpdateActive: { value: 'UpdateActive' },
    UpdateDeactivated: { value: 'UpdateDeactivated' },
    DeactivateStake: { value: 'DeactivateStake' },
    EmergencyUnstake: { value: 'EmergencyUnstake' },
    PartialUnstake: { value: 'PartialUnstake' },
    MergeStakes: { value: 'MergeStakes' },
    Redelegate: { value: 'Redelegate' },
    Pause: { value: 'Pause' },
    Resume: { value: 'Resume' },
    WithdrawStakeAccount: { value: 'WithdrawStakeAccount' },
    ReallocValidatorList: { value: 'ReallocValidatorList' },
    ReallocStakeList: { value: 'ReallocStakeList' },
  },
})

const commonEventFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  timestamp: { type: GraphQLLong },
  type: { type: new GraphQLNonNull(MarinadeFinanceEvent) },
  account: { type: new GraphQLNonNull(GraphQLString) },
  signer: { type: new GraphQLNonNull(GraphQLString) },
}

const Event = new GraphQLInterfaceType({
  name: 'Event',
  fields: {
    ...commonEventFields,
  },
})

/*-----------------------* CUSTOM EVENTS TYPES *-----------------------*/

export const InitializeInfo = new GraphQLObjectType({
  name: 'InitializeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    reservePda: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    msolMint: { type: new GraphQLNonNull(GraphQLString) },
    operationalSolAccount: { type: new GraphQLNonNull(GraphQLString) },
    liqPool: { type: new GraphQLNonNull(GraphQLString) },
    treasuryMsolAccount: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    data: { type: new GraphQLNonNull(InitializeData) },
  },
})

export const InitializeEvent = new GraphQLObjectType({
  name: 'InitializeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.Initialize,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(InitializeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ChangeAuthorityInfo = new GraphQLObjectType({
  name: 'ChangeAuthorityInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    adminAuthority: { type: new GraphQLNonNull(GraphQLString) },
    data: { type: new GraphQLNonNull(ChangeAuthorityData) },
  },
})

export const ChangeAuthorityEvent = new GraphQLObjectType({
  name: 'ChangeAuthorityEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.ChangeAuthority,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ChangeAuthorityInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const AddValidatorInfo = new GraphQLObjectType({
  name: 'AddValidatorInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    managerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    validatorVote: { type: new GraphQLNonNull(GraphQLString) },
    duplicationFlag: { type: new GraphQLNonNull(GraphQLString) },
    rentPayer: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    score: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const AddValidatorEvent = new GraphQLObjectType({
  name: 'AddValidatorEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.AddValidator,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(AddValidatorInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RemoveValidatorInfo = new GraphQLObjectType({
  name: 'RemoveValidatorInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    managerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    duplicationFlag: { type: new GraphQLNonNull(GraphQLString) },
    operationalSolAccount: { type: new GraphQLNonNull(GraphQLString) },
    index: { type: new GraphQLNonNull(GraphQLInt) },
    validatorVote: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const RemoveValidatorEvent = new GraphQLObjectType({
  name: 'RemoveValidatorEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.RemoveValidator,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RemoveValidatorInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const SetValidatorScoreInfo = new GraphQLObjectType({
  name: 'SetValidatorScoreInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    managerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    index: { type: new GraphQLNonNull(GraphQLInt) },
    validatorVote: { type: new GraphQLNonNull(GraphQLString) },
    score: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const SetValidatorScoreEvent = new GraphQLObjectType({
  name: 'SetValidatorScoreEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.SetValidatorScore,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(SetValidatorScoreInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ConfigValidatorSystemInfo = new GraphQLObjectType({
  name: 'ConfigValidatorSystemInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    managerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    extraRuns: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const ConfigValidatorSystemEvent = new GraphQLObjectType({
  name: 'ConfigValidatorSystemEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.ConfigValidatorSystem,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ConfigValidatorSystemInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const DepositInfo = new GraphQLObjectType({
  name: 'DepositInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    msolMint: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolSolLegPda: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolMsolLeg: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolMsolLegAuthority: { type: new GraphQLNonNull(GraphQLString) },
    reservePda: { type: new GraphQLNonNull(GraphQLString) },
    transferFrom: { type: new GraphQLNonNull(GraphQLString) },
    mintTo: { type: new GraphQLNonNull(GraphQLString) },
    msolMintAuthority: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    lamports: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const DepositEvent = new GraphQLObjectType({
  name: 'DepositEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.Deposit,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(DepositInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const DepositStakeAccountInfo = new GraphQLObjectType({
  name: 'DepositStakeAccountInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    stakeAuthority: { type: new GraphQLNonNull(GraphQLString) },
    duplicationFlag: { type: new GraphQLNonNull(GraphQLString) },
    rentPayer: { type: new GraphQLNonNull(GraphQLString) },
    msolMint: { type: new GraphQLNonNull(GraphQLString) },
    mintTo: { type: new GraphQLNonNull(GraphQLString) },
    msolMintAuthority: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const DepositStakeAccountEvent = new GraphQLObjectType({
  name: 'DepositStakeAccountEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.DepositStakeAccount,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(DepositStakeAccountInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const LiquidUnstakeInfo = new GraphQLObjectType({
  name: 'LiquidUnstakeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    msolMint: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolSolLegPda: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolMsolLeg: { type: new GraphQLNonNull(GraphQLString) },
    treasuryMsolAccount: { type: new GraphQLNonNull(GraphQLString) },
    getMsolFrom: { type: new GraphQLNonNull(GraphQLString) },
    getMsolFromAuthority: { type: new GraphQLNonNull(GraphQLString) },
    transferSolTo: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    msolAmount: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const LiquidUnstakeEvent = new GraphQLObjectType({
  name: 'LiquidUnstakeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.LiquidUnstake,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(LiquidUnstakeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const AddLiquidityInfo = new GraphQLObjectType({
  name: 'AddLiquidityInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    lpMint: { type: new GraphQLNonNull(GraphQLString) },
    lpMintAuthority: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolMsolLeg: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolSolLegPda: { type: new GraphQLNonNull(GraphQLString) },
    transferFrom: { type: new GraphQLNonNull(GraphQLString) },
    mintTo: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    lamports: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const AddLiquidityEvent = new GraphQLObjectType({
  name: 'AddLiquidityEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.AddLiquidity,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(AddLiquidityInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RemoveLiquidityInfo = new GraphQLObjectType({
  name: 'RemoveLiquidityInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    lpMint: { type: new GraphQLNonNull(GraphQLString) },
    burnFrom: { type: new GraphQLNonNull(GraphQLString) },
    burnFromAuthority: { type: new GraphQLNonNull(GraphQLString) },
    transferSolTo: { type: new GraphQLNonNull(GraphQLString) },
    transferMsolTo: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolSolLegPda: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolMsolLeg: { type: new GraphQLNonNull(GraphQLString) },
    liqPoolMsolLegAuthority: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokens: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const RemoveLiquidityEvent = new GraphQLObjectType({
  name: 'RemoveLiquidityEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.RemoveLiquidity,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RemoveLiquidityInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ConfigLpInfo = new GraphQLObjectType({
  name: 'ConfigLpInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    adminAuthority: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(ConfigLpParams) },
  },
})

export const ConfigLpEvent = new GraphQLObjectType({
  name: 'ConfigLpEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.ConfigLp,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ConfigLpInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ConfigMarinadeInfo = new GraphQLObjectType({
  name: 'ConfigMarinadeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    adminAuthority: { type: new GraphQLNonNull(GraphQLString) },
    params: { type: new GraphQLNonNull(ConfigMarinadeParams) },
  },
})

export const ConfigMarinadeEvent = new GraphQLObjectType({
  name: 'ConfigMarinadeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.ConfigMarinade,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ConfigMarinadeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const OrderUnstakeInfo = new GraphQLObjectType({
  name: 'OrderUnstakeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    msolMint: { type: new GraphQLNonNull(GraphQLString) },
    burnMsolFrom: { type: new GraphQLNonNull(GraphQLString) },
    burnMsolAuthority: { type: new GraphQLNonNull(GraphQLString) },
    newTicketAccount: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    msolAmount: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const OrderUnstakeEvent = new GraphQLObjectType({
  name: 'OrderUnstakeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.OrderUnstake,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(OrderUnstakeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ClaimInfo = new GraphQLObjectType({
  name: 'ClaimInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    reservePda: { type: new GraphQLNonNull(GraphQLString) },
    ticketAccount: { type: new GraphQLNonNull(GraphQLString) },
    transferSolTo: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const ClaimEvent = new GraphQLObjectType({
  name: 'ClaimEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.Claim,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ClaimInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const StakeReserveInfo = new GraphQLObjectType({
  name: 'StakeReserveInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    validatorVote: { type: new GraphQLNonNull(GraphQLString) },
    reservePda: { type: new GraphQLNonNull(GraphQLString) },
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    stakeDepositAuthority: { type: new GraphQLNonNull(GraphQLString) },
    rentPayer: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    epochSchedule: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    stakeHistory: { type: new GraphQLNonNull(GraphQLString) },
    stakeConfig: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const StakeReserveEvent = new GraphQLObjectType({
  name: 'StakeReserveEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.StakeReserve,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(StakeReserveInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const UpdateActiveInfo = new GraphQLObjectType({
  name: 'UpdateActiveInfo',
  fields: {
    common: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const UpdateActiveEvent = new GraphQLObjectType({
  name: 'UpdateActiveEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.UpdateActive,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(UpdateActiveInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const UpdateDeactivatedInfo = new GraphQLObjectType({
  name: 'UpdateDeactivatedInfo',
  fields: {
    common: { type: new GraphQLNonNull(GraphQLString) },
    operationalSolAccount: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const UpdateDeactivatedEvent = new GraphQLObjectType({
  name: 'UpdateDeactivatedEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.UpdateDeactivated,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(UpdateDeactivatedInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const DeactivateStakeInfo = new GraphQLObjectType({
  name: 'DeactivateStakeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    reservePda: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    stakeDepositAuthority: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeRentPayer: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    epochSchedule: { type: new GraphQLNonNull(GraphQLString) },
    stakeHistory: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const DeactivateStakeEvent = new GraphQLObjectType({
  name: 'DeactivateStakeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.DeactivateStake,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(DeactivateStakeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const EmergencyUnstakeInfo = new GraphQLObjectType({
  name: 'EmergencyUnstakeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    validatorManagerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    stakeDepositAuthority: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const EmergencyUnstakeEvent = new GraphQLObjectType({
  name: 'EmergencyUnstakeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.EmergencyUnstake,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(EmergencyUnstakeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const PartialUnstakeInfo = new GraphQLObjectType({
  name: 'PartialUnstakeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    validatorManagerAuthority: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    stakeDepositAuthority: { type: new GraphQLNonNull(GraphQLString) },
    reservePda: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeRentPayer: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    rent: { type: new GraphQLNonNull(GraphQLString) },
    stakeHistory: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
    desiredUnstakeAmount: { type: new GraphQLNonNull(GraphQLBigNumber) },
  },
})

export const PartialUnstakeEvent = new GraphQLObjectType({
  name: 'PartialUnstakeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.PartialUnstake,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(PartialUnstakeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const MergeStakesInfo = new GraphQLObjectType({
  name: 'MergeStakesInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    destinationStake: { type: new GraphQLNonNull(GraphQLString) },
    sourceStake: { type: new GraphQLNonNull(GraphQLString) },
    stakeDepositAuthority: { type: new GraphQLNonNull(GraphQLString) },
    stakeWithdrawAuthority: { type: new GraphQLNonNull(GraphQLString) },
    operationalSolAccount: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    stakeHistory: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    destinationStakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    sourceStakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const MergeStakesEvent = new GraphQLObjectType({
  name: 'MergeStakesEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.MergeStakes,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(MergeStakesInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const RedelegateInfo = new GraphQLObjectType({
  name: 'RedelegateInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    stakeDepositAuthority: { type: new GraphQLNonNull(GraphQLString) },
    reservePda: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeRentPayer: { type: new GraphQLNonNull(GraphQLString) },
    destValidatorAccount: { type: new GraphQLNonNull(GraphQLString) },
    redelegateStakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    stakeHistory: { type: new GraphQLNonNull(GraphQLString) },
    stakeConfig: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    sourceValidatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
    destValidatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const RedelegateEvent = new GraphQLObjectType({
  name: 'RedelegateEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.Redelegate,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(RedelegateInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const PauseInfo = new GraphQLObjectType({
  name: 'PauseInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    pauseAuthority: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const PauseEvent = new GraphQLObjectType({
  name: 'PauseEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.Pause,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(PauseInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ResumeInfo = new GraphQLObjectType({
  name: 'ResumeInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    pauseAuthority: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const ResumeEvent = new GraphQLObjectType({
  name: 'ResumeEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.Resume,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ResumeInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const WithdrawStakeAccountInfo = new GraphQLObjectType({
  name: 'WithdrawStakeAccountInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    msolMint: { type: new GraphQLNonNull(GraphQLString) },
    burnMsolFrom: { type: new GraphQLNonNull(GraphQLString) },
    burnMsolAuthority: { type: new GraphQLNonNull(GraphQLString) },
    treasuryMsolAccount: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    stakeWithdrawAuthority: { type: new GraphQLNonNull(GraphQLString) },
    stakeDepositAuthority: { type: new GraphQLNonNull(GraphQLString) },
    stakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeAccount: { type: new GraphQLNonNull(GraphQLString) },
    splitStakeRentPayer: { type: new GraphQLNonNull(GraphQLString) },
    clock: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    tokenProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeProgram: { type: new GraphQLNonNull(GraphQLString) },
    stakeIndex: { type: new GraphQLNonNull(GraphQLInt) },
    validatorIndex: { type: new GraphQLNonNull(GraphQLInt) },
    msolAmount: { type: new GraphQLNonNull(GraphQLBigNumber) },
    beneficiary: { type: new GraphQLNonNull(GraphQLString) },
  },
})

export const WithdrawStakeAccountEvent = new GraphQLObjectType({
  name: 'WithdrawStakeAccountEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.WithdrawStakeAccount,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(WithdrawStakeAccountInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ReallocValidatorListInfo = new GraphQLObjectType({
  name: 'ReallocValidatorListInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    adminAuthority: { type: new GraphQLNonNull(GraphQLString) },
    validatorList: { type: new GraphQLNonNull(GraphQLString) },
    rentFunds: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    capacity: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const ReallocValidatorListEvent = new GraphQLObjectType({
  name: 'ReallocValidatorListEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.ReallocValidatorList,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ReallocValidatorListInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const ReallocStakeListInfo = new GraphQLObjectType({
  name: 'ReallocStakeListInfo',
  fields: {
    state: { type: new GraphQLNonNull(GraphQLString) },
    adminAuthority: { type: new GraphQLNonNull(GraphQLString) },
    stakeList: { type: new GraphQLNonNull(GraphQLString) },
    rentFunds: { type: new GraphQLNonNull(GraphQLString) },
    systemProgram: { type: new GraphQLNonNull(GraphQLString) },
    capacity: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

export const ReallocStakeListEvent = new GraphQLObjectType({
  name: 'ReallocStakeListEvent',
  interfaces: [Event],
  isTypeOf: (item) => item.type === InstructionType.ReallocStakeList,
  fields: {
    ...commonEventFields,
    info: { type: new GraphQLNonNull(ReallocStakeListInfo) },
  },
})

/*----------------------------------------------------------------------*/

export const EventsList = new GraphQLList(Event)

// ------------------- QUERY ARGS ---------------------------

export const AccountEventsArgs = {
  account: { type: new GraphQLNonNull(GraphQLString) },
  types: { type: new GraphQLList(MarinadeFinanceEvent) },
  startDate: { type: GraphQLFloat },
  endDate: { type: GraphQLFloat },
  limit: { type: GraphQLInt },
  skip: { type: GraphQLInt },
  reverse: { type: GraphQLBoolean },
}

export const AccountsArgs = {
  types: { type: new GraphQLList(GraphQLString) },
  accounts: { type: new GraphQLList(GraphQLString) },
}

export const types = [
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
  ConfigLpEvent,
  ConfigMarinadeEvent,
  OrderUnstakeEvent,
  ClaimEvent,
  StakeReserveEvent,
  UpdateActiveEvent,
  UpdateDeactivatedEvent,
  DeactivateStakeEvent,
  EmergencyUnstakeEvent,
  PartialUnstakeEvent,
  MergeStakesEvent,
  RedelegateEvent,
  PauseEvent,
  ResumeEvent,
  WithdrawStakeAccountEvent,
  ReallocValidatorListEvent,
  ReallocStakeListEvent,
]
