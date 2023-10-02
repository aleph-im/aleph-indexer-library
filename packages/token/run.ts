import { fileURLToPath } from 'url'
import path from 'path'
import { config } from '@aleph-indexer/core'
import SDK, { Blockchain, TransportType } from '@aleph-indexer/framework'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const workerDomainPath = path.join(__dirname, './src/domain/worker.js')
  const mainDomainPath = path.join(__dirname, './src/domain/main.js')
  const apiSchemaPath = path.join(__dirname, './src/api/index.js')

  const projectId = config.INDEXER_NAMESPACE
  const supportedBlockchains = (
    config.INDEXER_BLOCKCHAINS || 'ethereum,bsc'
  ).split(',') as Blockchain[]
  const dataPath = config.INDEXER_DATA_PATH || undefined // 'data'
  const apiPort = Number(config.INDEXER_API_PORT || 8080)
  const transport =
    (config.INDEXER_TRANSPORT as TransportType) || TransportType.Thread

  if (!projectId) throw new Error('INDEXER_NAMESPACE env var must be provided')

  await SDK.init({
    projectId,
    supportedBlockchains,
    transport,
    apiPort,
    fetcher: {
      instances: 1,
      dataPath,
      api: false,
    },
    parser: {
      instances: 1,
      dataPath,
      api: false,
    },
    indexer: {
      dataPath,
      main: {
        apiSchemaPath,
        domainPath: mainDomainPath,
      },
      worker: {
        instances: 1,
        domainPath: workerDomainPath,
      },
    },
  })
}

main()
