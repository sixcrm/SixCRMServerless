#!/bin/bash
set -e
set -u
set -o pipefail

git fetch --all
git checkout $2
git merge $1
git push origin $2
