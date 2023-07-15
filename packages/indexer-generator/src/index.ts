import generate from './generator.js';
import { TemplateType } from './types.js';
import { Command } from 'commander';
import { exec } from 'child_process';
import { Paths } from './paths.js';
import { readFileSync } from 'fs';
import { Idl } from '@metaplex-foundation/solita';

const program = new Command();

program
  .name('igen')
  .option('-f, --file <path>', 'Generates Indexer based on your IDL.')
  .option(
    '-a, --address <pubkey>',
    'Generates Indexer based on your program PubKey. If --file is provided, then this address will only be used as the programId in the generated code.',
  )
  .option(
    '-o, --output <path>',
    'Sets the output path for the generated indexer.',
  )
  .action(main);

program.parse(process.argv);

interface MainOptions {
  file?: string;
  address?: string;
  output?: string;
}

async function main() {
  const options: MainOptions = program.opts();
  let paths: Paths | undefined = undefined;

  if (!options.file && !options.address) {
    console.error('You must provide either a file or a program address.');
    return;
  }

  if (options.output) {
    let output = options.output.split('/');
    if (output[output.length - 1] === '') {
      output = output.slice(0, output.length - 1);
    }
    paths = new Paths('./', output[output.length - 1], output.slice(0, output.length - 1).join('/'));
  }

  if (options.file) {
    const idlFilename: string = options.file;
    paths = paths ?? new Paths(`./`, idlFilename);
    const idl: Idl = JSON.parse(readFileSync(paths.idlFile(idlFilename), 'utf8'));
    paths = new Paths(`./`, idl.name);

    if (!idl.metadata) {
      idl.metadata = {
        address: 'PROGRAM PUBKEY',
      };
    }

    if (options.address) {
      idl.metadata.address = options.address;
    }

    await generate(idl, paths, [
      TemplateType.Types,
      TemplateType.Instructions,
      TemplateType.Accounts,
    ]);
  } else if (options.address) {
    try {
      const stdout = await executeCommand(`anchor idl fetch --provider.cluster mainnet ${options.address}`);
      const idl: Idl = JSON.parse(stdout);

      if (!idl.metadata) {
        idl.metadata = {
          address: options.address,
        };
      }

      paths = paths ?? new Paths(`./`, idl.name);
      await generate(idl, paths, [
        TemplateType.Types,
        TemplateType.Instructions,
        TemplateType.Accounts,
      ], options.address);
    } catch (error) {
      console.error('An error occurred while fetching the IDL:', error);
    }
  }
}

function executeCommand(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(new Error(stderr));
      } else {
        resolve(stdout);
      }
    });
  });
}
