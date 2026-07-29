import { races, biomes, genus_def, planetTraits } from '../../races.js';
import { BUILDING_VISUAL_REGISTRY } from '../config/building-visual-registry.js';
import { TOWN_DISTRICT_LAYOUT } from '../config/town-layout.js';
import { createTownVisualProfileCatalog, resolveTownVisualProfile } from '../config/town-visual-profiles.js';
import { TOWN_SCENE_CONTRACT_VERSION } from './town-scene-contracts.js';
import { createVisualProfileCoverageFixtures } from './visual-profile-coverage.js';

// Sólo definiciones estáticas del motor: nunca estado ni reglas de juego.
const engineTownVisualProfileCatalog = createTownVisualProfileCatalog({
    genera: genus_def,
    species: races,
    biomes,
    planetTraits
});

/** Fixtures de auditoría generadas desde todas las definiciones cargadas. */
export function createGameTownVisualProfileCoverage() {
    return createVisualProfileCoverageFixtures({
        genera: genus_def,
        species: races,
        biomes,
        planetTraits
    });
}

function finiteNumber(value, fallback = null) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function freezeSnapshot(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }
    Object.keys(value).forEach((key) => freezeSnapshot(value[key]));
    return Object.freeze(value);
}

function buildTownBuilding(id, cityState, presentation = {}) {
    return {
        id,
        label: typeof presentation.label === 'string' ? presentation.label : id,
        count: finiteNumber(cityState?.count, 0),
        on: finiteNumber(cityState?.on),
        active: finiteNumber(cityState?.on),
        maximum: finiteNumber(presentation.maximum),
        state: typeof presentation.state === 'string' ? presentation.state : (cityState?.count > 0 ? 'built' : 'available')
    };
}

function getAllBuildings(gameState, engineReader) {
    return Object.entries(gameState.city || {})
        .filter(([, value]) => value && typeof value === 'object' && typeof value.count === 'number' && value.count > 0)
        .map(([id, value]) => buildTownBuilding(id, value, engineReader.readBuiltBuilding?.(id, value) || {}));
}

function getResources(gameState, engineReader) {
    return Object.entries(gameState.resource || {})
        .filter(([, resource]) => resource && resource.display)
        .map(([id, resource], order) => {
            const presentation = engineReader.readResource?.(id, resource, order) || {};
            return {
                id,
                order: finiteNumber(presentation.order, order),
                label: typeof presentation.label === 'string' ? presentation.label : (resource.name || id),
                iconText: typeof presentation.iconText === 'string' ? presentation.iconText : String(resource.name || id).slice(0, 1),
                tooltip: typeof presentation.tooltip === 'string' ? presentation.tooltip : (resource.name || id),
                value: typeof presentation.value === 'string' ? presentation.value : String(resource.amount || 0),
                amount: finiteNumber(resource.amount, 0),
                max: finiteNumber(resource.max, -1),
                diff: finiteNumber(resource.diff, 0),
                generation: finiteNumber(resource.gen),
                unlocked: resource.display === true,
                visible: true,
                capacity: finiteNumber(resource.max, -1) >= 0,
                precision: finiteNumber(presentation.precision, 2),
                trend: typeof presentation.trend === 'string' ? presentation.trend : 'stable',
                warning: typeof presentation.warning === 'string' ? presentation.warning : 'none',
                trade: presentation.trade && typeof presentation.trade === 'object'
                    ? {
                        enabled: presentation.trade.enabled === true,
                        amount: finiteNumber(presentation.trade.amount, 0),
                        tradable: presentation.trade.tradable === true
                    }
                    : { enabled: false, amount: 0, tradable: false }
            };
        })
        .sort((left, right) => left.order - right.order);
}

function getWorkers(gameState, engineReader) {
    return Object.entries(gameState.civic || {})
        .filter(([, civic]) => civic && typeof civic === 'object' && typeof civic.workers === 'number')
        .map(([id, civic]) => {
            const presentation = engineReader.readWorker?.(id, civic) || {};
            return {
                id,
                label: typeof presentation.label === 'string' ? presentation.label : (civic.name || id),
                description: typeof presentation.description === 'string' ? presentation.description : '',
                workers: finiteNumber(civic.workers, 0),
                assigned: finiteNumber(civic.assigned, finiteNumber(civic.workers, 0)),
                max: finiteNumber(civic.max),
                visible: civic.display === true,
                canAssign: presentation.canAssign === true,
                canRemove: presentation.canRemove === true
            };
        });
}

