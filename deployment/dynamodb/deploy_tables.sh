#!/bin/bash
set -e
set -u

STAGE='development'

while [ $# -gt 0 ]; do
  case "$1" in
  	--stage=*)
		STAGE="${1#*=}"
		;;
  esac
  shift
done

echo "Stage: $STAGE";
serverless dynamodb install
serverless dynamodb executeAll --stage development