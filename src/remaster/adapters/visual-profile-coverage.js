import { createTownVisualProfileCatalog, resolveTownVisualProfile } from '../config/town-visual-profiles.js';

function makeFixtureSnapshot(species, biome, planetTraits = []) {
    return Object.freeze({
        context: Object.freeze({
            species: Object.freeze(species || { id: 'unknown', type: 'other' }),
            biome: Object.freeze(biome || { id: null }),
            environment: Object.freeze({ season: 0, weather: 2, temperature: 1, wind: 0, planetTraits: Object.freeze([...planetTraits]) }),
            technologies: Object.freeze([])
        }),
        visualBuildings: Object.freeze([])
    });
}

function makeFixture(snapshot, catalog) {
    const profile = resolveTownVisualProfile(snapshot, catalog);
    return Object.freeze({
        race: profile.race.id,
        genus: profile.race.genus,
        biome: profile.biome.id,
        architecture: profile.race.architecture,
        terrain: profile.biome.terrain,
        overlays: Object.freeze(profile.planetOverlays.map((overlay) => overlay.id)),
        waterways: profile.waterways,
        fallback: profile.race.fallback || profile.biome.fallback
    });
}

/**
 * Genera fixtures de cobertura a partir de las mismas definiciones que el
 * adaptador inyecta en el registro real. No consulta global ni persiste datos.
 * La fixture `reset` modela una civilización recién reiniciada para confirmar
 * que la resolución no conserva perfiles de la selección anterior.
 *
 * @param {{ genera?: Record<string, object>, species?: Record<string, { type?: string }>, biomes?: Record<string, object>, planetTraits?: Record<string, object> }} definitions
 */
export function createVisualProfileCoverageFixtures(definitions = {}) {
    const catalog = createTownVisualProfileCatalog(definitions);
    const genera = Object.keys(definitions.genera || {}).map((id) => makeFixture(
        makeFixtureSnapshot({ id: `genus-${id}`, type: id }, { id: 'unknown' }), catalog
    ));
    const species = Object.entries(definitions.species || {}).map(([id, definition]) => makeFixture(
        makeFixtureSnapshot({ id, type: definition?.type || 'other' }, { id: 'unknown' }), catalog
    ));
    const biomes = Object.keys(definitions.biomes || {}).map((id) => makeFixture(
        makeFixtureSnapshot({ id: 'unknown', type: 'other' }, { id }), catalog
    ));
    const planetOverlays = Object.keys(definitions.planetTraits || {}).map((id) => makeFixture(
        makeFixtureSnapshot({ id: 'unknown', type: 'other' }, { id: 'unknown' }, [id]), catalog
    ));

    return Object.freeze({
        catalog,
        genera: Object.freeze(genera),
        species: Object.freeze(species),
        biomes: Object.freeze(biomes),
        planetOverlays: Object.freeze(planetOverlays),
        fallback: makeFixture(makeFixtureSnapshot({ id: 'future-species', type: 'future-genus' }, { id: 'future-biome' }, ['future-trait']), catalog),
        representative: makeFixture(makeFixtureSnapshot({ id: 'octigoran', type: 'aquatic' }, { id: 'desert' }, ['stormy']), catalog),
        reset: makeFixture(makeFixtureSnapshot({ id: 'unknown', type: 'other' }, { id: null }), catalog)
    });
}

/** @param {ReturnType<typeof createVisualProfileCoverageFixtures>} fixtures */
export function hasCompleteVisualProfileCoverage(fixtures) {
    const groups = [fixtures?.genera, fixtures?.species, fixtures?.biomes, fixtures?.planetOverlays];
    return Boolean(
        groups.every((entries) => Array.isArray(entries) && entries.every((entry) => entry.architecture && entry.terrain))
        && fixtures?.fallback?.fallback
        && fixtures?.representative?.waterways === 'channels'
        && fixtures?.reset?.fallback
    );
}
