/**
 * Cobertura declarativa de las definiciones reales de ciudad. No inspecciona
 * el motor: el integrador le entrega las claves que éste ya conoce.
 *
 * Un edificio sin arte propio sigue siendo accesible mediante el panel de
 * ciudad clásico; así el mapa nunca convierte la cobertura visual en una
 * restricción de juego.
 *
 * @param {string[]} buildingIds Ids de `actions.city` proporcionados por el motor.
 * @param {(id: string) => boolean} hasGraphicalRepresentation Consulta del registro visual.
 * @returns {{ id: string, represented: boolean, panel: 'graphical'|'classic-city', fallback: 'classic-city'|null }[]}
 */
export function createTownBuildingCoverage(buildingIds = [], hasGraphicalRepresentation = () => false) {
    return [...new Set(buildingIds.filter((id) => typeof id === 'string' && id.length > 0))]
        .sort()
        .map((id) => {
            const represented = hasGraphicalRepresentation(id) === true;
            return Object.freeze({
                id,
                represented,
                panel: represented ? 'graphical' : 'classic-city',
                fallback: represented ? null : 'classic-city'
            });
        });
}

/** @param {{ fallback: string|null }[]} coverage */
export function hasCompleteTownBuildingCoverage(coverage = []) {
    return coverage.every((entry) => entry && (entry.fallback === null || entry.fallback === 'classic-city'));
}
