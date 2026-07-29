const esbuild = require('esbuild');
const path = require('path');

async function run() {
  const testFile = path.join(__dirname, 'test', 'remaster', 'integration-contract.test.js');
  const result = await esbuild.build({
    entryPoints: [testFile],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node16',
    write: false,
    logLevel: 'silent',
  });
  const testModule = { exports: {} };
  const execute = new Function('require', 'module', 'exports', '__filename', '__dirname', result.outputFiles[0].text);
  execute(require, testModule, testModule.exports, testFile, path.dirname(testFile));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
