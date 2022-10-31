const fs = require('fs');
const path = require('path');
const LOG = (message, type = 'log') => console[type](`NPM-JETPACK - ${message}`);
const BREAK = () => {
    console.log('');
    console.log('');
    console.log('');
}

module.exports = function (useOptions = {}) {
    LOG('Starting...', 'info');
    const workingDir = process.cwd();
    LOG(`Working directory: ${workingDir}`, 'info');
    try {
        // HANDLING PROVIDED OPTIONS
        const defaultOptions = {
            distDirPath: '', // relative path to finally published directory
            packageJsonPath: 'package.json', // relative path to package.json
            versionUpdateType: 2, // 'patch'
            releaseSuffix: '', // no release suffix
            doPublish: false, // only on demand
            gitCommit: false, // only on demand
            testing: '', // output dir for testing purposes
        };
        LOG(`Default options: ${JSON.stringify(defaultOptions, null, 2)}, weight 1`);
        LOG(`Function options passed: ${JSON.stringify(useOptions, null, 2)}, weight 2`);
        const argv = [].concat(process.argv);
        argv.shift(); // removing node link
        argv.shift(); // removing exec file
        const cliOptions = {};
        argv.forEach((arg, i) => {
            if (arg.toLowerCase() === '--minor') {
                cliOptions.versionUpdateType = 1; // 'minor'
                return;
            }
            if (arg.toLowerCase() === '--major') {
                cliOptions.versionUpdateType = 0; // 'major'
                return;
            }
            if (arg.toLowerCase() === '--commit') {
                cliOptions.gitCommit = true;
                return;
            }
            if (arg.toLowerCase() === '--publish') {
                cliOptions.doPublish = true;
                return;
            }
            const keyRegexp = new RegExp('^\-\-', 'gi');
            const isKey = (val) => val.match(keyRegexp);
            const currArg = arg;
            const nextArg = argv[i + 1];
            const keyName = arg.replace(keyRegexp, '');
            const shouldApply = isKey(currArg) // it is key or go next
                && nextArg // next value exists
                && !isKey(nextArg) // next is value, not key
                && defaultOptions.hasOwnProperty(keyName); // option is supported
            if (shouldApply) {
                cliOptions[keyName] = nextArg;
            }
        });
        LOG(`Cli options passed: ${JSON.stringify(cliOptions, null, 2)}, weight 3`);
        const finalOptions = {...defaultOptions, ...useOptions, ...cliOptions};
        LOG(`Final options passed: ${JSON.stringify(finalOptions, null, 2)}`);

        // RUNNING MAIN LOGIC
        const {distDirPath, packageJsonPath, versionUpdateType, releaseSuffix, testing} = finalOptions;
        const distDir = path.resolve(workingDir, distDirPath);
        const packageJson = path.resolve(workingDir, packageJsonPath);
        LOG(`Opening current package.json from: ${packageJson}`);
        const packageJsonObj = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
        const currVersion = packageJsonObj.version || '1.0.0';
        const currVersionArr = currVersion
            .split('.') // getting version numbers
            .splice(0, 3) // applying semver
            .map(numStr => isNaN(parseInt(numStr)) ? 0 : parseInt(numStr)) // fixing version numbers
        ;
        const nextVersionArr = currVersionArr.map((verNum, i) => (
            i === versionUpdateType ?
            verNum + 1 // update the version
                : i < versionUpdateType ?
                    verNum // don't touch higher value
                    : 0 // override lower value with 0
        ));
        const nextVersion = nextVersionArr.join('.') + releaseSuffix;
        packageJsonObj.version = nextVersion;
        LOG(`Writing updated package.json to: ${path.join(distDir, 'package.json')}`);
        fs.writeFileSync(path.join(distDir, `package${testing}.json`), JSON.stringify(packageJsonObj, null, 2), 'utf8');
        if (!testing) { // additional writing to original
            fs.writeFileSync(packageJson, JSON.stringify(packageJsonObj, null, 2), 'utf8');
        }
        if (cliOptions.gitCommit) {
            try {
                LOG('Trying to do git commit (requested)');
                process.exec(`git commit -m "Version update to ${nextVersion}`);
            } catch (gitError) {
                LOG(`git commit FAILED, error: ${gitError}`, 'error');
            }
        }
        if (cliOptions.doPublish) {
            try {
                LOG('Trying to do npm publish (requested)');
                process.exec(`npm publish`);
            } catch (npmError) {
                LOG(`npm publish FAILED, error: ${npmError}`, 'error');
            }
        }
    } catch (err) {
        LOG(`${err}`, 'error');
    }
    LOG('Finished!', 'info');
    BREAK();
};
