#!/bin/bash
set -e
set -u
set -o pipefail

git fetch --all

case "$2" in
	production)
		git fetch
		GIT_COMMIT=$(git rev-parse HEAD)
		echo "Git commit: $GIT_COMMIT"
		TAGS=$(git describe --all --exact-match $GIT_COMMIT)
		echo "Tags:"
		echo $TAGS;

		echo "$TAGS" | grep -q "tags/v\d\+.*"
		if [ $? -eq 0 ]; then
		  echo "Version tag present.  Merging to production."
		  git checkout $2
		  git merge $1
		  git push origin $2
		else
		  echo "Version tag not present.  Skipping merge to production."
		fi

	;;
	*)
		echo "Skipping version tagging requirements for merge.";
		git checkout $2
		git merge $1
		git push origin $2
	;;
esac
