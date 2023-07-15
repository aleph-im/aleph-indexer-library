import { ViewInstructions, ViewAccounts } from './types.js'

export function renderLayoutsFiles(
  filename: string,
  instructionsView: ViewInstructions | undefined,
  accountsView: ViewAccounts | undefined,
): [string, string][] {
  const NAME = filename.toUpperCase().replace(/-/g, "_");
  const name = filename.toLowerCase();
  let files: [string, string][] = [];

  if (accountsView && accountsView.length > 0) {
    files.push(renderAccountLayouts(accountsView));
  }

  if (instructionsView && instructionsView.instructions.length > 0) {
    files.push(renderIxLayouts(instructionsView));
  }

  files.push(renderIndexLayouts(accountsView));
  files.push(renderLayoutLayouts(name, NAME));

  return files;
}

function renderAccountLayouts(accountsView: ViewAccounts): [string, string] {
  let accountLayouts = ''

  if (accountsView && accountsView.length > 0) {
    accountLayouts = `import {
`

    for (const account of accountsView) {
      accountLayouts += `  ${account.name
        .charAt(0)
        .toLowerCase()
        .concat(account.name.slice(1))}Discriminator,
  ${account.name.charAt(0).toLowerCase().concat(account.name.slice(1))}Beet,
`
    }
    accountLayouts += `} from './solita/index.js'

export enum AccountType {
        `
    for (const account of accountsView) {
      accountLayouts += `   ${account.name} = '${account.name}',
`
    }
    accountLayouts += `}

export const ACCOUNT_DISCRIMINATOR: Record<AccountType, Buffer> = {
`
    for (const account of accountsView) {
      accountLayouts += `   [AccountType.${
        account.name
      }]: Buffer.from(${account.name
        .charAt(0)
        .toLowerCase()
        .concat(account.name.slice(1))}Discriminator),
`
    }
    accountLayouts += `}

export const ACCOUNTS_DATA_LAYOUT: Record<
    AccountType,
    any
> = {
`
    for (const account of accountsView) {
      accountLayouts += `   [AccountType.${account.name}]: ${account.name
        .charAt(0)
        .toLowerCase()
        .concat(account.name.slice(1))}Beet,
`
    }
    accountLayouts += `}`
  }
  return ['accounts', accountLayouts];
}

