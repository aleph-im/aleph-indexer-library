import SDK from '@aleph-indexer/framework'
import { fileURLToPath } from 'url'
import path from 'path'
import { PYTH_PROGRAM_ID } from './src/constants.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const indexerDomainPath = path.join(__dirname, './src/domain/indexer.js')
  const mainDomainPath = path.join(__dirname, './src/domain/main.js')
  const apiPath = path.join(__dirname, './src/api/index.js')

  await SDK.init({
    main: {
      apiPath,
      domainPath: mainDomainPath,
    },
    indexer: {
      instances: 4,
      domainPath: indexerDomainPath,
    },
    projectId: PYTH_PROGRAM_ID,
  })
}

main()
