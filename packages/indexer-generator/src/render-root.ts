export function renderRootFiles(filename: string): string[] {
  const name = filename.toLowerCase()

  const cmd = `#!/bin/sh

node --max-old-space-size=51200 packages/\${INDEXER}/dist/run.js`

  const docker = `version: '2'

services:
  ${name}:
    build: ../..
    volumes:
      - ~/indexer.data:/app/data:rw
    extra_hosts:
      - host.docker.internal:host-gateway
    env_file:
      - ../../.env
      - ./.env
    environment:
      - INDEXER=${name}
      - LETSENCRYPT_HOST=${name}.api.aleph.cloud
      - VIRTUAL_HOST=${name}.api.aleph.cloud
      - VIRTUAL_PORT=8080
      - SOLANA_RPC=
    network_mode: bridge
`

  const pkg = `{
  "name": "@aleph-indexer/${filename}",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.js",
  "type": "module",
  "scripts": {
    "build": "tsc -p ./tsconfig.json",
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "up": "docker-compose up -d",
    "up:devnet": "docker-compose -f docker-compose-devnet.yaml --project-name staking-devnet up -d"
  },
  "author": "ALEPH.im",
  "license": "ISC",
  "dependencies": {
    "@aleph-indexer/core": "^1.0.33",
    "@aleph-indexer/framework": "^1.0.40",
    "@aleph-indexer/solana": "^1.0.40",
    "@metaplex-foundation/beet": "0.7.1",
    "@metaplex-foundation/beet-solana": "0.4.0",
    "@project-serum/borsh": "^0.2.5",
    "@solana/spl-token": "0.3.5",
    "@solana/web3.js": "^1.66.2",
    "bs58": "5.0.0"
  },
  "devDependencies": {
    "@types/bn.js": "^5.1.0",
    "@types/luxon": "^3.0.1",
    "@types/node": "^18.7.18",
    "typescript": "^4.8.3"
  }
}`

  const run = `import { fileURLToPath } from 'url'
import path from 'path'
import { config } from '@aleph-indexer/core'
import SDK, { Blockchain, TransportType } from '@aleph-indexer/framework'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const workerDomainPath = path.join(__dirname, './src/domain/worker.js')
  const mainDomainPath = path.join(__dirname, './src/domain/main.js')
  const apiSchemaPath = path.join(__dirname, './src/api/index.js')
  const layoutPath = path.join(__dirname, './src/utils/layouts/layout.js')

  const instances = Number(config.INDEXER_INSTANCES || 2)
  const apiPort = Number(config.INDEXER_API_PORT || 8080)
  const tcpUrls = config.INDEXER_TCP_URLS || undefined
  const natsUrl = config.INDEXER_NATS_URL || undefined

  const projectId = '${name}'
  const dataPath = config.INDEXER_DATA_PATH || undefined // 'data'
  const transport =
    (config.INDEXER_TRANSPORT as TransportType) || TransportType.LocalNet

  const transportConfig: any =
    tcpUrls || natsUrl ? { tcpUrls, natsUrl } : undefined

  if (!projectId) throw new Error('INDEXER_NAMESPACE env var must be provided ')

  await SDK.init({
    projectId,
    supportedBlockchains: [Blockchain.Solana],
    transport,
    transportConfig,
    apiPort,
    fetcher: {
      instances: 1,
    },
    parser: {
      instances: 1,
      layoutPath,
    },
    indexer: {
      dataPath,
      main: {
        apiSchemaPath,
        domainPath: mainDomainPath,
      },
      worker: {
        instances,
        domainPath: workerDomainPath,
      },
    },
  })
}

main()
`

  const tsconfig = `{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "outDir": "dist"
    },
    "exclude": [
        "node_modules",
        "dist",
        "scripts",
        "tests",
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/__tests__",
        "**/__mocks__"
    ]
  }`

  const typesdts = `export * from '../../types'
`

  return [docker, pkg, run, tsconfig, typesdts, cmd]
}
