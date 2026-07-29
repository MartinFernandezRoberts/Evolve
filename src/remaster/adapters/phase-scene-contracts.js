/**
 * Contrato de fases del remaster. Estos DTOs son una proyección inmutable del
 * estado que el integrador ya autorizó; no importan `global` ni reglas del
 * motor.
 */

export const PHASE_SCENE_CONTRACT_VERSION = 1;

/**
 * @typedef {'evolution'|'sentience-transition'|'early-settlement'|'civilization'|'unsupported'} RemasterPhaseKind
 */

/**
 * @typedef {Object} PhaseSnapshot
 * @property {RemasterPhaseKind} kind Clasificación devuelta por el puente del motor.
 * @property {boolean} supported Si se puede montar una escena gráfica segura.
 * @property {string|null} reason Identificador técnico del fallback clásico, si aplica.
 */

/**
 * @typedef {Object} EvolutionSnapshot
 * @property {{ id: string, count: number }[]} steps Progreso real de `evolution`.
 * @property {{ id: string, level: number }[]} technologies Progreso `evo*` existente.
 * @property {boolean} sentienceReady Resultado de la condición original, no una réplica.
 */

/**
 * @typedef {Object} RaceSnapshot
 * @property {string|null} id Identificador estable de especie.
 * @property {string|null} label Etiqueta ya resuelta por el motor.
 * @property {string|null} type Género/grupo original de la especie.
 * @property {string|null} universe Universo activo.
 * @property {boolean} seeded Estado original de semilla.
 */

/**
 * @typedef {Object} EnvironmentSnapshot
 * @property {{ id: string|null, label: string|null }} biome Bioma original.
 * @property {string[]} planetTraits Rasgos originales del planeta.
 * @property {{ season: number|null, weather: number|null, temperature: number|null, wind: number|null, day: number|null }} calendar Códigos originales sin interpretar.
 */

/**
 * @typedef {Object} SettlementSnapshot
 * @property {{ amount: number|null, max: number|null }} population Recurso de población original.
 * @property {{ id: string, count: number }[]} buildings Estructuras de ciudad ya construidas.
 * @property {number} buildingTypes Número de tipos construidos, sólo para composición.
 */

/**
 * @typedef {Object} CivilizationSnapshot
 * @property {import('./town-scene-contracts.js').TownSnapshot|null} town TownSnapshot existente cuando la fase es Civilización.
 */

/**
 * @typedef {Object} RemasterPhaseSnapshot
 * @property {number} contractVersion Versión de esta frontera.
 * @property {'engine'} source Origen explícito de los datos.
 * @property {PhaseSnapshot} phase Fase resuelta por el puente del motor.
 * @property {EvolutionSnapshot} evolution Progreso de evolución.
 * @property {RaceSnapshot} race Contexto de raza/especie.
 * @property {EnvironmentSnapshot} environment Contexto planetario.
 * @property {SettlementSnapshot} settlement Estado mínimo del asentamiento.
 * @property {CivilizationSnapshot} civilization Escena de ciudad existente cuando corresponde.
 */

/**
 * Valida sólo la frontera de presentación. No valida requisitos, costes ni
 * ningún estado económico del juego.
 *
 * @param {unknown} snapshot
 * @returns {snapshot is RemasterPhaseSnapshot}
 */
export function isRemasterPhaseSnapshot(snapshot) {
    return Boolean(
        snapshot
        && typeof snapshot === 'object'
        && snapshot.contractVersion === PHASE_SCENE_CONTRACT_VERSION
        && snapshot.source === 'engine'
        && snapshot.phase
        && typeof snapshot.phase === 'object'
        && snapshot.race
        && snapshot.environment
        && snapshot.settlement
        && snapshot.civilization
    );
}
