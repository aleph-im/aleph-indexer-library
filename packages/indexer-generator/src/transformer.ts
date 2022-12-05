import {
  ViewEnum,
  ViewField,
  ViewInstruction,
  ViewInstructions,
  ViewStruct,
  ViewTypes,
  _ViewAccount,
  ViewAccounts,
  ParsedInstructionArg,
  ArgsImports,
} from './types.js'
import {
  Idl,
  IdlField,
  IdlInstruction,
  IdlAccount,
  IdlType,
  IdlTypeArray,
  IdlTypeDefined,
  IdlTypeOption,
  IdlTypeVec,
  IdlDefinedTypeDefinition,
  IdlTypeEnum,
  IdlInstructionArg,
  IdlFieldsType,
} from '@metaplex-foundation/solita'
import { primitivesMap, primitivesMapGraphqQl } from './constants.js'

export default class IdlTransformer {
  constructor(
    protected idl: Idl,
    protected ignoreImports: Set<string> = new Set([
      'boolean',
      'number',
      'string',
      'BN',
      'PublicKey',
      'Buffer',
    ]),
  ) {}
  // ------------------------------------------
  // ----------------- PUBLIC -----------------
  // ------------------------------------------

  public generateViewInstructions(
    enumName = 'InstructionType',
  ): ViewInstructions {
    const idl = this.idl.instructions

    const eventTypeEnum: ViewEnum = {
      name: enumName,
      variants: [],
    }

    const instructions: ViewInstruction[] = []
    let code = 0
    const imports = this.getArgsImports(idl)

    for (const ix of idl) {
      const name = ix.name.slice(0, 1).toUpperCase() + ix.name.slice(1)
      eventTypeEnum.variants.push(name)
      const args = this.getParsedArgs(ix)
      instructions.push({
        name,
        code,
        accounts: ix.accounts.map((account) => {
          return {
            name: account.name,
            multiple: true, //!!(account as IdlAccounts).accounts
          }
        }),
        args,
      })
      code++
    }

    return { instructions, imports }
  }

  public generateViewTypes(idl?: IdlDefinedTypeDefinition[]): ViewTypes {
    if (idl === undefined) idl = this.idl.types as IdlDefinedTypeDefinition[]

    const typesNames: string[] = []
    const view: ViewTypes = {
      enums: [],
      types: [],
    }

    for (const type of idl) {
      if (type.type.kind === 'struct' && !typesNames.includes(type.name)) {
        view.types.push(this.toViewStruct(type))
        typesNames.push(type.name)
      }
      if (type.type.kind === 'enum' && !typesNames.includes(type.name)) {
        view.enums.push(this.toViewEnum(type))
        typesNames.push(type.name)
      }
    }

    return view
  }

  public generateViewAccounts(idl?: IdlAccount[]): ViewAccounts {
    if (idl === undefined) idl = this.idl.accounts as IdlAccount[]

    const accounts: _ViewAccount[] = []

    for (const account of idl) {
      const name =
        account.name.slice(0, 1).toUpperCase() + account.name.slice(1)
      const data = this.toViewStruct(account)

      accounts.push({
        name,
        data,
      })
    }

    return accounts
  }

  // ---------------------------------------------
  // ----------------- PROTECTED -----------------
  // ---------------------------------------------

  protected toTypeScriptType(type: IdlType): string | undefined {
    if (type === undefined) return undefined

    if (typeof type === 'string') {
      return primitivesMap[type]
    }
    // @note: Ascii encoded strings
    if (
      (type as IdlTypeArray).array &&
      (type as IdlTypeArray).array[0] === 'u8'
    )
      return 'string'

    return (
      (type as IdlTypeDefined).defined ??
      this.toTypeScriptType(
        (type as IdlTypeOption).option ??
          (type as IdlTypeVec).vec ??
          (type as IdlTypeArray).array[0],
      )
    )
  }

  protected getParsedArgs(ix: IdlInstruction): ParsedInstructionArg[] {
    const parsedArgs: ParsedInstructionArg[] = []
    if (ix.args) {
      for (const arg of ix.args) {
        const graphQLType = this.toGraphQLTypes(arg.type)
        const tsType = this.toTypeScriptType(arg.type)

        parsedArgs.push({
          ...arg,
          graphQLType: graphQLType,
          tsType: tsType,
        })
      }
    }

    return parsedArgs
  }

