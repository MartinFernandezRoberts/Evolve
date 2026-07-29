import { PHASE_SCENE_CONTRACT_VERSION } from './phase-scene-contracts.js';

const phaseKinds = new Set(['evolution', 'sentience-transition', 'early-settlement', 'civilization', 'unsupported']);

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

function resolvePhase(reader, gameState) {
    const reported = reader.readPhase?.(gameState) || {};
    const kind = phaseKinds.has(reported.kind) ? reported.kind : 'unsupported';
    return {
        kind,
        supported: kind !== 'unsupported',
        reason: typeof reported.reason === 'string' ? reported.reason : (kind === 'unsupported' ? 'unavailable' : null)
    };
}

function getEvolution(gameState, reader) {
    const reported = reader.readEvolution?.(gameState) || {};
    const steps = Object.entries(gameState.evolution || {})
        .filter(([, value]) => value && typeof value === 'object' && Number.isFinite(value.count))
        .map(([id, value]) => ({ id, count: value.count }));
    const technologies = Object.entries(gameState.tech || {})
        .filter(([id, value]) => (id === 'evo' || id.startsWith('evo_')) && Number.isFinite(value) && value > 0)
        .map(([id, level]) => ({ id, level }));

    return {
        steps,
        technologies,
        progress: {
            final: finiteNumber(reported.progress?.final)
        },
        resources: Array.isArray(reported.resources) ? reported.resources.map((resource) => ({
            id: typeof resource.id === 'string' ? resource.id : '',
            label: typeof resource.label === 'string' ? resource.label : resource.id,
            value: typeof resource.value === 'string' ? resource.value : String(resource.amount || 0),
            amount: finiteNumber(resource.amount, 0),
            max: finiteNumber(resource.max),
            diff: finiteNumber(resource.diff, 0)
        })).filter((resource) => resource.id) : [],
        actions: Array.isArray(reported.actions) ? reported.actions.map((action) => ({
            id: typeof action.id === 'string' ? action.id : '',
            actionId: typeof action.actionId === 'string' ? action.actionId : action.id,
            label: typeof action.label === 'string' ? action.label : action.id,
            description: typeof action.description === 'string' ? action.description : '',
            effect: typeof action.effect === 'string' ? action.effect : '',
            requirements: Array.isArray(action.requirements) ? action.requirements.map((requirement) => ({ id: requirement.id, level: finiteNumber(requirement.level, 0) })).filter((requirement) => typeof requirement.id === 'string') : [],
            grant: action.grant && typeof action.grant.id === 'string' ? { id: action.grant.id, level: finiteNumber(action.grant.level) } : null,
            costs: Array.isArray(action.costs) ? action.costs.map((cost) => ({
                id: typeof cost.id === 'string' ? cost.id : null,
                text: typeof cost.text === 'string' ? cost.text : '',
                status: ['sufficient', 'warning', 'insufficient'].includes(cost.status) ? cost.status : 'sufficient'
            })) : [],
            affordable: action.affordable === true,
            available: action.available === true,
            locked: action.locked === true,
            active: action.active === true,
            count: finiteNumber(action.count),
            emblem: typeof action.emblem === 'string' ? action.emblem : '',
            stage: finiteNumber(action.stage)
        })).filter((action) => action.id) : [],
        coverage: Array.isArray(reported.coverage) ? reported.coverage.map((entry) => ({
            id: typeof entry.id === 'string' ? entry.id : '',
            represented: entry.represented === true,
            executable: entry.executable === true,
            fallback: ['classic-hidden-until-available', 'classic-unsupported'].includes(entry.fallback) ? entry.fallback : null
        })).filter((entry) => entry.id) : [],
        sentienceReady: reported.sentienceReady === true
    };
}

function getRace(gameState, reader) {
    const raceState = gameState.race || {};
    const id = typeof raceState.species === 'string' ? raceState.species : null;
    const reported = reader.readRace?.(id, raceState) || {};
    return {
        id,
        label: typeof reported.label === 'string' ? reported.label : id,
        type: typeof reported.type === 'string' ? reported.type : (typeof raceState.maintype === 'string' ? raceState.maintype : null),
        universe: typeof raceState.universe === 'string' ? raceState.universe : null,
        seeded: raceState.seeded === true
    };
}

function getEnvironment(gameState, reader) {
    const city = gameState.city || {};
    const calendar = city.calendar || {};
    const biomeId = typeof city.biome === 'string' ? city.biome : null;
    const reported = reader.readEnvironment?.(city, calendar) || {};
    return {
        biome: {
            id: biomeId,
            label: typeof reported.biomeLabel === 'string' ? reported.biomeLabel : biomeId
        },
        planetTraits: Array.isArray(city.ptrait) ? city.ptrait.filter((trait) => typeof trait === 'string') : [],
        calendar: {
            season: finiteNumber(calendar.season),
            weather: finiteNumber(calendar.weather),
            temperature: finiteNumber(calendar.temp),
            wind: finiteNumber(calendar.wind),
            day: finiteNumber(calendar.day)
        }
    };
}

function getSettlement(gameState, speciesId) {
    const buildings = Object.entries(gameState.city || {})
        .filter(([, value]) => value && typeof value === 'object' && Number.isFinite(value.count) && value.count > 0)
        .map(([id, value]) => ({ id, count: value.count }));
    const population = speciesId ? gameState.resource?.[speciesId] : null;
    return {
        population: {
            amount: finiteNumber(population?.amount),
            max: finiteNumber(population?.max)
        },
        buildings,
        buildingTypes: buildings.length
    };
}

/**
 * @typedef {Object} PhaseEngineReader
 * @property {(gameState: object) => { kind: import('./phase-scene-contracts.js').RemasterPhaseKind, reason?: string }} [readPhase]
 * @property {(gameState: object) => { sentienceReady?: boolean, progress?: object, resources?: object[], actions?: object[], coverage?: object[] }} [readEvolution]
 * @property {(speciesId: string|null, race: object) => { label?: string, type?: string }} [readRace]
 * @property {(city: object, calendar: object) => { biomeLabel?: string }} [readEnvironment]
 * @property {(gameState: object) => import('./town-scene-contracts.js').TownSnapshot} [readCivilization]
 */

/**
 * Crea snapshots separados para cada escena posible. Las decisiones de fase
 * proceden de `readPhase`, situado en el puente autorizado de `actions.js`;
 * por ello este módulo no conoce `global`, acciones, costes o fórmulas.
 *
 * @param {object} gameState Estado real proporcionado explícitamente por el integrador.
 * @param {PhaseEngineReader} [reader]
 * @returns {import('./phase-scene-contracts.js').RemasterPhaseSnapshot}
 */
export function createGamePhaseSnapshot(gameState, reader = {}) {
    const phase = resolvePhase(reader, gameState);
    const race = getRace(gameState, reader);
    const civilizationTown = ['early-settlement', 'civilization'].includes(phase.kind) && typeof reader.readCivilization === 'function'
        ? reader.readCivilization(gameState)
        : null;

    return freezeSnapshot({
        contractVersion: PHASE_SCENE_CONTRACT_VERSION,
        source: 'engine',
        phase,
        evolution: getEvolution(gameState, reader),
        race,
        environment: getEnvironment(gameState, reader),
        settlement: getSettlement(gameState, race.id),
        civilization: { town: civilizationTown || null }
    });
}
