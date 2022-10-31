# npm-jetpack

## Description

This package is dedicated to help in handling npm packages versions while publishing.

## Usage overview

### What does npm-jetpack do

1) Takes current package.json ();
2) Updates version according to flag / params;
3) Saves updated package.json to dist folder (project root if dist not provided);
4) Overwrites original ('single source of truth') package.json for future updates;
5) Commits new changes in project and package.json updated to git (on demand via flag); 
6) Publishes package to npm (on demand via flag);
7) ?????????
8) PROFIT!1!!!

### Options, flags and parameters

Options and their defaults:

```
{
    distDirPath: '',
    // relative path to final directory to be published
    // usually it is "build" or "dist" or any other dir
    // where author puts final package distributive for npm
    // the tool will place updated package.json there
    
    packageJsonPath: 'package.json', // relative path to package.json
    // the initial package.json file with current version of
    // package being published (it can be root repository
    // package.json or package.json in "build" or "dist" dir
    // - the most important for it is to handle current version
    // of the package published)
    
    versionUpdateType: 2, // 'patch'
    // it is target version part to increment, with 0 | 1 | 2 values
    // reflecting index of the part, 2 - 'patch', 1 - 'minor', 0 - 'major'.
    
    releaseSuffix: '', // no release suffix
    // will be added to new version if provided
    
    gitCommit: false, // only on demand
    // tool will run sequently 'git add .', 'git commit -m "Version update to ${nextVersion}"',
    // 'git push' commands when package.json is updated
    
    doPublish: false, // only on demand
    // tool will run "npm publish" command in the end of its work 
}
```

Flags:

```
Choose one or none (default "--patch" will be applied)
    "--patch" - will increase 'patch' version (versionUpdateType 2)
    "--minor" - will increase 'minor' version (versionUpdateType 1)
    "--major" - will increase 'major' version (versionUpdateType 0)
    "--commit" - will apply true to 'gitCommit' param
    "--publish" - will apply true to 'doPublish' param
```

Parameters:

```
    --distDirPath path/to/my/dist/dir
    --packageJsonPath path/to/my/main/source/package.json
    --releaseSuffix -alfa
```

You can use this package in both "npx" and "npm i -D" approaches.

### Usage as NPX

Can be used in **package.json** npm scripts or via CLI:

```
    npx npm-jetpack <FLAGS_AND_PARAMETERS>
```

Sample:

```
    npx npm-jetpack
                    --major
                    --packageJsonPath package.json
                    --distDirPath build
                    --releaseSuffix -pr20
                    --commit
                    --publish
```

### Usage as NPM

```
    npm install -D npm-jetpack
```
and then use it in **package.json** npm scripts like this:

```
scripts: {
    "update": "npm run test & npm-jetpack --releaseSuffix -alpha --commit --publish",
    "update-minor": "npm run test & npm-jetpack --minor --commit --publish",
    "update-major": "npm run test & npm-jetpack --major --commit --publish"
}
```

