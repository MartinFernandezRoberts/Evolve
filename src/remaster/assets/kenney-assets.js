/**
 * Índice de los assets curados para la escena. Todas las rutas son locales y
 * se publican por buildRemasterAssets.js; la escena nunca solicita Kenney ni
 * ningún otro host en tiempo de ejecución.
 */
// JS/SVG URLs resolve from the HTML document (repository root), unlike the
// LESS URL references which resolve from evolve/evolve.css.
const assetRoot = 'evolve/remaster-assets/kenney';

export const KenneyTownAssets = Object.freeze({
    grassPlatform: `${assetRoot}/landscape/grass-platform.png`,
    grassWhole: `${assetRoot}/roads/grass-whole.png`,
    water: `${assetRoot}/roads/water.png`,
    roadStraight: `${assetRoot}/roads/road-straight.png`,
    roadTurnNorthEast: `${assetRoot}/roads/road-turn-ne.png`,
    roadTurnEastSouth: `${assetRoot}/roads/road-turn-es.png`,
    crossroad: `${assetRoot}/roads/crossroad.png`,
    treeTall: `${assetRoot}/roads/tree-tall.png`,
    treeShort: `${assetRoot}/roads/tree-short.png`,
    civicRed: `${assetRoot}/buildings/civic-red.png`,
    civicAmber: `${assetRoot}/buildings/civic-amber.png`,
    industryStone: `${assetRoot}/buildings/industry-stone.png`,
    industryRed: `${assetRoot}/buildings/industry-red.png`,
    utility: `${assetRoot}/buildings/utility.png`,
    cornMature: `${assetRoot}/farm/corn-mature.png`,
    cornYoung: `${assetRoot}/farm/corn-young.png`,
    farmland: `${assetRoot}/farm/farmland.png`,
    panelBrown: `${assetRoot}/ui/panel-brown.png`,
    buttonBrown: `${assetRoot}/ui/button-brown.png`
});

const baseAssetIds = Object.freeze([
    'grassPlatform', 'grassWhole', 'water', 'roadStraight', 'roadTurnNorthEast',
    'roadTurnEastSouth', 'crossroad', 'treeTall', 'treeShort', 'panelBrown', 'buttonBrown'
]);
const preloaded = new Set();

/** @param {string} id */
export function getKenneyTownAsset(id) {
    return KenneyTownAssets[id] || '';
}

/**
 * Precarga sólo rutas ya necesarias por el mapa actual. Los `Image` quedan en
 * caché del navegador y no se crean por cada tick/snapshot.
 * @param {string[]} [assetIds]
 */
export function preloadKenneyTownAssets(assetIds = baseAssetIds) {
    if (typeof Image === 'undefined') {
        return;
    }
    assetIds.forEach((id) => {
        const source = getKenneyTownAsset(id);
        if (!source || preloaded.has(source)) {
            return;
        }
        const image = new Image();
        image.decoding = 'async';
        image.src = source;
        preloaded.add(source);
    });
}
