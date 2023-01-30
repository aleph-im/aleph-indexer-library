#!/bin/sh

node --max-old-space-size=16384 packages/${INDEXER}/dist/run.js
