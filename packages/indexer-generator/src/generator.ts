import {
  Solita,
  Idl,
  IdlType,
  IdlTypeDefined,
  IdlInstructionArg,
  IdlDataEnumVariant,
  isIdlFieldsType,
  IdlField,
} from '@metaplex-foundation/solita'
import {
  TemplateType,
  EnumVariant,
  ViewInstructions,
  ViewAccounts,
  ViewTypes,
} from './types.js'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import IdlTransformer from './transformer.js'
import { Paths } from './paths.js'
import { renderRootFiles } from './render-root.js'
import { renderSrcFiles } from './render-src.js'
import { renderParsersFiles } from './render-parsers.js'
import { renderDALFiles } from './render-dal.js'
import { renderDomainFiles } from './render-domain.js'
import { renderLayoutsFiles } from './render-layouts.js'
import { format, Options } from 'prettier'
import { renderApiFiles } from './render-api.js'
import { logError } from './utils/index.js'
import { renderStatsFiles } from './render-stats.js'
import { renderSolitaMods } from './render-solita.js'

const DEFAULT_FORMAT_OPTS: Options = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  useTabs: false,
  tabWidth: 2,
  arrowParens: 'always',
  printWidth: 80,
  parser: 'typescript',
}

export default async function generate(
  idl: Idl,
  paths: Paths,
  toGenerate: TemplateType[],
  address?: string,
): Promise<void> {
  const Name = toCamelCase(idl.name)
  if (idl.metadata.address) {
    address = idl.metadata.address
  }
  processIdl(idl)

  const { typesView, instructionsView, accountsView } =
    generateFromTemplateType(idl, toGenerate)

  if (!accountsView || !instructionsView) {
    console.log(
      'Your idl needs instructions and accounts to fit this implementation',
    )
    process.exit(0)
  }

  writeFilesNoFormat(paths.projectDir, renderRootFiles(idl.name), (filename) =>
    paths.projectFile(filename),
  )
  writeFiles(
    paths.srcDir,
    renderSrcFiles(Name, idl.name, instructionsView, address),
    (filename) => paths.srcFile(filename),
  )
  writeFiles(
    paths.apiDir,
    renderApiFiles(Name, instructionsView, accountsView, typesView),
    (filename) => paths.apiFile(filename),
  )
  ensureDirExists(paths.utilsDir)
  await generateSolitaTypeScript(
    paths,
    idl,
    instructionsView,
    accountsView,
    typesView,
    DEFAULT_FORMAT_OPTS,
  )
  writeFiles(
    paths.layoutsDir,
    renderLayoutsFiles(Name, idl.name, instructionsView, accountsView),
    (filename) => paths.layoutsFile(filename),
  )
  writeFiles(paths.parsersDir, renderParsersFiles(Name), (filename) =>
    paths.parsersFile(filename),
  )
  writeFiles(paths.dalDir, renderDALFiles(Name, instructionsView), (filename) =>
    paths.dalFile(filename),
  )
  writeFiles(
    paths.domainDir,
    renderDomainFiles(Name, idl.name, accountsView),
    (filename) => paths.domainFile(filename),
  )
  writeFiles(paths.statsDir, renderStatsFiles(Name), (filename) =>
    paths.statsFile(filename),
  )
}

function writeFiles(
  dir: string,
  files: [string, string][],
  pathFunc: (filename: string) => string,
) {
  ensureDirExists(dir)
  files.forEach(([filename, content]) => {
    const filePath = pathFunc(filename)
    writeFileWithFormat(filePath, content, DEFAULT_FORMAT_OPTS)
  })
}

function writeFilesNoFormat(
  dir: string,
  files: [string, string][],
  pathFunc: (filename: string) => string,
) {
  ensureDirExists(dir)
  files.forEach(([filename, content]) => {
    const filePath = pathFunc(filename)
    try {
      writeFileSync(filePath, content)
    } catch (err) {
      console.log(`Failed to format ${filePath}`)
    }
  })
}

