/**
 * Umbrales exclusivamente de composición. No se copian costes, producción ni
 * desbloqueos: TownSnapshot ya comunica qué edificios y tecnologías existen.
 * Se concentran aquí para poder ajustar la lectura del diorama sin tocar el
 * motor ni guardar estado visual en una partida.
 */
export const SETTLEMENT_VISUAL_THRESHOLDS = Object.freeze([
    { id: 'outpost', minimumPopulation: 0 },
    { id: 'village', minimumPopulation: 12 },
    { id: 'town', minimumPopulation: 60 },
    { id: 'industrial', minimumPopulation: 180 },
    { id: 'electrified', minimumPopulation: 420 }
]);

const technologySignals = Object.freeze({
    village: [{ id: 'agriculture', level: 1 }],
    town: [{ id: 'agriculture', level: 4 }, { id: 'steel', level: 1 }],
    industrial: [{ id: 'electricity', level: 1 }, { id: 'electronics', level: 1 }],
    electrified: [{ id: 'fission', level: 1 }]
});

function hasTechnology(technologies, signal) {
    return technologies.some((technology) => technology.id === signal.id && technology.level >= signal.level);
}

/**
 * @param {import('../adapters/town-scene-contracts.js').TownSnapshot} snapshot
 * @returns {{ id: string, builtCount: number, activeDistricts: number }}
 */
export function resolveSettlementVisualProgression(snapshot) {
    const population = snapshot.context.population?.amount || 0;
    const technologies = snapshot.context.technologies || [];
    const builtCount = snapshot.visualBuildings.reduce((total, building) => total + building.count, 0);
    const activeDistricts = new Set(snapshot.visualBuildings.filter((building) => building.count > 0).map((building) => building.district)).size;
    let id = builtCount > 0 ? 'outpost' : 'outpost';

    SETTLEMENT_VISUAL_THRESHOLDS.slice(1).forEach((threshold) => {
        const signalled = (technologySignals[threshold.id] || []).some((signal) => hasTechnology(technologies, signal));
        if (population >= threshold.minimumPopulation || signalled) {
            id = threshold.id;
        }
    });

    return { id, builtCount, activeDistricts };
}
