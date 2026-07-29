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
        building: building ? { id: building.id, count: building.count, on: building.on, queue: building.detail?.queue || null } : null,
        resources: snapshot.resources.map((resource) => ({ id: resource.id, amount: resource.amount, max: resource.max })),
        workers: building?.detail?.workers || [],
        energy: snapshot.context.energy
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
