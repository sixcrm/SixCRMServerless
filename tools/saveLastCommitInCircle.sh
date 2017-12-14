#!/usr/bin/env bash

# Save the hash of last commit to a file. If file is not provided ~/.circlerc is used.


current_commit=`git rev-parse --verify HEAD`
file=$1
var_name="LAST_COMMIT_$CIRCLE_BRANCH"

test -z $file && file="$HOME/.circlerc"

echo "Curent commit is ${current_commit}"
echo "Variable name is ${var_name}"
echo "Saving to ${file}"

touch $file
cat $file | grep $var_name > /dev/null && sed -i "s/export $var_name=.*/export $var_name=$current_commit/" $file || echo "export $var_name=$current_commit" >> $file

cat $file