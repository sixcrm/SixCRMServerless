#!/bin/bash
set -e
set -u
set -o pipefail

git fetch --all

case "$2" in
	*)
		echo "Skipping version tagging requirements for merge.";
		git checkout $2
		git merge $1
		git push origin $2
	;;
esac
