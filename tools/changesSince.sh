#!/usr/bin/env bash

# Lists all files changed since the provided hash until now (HEAD).
# Usage: changesSince.sh HASH
# Example: changesSince.sh c008169

git log --name-only --pretty=oneline --full-index $1..HEAD | grep -vE '^[0-9a-f]{40} ' | sort | uniq