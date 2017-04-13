#!/bin/bash
cd "$(git rev-parse --show-toplevel)"

LINT_CMD="node_modules/.bin/eslint"
FILES_TO_CHECK=($(git diff --cached --name-only --diff-filter=ACM | grep ".js$"))

if [[ "$FILES_TO_CHECK" = "" ]]; then
  printf "No files to lint check"
  exit 0
fi

echo "Checking ESLint for ${#FILES_TO_CHECK[@]} files..."

$LINT_CMD "${FILES_TO_CHECK[@]}" --fix

LINT_RESULT="$?"

git add "${FILES_TO_CHECK[@]}"

if [[ "${LINT_RESULT}" == 0 ]]; then
  printf "Lint check \033[42mPASSED\033[0m\n"
else
  printf "Lint check \033[41mFAILED\033[0m Fix above errors\n"
  exit 1
fi

exit $?
