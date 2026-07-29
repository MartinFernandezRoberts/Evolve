/**
 * Contratos de frontera del remaster.
 *
 * Estos typedefs no importan ni leen el estado de Evolve. La demo usa el
 * snapshot mock de config/town-map.js; un adaptador futuro podrá producir el
 * mismo contrato desde el motor sin cambiar TownScene.
 */

export const TOWN_SCENE_CONTRACT_VERSION = 1;

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
 */

/**
 * @typedef {Object} TownSceneSnapshot
 * @property {number} contractVersion Versión del contrato de presentación.
 * @property {'mock'|'engine'} source Origen explícito de los datos.
 * @property {string} title Título de la escena ya localizado.
 * @property {string} subtitle Texto contextual ya localizado.
 * @property {TownResource[]} resources Datos resumidos de sólo lectura.
 * @property {TownDistrict[]} districts Distritos renderizables.
 */

/**
 * Comprueba la forma mínima antes de que TownScene intente renderizarla.
 * No valida reglas de juego: sólo protege la frontera de UI.
 *
 * @param {unknown} snapshot Posible snapshot de escena.
 * @returns {snapshot is TownSceneSnapshot}
 */
export function isTownSceneSnapshot(snapshot) {
    return Boolean(
        snapshot &&
        typeof snapshot === 'object' &&
        snapshot.contractVersion === TOWN_SCENE_CONTRACT_VERSION &&
        Array.isArray(snapshot.resources) &&
        Array.isArray(snapshot.districts)
    );
}
