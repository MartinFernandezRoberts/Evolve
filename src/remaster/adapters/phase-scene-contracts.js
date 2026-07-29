/**
 * Contrato de fases del remaster. Estos DTOs son una proyección inmutable del
 * estado que el integrador ya autorizó; no importan `global` ni reglas del
 * motor.
 */

export const PHASE_SCENE_CONTRACT_VERSION = 3;

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
 * @property {{ final: number|null }} progress Valor de progreso del motor, sin reinterpretarlo.
 * @property {EvolutionResource[]} resources Recursos evolutivos ya formateados por el motor.
 * @property {EvolutionActionSnapshot[]} actions Acciones visibles que definió el motor.
 * @property {EvolutionActionCoverage[]} coverage Matriz de cobertura de todas las definiciones del motor.
 * @property {boolean} sentienceReady Resultado de la condición original, no una réplica.
 */

/**
 * @typedef {Object} EvolutionResource
 * @property {string} id Identificador original de recurso.
 * @property {string} label Nombre localizado preparado por el motor.
 * @property {string} value Valor ya formateado por el motor.
 * @property {number} amount Cantidad original.
 * @property {number|null} max Capacidad original.
 * @property {number} diff Variación original calculada por el motor.
 */

/**
 * @typedef {Object} EvolutionActionSnapshot
 * @property {string} id Clave estable de `actions.evolution`.
 * @property {string} actionId Id DOM original de la acción.
 * @property {string} label Título localizado original.
 * @property {string} description Descripción original sin HTML.
 * @property {string} effect Efecto original sin HTML.
 * @property {{ id: string, level: number }[]} requirements Requisitos originales para composición de conexiones.
 * @property {{ id: string, level: number|null }|null} grant Grant original cuando existe.
 * @property {EvolutionActionCost[]} costs Costes actuales calculados por el renderer original.
 * @property {boolean} affordable Asequibilidad original.
 * @property {boolean} available La acción superó las comprobaciones originales de visibilidad.
 * @property {boolean} locked Los nodos visibles no revelan contenido temprano, por eso es falso.
 * @property {boolean} active Estado original de selección/desafío cuando aplica.
 * @property {number|null} count Contador original cuando existe.
 * @property {string} emblem SVG/markup creado por el emblema original cuando existe.
 * @property {number|null} stage Agrupación visual derivada únicamente de `reqs.evo`.
 */

/**
 * @typedef {Object} EvolutionActionCoverage
 * @property {string} id Stable key from the original definition.
 * @property {boolean} represented True when the visible action has a generic map node.
 * @property {boolean} executable True when the bridge can delegate to the original action.
 * @property {'classic-hidden-until-available'|'classic-unsupported'|null} fallback Explicit classic fallback otherwise.
 */

/**
 * @typedef {Object} EvolutionActionCost
 * @property {string|null} id Recurso/estructura expuesto por el renderer original.
 * @property {string} text Texto de coste original.
 * @property {'sufficient'|'warning'|'insufficient'} status Disponibilidad resuelta por el renderer.
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
 * @property {import('./town-scene-contracts.js').TownSnapshot|null} town TownSnapshot existente desde el asentamiento inicial hasta Civilización.
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
 * @property {CivilizationSnapshot} civilization TownSnapshot reutilizable cuando la fase lo admite.
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
