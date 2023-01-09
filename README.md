## Aleph Indexer Library
**If you want to create an indexer, you're in the right place.**

*But if you like to contribute to the indexing framework itself, head over to the [framework repo](https://github.com/aleph-im/solana-indexer-framework)*

# START HERE to create an indexer
There are three way's to create your indexer after you create a new project:
1. If you have an IDL, use the [***Anchor Indexer Generator***](https://github.com/aleph-im/solana-indexer-library/tree/main/packages/indexer-generator#indexer-generator).
2. Use one of the pre-built, customized [***indexer examples***](https://github.com/aleph-im/solana-indexer-library/tree/main/packages) in the package folder as a starting point.
3. Build one from scratch.

## Building and deploying an indexer

- Make a fork of this project in your GitHub Workspace.
- Create a package with your project name's and put it inside `/packages` directory.
- Modify the `lerna.json` file and ensure to add your project to the list.
- Write your custom indexer code or copy it from another project like the `spl-lending` indexer in the [package](https://github.com/aleph-im/solana-indexer-library/tree/main/packages) folder.
- Substitute the `INDEXER` variable inside `.github/workflows/main.yml` file, changing it to your project's name:
```yml
- name: Build and export
  uses: docker/build-push-action@v3
  with:
    context: .
    tags: aleph-framework:latest
    outputs: type=docker,dest=/tmp/aleph-framework.tar
    build-args: |
      INDEXER=spl-token |
      SPL_TOKEN_MINTS=3UCMiSnkcnkPE1pgQ5ggPCBv6dXgVUy16TmMUe1WpG9x |
      INDEXER_INSTANCES=1 |
      SOLANA_RPC=http://solrpc1.aleph.cloud:7725/
```
- Also replace the rest of the environment variables that you want to use like `SPL_TOKEN_MINTS` or `SOLANA_RPC`.
- Once your indexer code is finished and working, create a PR on GitHub and push it.
- Label your PR with the `deploy` tag.
- The GitHub action will be triggered, and you will be able to download the final root filesystem of your indexer, ready to be pushed to Aleph network.
- You will find this rootfs file inside `Actions` -> `"Name of your last commit"` -> `Artifacts` -> `rootfs.squashfs`.
- Download it, **upload this `rootfs.squashfs` runtime file to IPFS, pin it,** and you will be ready to proceed with the deployment.

### Deploying with GitHub Actions

**_Using this method you will need to store you wallet private key's inside GitHub Secrets._**

- Go to repository `Secrets` tab and add a new one like `WALLET_PRIVATE_KEY`.
- Every new PR labeled with `deploy` tag on the repository will trigger the GitHub Action and publish the VM.
- Once the action finishes successfully, inside `Actions` -> `"Name of your last commit"` -> `Generate runtime` job -> `Publish runtime` step, you will be able to see the VM address:
```
https://aleph.sh/vm/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Deploying in Local Machine

#### Requirements

- Have installed `aleph-client` (See https://github.com/aleph-im/aleph-client).

#### Steps

- Pin your `rootfs.squashfs` runtime file hash (that is already uploaded to IPFS) inside Aleph network:
```shell
aleph pin RUNTIME_HASH --private-key WALLET_PRIVATE_KEY
```
- Download the program files in the current directory through [here](https://github.com/aleph-im/aleph-github-actions/tree/main/publish-runtime).
- Deploy the program inside a persistent VM at Aleph network (changing INDEXER by your indexer name):
```shell
aleph program ./program "run.sh" --persistent --private-key WALLET_PRIVATE_KEY --runtime RUNTIME_HASH
```
- Once command finishes, you will be able to see the VM address:
```
https://aleph.sh/vm/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
