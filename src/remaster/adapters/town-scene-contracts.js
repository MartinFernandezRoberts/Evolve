/**
 * Contratos de frontera del remaster.
 *
 * Estos typedefs no importan ni leen el estado de Evolve. La demo usa el
 * snapshot mock de config/town-map.js; el adaptador de juego produce el mismo
 * contrato desde una entrada de sólo lectura sin cambiar TownScene.
 */

export const TOWN_SCENE_CONTRACT_VERSION = 2;

/**
 * @typedef {'center'|'housing'|'agriculture'|'forest'|'quarry'|'science'|'religion'|'industry'|'government'|'military'} TownDistrictId
 */

/**
 * @typedef {'hall'|'homes'|'farm'|'lumber'|'quarry'|'observatory'|'shrine'|'workshop'|'council'|'fort'} TownArtKind
 */

/**
 * @typedef {Object} TownPosition
 * @property {number} x Posición horizontal en el viewBox del mapa.
 * @property {number} y Posición vertical en el viewBox del mapa.
 */

/**
 * @typedef {Object} TownResource
 * @property {string} id Identificador estable para la presentación.
 * @property {string} label Texto ya localizado por quien produzca el snapshot.
 * @property {string} value Valor ya formateado, sin fórmulas en la escena.
 * @property {string} accent Color de presentación del recurso.
 * @property {number} amount Cantidad original, sin transformación de reglas.
 * @property {number} max Capacidad original del recurso.
 * @property {number} diff Variación calculada por el motor.
 */

/**
 * @typedef {Object} TownBuilding
 * @property {string} id Identificador de la estructura original.
 * @property {string} label Etiqueta de presentación.
 * @property {number} count Cantidad construida según el estado original.
 * @property {number|null} on Cantidad activa cuando la estructura la define.
 */

/**
 * @typedef {Object} TownVisualBuilding
 * @property {string} id Id original de `actions.city` incluido en el registro visual.
 * @property {TownDistrictId} district Distrito de presentación declarado.
 * @property {string} label Nombre localizado por la acción original.
 * @property {number} count Cantidad construida; nunca determina el número de sprites.
 * @property {number|null} on Cantidad activa original cuando aplica.
 * @property {boolean} unlocked Resultado de los requisitos originales.
 * @property {boolean|null} affordable Resultado de la asequibilidad original si está desbloqueado.
 * @property {TownBuildingDetail|null} [detail] Engine-prepared detail panel data.
 */

/**
 * @typedef {Object} TownBuildingCost
 * @property {string} text Cost formatted by the original renderer.
 * @property {'sufficient'|'warning'|'insufficient'} status Engine-resolved availability.
 */

/**
 * @typedef {Object} TownBuildingWorker
 * @property {string} id Original Civics job id.
 * @property {string} label Localized engine label.
 * @property {number} workers Current worker count.
 * @property {number|null} max Original job capacity.
 * @property {boolean} canAssign Original assignment constraints result.
 * @property {boolean} canRemove Original removal constraints result.
 */

/**
 * @typedef {Object} TownBuildingDetail
 * @property {string} description Original action description without HTML markup.
 * @property {string} effect Original production or effect without HTML markup.
 * @property {TownBuildingCost[]} costs Current cost without scene-side calculation.
 * @property {boolean} affordable Original complete affordability result.
 * @property {number[]} buildAmounts Multipliers supported by the original action.
 * @property {boolean} maxBuild Whether the engine offers a native build-max semantic.
 * @property {{ value: number, direction: 'used'|'produced' }|null} energy Original `powered()` result.
 * @property {{ on: number, off: number }|null} enabled Active structure state.
 * @property {TownBuildingWorker[]} workers Related original jobs.
 * @property {{ count: number, amount: number }} queue Original building queue entries.
 */

/**
 * @typedef {Object} TownDistrict
 * @property {TownDistrictId} id Identificador estable del distrito.
 * @property {string} label Nombre ya localizado.
 * @property {string} summary Descripción corta ya localizada.
 * @property {string} detail Información de panel ya preparada por el adaptador.
 * @property {string} status Estado de presentación; no es una regla de juego.
 * @property {string} accent Color original del marcador.
 * @property {TownPosition} position Posición puramente visual.
 * @property {TownArtKind} art Variante de SVG temporal y original.
 * @property {number} marker Cantidad ya calculada por quien produzca los datos.
 * @property {TownBuilding[]} buildings Estructuras reales agrupadas sólo para presentación.
 */

/**
 * @typedef {Object} TownSnapshotContext
 * @property {{ id: string, label: string }} species Especie actual.
 * @property {{ id: string|null, label: string|null }} biome Bioma actual.
 * @property {string|null} planet Planeta de origen.
 * @property {number|null} season Estación codificada por el motor.
 * @property {number|null} weather Clima codificado por el motor.
 * @property {{ amount: number, max: number, label: string }} population Recurso de población original.
 * @property {{ id: string, workers: number, max: number|null }[]} workers Empleos con trabajadores.
 * @property {TownBuilding[]} buildings Todas las estructuras urbanas construidas.
 * @property {{ id: string, level: number }[]} technologies Tecnologías numéricas activas.
 * @property {{ available: number|null, powered: boolean|null }} energy Estado de energía original disponible.
 * @property {{ current: number|null, potential: number|null }} morale Moral original.
 * @property {{ id: string|null, label: string|null }} government Gobierno actual.
 */

/**
 * @typedef {Object} TownSnapshot
 * @property {number} contractVersion Versión del contrato de presentación.
 * @property {'mock'|'engine'} source Origen explícito de los datos.
 * @property {string} title Título de la escena ya localizado.
 * @property {string} subtitle Texto contextual ya localizado.
 * @property {TownResource[]} resources Datos resumidos de sólo lectura.
 * @property {TownDistrict[]} districts Distritos renderizables.
 * @property {TownVisualBuilding[]} visualBuildings Edificios reales admitidos por BuildingVisualRegistry.
 * @property {TownSnapshotContext} context Contexto de juego sólo de lectura.
 */

/**
 * Comprueba la forma mínima antes de que TownScene intente renderizarla.
 * No valida reglas de juego: sólo protege la frontera de UI.
 *
 * @param {unknown} snapshot Posible snapshot de escena.
 * @returns {snapshot is TownSnapshot}
 */
export function isTownSceneSnapshot(snapshot) {
    return Boolean(
        snapshot &&
        typeof snapshot === 'object' &&
        snapshot.contractVersion === TOWN_SCENE_CONTRACT_VERSION &&
        Array.isArray(snapshot.resources) &&
        Array.isArray(snapshot.districts) &&
        Array.isArray(snapshot.visualBuildings) &&
        snapshot.context &&
        typeof snapshot.context === 'object'
    );
}
