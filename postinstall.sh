#!/usr/bin/env bash
# lib/ is empty in the git repo and has binaries in npm
# this script triggers lib/ build when used from git link instead of npm.
if [ ! -e lib/made.js ]; then
       npm run transpile
fi
