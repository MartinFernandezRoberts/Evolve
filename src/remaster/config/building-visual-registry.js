/**
 * Registro declarativo de representaciones de edificios de Civilización.
 *
 * Las claves son ids reales de `actions.city`. Los niveles y posiciones sólo
 * determinan composición SVG: no representan costes, producción ni requisitos
 * del motor. Cada `sprite` apunta a una forma SVG original de este fork.
 */

const compactLevels = Object.freeze([
    { min: 1, key: 'small', secondary: 0 },
    { min: 4, key: 'settled', secondary: 1 },
    { min: 12, key: 'dense', secondary: 2 },
    { min: 40, key: 'landmark', secondary: 3 }
]);

const civicLevels = Object.freeze([
    { min: 1, key: 'small', secondary: 0 },
    { min: 3, key: 'expanded', secondary: 1 },
    { min: 8, key: 'established', secondary: 2 },
    { min: 24, key: 'district', secondary: 3 }
]);

const industrialLevels = Object.freeze([
    { min: 1, key: 'small', secondary: 0 },
    { min: 3, key: 'working', secondary: 1 },
    { min: 9, key: 'complex', secondary: 2 },
    { min: 28, key: 'works', secondary: 3 }
]);

const hiddenWhenLocked = Object.freeze({ locked: 'hidden', available: 'terrain-plot', noResources: 'supply-marker' });

/**
 * @typedef {Object} BuildingVisualDefinition
 * @property {string} id Id original de `actions.city`.
 * @property {import('../adapters/town-scene-contracts.js').TownDistrictId} district Distrito visual.
 * @property {{ source: 'actions.city.title' }} localizedName Fuente del nombre localizado.
 * @property {string} sprite Id de silueta histÃ³rica, conservado para el registro.
 * @property {string} asset Id de un sprite CC0 local en assets/kenney-assets.js.
 * @property {{ min: number, key: string, secondary: number }[]} visualLevels Niveles sólo visuales.
 * @property {{ x: number, y: number, scale: number }[]} positions Posiciones relativas válidas al nodo de distrito.
 * @property {string[]} animations Animaciones decorativas permitidas.
 * @property {{ supportsPower: boolean, locked: string, available: string, noResources: string }} states Presentación de estados sin reglas propias.
 * @property {{ format: 'count', cap: number }} quantityIndicator Indicador de cantidad, nunca una unidad por sprite.
 * @property {string[]} workerJobs Empleos originales relacionados, sólo para presentación y controles delegados.
 */

