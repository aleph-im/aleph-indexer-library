export function renderRootFiles(filename: string): [string, string][] {
  const name = filename.toLowerCase()
  const files: [string, string][] = []

  files.push(renderSh())
  files.push(renderEnv())
  files.push(renderDocker(name))
  files.push(renderPackageJson(filename))
  files.push(renderRun(name))
  files.push(renderTsconfig())
  files.push(renderTypesDts())

  return files
}

function renderSh(): [string, string] {
  const content = `#!/bin/bash
echo "NODE_ENV=production node node_modules/@aleph-indexer/core/dist/config.js setup"
ENVS=$(NODE_ENV=production node node_modules/@aleph-indexer/core/dist/config.js setup)

while IFS= read -r env; do
export "\${env//\\"/}";
done <<< "$ENVS"

echo "NODE_ENV=production node dist/run.js" 
NODE_ENV=production node $NODE_OPTIONS dist/run.js
`
  return ['run.sh', content]
}

function renderDocker(name: string): [string, string] {
  const content = `version: '2'

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
  return ['docker-compose.yaml', content]
}

function renderEnv(): [string, string] {
  const content = `SOLANA_RPC=
SOLANA_MAIN_PUBLIC_RPC=

# 16 GB RAM for node.js
NODE_OPTIONS=--max-old-space-size=16384  
`
  return ['.env', content]
}

function renderPackageJson(filename: string): [string, string] {
  const content = `{
  "name": "@aleph-indexer/${filename}",
  "version": "1.0.0",
  "description": "",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.js",
  "type": "module",
  "scripts": {
    "start": "./run.sh",
    "build": "tsc -p ./tsconfig.json",
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "up": "docker-compose up -d",
    "up:devnet": "docker-compose -f docker-compose-devnet.yaml --project-name staking-devnet up -d",
    "start": "chmod +x run.sh && ./run.sh"
  },
  "author": "ALEPH.im",
  "license": "ISC",
  "dependencies": {
    "@aleph-indexer/solana": "^1.1.11",
    "@metaplex-foundation/beet": "0.7.2",
    "@metaplex-foundation/beet-solana": "0.4.1"
  },
  "devDependencies": {
    "@types/luxon": "^3.0.1",
    "@types/node": "^18.7.18",
    "typescript": "^4.8.3",
    "@types/bn.js": "^5.1.0"
  }
}
`
  return ['package.json', content]
}

function renderRun(name: string): [string, string] {
  const content = `import { fileURLToPath } from 'url'
import path from 'path'
import { config } from '@aleph-indexer/core'
import SDK, { BlockchainChain, TransportType } from '@aleph-indexer/framework'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const workerDomainPath = path.join(__dirname, './src/domain/worker.js')
  const mainDomainPath = path.join(__dirname, './src/domain/main.js')
  const apiSchemaPath = path.join(__dirname, './src/api/index.js')
  const layoutPath = path.join(__dirname, './src/utils/layouts/layout.js')

  const instances = Number(config.INDEXER_INSTANCES || 1)
  const apiPort = Number(config.INDEXER_API_PORT || 8080)
  const tcpUrls = config.INDEXER_TCP_URLS || undefined
  const natsUrl = config.INDEXER_NATS_URL || undefined

  const projectId = '${name}'
  const dataPath = config.INDEXER_DATA_PATH || undefined // 'data'
  const transport =
    (config.INDEXER_TRANSPORT as TransportType) || TransportType.Thread

  const transportConfig: any =
    tcpUrls || natsUrl ? { tcpUrls, natsUrl } : undefined

  if (!projectId) throw new Error('INDEXER_NAMESPACE env var must be provided ')

  await SDK.init({
    projectId,
    supportedBlockchains: [BlockchainChain.Solana],
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
  return ['run.ts', content]
}

function renderTsconfig(): [string, string] {
  const content = `{
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
}
`
  return ['tsconfig.json', content]
}

function renderTypesDts(): [string, string] {
  const content = `export * from '../../types'
`
  return ['types.d.ts', content]
}
