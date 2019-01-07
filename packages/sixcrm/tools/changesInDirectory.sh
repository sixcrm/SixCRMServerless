#!/usr/bin/env bash

# Determines whether there were changes in the given directory since the given commit.
# Usage: changesInDirectory.sh DIRECTORY [HASH]
# DIRECTORY is relative to project root
#
# Examples:
# tools/changesInDirectory.sh deployment/sqs c008169
# tools/changesInDirectory.sh deployment/ c008169
# tools/changesInDirectory.sh test c008169
# tools/changesInDirectory.sh test/unit c008169
# tools/changesInDirectory.sh test/unit # previous commit is used when hash not provided


dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

$dir/changesSince.sh $2 | grep "^$1" > /dev/null
were_changes=$?
test $were_changes -eq 0 && echo yes || echo no
exit $were_changes
