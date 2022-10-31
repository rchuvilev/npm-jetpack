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
    {
        name: "test-dist-dir",
        subdir: '/dist',
        file: '.subdir',
        ver: '0.0.1',
        command: "",
    },
];

(function runTests() {
    testCases.forEach(testCase => {
        try {
            childProcess.spawnSync(
                `npx npm-jetpack ${testCase.command} --distDirPath tests${testCase.subdir} --packageJsonPath tests/package.json --testing ${testCase.file}`,
                {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    shell: true,
                }
            );
            const package = JSON.parse(fs.readFileSync(path.join(rootDir, 'tests', testCase.subdir, `package${testCase.file}.json`), 'utf8'));
            if (testCase.subdir) {
                deleteFolderRecursive(path.join(rootDir, 'tests', testCase.subdir), { recursive: true });
            } else {
                fs.unlinkSync(path.join(rootDir, 'tests', testCase.subdir, `package${testCase.file}.json`));
            }
            if (testCase.ver && testCase.ver !== package.version) {
                errors.push(
                    errors.push({
                        testCase: testCase.name,
                        error: `Wrong version: ${package.version} instead of ${testCase.ver}`,
                    })
                );
            }
        } catch (error) {
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

    childProcess.spawnSync(
        `clear`,
        {
            stdio: 'inherit',
            cwd: process.cwd(),
            shell: true,
        }
    );
    console.log(`TESTS SUCCEEDED: passed ${testCasesPassed.length} of ${testCases.length}`);
}

if (errors.length) {
    process.exit(1);
}

function deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
};
