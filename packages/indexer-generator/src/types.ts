import {
  IdlInstructionArg,
  IdlDataEnumVariantWithNamedFields,
  IdlField,
} from '@metaplex-foundation/solita'

export enum TemplateType {
  Types = 'types',
  Instructions = 'instructions',
  Events = 'events',
  Accounts = 'accounts',
}

// -------------------- VIEW --------------------
export type ViewPrimitive =
  | 'boolean'
  | 'number'
  | 'BN'
  | 'string'
  | 'PublicKey'
  | 'Buffer'

export type ViewField = {
  name: string
  type: ViewPrimitive | string
  rustType: string
  graphqlType: string
  optional: boolean
  multiple: boolean
  length?: number
}

export type ViewEnum = {
  name: string
  variants: string[]
}

export type ViewStruct = {
  name: string
  fields: ViewField[]
}

export type ViewTypes = {
  enums: ViewEnum[]
  types: ViewStruct[]
}

export type ViewAccount = {
  name: string
  multiple: boolean
}

export type ViewInstruction = {
  name: string
  code: number
  accounts: ViewAccount[]
  args: ParsedInstructionArg[]
}

export type ArgsImports = {
  otherImports: string[] // pubkey & bn
  definedImports: string[]
}

export type ParsedInstructionArg = IdlInstructionArg & {
  graphQLType: string
  tsType: string | undefined
}

export type ViewInstructions = {
  instructions: ViewInstruction[]
  imports: ArgsImports
}

export type ViewEvent = ViewStruct

export type ViewEvents = {
  typeImports: string[]
  events: ViewStruct[]
}

export type ViewAccounts = _ViewAccount[]

export type _ViewAccount = {
  name: string
  data: ViewStruct
}

export type EnumVariant = Omit<IdlDataEnumVariantWithNamedFields, 'fields'> & {
  fields?: IdlField[]
}
