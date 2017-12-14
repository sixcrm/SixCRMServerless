#!/usr/bin/env bash

# Returns hash of the last commit per branch, referencing $CIRCLE_BRANCH and stores it in $LAST_COMMIT

export LAST_COMMIT=`eval echo '${'LAST_COMMIT_$CIRCLE_BRANCH'}'`