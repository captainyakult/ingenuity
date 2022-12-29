#!/bin/bash

# Populates the build folder for deployment.

set -e

if [[ ($# -ne 3) || (($1 != "dev") && ($1 != "staging") && ($1 != "production")) ]] ; then
	echo "usage: build.sh <dev|staging|production> <version> <build folder>"
	exit 1
fi

QA_LEVEL=$1
VERSION=$2
BUILD_FOLDER=$3

# Get git branches.
PIONEER_BRANCH="v45.0.1"
ES6_UI_LIBRARY_BRANCH="mars2020"

# Update the pioneer.
echo "Making sure pioneer is up-to-date."
pushd ../pioneer > /dev/null
git fetch -p
git checkout $PIONEER_BRANCH
git reset --hard origin/$PIONEER_BRANCH
git clean -dfx
cd engine
yarn setup
cd ../scripts
yarn setup
popd > /dev/null

# Update es6-ui-library
echo "Making sure es6-ui-library is up-to-date."
pushd ../es6-ui-library > /dev/null
git fetch -p
git checkout $ES6_UI_LIBRARY_BRANCH
git reset --hard origin/$ES6_UI_LIBRARY_BRANCH
git clean -dfx
yarn setup
popd > /dev/null

# Update the dependencies.
yarn setup

# Build the app
if [[($QA_LEVEL = "staging") || ($QA_LEVEL = "production")]]; then
	yarn build-production
else
	yarn build
fi

# Create the config.js
if [[($QA_LEVEL = "production")]]; then
	printf "config = {\n\tstaticAssetsUrl: 'https://eyes.nasa.gov/assets/static',\n\tdynamicAssetsUrl: 'https://eyes.nasa.gov/assets/dynamic',\n}\n" > dist/config.js
elif [[($QA_LEVEL = "staging")]]; then
	printf "config = {\n\tstaticAssetsUrl: 'https://eyes.nasa.gov/staging/assets/static',\n\tdynamicAssetsUrl: 'https://eyes.nasa.gov/staging/assets/dynamic',\n}\n" > dist/config.js
else
	printf "config = {\n\tstaticAssetsUrl: 'https://eyes.nasa.gov/dev/assets/static',\n\tdynamicAssetsUrl: 'https://eyes.nasa.gov/dev/assets/dynamic',\n}\n" > dist/config.js
fi

# Moves files into the build folder.
rsync -rtvz --delete dist/ "$BUILD_FOLDER/"

