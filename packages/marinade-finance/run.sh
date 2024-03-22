#!/bin/bash
echo "NODE_ENV=production node node_modules/@aleph-indexer/core/dist/config.js setup"
ENVS=$(NODE_ENV=production node node_modules/@aleph-indexer/core/dist/config.js setup)

while IFS= read -r env; do
export "${env//\"/}";
done <<< "$ENVS"

echo "NODE_ENV=production node dist/run.js" 
NODE_ENV=production node $NODE_OPTIONS dist/run.js
