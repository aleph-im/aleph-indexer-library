import generate from './generator.js'
import { TemplateType } from './types.js'
import { Command } from 'commander'
import { exec } from 'child_process'
import { Paths } from './paths.js'
import { readFileSync } from 'fs'
import { Idl } from '@metaplex-foundation/solita'

const program = new Command()

program
  .name('igen')
  .option('-f, --file <path>', 'Generates Indexer based on your IDL.')
  .option(
    '-a, --address <pubkey>',
    'Generates Indexer based on your program PubKey. If --file is provided, then this address will only be used as the programId in the generated code.',
  )
  .option(
    '-o, --output <path>',
    'Sets the output path for the generated indexer folder.',
  )
  .action(main)

program.parse(process.argv)

async function main() {
  const options = program.opts()
  let paths: Paths | undefined = undefined
  if (!options.file && !options.address) {
    console.log('You must provide either a file or a program address.')
    return
  }
  if (options.output) {
    let output = options.output.split('/')
    if (output[output.length - 1] === '') {
      output = output.slice(0, output.length - 1)
    }
    paths = new Paths(
      './',
      output[output.length - 1],
      output.slice(0, output.length - 1).join('/'),
    )
  }
  if (options.file) {
    const programName: string = options.file
    paths = paths ?? new Paths(`./`, programName)
    const idl: Idl = JSON.parse(
      readFileSync(paths.idlFile(programName), 'utf8'),
    )
    if (!idl.metadata) {
      idl.metadata = {
        address: 'PROGRAM PUBKEY',
      }
    }
    if (options.address) {
      idl.metadata.address = options.address
    }
    await generate(idl, paths, [
      TemplateType.Types,
      TemplateType.Instructions,
      TemplateType.Accounts,
    ])
  } else {
    if (options.address) {
      exec(
        `anchor idl fetch --provider.cluster mainnet ${options.address}`,
        async (error, stdout, stderr) => {
          if (error) {
            console.log(error)
          }
          if (stdout) {
            const idl: Idl = JSON.parse(stdout)
            if (!idl.metadata) {
              idl.metadata = {
                address: options.address,
              }
            }
            paths = paths ?? new Paths(`./`, idl.name)
            await generate(
              idl,
              paths,
              [
                TemplateType.Types,
                TemplateType.Instructions,
                TemplateType.Accounts,
              ],
              options.address,
            )
            return
          }
          if (stderr) {
            console.log(`Your IDL couldn't be fetched from apr`)
            return
          }
        },
      )
    }
  }
}
