/**
 * Enrutamiento declarativo de escenas. Recibe únicamente señales ya resueltas
 * por el puente del motor; no contiene umbrales de costes, producción o
 * población y no conoce el estado global de Evolve.
 *
 * @param {{ hasSpecies?: boolean, creationActive?: boolean, bigBang?: boolean, seedSelection?: boolean, protoplasm?: boolean, sentienceReady?: boolean, cityAvailable?: boolean, hasBuiltStructure?: boolean }} signals
 * @returns {{ kind: import('../adapters/phase-scene-contracts.js').RemasterPhaseKind, reason?: string }}
 */
export function resolvePhaseRoute(signals = {}) {
    if (!signals.hasSpecies) {
        return { kind: 'unsupported', reason: 'missing-race' };
    }
    if (signals.creationActive) {
        return { kind: 'unsupported', reason: 'creation-screen' };
    }
    if (signals.bigBang) {
        return { kind: 'unsupported', reason: 'bigbang' };
    }
    if (signals.seedSelection) {
        return { kind: 'unsupported', reason: 'seed-selection' };
    }
    if (signals.protoplasm) {
        return { kind: signals.sentienceReady ? 'sentience-transition' : 'evolution' };
    }
    if (!signals.cityAvailable) {
        return { kind: 'unsupported', reason: 'city-unavailable' };
    }
    return { kind: signals.hasBuiltStructure ? 'civilization' : 'early-settlement' };
}
