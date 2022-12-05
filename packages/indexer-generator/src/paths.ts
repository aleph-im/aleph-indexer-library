import { PathLike } from 'fs'
import path from 'path'

export class Paths {
  constructor(
    readonly root: PathLike,
    readonly project: string,
    readonly output?: string | undefined,
  ) {}

  get rootDir(): string {
    return this.root.toString()
  }

  get idlDir(): string {
    return path.join(this.outputDir + '/indexer-generator/', 'idl')
  }
  idlFile(name: string): string {
    return path.join(this.idlDir, `${name}.json`)
  }

  get outputDir(): string {
    return this.output
      ? path.resolve(this.output)
      : path.join(this.rootDir.toString(), 'packages')
  }

  get projectDir(): string {
    return path.join(this.outputDir.toString(), this.project)
  }
  projectFile(name: string): string {
    return path.join(this.projectDir, name)
  }

  get srcDir(): string {
    return path.join(this.projectDir.toString(), 'src')
  }
  srcFile(name: string): string {
    return path.join(this.srcDir, `${name}.ts`)
  }

  get apiDir(): string {
    return path.join(this.srcDir.toString(), 'api')
  }
  apiFile(name: string): string {
    return path.join(this.apiDir, `${name}.ts`)
  }

  get dalDir(): string {
    return path.join(this.srcDir.toString(), 'dal')
  }
  get relDalDir(): string {
    return path.relative(process.cwd(), this.dalDir)
  }
  dalFile(name: string): string {
    return path.join(this.dalDir, `${name}.ts`)
  }

  get domainDir(): string {
    return path.join(this.srcDir.toString(), 'domain')
  }
  get relDomainDir(): string {
    return path.relative(process.cwd(), this.domainDir)
  }
  domainFile(name: string): string {
    return path.join(this.domainDir, `${name}.ts`)
  }

  get discovererDir(): string {
    return path.join(this.domainDir.toString(), 'discoverer')
  }
  get relDiscovererDir(): string {
    return path.relative(process.cwd(), this.discovererDir)
  }
  discovererFile(name: string): string {
    return path.join(this.discovererDir, `${name}.ts`)
  }

  get statsDir(): string {
    return path.join(this.domainDir.toString(), 'stats')
  }
  get relStatsDir(): string {
    return path.relative(process.cwd(), this.statsDir)
  }
  statsFile(name: string): string {
    return path.join(this.statsDir, `${name}.ts`)
  }

  get parsersDir(): string {
    return path.join(this.srcDir.toString(), 'parsers')
  }
  get relParsersDir(): string {
    return path.relative(process.cwd(), this.parsersDir)
  }
  parsersFile(name: string): string {
    return path.join(this.parsersDir, `${name}.ts`)
  }

  get utilsDir(): string {
    return path.join(this.srcDir.toString(), 'utils')
  }
  get relUtilsDir(): string {
    return path.relative(process.cwd(), this.utilsDir)
  }
  utilsFile(name: string): string {
    return path.join(this.utilsDir, `${name}.ts`)
  }

  get layoutsDir(): string {
    return path.join(this.utilsDir.toString(), 'layouts')
  }
  get relLayoutsDir(): string {
    return path.relative(process.cwd(), this.layoutsDir)
  }
  layoutsFile(name: string): string {
    return path.join(this.layoutsDir, `${name}.ts`)
  }

  get tsDir(): string {
    return path.join(this.layoutsDir.toString(), 'ts')
  }
  tsFile(name: string): string {
    return path.join(this.tsDir, `${name}.ts`)
  }

  get tsSolitaDir(): string {
    return path.join(this.layoutsDir.toString(), 'solita')
  }
  solitaFile(name: string): string {
    return path.join(this.tsSolitaDir, `${name}.ts`)
  }

  get ixSolitaDir(): string {
    return path.join(this.tsSolitaDir.toString(), 'instructions/')
  }

  ixSolitaFile(name: string): string {
    return path.join(this.ixSolitaDir, `${name}`)
  }

  get accountSolitaDir(): string {
    return path.join(this.tsSolitaDir.toString(), 'accounts/')
  }

  accountSolitaFile(name: string): string {
    return path.join(this.accountSolitaDir, `${name}`)
  }

  get typeSolitaDir(): string {
    return path.join(this.tsSolitaDir.toString(), 'types/')
  }

  typeSolitaFile(name: string): string {
    return path.join(this.typeSolitaDir, `${name}`)
  }

  get errorSolitaDir(): string {
    return path.join(this.tsSolitaDir.toString(), 'errors/')
  }

  errorSolitaFile(name: string): string {
    return path.join(this.errorSolitaDir, `${name}`)
  }

  mockDir(folder: string): string {
    return path.join(folder, '__mocks__/')
  }

  mockFile(name: string, folder: string): string {
    return path.join(this.mockDir(folder), `${name}`)
  }

  testsDir(folder: string): string {
    return path.join(folder, '__tests__/')
  }

  testsFile(name: string, folder: string): string {
    return path.join(this.testsDir(folder), `${name}.spec.ts`)
  }
}