  protected getArgsImports(ixns: IdlInstruction[]): ArgsImports {
    const otherImports: string[] = []
    const definedImports: string[] = []

    for (const ix of ixns) {
      if (ix.args) {
        for (const arg of ix.args) {
          if (this.isPubkey(arg.type) || this.isBN(arg.type)) {
            const tsType = this.toTypeScriptType(arg.type)
            if (tsType && !otherImports.includes(tsType))
              otherImports.push(tsType)
          }
          if (this.isIdlDefined(arg.type)) {
            const tsType = this.toTypeScriptType(arg.type)
            if (tsType && !otherImports.includes(tsType))
              definedImports.push(tsType)
          }
        }
      }
    }

    const argsImports: ArgsImports = {
      otherImports,
      definedImports,
    }

    return argsImports
  }

  protected toGraphQLTypes(type: IdlType): string {
    if (type === undefined) return 'undefined'

    if (typeof type === 'string') {
      return primitivesMapGraphqQl[type]
    }
    // @note: Ascii encoded strings
    if (
      (type as IdlTypeArray).array &&
      (type as IdlTypeArray).array[0] === 'u8'
    )
      return 'GraphQLString'

    return (
      (type as IdlTypeDefined).defined ??
      this.toGraphQLTypes(
        (type as IdlTypeOption).option ??
          (type as IdlTypeVec).vec ??
          (type as IdlTypeArray).array[0],
      )
    )
  }

  protected toRustType(type: IdlType): string {
    let name = type as string
    let option = type as IdlTypeOption

    if ((type as IdlTypeArray).array) name = 'blob'
    if ((type as IdlTypeVec).vec) name = 'vec'
    if (this.isIdlTypeOption(type)) {
      option = (type as IdlTypeOption).option as IdlTypeOption
      if (this.isIdlDefined(option)) {
        name = (option as IdlTypeDefined).defined as string
      } else {
        name = (type as IdlTypeOption).option as string
      }
    }
    if (this.isIdlDefined(type)) name = (type as IdlTypeDefined).defined
    name = name.slice(0, 1).toLowerCase() + name.slice(1)
    return name
  }

  protected isIdlTypeOption(type: IdlType): type is IdlTypeOption {
    return (type as IdlTypeOption).option !== undefined
  }
  protected isIdlDefined(type: IdlType): type is IdlTypeDefined {
    return (type as IdlTypeDefined).defined !== undefined
  }
  protected isPubkey(type: IdlType): boolean {
    return type === 'publicKey'
  }
  protected isBN(type: IdlType): boolean {
    return (
      type === 'u64' ||
      type === 'u128' ||
      type === 'u256' ||
      type === 'u512' ||
      type === 'i64' ||
      type === 'i128' ||
      type === 'i256' ||
      type === 'i512'
    )
  }

  protected toViewField(field: IdlField): ViewField {
    return {
      name: field.name,
      type: this.toTypeScriptType(field.type) as string,
      rustType: this.toRustType(field.type),
      graphqlType: this.toGraphQLTypes(field.type),
      optional: !!(field.type as IdlTypeOption).option,
      multiple: !!(
        (field.type as IdlTypeVec).vec ?? (field.type as IdlTypeArray).array
      ),
      length: (field.type as IdlTypeArray).array
        ? (field.type as IdlTypeArray).array[1]
        : undefined,
    }
  }

  protected toViewStruct(
    type: IdlDefinedTypeDefinition | IdlAccount | IdlInstructionArg,
  ): ViewStruct {
    const viewFields: ViewField[] = []

    const fields =
      ((type as IdlDefinedTypeDefinition)?.type as IdlFieldsType)?.fields ??
      type

    for (const field of fields) viewFields.push(this.toViewField(field))

    return {
      name: type.name,
      fields: viewFields,
    }
  }

  protected toViewEnum(type: IdlDefinedTypeDefinition): ViewEnum {
    return {
      name: type.name,
      variants: (type.type as IdlTypeEnum).variants.map((value) => value.name),
    }
  }
}
