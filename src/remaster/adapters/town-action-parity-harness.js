/**
 * Harness sin acceso al motor para contrastar una misma acción desde la vista
 * gráfica y desde la tarjeta clásica. Cada ejecución debe partir de una copia
 * aislada de la misma partida; este módulo compara únicamente los snapshots
 * que le entrega el entorno de prueba.
 */

function sortValue(value) {
    if (Array.isArray(value)) {
        return value.map(sortValue).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
    }
    if (value && typeof value === 'object') {
        return Object.keys(value).sort().reduce((result, key) => {
            result[key] = sortValue(value[key]);
            return result;
        }, {});
    }
    return value;
}

/**
 * Reduce un TownSnapshot a los valores que puede cambiar una acción de mapa.
 * No conoce fórmulas ni escribe una partida.
 *
 * @param {import('./town-scene-contracts.js').TownSnapshot} snapshot
 * @param {string} buildingId
 * @returns {object}
 */
export function captureTownActionParityState(snapshot, buildingId) {
    const building = snapshot.visualBuildings.find((entry) => entry.id === buildingId) || null;
    return sortValue({
        building: building ? {
            id: building.id,
            count: building.count,
            on: building.on,
            active: building.active,
            affordable: building.affordable,
            queue: building.detail?.queue || null
        } : null,
        resources: snapshot.resources.map((resource) => ({ id: resource.id, amount: resource.amount, max: resource.max, diff: resource.diff, trade: resource.trade })),
        workers: snapshot.context.workers.map((worker) => ({ id: worker.id, workers: worker.workers, assigned: worker.assigned, max: worker.max })),
        energy: snapshot.context.energy
    });
}

/**
 * Reduce una partida decodificada a los campos afectados por las acciones de
 * ciudad. El entorno de navegador puede decodificar exportaciones con el
 * importador/exportador original antes de entregar este objeto; el harness no
 * conoce LZString ni muta la partida.
 *
 * @param {object} saveState Partida ya decodificada.
 * @param {string[]} buildingIds Ids de ciudad que se contrastan.
 */
export function captureTownSaveParityState(saveState, buildingIds) {
    const city = saveState?.city || {};
    const civic = saveState?.civic || {};
    return sortValue({
        resources: Object.entries(saveState?.resource || {}).map(([id, resource]) => ({
            id,
            amount: resource?.amount,
            max: resource?.max,
            diff: resource?.diff,
            trade: resource?.trade
        })),
        buildings: (buildingIds || []).map((id) => ({
            id,
            count: city[id]?.count,
            on: city[id]?.on
        })),
        workers: Object.entries(civic)
            .filter(([, worker]) => worker && typeof worker === 'object' && typeof worker.workers === 'number')
            .map(([id, worker]) => ({ id, workers: worker.workers, assigned: worker.assigned, max: worker.max })),
        energy: {
            power: city.power,
            power_total: city.power_total,
            powered: city.powered
        }
    });
}

/**
 * @param {object} graphical Estado capturado después de una acción gráfica.
 * @param {object} classic Estado capturado después de la misma acción clásica.
 * @returns {{ equal: boolean, graphical: object, classic: object }} Resultado apto para un test o una comprobación manual.
 */
export function compareTownActionParity(graphical, classic) {
    const normalizedGraphic = sortValue(graphical);
    const normalizedClassic = sortValue(classic);
    return {
        equal: JSON.stringify(normalizedGraphic) === JSON.stringify(normalizedClassic),
        graphical: normalizedGraphic,
        classic: normalizedClassic
    };
}