function getTechnologies(gameState, engineReader) {
    return Object.entries(gameState.tech || {})
        .filter(([, level]) => typeof level === 'number' && level > 0)
        .map(([id, level]) => {
            const presentation = engineReader.readTechnology?.(id, level) || {};
            return {
                id,
                level,
                label: typeof presentation.label === 'string' ? presentation.label : id,
                era: typeof presentation.era === 'string' ? presentation.era : null
            };
        });
}

function getEnvironment(city, calendar, engineReader) {
    const presentation = engineReader.readEnvironment?.(city, calendar) || {};
    return {
        season: finiteNumber(calendar.season),
        seasonLabel: typeof presentation.seasonLabel === 'string' ? presentation.seasonLabel : null,
        weather: finiteNumber(calendar.weather),
        weatherLabel: typeof presentation.weatherLabel === 'string' ? presentation.weatherLabel : null,
        temperature: finiteNumber(calendar.temp),
        temperatureLabel: typeof presentation.temperatureLabel === 'string' ? presentation.temperatureLabel : null,
        wind: finiteNumber(calendar.wind),
        day: finiteNumber(calendar.day),
        planetTraits: Array.isArray(city.ptrait) ? city.ptrait.filter((trait) => typeof trait === 'string') : []
    };
}

function makeDistrict(layout, city, engineReader) {
    const buildings = layout.buildingIds
        .map((id) => buildTownBuilding(id, city[id]))
        .filter((building) => building.count > 0);
    const count = buildings.reduce((total, building) => total + building.count, 0);
    const presentation = engineReader.readDistrict?.(layout.id, count, buildings) || {};

    return {
        id: layout.id,
        label: typeof presentation.label === 'string' ? presentation.label : layout.id,
        summary: typeof presentation.summary === 'string' ? presentation.summary : '',
        detail: typeof presentation.detail === 'string' ? presentation.detail : '',
        status: typeof presentation.status === 'string' ? presentation.status : String(count),
        accent: layout.accent,
        position: { ...layout.position },
        art: layout.art,
        marker: Math.min(count, 99),
        buildings
    };
}

/**
 * @param {object} city
 * @param {TownEngineReader} engineReader
 * @returns {import('./town-scene-contracts.js').TownVisualBuilding[]}
 */
function getVisualBuildings(city, engineReader) {
    return BUILDING_VISUAL_REGISTRY.map((definition) => {
        const cityState = city[definition.id];
        const originalState = engineReader.readBuilding?.(definition.id) || {};
        const count = finiteNumber(cityState?.count, 0);
        const unlocked = count > 0 || originalState.unlocked === true;

        return {
            id: definition.id,
            district: definition.district,
            label: typeof originalState.label === 'string' ? originalState.label : definition.id,
            count,
            on: finiteNumber(cityState?.on),
            active: finiteNumber(cityState?.on),
            unlocked,
            locked: !unlocked,
            affordable: typeof originalState.affordable === 'boolean' ? originalState.affordable : null,
            status: typeof originalState.status === 'string' ? originalState.status : (unlocked ? (count > 0 ? 'built' : 'available') : 'locked'),
            maximum: finiteNumber(originalState.maximum),
            detail: originalState.detail && typeof originalState.detail === 'object' ? originalState.detail : null
        };
    });
}

/**
 * Información ya resuelta por funciones o renderizadores originales del juego.
 * El adaptador sólo copia esos valores al DTO y nunca implementa reglas.
 *
 * @typedef {Object} TownEngineReader
 * @property {(id: string, resource: object, order: number) => object} [readResource]
 * @property {(id: string, building: object) => object} [readBuiltBuilding]
 * @property {(id: string) => object} [readBuilding]
 * @property {(id: string, worker: object) => object} [readWorker]
 * @property {(id: string, level: number) => object} [readTechnology]
 * @property {(id: string, count: number, buildings: object[]) => object} [readDistrict]
 * @property {(city: object, calendar: object) => object} [readEnvironment]
 * @property {(gameState: object) => object} [readContext]
 * @property {() => { id: string, represented: boolean, panel: 'graphical'|'classic-city', fallback: 'classic-city'|null }[]} [readBuildingCoverage]
 */

