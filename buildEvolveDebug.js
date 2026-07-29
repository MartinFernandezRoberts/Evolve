const { assertProductionBundleHasNoMocks } = require("./buildRemasterValidation.js");

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
  .then(assertProductionBundleHasNoMocks)
  .catch(() => process.exit(1));
