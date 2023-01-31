## Aleph Indexer Library
**If you want to create an indexer, you're in the right place.**

*But if you like to contribute to the indexing framework itself, head over to the [framework repo](https://github.com/aleph-im/aleph-indexer-framework)*

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
      INDEXER=XXXXXX
```
- Once your indexer code is finished and working, create a PR on GitHub and push it.
- Label your PR with the `deploy` tag.
- The GitHub action will be triggered, and you will be able to download the final root filesystem of your indexer, ready to be pushed to Aleph network.
- You will find this rootfs file inside `Actions` -> `"Name of your last commit"` -> `Artifacts` -> `rootfs.squashfs`.
- This `rootfs.squashfs` runtime file will be used for the deployment.

### Deploying with GitHub Actions

**_Using this method you will need to store you wallet private key's inside GitHub Secrets._**

- Go to repository `Secrets` tab and add a new one like `WALLET_PRIVATE_KEY`.
- Inside `.github/workflows/main.yml` file, uncomment the last action that is commented and ensure to replace `https://XXXXXXXXX/docker-compose.yml` with the URL of your `docker-compose.yml`
file that you will use and also replace `https://XXXXXXXXX/.env` with the URL of your `.env` file to use :
```yml
- uses: aleph-im/aleph-github-actions/publish-runtime@main
  id: publish-runtime
  with:
    runtime_filename: rootfs.squashfs
    private-key: ${{ secrets.WALLET_PRIVATE_KEY }}
    docker_compose_url: https://XXXXXXXXX/docker-compose.yml
    env_url: https://XXXXXXXXX/.env
```
- Pushing this new changes with a PR or a simple commit to the repository, the GitHub action will be triggered.
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
- Get the `item_hash` field of the resulting message. We will use it in the next steps as `RUNTIME_ITEM_HASH`
- Download the program files in the current directory through [here](https://github.com/aleph-im/aleph-github-actions/tree/main/publish-runtime).
- Enter the folder just downloaded:
```shell
cd publish-runtime
```
- Replace inside `program` folder the `.env` and `docker_compose.yml` files with the needed for your indexer. You can
find some example here [here](https://github.com/aleph-im/aleph-github-actions/tree/main/publish-runtime/examples)
- Deploy the program inside a persistent VM at Aleph network passing the needed parameters:
```shell
aleph program ./program "run.sh" --persistent --private-key WALLET_PRIVATE_KEY --runtime RUNTIME_ITEM_HASH
```
- When the console prompt to add a persistent volume, press `y` and specify the volume parameters.
- Once command finishes, you will be able to see the VM address:
```
https://aleph.sh/vm/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
