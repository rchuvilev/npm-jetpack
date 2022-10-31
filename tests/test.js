// RUN FROM PACKAGE.JSON NPM SCRIPT ONLY

const fs = require('fs');
const path = require('path');
const rootDir = process.cwd();
const childProcess = require('child_process');

const errors = [];
const testCases = [
    { //
        name: "test-patch-default",
        subdir: '',
        file: '.patch.default',
        ver: '0.0.1',
        command: '',
    },
    {
        name: "test-patch",
        subdir: '',
        file: '.patch',
        ver: '0.0.1',
        command: "--patch",
    },
    {
        name: "test-minor",
        subdir: '',
        file: '.minor',
        ver: '0.1.0',
        command: "--minor",
    },
    {
        name: "test-major",
        subdir: '',
        file: '.major',
        ver: '1.0.0',
        command: "--major",
    },
];

(function runTests() {
    testCases.forEach(testCase => {
        try {
            childProcess.spawnSync(
                `npx npm-jetpack ${testCase.command} --distDirPath tests --packageJsonPath tests/package.json --testing ${testCase.file}`,
                {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    shell: true,
                }
            );
            console.log(111111, path.resolve(rootDir, 'tests', testCase.subdir, `package${testCase.file}.json`));
            const package = fs.readFileSync(JSON.parse(path.resolve(rootDir, 'tests', testCase.subdir, `package${testCase.file}.json`)));
            // fs.unlink(path.resolve(rootDir, 'tests', testCase.subdir, `package${testCase.file}.json`));
            if (package.version !== testCase.ver) {
                throw new Error(`Wrong version: ${package.version} instead of ${testCase.ver}`);
            }
        } catch (error) {
            console.error(22222, error)
            errors.push({
                testCase: testCase.name,
                error,
            });
        }
    });
}());

const testCasesPassed = testCases.filter(testCase => !errors.some(err => err.testCase === testCase.name));
if (errors.length) {
    console.log(`TESTS FAILED: passed ${testCasesPassed.length} of ${testCases.length}`);
    console.log(`Total errors: ${errors.length}`);
    console.log(`Errors details: ${JSON.stringify(errors, null, 2)}`)
} else {
    console.log(`TESTS SUCCEEDED: passed ${testCasesPassed.length} of ${testCases.length}`);
}
