const { assertProductionBundleHasNoMocks } = require("./buildRemasterValidation.js");
const { copyRemasterAssets } = require("./buildRemasterAssets.js");

require("esbuild")
  .build({
    logLevel: "debug",
    entryPoints: {
      main: "./src/main.js",
      "remaster-demo": "./src/remaster/demo.js",
    },
    bundle: true,
    minify: false,
    metafile: true,
    sourcemap : true,
    outdir: "evolve",
  })
  .then((result) => {
    assertProductionBundleHasNoMocks(result);
    copyRemasterAssets();
  })
  .catch(() => process.exit(1));
