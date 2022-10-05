#!/bin/bash

WORKDIR=$PWD
INDEXER=$1

cd $WORKDIR && \

echo "NODE_ENV=production node $NODE_OPTIONS packages/${INDEXER}/dist/run.js" 
cd $WORKDIR && NODE_ENV=production node $NODE_OPTIONS packages/${INDEXER}/dist/run.js
