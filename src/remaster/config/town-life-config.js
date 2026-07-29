/**
 * Límites de composición, no de simulación. Las capas SVG se crean una vez y
 * se ocultan por rango para que la población del motor nunca se traduzca en
 * cientos de nodos DOM.
 */
export const TOWN_LIFE_BUDGET = Object.freeze({
    normal: Object.freeze({ residents: 8, activities: 6, weatherParticles: 12 }),
    lowPower: Object.freeze({ residents: 4, activities: 3, weatherParticles: 4 }),
    reducedMotion: Object.freeze({ residents: 0, activities: 0, weatherParticles: 0 })
});

const architectureProfiles = Object.freeze({
    aquatic: Object.freeze({ key: 'aquatic', label: 'acuática' }),
    carnivore: Object.freeze({ key: 'mammalian', label: 'mamífera' }),
    insectoid: Object.freeze({ key: 'arthropod', label: 'artrópoda' }),
    avian: Object.freeze({ key: 'avian', label: 'aviar' }),
    reptilian: Object.freeze({ key: 'reptilian', label: 'reptiliana' }),
    humanoid: Object.freeze({ key: 'humanoid', label: 'humanoide' }),
    other: Object.freeze({ key: 'other', label: 'adaptable' })
});

// Las excepciones por especie conservan un perfil declarativo sin introducir
// lógica de raza en los componentes de escena.
const speciesArchitectureProfiles = Object.freeze({
    octigoran: Object.freeze({ key: 'aquatic', label: 'octigorana', variant: 'octigoran' })
});

export const TOWN_ACTIVITY_SLOTS = Object.freeze([
    Object.freeze({ id: 'farmer', x: 345, y: 516, route: 'a' }),
    Object.freeze({ id: 'miner', x: 1170, y: 242, route: 'b' }),
    Object.freeze({ id: 'transport', x: 1040, y: 585, route: 'c' }),
    Object.freeze({ id: 'researcher', x: 1035, y: 482, route: 'a' }),
    Object.freeze({ id: 'guard', x: 602, y: 684, route: 'b' }),
    Object.freeze({ id: 'industrial', x: 1195, y: 598, route: 'c' })
]);

export const TOWN_RESIDENT_SLOTS = Object.freeze([
    Object.freeze({ x: 625, y: 447, route: 'a' }),
    Object.freeze({ x: 691, y: 420, route: 'b' }),
    Object.freeze({ x: 754, y: 451, route: 'c' }),
    Object.freeze({ x: 823, y: 428, route: 'a' }),
    Object.freeze({ x: 873, y: 465, route: 'b' }),
    Object.freeze({ x: 736, y: 498, route: 'c' }),
    Object.freeze({ x: 650, y: 509, route: 'b' }),
    Object.freeze({ x: 910, y: 512, route: 'a' })
]);

/** @param {{ type?: string }|null|undefined} species */
export function getSpeciesArchitectureProfile(species) {
    return speciesArchitectureProfiles[species?.id] || architectureProfiles[species?.type] || architectureProfiles.other;
}

/** La cantidad visible se obtiene por rangos decorativos, no por individuo. */
export function getPopulationVisualCount(population) {
    if (!Number.isFinite(population) || population <= 0) {
        return 0;
    }
    if (population <= 6) {
        return 2;
    }
    if (population <= 25) {
        return 4;
    }
    if (population <= 100) {
        return 6;
    }
    return TOWN_LIFE_BUDGET.normal.residents;
}

/** @param {{ id: string, workers: number }[]} workers @param {string[]} ids */
export function getWorkersForJobs(workers, ids) {
    let total = 0;
    for (let index = 0; index < workers.length; index += 1) {
        if (ids.includes(workers[index].id)) {
            total += Number(workers[index].workers || 0);
        }
    }
    return total;
}

/** @param {import('../adapters/town-scene-contracts.js').TownVisualBuilding[]} buildings @param {string[]} ids */
export function hasActiveBuilding(buildings, ids) {
    for (let index = 0; index < buildings.length; index += 1) {
        const building = buildings[index];
        if (ids.includes(building.id) && building.count > 0 && (building.on === null || building.on > 0)) {
            return true;
        }
    }
    return false;
}

/**
 * Determina sólo si se puede mostrar una viñeta de trabajo usando contadores
 * ya calculados por el motor. No cambia recursos ni calcula producción.
 */
export function isTownActivityActive(id, workers, buildings) {
    switch (id) {
        case 'farmer':
            return getWorkersForJobs(workers, ['farmer']) > 0;
        case 'miner':
            return getWorkersForJobs(workers, ['miner', 'quarry_worker']) > 0;
        case 'transport':
            return hasActiveBuilding(buildings, ['lumber_yard', 'foundry', 'factory']);
        case 'researcher':
            return getWorkersForJobs(workers, ['scientist', 'professor']) > 0;
        case 'guard':
            return hasActiveBuilding(buildings, ['garrison']);
        case 'industrial':
            return hasActiveBuilding(buildings, ['foundry', 'factory', 'coal_power', 'oil_power', 'fission_power']);
        default:
            return false;
    }
}
