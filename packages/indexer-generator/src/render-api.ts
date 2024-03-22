import {
  ViewAccounts,
  ViewInstructions,
  ViewTypes,
  ViewStruct,
} from './types.js'

export function renderApiFiles(
  Name: string,
  instructions: ViewInstructions | undefined,
  accounts: ViewAccounts | undefined,
  types: ViewTypes | undefined,
): [string, string][] {
  const files: [string, string][] = []

  files.push(['index', createIndexApi()])
  files.push(['resolvers', createResolversApi(Name)])
  files.push(['schema', createSchemaApi(Name)])
  if (accounts && instructions && types) {
    files.push(['types', createTypesApi(Name, accounts, instructions, types)])
  }

  return files
}

function createIndexApi(): string {
  return `export { default } from './schema.js'`
}

function createResolversApi(Name: string): string {
  return `import MainDomain from '../domain/main.js'
import {
  AccountType,
  ${Name}Event,
  InstructionType,
} from '../utils/layouts/index.js'
import {
  Global${Name}Stats,
  ${Name}AccountInfo,
  ${Name}AccountData,
} from '../types.js'

export type AccountsFilters = {
  types?: AccountType[]
  accounts?: string[]
  includeStats?: boolean
}

export type EventsFilters = {
  account: string
  types?: InstructionType[]
  startDate?: number
  endDate?: number
  limit?: number
  skip?: number
  reverse?: boolean
}

export type GlobalStatsFilters = AccountsFilters

export class APIResolvers {
  constructor(protected domain: MainDomain) {}

  async getAccounts(args: AccountsFilters): Promise<${Name}AccountInfo[]> {
    const acountsData = await this.filterAccounts(args)
    return acountsData.map(({ info, stats }) => ({ ...info, stats }))
  }

  async getAccountEvents(filters: EventsFilters): Promise<${Name}Event[]> {
    return await this.domain.getAccountEvents(filters)
  }

  public async getGlobalStats(args: GlobalStatsFilters): Promise<Global${Name}Stats> {
    const acountsData = await this.filterAccounts(args)
    const addresses = acountsData.map(({ info }) => info.address)

    return this.domain.getGlobalStats(addresses)
  }

  protected async filterAccounts({ 
    types, 
    accounts, 
    includeStats 
  }: AccountsFilters): Promise<${Name}AccountData[]> {
    const accountMap = await this.domain.getAccounts(includeStats)

    accounts =
      accounts ||
      Object.values(accountMap).map((account) => account.info.address)

    let accountsData = accounts
      .map((address) => accountMap[address])
      .filter((account) => !!account)

    if (types !== undefined) {
      accountsData = accountsData.filter(({ info }) => types!.includes(info.type))
    }

    return accountsData
  }
}`
}

function createSchemaApi(Name: string): string {
  return `import { GraphQLObjectType } from 'graphql'
import { IndexerAPISchema } from '@aleph-indexer/framework'
import * as Types from './types.js'
import {
  EventsFilters,
  GlobalStatsFilters,
  APIResolvers,
  AccountsFilters,
} from './resolvers.js'
import MainDomain from '../domain/main.js'

export default class APISchema extends IndexerAPISchema {
  constructor(
      protected domain: MainDomain,
      protected resolver: APIResolvers = new APIResolvers(domain),
  ) {
    super(domain, {
      types: Types.types,

      customTimeSeriesTypesMap: { access: Types.AccessTimeStats },
      customStatsType: Types.Stats,

      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          accounts: {
            type: Types.AccountInfoList,
            args: Types.AccountsArgs,
            resolve: (_, ctx, __, info) => {
              ctx.includeStats =
                  !!info.fieldNodes[0].selectionSet?.selections.find(
                      (item) =>
                          item.kind === 'Field' && item.name.value === 'stats',
                  )

              return this.resolver.getAccounts(ctx as AccountsFilters)
            },
          },

          events: {
            type: Types.EventsList,
            args: Types.AccountEventsArgs,
            resolve: (_, ctx) => this.resolver.getAccountEvents(ctx as EventsFilters),
          },

          globalStats: {
            type: Types.GlobalStats,
            args: Types.AccountsArgs,
            resolve: (_, ctx) =>
                resolver.getGlobalStats(ctx as GlobalStatsFilters),
          },
        },
      }),
    })
  }
}
`
}

