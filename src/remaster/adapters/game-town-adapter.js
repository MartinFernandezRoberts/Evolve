import { races, biomes } from '../../races.js';
import { BUILDING_VISUAL_REGISTRY } from '../config/building-visual-registry.js';
import { TOWN_DISTRICT_LAYOUT } from '../config/town-layout.js';
import { TOWN_SCENE_CONTRACT_VERSION } from './town-scene-contracts.js';

const resourceAccents = ['#f6c65f', '#d88a4b', '#a9c1c7', '#70d7dc', '#ffd668', '#c68de8'];

function humanizeId(id) {
    return String(id).replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAmount(value) {
    return typeof value === 'number' && !Number.isNaN(value)
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : '0';
}

function buildTownBuilding(id, cityState) {
    return {
        id,
        label: humanizeId(id),
        count: Number(cityState?.count || 0),
        on: typeof cityState?.on === 'number' ? cityState.on : null
    };
}

function getAllBuildings(gameState) {
    return Object.entries(gameState.city || {})
        .filter(([, value]) => value && typeof value === 'object' && typeof value.count === 'number' && value.count > 0)
        .map(([id, value]) => buildTownBuilding(id, value));
}

function getResources(gameState) {
    return Object.entries(gameState.resource || {})
        .filter(([, resource]) => resource && resource.display)
        .map(([id, resource], index) => ({
            id,
            label: resource.name || humanizeId(id),
            value: resource.max >= 0 ? `${formatAmount(resource.amount)} / ${formatAmount(resource.max)}` : formatAmount(resource.amount),
            accent: resourceAccents[index % resourceAccents.length],
            amount: Number(resource.amount || 0),
            max: typeof resource.max === 'number' ? resource.max : -1,
            diff: Number(resource.diff || 0)
        }));
}

function getWorkers(gameState) {
    return Object.entries(gameState.civic || {})
        .filter(([, civic]) => civic && typeof civic === 'object' && typeof civic.workers === 'number')
        .map(([id, civic]) => ({ id, workers: civic.workers, max: typeof civic.max === 'number' ? civic.max : null }));
}

function getTechnologies(gameState) {
    return Object.entries(gameState.tech || {})
        .filter(([, level]) => typeof level === 'number' && level > 0)
        .map(([id, level]) => ({ id, level }));
}

function makeDistrict(layout, city) {
    const buildings = layout.buildingIds.map((id) => buildTownBuilding(id, city[id])).filter((building) => building.count > 0);
    const count = buildings.reduce((total, building) => total + building.count, 0);

    return {
        id: layout.id,
        label: layout.label,
        summary: count > 0 ? `${count} estructuras construidas en este distrito.` : 'Todavía no hay estructuras construidas en este distrito.',
        detail: count > 0 ? 'Los contadores proceden directamente del estado de ciudad original.' : 'El distrito permanece disponible como referencia visual mientras se desbloquea en el juego.',
        status: count > 0 ? `${count} construidas` : 'Sin construir',
        accent: layout.accent,
        position: { ...layout.position },
        art: layout.art,
        marker: Math.min(count, 99),
        buildings
    };
}

/**
 * @param {object} city
 * @param {(id: string) => { label?: string, unlocked?: boolean, affordable?: boolean }|undefined} [readVisualBuildingState]
 * @returns {import('./town-scene-contracts.js').TownVisualBuilding[]}
 */
function getVisualBuildings(city, readVisualBuildingState) {
    return BUILDING_VISUAL_REGISTRY.map((definition) => {
        const cityState = city[definition.id];
        const originalState = readVisualBuildingState ? (readVisualBuildingState(definition.id) || {}) : {};
        const count = Number(cityState?.count || 0);

        return {
            id: definition.id,
            district: definition.district,
            label: typeof originalState.label === 'string' ? originalState.label : humanizeId(definition.id),
            count,
            on: typeof cityState?.on === 'number' ? cityState.on : null,
            unlocked: count > 0 || originalState.unlocked === true,
            affordable: typeof originalState.affordable === 'boolean' ? originalState.affordable : null,
            detail: originalState.detail && typeof originalState.detail === 'object' ? originalState.detail : null
        };
    });
}

/**
 * Transforma un estado real de Evolve en un contrato exclusivamente de lectura.
 *
 * No importa el estado de módulo: el llamador le pasa el objeto actual y el
 * adaptador no conserva referencias a él. No evalúa costes, producción, requisitos ni
 * fórmulas; se limita a seleccionar y presentar valores ya calculados.
 *
 * @param {object} gameState Estado actual de Evolve proporcionado por el integrador.
 * @param {(id: string) => { label?: string, unlocked?: boolean, affordable?: boolean }|undefined} [readVisualBuildingState] Puente hacia comprobaciones originales del integrador.
 * @returns {import('./town-scene-contracts.js').TownSnapshot}
 */
export function createGameTownSnapshot(gameState, readVisualBuildingState) {
    const speciesId = gameState.race?.species || 'unknown';
    const species = races[speciesId] || {};
    const biomeId = gameState.city?.biome || null;
    const biome = biomeId && biomes[biomeId] ? biomes[biomeId] : {};
    const populationResource = gameState.resource?.[speciesId] || {};
    const city = gameState.city || {};
    const calendar = city.calendar || {};
    const government = gameState.civic?.govern || {};
    const resources = getResources(gameState);
    const buildings = getAllBuildings(gameState);
    const visualBuildings = getVisualBuildings(city, readVisualBuildingState);

    return {
        contractVersion: TOWN_SCENE_CONTRACT_VERSION,
        source: 'engine',
        title: 'Visual Remaster',
        subtitle: 'Vista gráfica de Civilización basada en el estado actual de la partida.',
        resources,
        districts: TOWN_DISTRICT_LAYOUT.map((layout) => makeDistrict(layout, city)),
        visualBuildings,
        context: {
            species: { id: speciesId, label: species.name || humanizeId(speciesId) },
            biome: { id: biomeId, label: biome.label || biomeId },
            planet: species.home || null,
            season: typeof calendar.season === 'number' ? calendar.season : null,
            weather: typeof calendar.weather === 'number' ? calendar.weather : null,
            population: { amount: Number(populationResource.amount || 0), max: typeof populationResource.max === 'number' ? populationResource.max : 0, label: populationResource.name || humanizeId(speciesId) },
            workers: getWorkers(gameState),
            buildings,
            technologies: getTechnologies(gameState),
            energy: { available: typeof city.power === 'number' ? city.power : null, powered: typeof city.powered === 'boolean' ? city.powered : null },
            morale: { current: typeof city.morale?.current === 'number' ? city.morale.current : null, potential: typeof city.morale?.potential === 'number' ? city.morale.potential : null },
            government: { id: government.type || null, label: government.type ? humanizeId(government.type) : null }
        }
    };
}
