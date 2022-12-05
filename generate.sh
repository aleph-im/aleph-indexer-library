#!/bin/bash

arg1=$1
arg2=$2

if [[ $# -ne 1 && $# -ne 2 ]]; then
    echo "Error: wrong number of arguments"
    echo "Usage: $0 arg1 (program address on apr or name of the idl) [arg2 (optional, address of the program to use it with the idl file)]"
    exit 1
fi

if [[ ${#arg1} -eq 43 ]]; then
    flag1="-a"
    if [[ $# -eq 2 ]]; then
        flag2="-f"
    fi
else
    flag1="-f"
        if [[ $# -eq 2 ]]; then
        flag2="-a"
    fi
fi

node ./packages/indexer-generator/dist/index.js $flag1 $arg1 $flag2 $arg2