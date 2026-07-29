const { assertProductionBundleHasNoMocks } = require("./buildRemasterValidation.js");

require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: {
      main: "./src/main.js",
      "remaster-demo": "./src/remaster/demo.js",
    },
    bundle: true,
    minify: true,
    metafile: true,
    outdir: "evolve",
  })
  .then(assertProductionBundleHasNoMocks)
  .catch(() => process.exit(1));