/** @type {readonly BuildingVisualDefinition[]} */
export const BuildingVisualRegistry = Object.freeze([
    { id: 'basic_housing', district: 'housing', localizedName: { source: 'actions.city.title' }, sprite: 'housing', asset: 'civicAmber', visualLevels: compactLevels, positions: [{ x: -42, y: 4, scale: .72 }], animations: ['window-glow'], states: { supportsPower: false, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: [] },
    { id: 'farm', district: 'agriculture', localizedName: { source: 'actions.city.title' }, sprite: 'farm', asset: 'farmland', visualLevels: compactLevels, positions: [{ x: -28, y: 6, scale: .72 }], animations: ['water-wheel'], states: { supportsPower: false, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['farmer'] },
    { id: 'lumber_yard', district: 'forest', localizedName: { source: 'actions.city.title' }, sprite: 'lumberyard', asset: 'civicAmber', visualLevels: civicLevels, positions: [{ x: 30, y: 9, scale: .7 }], animations: ['saw-motion'], states: { supportsPower: false, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['lumberjack'] },
    { id: 'rock_quarry', district: 'quarry', localizedName: { source: 'actions.city.title' }, sprite: 'quarry', asset: 'industryStone', visualLevels: industrialLevels, positions: [{ x: -34, y: 13, scale: .68 }], animations: ['crane-swing'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['quarry_worker'] },
    { id: 'mine', district: 'quarry', localizedName: { source: 'actions.city.title' }, sprite: 'mine', asset: 'industryStone', visualLevels: industrialLevels, positions: [{ x: 37, y: 9, scale: .66 }], animations: ['cart-roll'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['miner'] },
    { id: 'library', district: 'science', localizedName: { source: 'actions.city.title' }, sprite: 'library', asset: 'civicAmber', visualLevels: civicLevels, positions: [{ x: -38, y: 16, scale: .66 }], animations: ['page-glow'], states: { supportsPower: false, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['scientist'] },
    { id: 'university', district: 'science', localizedName: { source: 'actions.city.title' }, sprite: 'university', asset: 'civicRed', visualLevels: civicLevels, positions: [{ x: 40, y: 7, scale: .68 }], animations: ['beacon-pulse'], states: { supportsPower: false, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['professor'] },
    { id: 'temple', district: 'religion', localizedName: { source: 'actions.city.title' }, sprite: 'temple', asset: 'civicRed', visualLevels: civicLevels, positions: [{ x: -18, y: 6, scale: .7 }], animations: ['banner-wave'], states: { supportsPower: false, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['priest'] },
    { id: 'garrison', district: 'military', localizedName: { source: 'actions.city.title' }, sprite: 'garrison', asset: 'industryStone', visualLevels: civicLevels, positions: [{ x: 18, y: 5, scale: .68 }], animations: ['banner-wave', 'patrol-step'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['garrison'] },
    { id: 'foundry', district: 'industry', localizedName: { source: 'actions.city.title' }, sprite: 'foundry', asset: 'industryRed', visualLevels: industrialLevels, positions: [{ x: -45, y: 8, scale: .67 }], animations: ['smoke-rise', 'furnace-glow'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['craftsman'] },
    { id: 'factory', district: 'industry', localizedName: { source: 'actions.city.title' }, sprite: 'factory', asset: 'industryStone', visualLevels: industrialLevels, positions: [{ x: 35, y: 9, scale: .67 }], animations: ['smoke-rise', 'machine-turn'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: ['craftsman'] },
    { id: 'coal_power', district: 'industry', localizedName: { source: 'actions.city.title' }, sprite: 'power-coal', asset: 'utility', visualLevels: industrialLevels, positions: [{ x: 3, y: -42, scale: .62 }], animations: ['smoke-rise', 'power-pulse'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: [] },
    { id: 'oil_power', district: 'industry', localizedName: { source: 'actions.city.title' }, sprite: 'power-oil', asset: 'utility', visualLevels: industrialLevels, positions: [{ x: 72, y: -20, scale: .58 }], animations: ['smoke-rise', 'power-pulse'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: [] },
    { id: 'fission_power', district: 'industry', localizedName: { source: 'actions.city.title' }, sprite: 'power-fission', asset: 'utility', visualLevels: industrialLevels, positions: [{ x: -72, y: -18, scale: .58 }], animations: ['reactor-pulse'], states: { supportsPower: true, ...hiddenWhenLocked }, quantityIndicator: { format: 'count', cap: 999 }, workerJobs: [] }
]);

export const BUILDING_VISUAL_REGISTRY = BuildingVisualRegistry;

const registryById = new Map(BuildingVisualRegistry.map((definition) => [definition.id, definition]));

/** @param {string} id @returns {BuildingVisualDefinition|undefined} */
export function getBuildingVisualDefinition(id) {
    return registryById.get(id);
}

/**
 * @param {BuildingVisualDefinition} definition
 * @param {number} count
 * @returns {{ min: number, key: string, secondary: number }}
 */
export function getBuildingVisualLevel(definition, count) {
    return definition.visualLevels.reduce((current, level) => count >= level.min ? level : current, definition.visualLevels[0]);
}

/** La densidad es decorativa; no alimenta ni refleja una regla del motor. */
export function getDistrictVisualDensity(visualBuildings) {
    const total = visualBuildings.reduce((sum, building) => sum + building.count, 0);
    if (total >= 24) {
        return 'dense';
    }
    if (total >= 7) {
        return 'settled';
    }
    return total > 0 ? 'sparse' : 'open';
}
