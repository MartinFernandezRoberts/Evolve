const fs = require('fs');
const path = require('path');

const sourceRoot = path.join(__dirname, 'src', 'remaster', 'assets', 'kenney');
const outputRoot = path.join(__dirname, 'evolve', 'remaster-assets', 'kenney');

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  fs.readdirSync(source, { withFileTypes: true }).forEach((entry) => {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(from, to);
    }
    else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  });
}

/** Copies the curated, locally versioned remaster assets after each JS build. */
function copyRemasterAssets() {
  if (!fs.existsSync(sourceRoot)) {
    return;
  }
  copyDirectory(sourceRoot, outputRoot);
}

module.exports = { copyRemasterAssets };
