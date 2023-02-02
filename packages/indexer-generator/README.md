# Indexer generator

Aleph Indexer Generator for Solana programs, using Anchor's IDLs. It generates all boilerplate necessary for starting your own Solana indexer on our [open-source, multi-threaded node.js framework](https://github.com/aleph-im/aleph-indexer-framework), using [moleculer](https://moleculer.services/).

You can run the indexer generator (from solana-indexer-library's root):

- Install dependencies and build the project: 
  ```bash
  npm i && npm run build
  ```
- You have two options, generating your indexer either from a local Anchor IDL file or from a remote one:
  - Providing the IDL:
    - Move a copy of the idl to the path: solana-indexer-library/packages/indexer-generator/idl
    - Run the npm script generate, including the idl name as argument:
      ```bash
      npm run generate marinade-finance
      ```
    - Recommended to include as a second argument the address of your program:
      ```bash
      npm run generate marinade-finance MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD
      ``` 
  - Providing your program address:
      For this option you need to have anchor installed and your program published on [apr](https://www.apr.dev/)
      ```bash
      npm run generate MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD
      ```

## Example Usage
- Generate a new indexer:
```bash
npm i && npm run build
npm run generate MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD
```
- Run the indexer:
```bash
npm i && npm run build
npm run start marinade-finance
```

If you wait for a moment you will see a message warning you that it is now running a GraphQL server on http://localhost:8080.

## Deploying your Indexer to Aleph.im
To deploy your indexer, read this [documentation](https://github.com/aleph-im/solana-indexer-library/#deploying-a-new-indexer)

## Supported Queries
### Total program accounts and instruction invocations
Return global stats about the amount of accounts and total amount of instructions processed by the indexer:
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
Get all accounts, their addresses, Anchor type and contents:
```graphql
{
  accounts {
    address
    type
    data {
      ...on State {
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
    }
  }
}
```

### Indexing state
Get the current progress of the indexer. Accurate means that the indexer fetched all transaction signatures belonging to
that account, progress tells you how much percent of all transactions have been fetched and processed.
```graphql
{
  accountState(account: "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC") {
    accurate
    progress
    pending
    processed
  }
}
```

### General account stats
Get accesses in the last hour, day, week or in total:
```graphql
{
  accountStats(account: "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC") {
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
Get aggregated accesses by signing wallet and month:
```graphql
{
  accountTimeSeriesStats(timeFrame:Month, account: "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC", type: "access") {
    series {
      date
      value {
        ...on MarinadeFinanceInfo {
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
  events(account: "8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC", limit: 10) {
    id
    timestamp
    type
    signer
    ...on OrderUnstakeEvent {
      data {
        msolAmount
      }
    }
    ...on AddLiquidityEvent {
      data {
        lamports
      }
    }
    ...on DepositEvent {
      data {
        lamports
      }
    }
    ...on LiquidUnstakeEvent {
      data {
        msolAmount
      }
    }
    ...on RemoveLiquidityEvent {
      data {
        tokens
      }
    }
  }
}
```
