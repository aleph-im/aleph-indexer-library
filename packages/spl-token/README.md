# SPL Token Indexer

## Configuration

Set the `SPL_TOKEN_MINTS` environment variable with the token mints
separated by comas to index these tokens, and set the `SPL_TOKEN_ACCOUNTS`
environment variable with the account's addresses separated by comas to also
index it.

### Example

Index KIN token mint

``` sh
SPL_TOKEN_MINTS=kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6
```

### Deploying the indexer

Follow the guide of the main [README.md](https://github.com/aleph-im/solana-indexer-library/blob/main/README.md) file
to publish it in Aleph.IM network using different methods.
