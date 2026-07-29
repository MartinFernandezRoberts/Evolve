const path = require('path');

function normalize(value) {
  return path.normalize(value).replace(/\\/g, '/');
}

const mockInputs = new Set([
  normalize('src/remaster/config/town-map.js'),
  normalize('src/remaster/demo.js'),
]);

/**
 * El prototipo puede compilarse como entrada independiente, pero su mock no
 * puede entrar por accidente en el bundle de la partida. Esbuild informa la
 * traza real de imports mediante `metafile`, por lo que esta comprobación no
 * depende de una búsqueda textual del output minificado.
 */
function assertProductionBundleHasNoMocks(result) {
  const outputs = result?.metafile?.outputs || {};
  const mainOutput = Object.entries(outputs).find(([output]) => normalize(output).endsWith('/evolve/main.js') || normalize(output) === 'evolve/main.js');
  if (!mainOutput) {
    throw new Error('No se encontró evolve/main.js en el metafile de esbuild.');
  }
  const imported = Object.keys(mainOutput[1].inputs || {}).map(normalize);
  const forbidden = imported.filter((input) => mockInputs.has(input));
  if (forbidden.length > 0) {
    throw new Error(`El bundle principal importa datos mock del remaster: ${forbidden.join(', ')}`);
  }
}

module.exports = { assertProductionBundleHasNoMocks };
