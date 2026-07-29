require("esbuild")
  .build({
    logLevel: "debug",
    entryPoints: {
      main: "./src/main.js",
      "remaster-demo": "./src/remaster/demo.js",
    },
    bundle: true,
    minify: false,
    sourcemap : true,
    outdir: "evolve",
  })
  .catch(() => process.exit(1));
