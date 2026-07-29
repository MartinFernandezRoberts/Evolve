/**
 * Builds a coverage matrix from the live Evolution definitions. It contains no
 * knowledge of specific branches: the caller supplies the original engine's
 * visibility and executability results for every definition it enumerates.
 *
 * @param {{ id: string, visible: boolean, executable: boolean }[]} definitions
 * @returns {{ id: string, represented: boolean, executable: boolean, fallback: 'classic-hidden-until-available'|'classic-unsupported'|null }[]}
 */
export function createEvolutionCoverageMatrix(definitions) {
    return definitions.map((definition) => {
        const executable = definition.visible === true && definition.executable === true;
        return {
            id: definition.id,
            represented: executable,
            executable,
            fallback: executable ? null : (definition.visible ? 'classic-unsupported' : 'classic-hidden-until-available')
        };
    });
}

/** @param {{ represented: boolean, executable: boolean, fallback: string|null }[]} matrix */
export function hasCompleteEvolutionCoverage(matrix) {
    return matrix.every((entry) => (
        (entry.represented && entry.executable) || typeof entry.fallback === 'string'
    ));
}
