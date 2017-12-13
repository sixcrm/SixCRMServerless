#!/usr/bin/env bash

# Determines whether there were changes in the given directory since the given commit.
# Usage: changesInDirectorySince.sh DIRECTORY HASH
# DIRECTORY is relative to project root
#
# Examples:
# tools/changesInDirectorySince.sh deployment/sqs c008169
# tools/changesInDirectorySince.sh deployment/ c008169
# tools/changesInDirectorySince.sh test c008169
# tools/changesInDirectorySince.sh test/unit c008169


dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

$dir/changesSince.sh $2 | grep "^$1" > /dev/null
were_changes=$?
test $were_changes -eq 0 && echo yes || echo no
exit $were_changes
