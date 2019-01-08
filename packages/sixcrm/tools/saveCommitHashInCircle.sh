#!/usr/bin/env bash

# Save the given hash as a last commit in a file. If file is not provided ~/.circlerc is used.


hash=$1
file=$2
var_name="LAST_COMMIT"

test -z $file && file="$HOME/.circlerc"

echo "Curent commit is ${hash}"
echo "Variable name is ${var_name}"
echo "Saving to ${file}"

touch $file
cat $file | grep $var_name= > /dev/null && sed -i "s/export $var_name=.*/export $var_name=$hash/" $file || echo "export $var_name=$hash" >> $file

cat $file