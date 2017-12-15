#!/usr/bin/env bash

# Lists all files changed since the provided hash until now (HEAD).
# If the hash is not provided, previous commit is used.
#
# Usage: changesSince.sh [HASH]
# Example: changesSince.sh c008169

since=$1
test -z $since && since=`git rev-parse HEAD~1`

git log --name-only --pretty=oneline --full-index $since..HEAD | grep -vE '^[0-9a-f]{40} ' | sort | uniq