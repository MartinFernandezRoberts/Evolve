/**
 * Progresión de composición del asentamiento. Sólo observa hechos que el
 * TownSnapshot ya publicó: estructuras existentes, distritos y eras de las
 * tecnologías originales. No añade costes, requisitos ni progreso guardado.
 */

export const SETTLEMENT_VISUAL_STAGES = Object.freeze([
    'wilderness',
    'camp',
    'first-homes',
    'frontier',
    'village',
    'town',
    'industrial',
    'electrified',
    'advanced'
]);

const homesteadBuildings = Object.freeze(['basic_housing', 'cottage', 'apartment', 'lodge', 'slave_pen']);
const frontierBuildings = Object.freeze(['farm', 'lumber', 'lumber_yard', 'rock_quarry', 'mine', 'coal_mine', 'oil_well']);
const powerBuildings = Object.freeze(['coal_power', 'oil_power', 'fission_power']);

function hasBuiltBuilding(buildings, ids) {
    return buildings.some((building) => ids.includes(building.id) && building.count > 0);
}

function getTechnologyEras(technologies) {
    return new Set(technologies
        .map((technology) => typeof technology?.era === 'string' ? technology.era : '')
        .filter(Boolean));
}

/**
 * @param {import('../adapters/town-scene-contracts.js').TownSnapshot} snapshot
 * @returns {{ id: string, builtCount: number, activeDistricts: number, technologyEras: string[] }}
 */
export function resolveSettlementVisualProgression(snapshot) {
    const visualBuildings = Array.isArray(snapshot.visualBuildings) ? snapshot.visualBuildings : [];
    const realBuildings = Array.isArray(snapshot.context?.buildings) && snapshot.context.buildings.length > 0
        ? snapshot.context.buildings
        : visualBuildings;
    const technologies = Array.isArray(snapshot.context?.technologies) ? snapshot.context.technologies : [];
    const builtBuildings = realBuildings.filter((building) => building.count > 0);
    const builtCount = builtBuildings.reduce((total, building) => total + building.count, 0);
    const activeDistricts = new Set((snapshot.districts || [])
        .filter((district) => district.buildings?.some((building) => building.count > 0))
        .map((district) => district.id)).size || new Set(visualBuildings
        .filter((building) => building.count > 0)
        .map((building) => building.district)).size;
    const technologyEras = getTechnologyEras(technologies);
    const unlockedBuildingExists = visualBuildings.some((building) => building.unlocked === true);
    let id = 'wilderness';

    if (unlockedBuildingExists || snapshot.context?.population?.amount > 0) {
        id = 'camp';
    }
    if (hasBuiltBuilding(builtBuildings, homesteadBuildings)) {
        id = 'first-homes';
    }
    if (hasBuiltBuilding(builtBuildings, frontierBuildings)) {
        id = 'frontier';
    }
    if (activeDistricts >= 3) {
        id = 'village';
    }
    if (activeDistricts >= 5) {
        id = 'town';
    }
    if (technologyEras.has('industrialized')) {
        id = 'industrial';
    }
    if (hasBuiltBuilding(builtBuildings, powerBuildings)) {
        id = 'electrified';
    }
    if (technologyEras.has('advanced')) {
        id = 'advanced';
    }

    return { id, builtCount, activeDistricts, technologyEras: [...technologyEras].sort() };
}
