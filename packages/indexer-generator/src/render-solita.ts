import { Paths } from './paths.js'
import { ViewAccounts, ViewInstructions, ViewTypes } from './types.js'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { format, Options } from 'prettier'
import { logError } from './utils/index.js'

export function renderSolitaMods(
  instructionsView: ViewInstructions | undefined,
  accountsView: ViewAccounts | undefined,
  typesView: ViewTypes | undefined,
  paths: Paths,
  DEFAULT_FORMAT_OPTS: Options,
): string {
  let files: string[] = []

  if (existsSync(paths.ixSolitaDir)) {
    files = readdirSync(paths.ixSolitaDir)
    for (const fileName of files) {
      let content = readFileSync(paths.ixSolitaDir + fileName).toString()
      let fromPos = content.indexOf("from '.")

      while (fromPos != -1) {
        const posToWrite = content.indexOf("'", fromPos + 7)
        content =
          content.substring(0, posToWrite) +
          '.js' +
          content.substring(posToWrite)
        fromPos = content.indexOf("from '.", posToWrite)
      }

      const lines = content.split('\n')
      for (const line of lines) {
        if (line.includes('wasAnEmptyDefinedType')) {
          const lineIndex = lines.indexOf(line)
          lines.splice(lineIndex, 1)
        }
      }
      content = lines.join('\n')

      try {
        writeFileSync(
          paths.ixSolitaFile(fileName),
          format(content, DEFAULT_FORMAT_OPTS),
        )
      } catch (err) {
        console.log(`Failed to format on solita/instructions folder`)
        logError(err)
      }
    }
  }

  if (existsSync(paths.accountSolitaDir)) {
    files = readdirSync(paths.accountSolitaDir)
    for (const fileName of files) {
      let content = readFileSync(paths.accountSolitaDir + fileName).toString()
      let fromPos = content.indexOf("from '.")

      while (fromPos != -1) {
        const posToWrite = content.indexOf("'", fromPos + 7)
        content =
          content.substring(0, posToWrite) +
          '.js' +
          content.substring(posToWrite)
        fromPos = content.indexOf("from '.", posToWrite)
      }

      try {
        writeFileSync(
          paths.accountSolitaFile(fileName),
          format(content, DEFAULT_FORMAT_OPTS),
        )
      } catch (err) {
        console.log(`Failed to format on solita/instructions folder`)
        logError(err)
      }
    }
  }

  if (existsSync(paths.typeSolitaDir)) {
    files = readdirSync(paths.typeSolitaDir)
    for (const fileName of files) {
      let content = readFileSync(paths.typeSolitaDir + fileName).toString()
      let fromPos = content.indexOf("from '.")

      while (fromPos != -1) {
        const posToWrite = content.indexOf("'", fromPos + 7)
        content =
          content.substring(0, posToWrite) +
          '.js' +
          content.substring(posToWrite)
        fromPos = content.indexOf("from '.", posToWrite)
      }

      try {
        writeFileSync(
          paths.typeSolitaFile(fileName),
          format(content, DEFAULT_FORMAT_OPTS),
        )
      } catch (err) {
        console.log(`Failed to format on solita/instructions folder`)
        logError(err)
      }
    }
  }

  if (existsSync(paths.errorSolitaDir)) {
    files = readdirSync(paths.errorSolitaDir)
    for (const fileName of files) {
      let content = readFileSync(paths.errorSolitaDir + fileName).toString()
      let fromPos = content.indexOf("from '.")

      while (fromPos != -1) {
        const posToWrite = content.indexOf("'", fromPos + 7)
        content =
          content.substring(0, posToWrite) +
          '.js' +
          content.substring(posToWrite)
        fromPos = content.indexOf("from '.", posToWrite)
      }

      try {
        writeFileSync(
          paths.errorSolitaFile(fileName),
          format(content, DEFAULT_FORMAT_OPTS),
        )
      } catch (err) {
        console.log(`Failed to format on solita/instructions folder`)
        logError(err)
      }
    }
  }

  let indexSolita = `
import { AccountMeta, PublicKey } from '@solana/web3.js'
`
  if (accountsView)
    indexSolita += `export * from './accounts/index.js'
`
  if (instructionsView)
    indexSolita += `export * from './instructions/index.js'
`
  if (typesView)
    indexSolita += `export * from './types/index.js'
`

  if (accountsView) {
    indexSolita += `
import {
`
    for (const account of accountsView) {
      indexSolita += ` ${account.name},
    ${account.name}Args,
`
    }
    indexSolita += `
} from './accounts/index.js'

`
  }
  if (typesView) {
    indexSolita += `import {
`
    for (const type of typesView.types) {
      indexSolita += ` ${type.name},
        `
    }

    for (const type of typesView.enums) {
      indexSolita += ` ${type.name},
        `
    }

    indexSolita += `
} from './types/index.js'
`
  }
  if (instructionsView) {
    for (const instruction of instructionsView.instructions) {
      indexSolita += `
export type ${instruction.name}Instruction = {
    programId: PublicKey
    keys: AccountMeta[]
    data: Buffer
}

export const ${instruction.name}Accounts = [`
      for (const account of instruction.accounts) {
        indexSolita += `
    '${account.name}',`
      }
      indexSolita += `]
`
    }
    indexSolita += `
export type ParsedInstructions =
`
    for (const instruction of instructionsView.instructions) {
      indexSolita += `
    | ${instruction.name}Instruction`
    }
  }
  if (accountsView) {
    indexSolita += `
export type ParsedAccounts =
`
    for (const account of accountsView) {
      indexSolita += `
            | ${account.name}`
    }

    indexSolita += `
        
export type ParsedAccountsData =
        `
    for (const account of accountsView) {
      indexSolita += `
            | ${account.name}Args`
    }
  }
  if (typesView) {
    indexSolita += `
        
export type ParsedTypes =
`
    for (const type of typesView.enums) {
      indexSolita += `
            | ${type.name}`
    }
    for (const type of typesView.types) {
      indexSolita += `
            | ${type.name}`
    }
  }
  return indexSolita
}
