# Indexer generator

The Aleph Indexer Generator simplifies the process of creating indexers for Solana programs, by using Anchor's IDLs. It generates the necessary boilerplate code for launching your own Solana indexer on our [open-source, multi-threaded node.js framework](https://github.com/aleph-im/aleph-indexer-framework), using [moleculer](https://moleculer.services/).

## Getting started
1. Clone the repository
```bash
git clone https://github.com/aleph-im/solana-indexer-library.git
```
2. Navigate to the project's root directory
3. Install the necessary dependencies and build the project:
```bash
npm install && npm run build
```
4. Generate your indexer from a local or remote Anchor IDL:
- Local idl:
1. Move a copy of the idl of your program to the path: solana-indexer-library/packages/indexer-generator/idl
2. Run the generate command, passing the IDL name as an argument:
```bash
npm run generate <idl-name>
```
3. Optionally, include your program's address as a second argument:
```bash
npm run generate <idl-name> <program-address>
``` 

- Remote idl:
1. Ensure Anchor is installed locally and your program is published on APR
2. Run the generate command, providing your program's address:
```bash
npm run generate <program-address>
``` 

## Example Usage
1. Navigate to the generated package directory
```bash
cd packages/<idl-name>
```
2. Install dependencies and build the package
```bash
npm i && npm run build
```
3. Add your RPC on SOLANA_RPC env
4. Run he indexer by executing run script
```bash
./run.sh
```

The GraphQL server is accessible at http://localhost:8080.

## Deploying your Indexer to Aleph.im
To deploy your indexer, read this [documentation](https://github.com/aleph-im/solana-indexer-library/#deploying-a-new-indexer)

## Supported Queries
### Total program accounts and instruction invocations
Return global stats about the amount of accounts and program accesses by signers:
```graphql
{
    globalStats {
        totalAccounts {
            State
            TicketAccountData
        }
        totalAccesses
        totalAccessesByProgramId
    }
}
```

### Accounts
Get all accounts, their addresses, type and contents:
```graphql
{
  accounts {
    address
    type
    data {
      ...on StateData {
        msolMint
        adminAuthority
        liqPool {
          lpLiquidityTarget
          lpMaxFee {
            basisPoints
          }
          lpMinFee {
            basisPoints
          }
          treasuryCut {
            basisPoints
          }
        }
        # and other fields, see generated GraphQL schema
      }
      ... on TicketAccountDataData {
        beneficiary
        stateAddress
        lamportsAmount
        # and other fields, see generated GraphQL schema
      }
    }
  }
}
```

### Indexing state
Get the current indexing state of a specified account entity or all indexed accounts:
```graphql
{
  accountState(account:"ELMTgR1fLdJeENJKWGWz3eCH8URpaSuPfCyAaphELTVJ", blockchain: "solana", type: transaction) {
    account
    accurate
    progress
    pending
    processed
  }
}
```
Query response properties:
- accurate: If covers the complete transaction history.
- progress: Percentage of transactions indexed out of the total identified.
- pending: An array of ISO-formatted date ranges indicating the transaction ranges yet to be indexed.
- processed: An array of ISO-formatted date ranges indicating the transaction ranges that have been successfully indexed.

### General account stats
Get accesses in the last hour, day, week or in total:
```graphql
{
  accountStats(account: "ELMTgR1fLdJeENJKWGWz3eCH8URpaSuPfCyAaphELTVJ", blockchain: "solana") {
    stats {
      last1h {
        accesses
      }
      last24h {
        accesses
      }
      last7d {
        accesses
      }
      total {
        accesses
      }
    }
  }
}
```

### Account time series stats
Get aggregated accesses by signer and month:
```graphql
{
  accountTimeSeriesStats(timeFrame: Month, account: "ELMTgR1fLdJeENJKWGWz3eCH8URpaSuPfCyAaphELTVJ", type: "access", blockchain: "solana") {
    series {
      date
      value {
        ...on AccessTimeStats {
          accessesByProgramId
        }
      }
    }
  }
}
```

### Processed instructions (Events)
Get the latest 1000 processed instructions:
```graphql
{
  events(account: "ELMTgR1fLdJeENJKWGWz3eCH8URpaSuPfCyAaphELTVJ", types: OrderUnstake, limit: 1000) {
    id
    timestamp
    type
    signer
    ...on OrderUnstakeEvent {
      info {
        state
        msolAmount
        burnMsolFrom
        burnMsolAuthority
        newTicketAccount
      }
    }
  }
}
```