function renderIxLayouts(instructionsView: ViewInstructions): [string, string] {
  let ixLayouts = ''
  if (instructionsView && instructionsView.instructions.length > 0) {
    ixLayouts += `import { EventBase } from '@aleph-indexer/framework'
import * as solita from './solita/index.js'
`
    for (const otherImport of instructionsView.imports.otherImports) {
      if (isBN(otherImport))
        ixLayouts += `import { PublicKey } from '@solana/web3.js'
`
      if (isPubkey(otherImport))
        ixLayouts += `import BN from 'bn.js'
`
    }

    ixLayouts += `
export enum InstructionType { 
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   ${instruction.name} = '${instruction.name}Event',
`
    }
    ixLayouts += `}

export type InstructionBase = EventBase<InstructionType> & {
        programId: string
        signer: string
        account: string
}

/*-----------------------* CUSTOM EVENTS TYPES *-----------------------*/

`
    for (const instruction of instructionsView.instructions) {
      let definedData = false

      if (instruction.args.length > 0) {
        for (const arg of instruction.args) {
          for (const definedImport of instructionsView.imports.definedImports) {
            if (arg.tsType === definedImport) definedData = true
          }
        }
        if (definedData) {
          ixLayouts += `

export type ${instruction.name}Info = {`
          if (instruction.args.length > 0) {
            if (instruction.args.length === 1) {
              ixLayouts += ` 
        data: solita.${instruction.args[0].tsType}
`
            } else {
              ixLayouts += ` 
        data: solita.${instruction.name}InstructionArgs
`
            }
          }
          if (instruction.accounts.length > 0) {
            ixLayouts += `accounts: solita.${instruction.name}InstructionAccounts
`
          }

          ixLayouts += `}`
        } else {
          ixLayouts += `export type ${instruction.name}EventData = {`
          for (const arg of instruction.args) {
            ixLayouts += ` 
        ${arg.name}: ${arg.tsType}`
          }
          ixLayouts += `}

export type ${instruction.name}Info = {
        data: ${instruction.name}EventData
`

          if (instruction.accounts.length > 0) {
            ixLayouts += `accounts: solita.${instruction.name}InstructionAccounts
`
          }

          ixLayouts += `}`
        }
      } else {
        ixLayouts += `

export type ${instruction.name}Info = {
`
        if (instruction.accounts.length > 0) {
          ixLayouts += `accounts: solita.${instruction.name}InstructionAccounts
`
        }
        ixLayouts += `}`
      }
      ixLayouts += `

export type ${instruction.name}Event = InstructionBase &
        ${instruction.name}Info & {
                type: InstructionType.${instruction.name}
        }

/*----------------------------------------------------------------------*/

`
    }

    ixLayouts += `
export function getInstructionType(data: Buffer): InstructionType | undefined {
  const discriminator = data.slice(0, 8)
  return IX_METHOD_CODE.get(discriminator.toString('ascii'))
}

export const IX_METHOD_CODE: Map<string, InstructionType | undefined > = 
  new Map<string, InstructionType | undefined >([
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   [Buffer.from(solita.${instruction.name
        .charAt(0)
        .toLowerCase()
        .concat(
          instruction.name.slice(1),
        )}InstructionDiscriminator).toString('ascii'), InstructionType.${
        instruction.name
      }],
`
    }
    ixLayouts += `
])
export const IX_DATA_LAYOUT: Partial<Record<InstructionType, any>> = {
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   [InstructionType.${
        instruction.name
      }]: solita.${instruction.name
        .charAt(0)
        .toLowerCase()
        .concat(instruction.name.slice(1))}Struct,
`
    }

    ixLayouts += `}

export const IX_ACCOUNTS_LAYOUT: Partial<Record<InstructionType, any>> = {
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   [InstructionType.${instruction.name}]: solita.${instruction.name}Accounts,
`
    }

    ixLayouts += `}
    
export type ParsedEventsInfo = 
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   | ${instruction.name}Info
`
    }

    ixLayouts += `       
export type ParsedEvents = 
`
    for (const instruction of instructionsView.instructions) {
      ixLayouts += `   | ${instruction.name}Event
`
    }
  }
  return ['instructions', ixLayouts];
}

function renderIndexLayouts(accountsView: ViewAccounts | undefined): [string, string] {
  let indexLayouts = `export * from './instructions.js'
export * from './solita/index.js'
`;
  if (accountsView) indexLayouts += `export * from './accounts.js'`;
  return ['index', indexLayouts];
}

function renderLayoutLayouts(name: string, NAME: string): [string, string] {
  const content = `import { ${NAME}_PROGRAM_ID } from '../../constants.js'
  import { ACCOUNTS_DATA_LAYOUT } from './accounts.js'
  import {
    InstructionType,
    IX_DATA_LAYOUT,
    getInstructionType,
    IX_ACCOUNTS_LAYOUT,
  } from './instructions.js'

  export default {
    [${NAME}_PROGRAM_ID]: {
      name: '${name}',
      programID: ${NAME}_PROGRAM_ID,
      accountLayoutMap: IX_ACCOUNTS_LAYOUT,
      dataLayoutMap: IX_DATA_LAYOUT,
      accountDataLayoutMap: ACCOUNTS_DATA_LAYOUT,
      eventType: InstructionType,
      getInstructionType,
    },
  }`;
  return ['layout', content];
}

function isPubkey(type: string): boolean {
  return type === 'PublicKey';
}
function isBN(type: string): boolean {
  return type === 'BN';
}