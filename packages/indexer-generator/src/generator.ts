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
import { TemplateType, EnumVariant } from './types.js'
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
import { renderDiscovererFiles } from './render-discoverer.js'
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

const JSON_FORMAT: Options = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  useTabs: false,
  tabWidth: 2,
  arrowParens: 'always',
  printWidth: 80,
  parser: 'json',
}

export default async function generate(
  idl: Idl,
  paths: Paths,
  toGenerate: TemplateType[],
  address?: string,
): Promise<void> {
  const Name = toCamelCase(idl.name)
  if (idl.metadata.address) address = idl.metadata.address
  processIdl(idl)

  const { typesView, instructionsView, accountsView } =
    generateFromTemplateType(idl, toGenerate)

  if (!accountsView) {
    console.log(
      'This implementation is only for those programs that use accounts',
    )
    process.exit(0)
  }

  if (!existsSync(paths.projectDir)) mkdirSync(paths.projectDir)

  const [docker, pkg, run, tsconfig, typesdts, cmd] = renderRootFiles(idl.name)
  writeFileSync(paths.projectFile('docker-compose.yaml'), docker)
  writeFileSync(paths.projectFile('package.json'), pkg)
  writeFileSync(paths.projectFile('run.ts'), run)
  writeFileSync(paths.projectFile('tsconfig.json'), tsconfig)
  writeFileSync(paths.projectFile('types.d.ts'), typesdts)
  writeFileSync(paths.projectFile('cmd.sh'), cmd)

  if (!existsSync(paths.srcDir)) mkdirSync(paths.srcDir)

  const [constants, types] = renderSrcFiles(
    Name,
    idl.name,
    instructionsView,
    address,
  )
  try {
    writeFileSync(
      paths.srcFile('constants'),
      format(constants, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(paths.srcFile('types'), format(types, DEFAULT_FORMAT_OPTS))
  } catch (err) {
    console.log(`Failed to format on src folder`)
    logError(err)
  }

  if (!existsSync(paths.apiDir)) mkdirSync(paths.apiDir)

  const [indexApi, resolversApi, schemaApi, apiTypes] = renderApiFiles(
    Name,
    instructionsView,
    accountsView,
    typesView,
  )
  try {
    writeFileSync(paths.apiFile('index'), format(indexApi, DEFAULT_FORMAT_OPTS))
    writeFileSync(
      paths.apiFile('resolvers'),
      format(resolversApi, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.apiFile('schema'),
      format(schemaApi, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(paths.apiFile('types'), format(apiTypes, DEFAULT_FORMAT_OPTS))
  } catch (err) {
    logError(`Failed to format on api folder`)
    logError(err)
  }

  if (!existsSync(paths.utilsDir)) mkdirSync(paths.utilsDir)
  if (!existsSync(paths.layoutsDir)) mkdirSync(paths.layoutsDir)
  if (!existsSync(paths.testsDir(paths.layoutsDir)))
    mkdirSync(paths.testsDir(paths.layoutsDir))
  if (!existsSync(paths.mockDir(paths.layoutsDir)))
    mkdirSync(paths.mockDir(paths.layoutsDir))

  const [
    accountLayouts,
    ixLayouts,
    indexLayouts,
    layoutLayouts,
    txLegacy,
    txV0,
    tx,
    layoutTest,
  ] = renderLayoutsFiles(idl.name, instructionsView, accountsView)
  try {
    if (accountLayouts) {
      writeFileSync(
        paths.layoutsFile('accounts'),
        format(accountLayouts, DEFAULT_FORMAT_OPTS),
      )
    }
    if (ixLayouts) {
      writeFileSync(
        paths.layoutsFile('instructions'),
        format(ixLayouts, DEFAULT_FORMAT_OPTS),
      )
    }
    writeFileSync(
      paths.layoutsFile('index'),
      format(indexLayouts, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.layoutsFile('layout'),
      format(layoutLayouts, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.mockFile('tx_legacy.json', paths.layoutsDir),
      format(txLegacy, JSON_FORMAT),
    )
    writeFileSync(
      paths.mockFile('txn_v0.json', paths.layoutsDir),
      format(txV0, JSON_FORMAT),
    )
    writeFileSync(
      paths.mockFile('txn.json', paths.layoutsDir),
      format(tx, JSON_FORMAT),
    )
    writeFileSync(
      paths.testsFile('layout', paths.layoutsDir),
      format(layoutTest, DEFAULT_FORMAT_OPTS),
    )
  } catch (err) {
    console.log(`Failed to format on layouts folder`)
    logError(err)
  }

  if (!existsSync(paths.tsSolitaDir)) mkdirSync(paths.tsSolitaDir)

  await generateSolitaTypeScript(paths, idl)
  const indexSolita = renderSolitaMods(
    instructionsView,
    accountsView,
    typesView,
    paths,
    DEFAULT_FORMAT_OPTS,
  )
  try {
    writeFileSync(
      paths.solitaFile('index'),
      format(indexSolita, DEFAULT_FORMAT_OPTS),
    )
  } catch (err) {
    console.log(`Failed to format on parser folder`)
    logError(err)
  }

  if (!existsSync(paths.parsersDir)) mkdirSync(paths.parsersDir)
  if (!existsSync(paths.testsDir(paths.parsersDir)))
    mkdirSync(paths.testsDir(paths.parsersDir))

  const [event, eventTest] = renderParsersFiles(instructionsView)
  try {
    writeFileSync(
      paths.parsersFile('event'),
      format(event, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.testsFile('event', paths.parsersDir),
      format(eventTest, DEFAULT_FORMAT_OPTS),
    )
  } catch (err) {
    console.log(`Failed to format on parser folder`)
    logError(err)
  }

  if (!existsSync(paths.dalDir)) mkdirSync(paths.dalDir)

  const eventDal = renderDALFiles(instructionsView)
  try {
    writeFileSync(paths.dalFile('event'), format(eventDal, DEFAULT_FORMAT_OPTS))
  } catch (err) {
    logError(`Failed to format on dal folder`)
    logError(err)
  }

  if (!existsSync(paths.domainDir)) mkdirSync(paths.domainDir)

  const [account, worker, mainDomain] = renderDomainFiles(
    Name,
    idl.name,
    accountsView,
  )
  try {
    writeFileSync(
      paths.domainFile('account'),
      format(account, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.domainFile('worker'),
      format(worker, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.domainFile('main'),
      format(mainDomain, DEFAULT_FORMAT_OPTS),
    )
  } catch (err) {
    logError(`Failed to format on domain folder`)
    logError(err)
  }

  if (!existsSync(paths.statsDir)) mkdirSync(paths.statsDir)
  if (!existsSync(paths.mockDir(paths.statsDir)))
    mkdirSync(paths.mockDir(paths.statsDir))
  if (!existsSync(paths.testsDir(paths.statsDir)))
    mkdirSync(paths.testsDir(paths.statsDir))

  const [
    timeSeries,
    timeSeriesAggregator,
    statsAggregator,
    mockDAL,
    mockIndexer,
    timeSeriesTest,
  ] = renderStatsFiles(Name, instructionsView, idl.name)
  try {
    writeFileSync(
      paths.statsFile('timeSeries'),
      format(timeSeries, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.statsFile('timeSeriesAggregator'),
      format(timeSeriesAggregator, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.statsFile('statsAggregator'),
      format(statsAggregator, DEFAULT_FORMAT_OPTS),
    )

    writeFileSync(
      paths.mockFile('DAL.ts', paths.statsDir),
      format(mockDAL, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.mockFile('indexer.ts', paths.statsDir),
      format(mockIndexer, DEFAULT_FORMAT_OPTS),
    )
    writeFileSync(
      paths.testsFile('timeSeriesTest', paths.statsDir),
      format(timeSeriesTest, DEFAULT_FORMAT_OPTS),
    )
  } catch (err) {
    logError(`Failed to format on domain folder`)
    logError(err)
  }

  if (!existsSync(paths.discovererDir)) mkdirSync(paths.discovererDir)

  const discoverer = renderDiscovererFiles(Name, idl.name)
  try {
    writeFileSync(
      paths.discovererFile(idl.name),
      format(discoverer, DEFAULT_FORMAT_OPTS),
    )
  } catch (err) {
    logError(`Failed to format on discoverer folder`)
    logError(err)
  }
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

async function generateSolitaTypeScript(paths: Paths, idl: Idl) {
  console.log('Generating TypeScript SDK to %s', paths.tsSolitaDir)

  const gen = new Solita(idl, { formatCode: true })
  await gen.renderAndWriteTo(paths.tsSolitaDir)

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
