import { fileURLToPath } from 'url'
import path from 'path'
import { config } from '@aleph-indexer/core'
import SDK, { TransportType } from '@aleph-indexer/framework'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const workerDomainPath = path.join(__dirname, './src/domain/worker.js')
  const mainDomainPath = path.join(__dirname, './src/domain/main.js')
  const apiSchemaPath = path.join(__dirname, './src/api/index.js')

  const instances = Number(config.INDEXER_INSTANCES || 2)
  const apiPort = Number(config.INDEXER_API_PORT || 8080)
  const tcpPort = Number(config.INDEXER_TCP_PORT) || undefined
  const tcpUrls = config.INDEXER_TCP_URLS || undefined

  const projectId = config.INDEXER_NAMESPACE || config.LENDING_ID
  const dataPath = config.INDEXER_DATA_PATH || undefined // 'data'
  const transport =
    (config.INDEXER_TRANSPORT as TransportType) || TransportType.LocalNet

  if (!projectId)
    throw new Error('INDEXER_NAMESPACE or LENDING_ID env var must be provided ')

  await SDK.init({
    projectId,
    transport,
    apiPort,
    indexer: {
      dataPath,
      tcpPort,
      tcpUrls,
      main: {
        apiSchemaPath,
        domainPath: mainDomainPath,
      },
      worker: {
        instances,
        domainPath: workerDomainPath,
      },
    },
    // parser: {
    //   instances: 1,
    // },
    // fetcher: {
    //   instances: 1,
    // },
  })
}

main()
