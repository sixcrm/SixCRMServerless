#!/bin/bash
cd "$(git rev-parse --show-toplevel)"

FILE_MATCH_REGULAR_EXPRESSION=$1
FILES_TO_CHECK=$(git diff --cached --name-only --diff-filter=ACM | grep -e "$FILE_MATCH_REGULAR_EXPRESSION")

if [[ "$FILES_TO_CHECK" = "" ]]; then
  echo "No files in the commit match the specified regular expression.";
  exit 0;
fi

echo "Updated files: ";
echo  "$FILES_TO_CHECK";

exit 1;