function createTypesApi(
  Name: string,
  accounts: ViewAccounts,
  instructions: ViewInstructions,
  types: ViewTypes,
): string {
  // this function mutates types var to get the correct types order
  checkOrder(types)
  let apiTypes = `import {
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

`
  for (const type of types.enums) {
    apiTypes += `
export const ${type.name} = new GraphQLEnumType({
  name: '${type.name}',
  values: {`
    for (const field of type.variants) {
      apiTypes += `
    ${field}: { value: '${field}' },`
    }
    apiTypes += `
  },
})`
  }

  for (const type of types.types) {
    apiTypes += `
export const ${type.name} = new GraphQLObjectType({
  name: '${type.name}',
  fields: {`
    for (const field of type.fields) {
      apiTypes += `
    ${field.name}: { type: new GraphQLNonNull(${field.graphqlType}) },`
    }
    apiTypes += `
  },
})`
  }

  apiTypes += `
  
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
  fields: {`
  for (const account of accounts) {
    apiTypes += `
  ${account.name}: { type: new GraphQLNonNull(GraphQLInt) },`
  }
  apiTypes += `
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
  values: {`
  for (const account of accounts) {
    apiTypes += `
    ${account.name}: { value: '${account.name}' },`
  }
  apiTypes += `
  },
})`

  for (const account of accounts) {
    apiTypes += `
export const ${account.name}Data = new GraphQLObjectType({
  name: '${account.name}Data',
  fields: {`
    for (const field of account.data.fields) {
      apiTypes += `
    ${field.name}: { type: new GraphQLNonNull(${field.graphqlType}) },`
    }
    apiTypes += `
  },
})`
  }

  apiTypes += `
export const ParsedAccountsData = new GraphQLUnionType({
  name: "ParsedAccountsData",
  types: [`
  for (const account of accounts) {
    apiTypes += `
    ${account.name}Data, `
  }
  apiTypes += `
  ],
  resolveType: (obj) => {
    // here is selected a unique property of each account to discriminate between types`

  const uniqueAccountProperty: Record<string, string> = {}
  for (const account of accounts) {
    for (const field of account.data.fields) {
      let checksRequired = accounts.length - 1
      for (const _account of accounts) {
        if (_account.name == account.name) continue
        if (_account.data.fields.includes(field)) continue
        checksRequired--
      }
      if (checksRequired == 0) {
        uniqueAccountProperty[account.name] = field.name
      }
    }
  }

  for (const [account, field] of Object.entries(uniqueAccountProperty)) {
    apiTypes += `
    if(obj.${field}) {
        return '${account}Data'
    }`
  }

  apiTypes += `
  }
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

export const AccountsInfo = new GraphQLObjectType({
  name: 'AccountsInfo',
  interfaces: [Account],
  fields: {
    ...commonAccountInfoFields,
    data: { type: new GraphQLNonNull(ParsedAccountsData) },
  },
})

export const AccountInfoList = new GraphQLList(AccountsInfo)

// ------------------- EVENTS --------------------------
  
export const ${Name}Event = new GraphQLEnumType({
  name: '${Name}Event',
  values: {
`
  for (const instruction of instructions.instructions) {
    apiTypes += `
    ${instruction.name}: { value: '${instruction.name}' },`
  }

  apiTypes += `
  },
})

const commonEventFields = {
  id: { type: new GraphQLNonNull(GraphQLString) },
  timestamp: { type: GraphQLLong },
  type: { type: new GraphQLNonNull(${Name}Event) },
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
  
  `
  for (const instruction of instructions.instructions) {
    apiTypes += `export const ${instruction.name}Info = new GraphQLObjectType({
      name: '${instruction.name}Info',
      fields: {
  `
    if (instruction.accounts.length > 0) {
      for (const account of instruction.accounts) {
        apiTypes += `    ${account.name}: { type: new GraphQLNonNull(GraphQLString) },
  `
      }
    }
    if (instruction.args.length > 0) {
      for (const arg of instruction.args) {
        apiTypes += `    ${arg.name}: { type: new GraphQLNonNull(${arg.graphQLType}) },
  `
      }
    }
    apiTypes += `    },
    });
    
    export const ${instruction.name}Event = new GraphQLObjectType({
      name: '${instruction.name}Event',
      interfaces: [Event],
      isTypeOf: (item) => item.type === InstructionType.${instruction.name},
      fields: {
        ...commonEventFields,
        info: { type: new GraphQLNonNull(${instruction.name}Info)}
      },
    });
    
    /*----------------------------------------------------------------------*/
    
  `
  }
  apiTypes += `export const EventsList = new GraphQLList(Event)

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
  
  
  export const types = [`
  for (const instruction of instructions.instructions) {
    apiTypes += `   
    ${instruction.name}Event,`
  }
  apiTypes += `]
  `

  return apiTypes
}

function checkOrder(types: ViewTypes | undefined) {
  if (types) {
    modifyOrder(types)
  }
}

function modifyOrder(types: ViewTypes) {
  const alreadyIncluded: string[] = []
  const { nameTypes, auxTypes } = getTypesInfo(types)
  let modified = false

  for (const type of types.types) {
    if (type.name) {
      for (const field of type.fields) {
        if (
          nameTypes.includes(field.graphqlType) &&
          !alreadyIncluded.includes(field.graphqlType)
        ) {
          const upperIndex = nameTypes.indexOf(field.graphqlType)
          const lowerIndex = nameTypes.indexOf(type.name)

          types.types[upperIndex] = auxTypes[lowerIndex]
          types.types[lowerIndex] = auxTypes[upperIndex]

          alreadyIncluded.push(field.graphqlType)

          modified = true
          break
        }
      }
      alreadyIncluded.push(type.name)
    }
  }
  if (modified) modifyOrder(types)
}

function getTypesInfo(types: ViewTypes) {
  const nameTypes: string[] = []
  const auxTypes: ViewStruct[] = []

  for (const type of types.types) {
    if (type.name) {
      nameTypes.push(type.name)
      auxTypes.push(type)
    }
  }

  return { nameTypes, auxTypes }
}
