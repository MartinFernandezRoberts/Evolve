require("esbuild")
  .build({
    logLevel: "info",
    entryPoints: {
      main: "./src/main.js",
      "remaster-demo": "./src/remaster/demo.js",
    },
    bundle: true,
    minify: true,
    outdir: "evolve",
  })
  .catch(() => process.exit(1));