function writeFileWithFormat(
  path: string,
  content: string,
  formatOptions: Options,
): void {
  try {
    writeFileSync(path, format(content, formatOptions))
  } catch (err) {
    console.log(err)
    console.log(`Failed to format ${path}`)
  }
}

function ensureDirExists(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir)
}

function generateFromTemplateType(idl: Idl, toGenerate: TemplateType[]) {
  let typesView,
    instructionsView,
    accountsView = undefined
  for (const templateType of toGenerate) {
    switch (templateType) {
      case TemplateType.Types:
        if (idl.types) {
          const view = generateTypes(idl)
          typesView = view
        } else console.log('Missing IDL types')
        break

      case TemplateType.Instructions:
        if (idl.instructions) {
          const view = generateInstructions(idl)
          instructionsView = view
        } else console.log('Missing IDL instructions')
        break

      case TemplateType.Accounts:
        if (idl.accounts) {
          const view = generateAccounts(idl)
          accountsView = view
        } else console.log('Missing IDL accounts')
        break

      default:
        console.log(`template type ${templateType} not supported`)
    }
  }
  return { typesView, instructionsView, accountsView }
}

function generateTypes(idl: Idl) {
  const trafo = new IdlTransformer(idl)
  const view = trafo.generateViewTypes()
  return view
}

function generateInstructions(idl: Idl) {
  const trafo = new IdlTransformer(idl)
  const view = trafo.generateViewInstructions()
  return view
}

function generateAccounts(idl: Idl) {
  const trafo = new IdlTransformer(idl)
  const view = trafo.generateViewAccounts()
  return view
}

async function generateSolitaTypeScript(
  paths: Paths,
  idl: Idl,
  instructionsView: ViewInstructions,
  accountsView: ViewAccounts,
  typesView: ViewTypes | undefined,
  DEFAULT_FORMAT_OPTS: Options,
) {
  console.log('Generating TypeScript SDK to %s', paths.tsSolitaDir)

  const gen = new Solita(idl, { formatCode: true })
  await gen.renderAndWriteTo(paths.tsSolitaDir)

  const solitaFile = renderSolitaMods(
    instructionsView,
    accountsView,
    typesView,
    paths,
    DEFAULT_FORMAT_OPTS,
  )
  try {
    writeFileSync(
      paths.solitaFile('index'),
      format(solitaFile, DEFAULT_FORMAT_OPTS),
    )
  } catch (err) {
    console.log(`Failed to format on parser folder`)
    logError(err)
  }

  console.log('Success on TS generation!')
}

function toCamelCase(str: string) {
  const wordArr = str.split(/[-_]/g)
  let camelCase = ''
  for (const i in wordArr) {
    camelCase += wordArr[i].charAt(0).toUpperCase() + wordArr[i].slice(1)
  }
  return camelCase
}

function processIdl(idl: Idl) {
  if (idl.types) {
    for (const type of idl.types) {
      if (type.type.kind === 'struct' && type.type.fields.length === 0) {
        const index = idl.types.indexOf(type)
        idl.types.splice(index, 1)
        for (const ix of idl.instructions) {
          for (const arg of ix.args) {
            if (isIdlDefined(arg.type) && arg.type.defined === type.name) {
              const newArgs: IdlInstructionArg[] = []
              newArgs.push({
                name: 'wasAnEmptyDefinedType',
                type: 'u32',
              })
              ix.args = newArgs
            }
          }
        }
      }
      if (!isIdlFieldsType(type.type) && type.type.variants) {
        for (const variant of type.type.variants) {
          if (
            hasFields(variant) &&
            variant.fields &&
            isIdlDefined(variant.fields[0]) &&
            variant.fields[0].defined === 'bincode::Error'
          ) {
            delete variant.fields
          }
        }
      }
    }
  }
}

function isIdlDefined(type: IdlType | IdlField): type is IdlTypeDefined {
  return (type as IdlTypeDefined).defined !== undefined
}

function hasFields(type: IdlDataEnumVariant): type is EnumVariant {
  return (type as EnumVariant).fields !== undefined
}