/**
 * Transforma un estado real de Evolve en un `TownSnapshot` inmutable.
 *
 * El único parámetro de estado viene del puente de motor. Ningún componente de
 * escena recibe una referencia a él y este módulo no evalúa costes,
 * producción, requisitos ni fórmulas.
 *
 * @param {object} gameState Estado actual de Evolve proporcionado por el integrador.
 * @param {TownEngineReader} [engineReader] Puente de presentaciones ya calculadas.
 * @returns {import('./town-scene-contracts.js').TownSnapshot}
 */
export function createGameTownSnapshot(gameState, engineReader = {}) {
    const speciesId = gameState.race?.species || 'unknown';
    const species = races[speciesId] || {};
    const biomeId = gameState.city?.biome || null;
    const biome = biomeId && biomes[biomeId] ? biomes[biomeId] : {};
    const populationResource = gameState.resource?.[speciesId] || {};
    const city = gameState.city || {};
    const calendar = city.calendar || {};
    const government = gameState.civic?.govern || {};
    const contextPresentation = engineReader.readContext?.(gameState) || {};
    const resources = getResources(gameState, engineReader);
    const buildings = getAllBuildings(gameState, engineReader);
    const visualBuildings = getVisualBuildings(city, engineReader);
    const reportedBuildingCoverage = engineReader.readBuildingCoverage?.();

    const snapshot = {
        contractVersion: TOWN_SCENE_CONTRACT_VERSION,
        source: 'engine',
        title: typeof contextPresentation.title === 'string' ? contextPresentation.title : 'Civilization',
        subtitle: typeof contextPresentation.subtitle === 'string' ? contextPresentation.subtitle : '',
        resources,
        districts: TOWN_DISTRICT_LAYOUT.map((layout) => makeDistrict(layout, city, engineReader)),
        visualBuildings,
        buildingCoverage: Array.isArray(reportedBuildingCoverage)
            ? reportedBuildingCoverage.map((entry) => ({
                id: typeof entry.id === 'string' ? entry.id : '',
                represented: entry.represented === true,
                panel: entry.panel === 'graphical' ? 'graphical' : 'classic-city',
                fallback: entry.fallback === 'classic-city' ? 'classic-city' : null
            })).filter((entry) => entry.id)
            : [],
        context: {
            species: {
                id: speciesId,
                label: typeof contextPresentation.speciesLabel === 'string' ? contextPresentation.speciesLabel : (species.name || speciesId),
                type: species.type || 'other'
            },
            biome: {
                id: biomeId,
                label: typeof contextPresentation.biomeLabel === 'string' ? contextPresentation.biomeLabel : (biome.label || biomeId)
            },
            planet: typeof contextPresentation.planet === 'string' ? contextPresentation.planet : (species.home || null),
            stage: typeof contextPresentation.stage === 'string' ? contextPresentation.stage : null,
            season: finiteNumber(calendar.season),
            weather: finiteNumber(calendar.weather),
            environment: getEnvironment(city, calendar, engineReader),
            population: {
                amount: finiteNumber(populationResource.amount, 0),
                max: finiteNumber(populationResource.max, 0),
                label: typeof contextPresentation.populationLabel === 'string' ? contextPresentation.populationLabel : (populationResource.name || speciesId)
            },
            workers: getWorkers(gameState, engineReader),
            buildings,
            technologies: getTechnologies(gameState, engineReader),
            energy: contextPresentation.energy && typeof contextPresentation.energy === 'object'
                ? { ...contextPresentation.energy }
                : { available: finiteNumber(city.power), powered: typeof city.powered === 'boolean' ? city.powered : null },
            morale: {
                current: finiteNumber(city.morale?.current),
                potential: finiteNumber(city.morale?.potential)
            },
            government: {
                id: government.type || null,
                label: typeof contextPresentation.governmentLabel === 'string' ? contextPresentation.governmentLabel : (government.type || null)
            }
        }
    };
    snapshot.context.visual = resolveTownVisualProfile(snapshot, engineTownVisualProfileCatalog);
    return freezeSnapshot(snapshot);
}
