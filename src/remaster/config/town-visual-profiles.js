import { TOWN_DISTRICT_LAYOUT } from './town-layout.js';

/**
 * El mapa no se especializa por especie. Esta composición sólo reúne perfiles
 * de presentación derivados de ids que ya publica el motor y no forma parte
 * de una partida ni de sus reglas.
 */
export const BaseSettlementLayout = Object.freeze({
    id: 'planetary-board',
    roadStyle: 'curved',
    districtIds: Object.freeze(TOWN_DISTRICT_LAYOUT.map((district) => district.id))
});

const genericRaceProfile = Object.freeze({
    id: 'generic',
    genus: 'other',
    architecture: 'adaptable',
    residentArt: 'other',
    material: 'mixed',
    culture: 'practical',
    homeForm: 'courtyard',
    landmark: 'beacon',
    emblem: 'diamond',
    animation: 'walk',
    waterways: false,
    fallback: true
});

/**
 * Las familias son una paleta artística, no una lista de razas del juego. El
 * registro resultante recorre genus_def y conserva el fallback genérico para
 * cualquier género futuro o personalizado.
 */
const genusFamilyProfiles = Object.freeze({
    humanoid: { architecture: 'humanoid', residentArt: 'humanoid', material: 'brick', culture: 'civic', homeForm: 'gable', landmark: 'tower', emblem: 'sun', animation: 'walk' },
    carnivore: { architecture: 'mammalian', residentArt: 'mammalian', material: 'timber', culture: 'clan', homeForm: 'longhouse', landmark: 'totem', emblem: 'claw', animation: 'prowl' },
    herbivore: { architecture: 'herbivore', residentArt: 'mammalian', material: 'woven', culture: 'pastoral', homeForm: 'roundhouse', landmark: 'windmill', emblem: 'leaf', animation: 'amble' },
    omnivore: { architecture: 'mammalian', residentArt: 'mammalian', material: 'stone', culture: 'market', homeForm: 'gable', landmark: 'market', emblem: 'grain', animation: 'walk' },
    small: { architecture: 'compact', residentArt: 'small', material: 'tile', culture: 'burrow', homeForm: 'low-roof', landmark: 'lantern', emblem: 'acorn', animation: 'scurry' },
    giant: { architecture: 'monumental', residentArt: 'giant', material: 'megalith', culture: 'monument', homeForm: 'tall-roof', landmark: 'monolith', emblem: 'peak', animation: 'stride' },
    reptilian: { architecture: 'reptilian', residentArt: 'reptilian', material: 'stone', culture: 'terrace', homeForm: 'sun-court', landmark: 'spire', emblem: 'scale', animation: 'stalk' },
    avian: { architecture: 'avian', residentArt: 'avian', material: 'lightwood', culture: 'aerie', homeForm: 'nest', landmark: 'wind-tower', emblem: 'feather', animation: 'hop' },
    insectoid: { architecture: 'arthropod', residentArt: 'arthropod', material: 'resin', culture: 'hive', homeForm: 'cell', landmark: 'hive', emblem: 'hex', animation: 'skitter' },
    plant: { architecture: 'living', residentArt: 'plant', material: 'vine', culture: 'grove', homeForm: 'canopy', landmark: 'heartwood', emblem: 'sprout', animation: 'sway' },
    fungi: { architecture: 'mycelial', residentArt: 'fungi', material: 'mycelium', culture: 'circle', homeForm: 'cap', landmark: 'mushroom', emblem: 'spore', animation: 'drift' },
    aquatic: { architecture: 'aquatic', residentArt: 'aquatic', material: 'coral', culture: 'tide', homeForm: 'dome', landmark: 'pool', emblem: 'wave', animation: 'float', waterways: true },
    fey: { architecture: 'fey', residentArt: 'fey', material: 'glasswood', culture: 'garden', homeForm: 'arch', landmark: 'moon-gate', emblem: 'star', animation: 'glide' },
    heat: { architecture: 'thermal', residentArt: 'thermal', material: 'basalt', culture: 'forge', homeForm: 'vent', landmark: 'furnace', emblem: 'ember', animation: 'stride' },
    polar: { architecture: 'polar', residentArt: 'polar', material: 'ice-stone', culture: 'shelter', homeForm: 'snow-dome', landmark: 'aurora', emblem: 'crystal', animation: 'trudge' },
    sand: { architecture: 'desert', residentArt: 'desert', material: 'sandstone', culture: 'caravan', homeForm: 'courtyard', landmark: 'sail', emblem: 'dune', animation: 'walk' },
    demonic: { architecture: 'infernal', residentArt: 'demonic', material: 'obsidian', culture: 'citadel', homeForm: 'arch', landmark: 'flame', emblem: 'horn', animation: 'stride' },
    angelic: { architecture: 'celestial', residentArt: 'angelic', material: 'marble', culture: 'sanctuary', homeForm: 'vault', landmark: 'halo', emblem: 'wing', animation: 'glide' },
    synthetic: { architecture: 'synthetic', residentArt: 'synthetic', material: 'alloy', culture: 'network', homeForm: 'module', landmark: 'antenna', emblem: 'circuit', animation: 'hover' },
    eldritch: { architecture: 'eldritch', residentArt: 'eldritch', material: 'voidstone', culture: 'labyrinth', homeForm: 'asymmetry', landmark: 'rift', emblem: 'eye', animation: 'drift' },
    hybrid: { architecture: 'hybrid', residentArt: 'other', material: 'mixed', culture: 'adaptive', homeForm: 'courtyard', landmark: 'beacon', emblem: 'split', animation: 'walk' }
});

function freezeProfile(id, genus, family = genericRaceProfile, override = null) {
    return Object.freeze({
        ...genericRaceProfile,
        ...family,
        ...(override || {}),
        id,
        genus,
        fallback: !genusFamilyProfiles[genus]
    });
}

/**
 * Variantes pequeñas y opcionales. No son una lista de especies admitidas:
 * cada especie del motor recibe un perfil heredado aunque no aparezca aquí.
 */
export const SpeciesVisualOverrides = Object.freeze({
    octigoran: Object.freeze({
        variant: 'octigoran',
        homeForm: 'tidal-dome',
        landmark: 'tentacle-garden',
        emblem: 'spiral',
        animation: 'tentacle-sway'
    })
});

/**
 * Construye los perfiles por id a partir de las definiciones inyectadas por el
 * adaptador del motor. La escena puede probarse sin cargar el módulo global de
 * razas y el catálogo real continúa descubriendo cada entrada automáticamente.
 *
 * @param {{ genera?: Record<string, object>, species?: Record<string, { type?: string }> }} [definitions]
 */
export function createRaceVisualProfileRegistry(definitions = {}) {
    const generaDefinitions = definitions.genera || {};
    const speciesDefinitions = definitions.species || {};
    const genera = Object.freeze(Object.fromEntries(
        Object.keys(generaDefinitions).map((id) => [id, freezeProfile(id, id, genusFamilyProfiles[id])])
    ));
    const species = Object.freeze(Object.fromEntries(Object.entries(speciesDefinitions).map(([id, definition]) => {
        const genus = typeof definition?.type === 'string' ? definition.type : 'other';
        const inherited = genera[genus] || freezeProfile('generic', genus, genusFamilyProfiles[genus]);
        return [id, freezeProfile(id, genus, inherited, SpeciesVisualOverrides[id])];
    })));
    return Object.freeze({ genera, species, fallback: genericRaceProfile });
}

/** Registro vacío y seguro para demos, pruebas y especies futuras. */
export const RaceVisualProfileRegistry = createRaceVisualProfileRegistry();
const dynamicRaceProfiles = new Map();

function getDynamicRaceProfile(id, genus) {
    const key = `${id}|${genus}`;
    if (!dynamicRaceProfiles.has(key)) {
        dynamicRaceProfiles.set(key, freezeProfile(id || 'generic', genus, genusFamilyProfiles[genus], SpeciesVisualOverrides[id]));
    }
    return dynamicRaceProfiles.get(key);
}

/** @param {{ id?: string, type?: string }|null|undefined} species @param {{ genera?: object, species?: object, fallback?: object }} [registry] */
export function getRaceVisualProfile(species, registry = RaceVisualProfileRegistry) {
    const speciesId = typeof species?.id === 'string' ? species.id : '';
    if (speciesId && registry.species?.[speciesId]) {
        return registry.species[speciesId];
    }
    const genus = typeof species?.type === 'string' ? species.type : 'other';
    return registry.genera?.[genus] || getDynamicRaceProfile(speciesId || 'generic', genus);
}

const genericBiomeProfile = Object.freeze({
    id: 'generic',
    terrain: 'temperate',
    palette: 'temperate',
    water: 'stream',
    vegetation: 'mixed',
    weatherTone: 'mild',
    art: 'grassland',
    fallback: true
});

const biomeFamilies = Object.freeze({
    grassland: { terrain: 'meadow', palette: 'grassland', water: 'stream', vegetation: 'grass', weatherTone: 'mild', art: 'grassland' },
    oceanic: { terrain: 'coast', palette: 'oceanic', water: 'tide', vegetation: 'kelp', weatherTone: 'mist', art: 'oceanic' },
    forest: { terrain: 'woodland', palette: 'forest', water: 'brook', vegetation: 'canopy', weatherTone: 'dappled', art: 'forest' },
    desert: { terrain: 'dunes', palette: 'desert', water: 'oasis', vegetation: 'succulent', weatherTone: 'dry', art: 'desert' },
    volcanic: { terrain: 'basalt', palette: 'volcanic', water: 'steam', vegetation: 'sparse', weatherTone: 'ash', art: 'volcanic' },
    tundra: { terrain: 'frost', palette: 'tundra', water: 'ice', vegetation: 'lichen', weatherTone: 'cold', art: 'tundra' },
    savanna: { terrain: 'plain', palette: 'savanna', water: 'seasonal', vegetation: 'acacia', weatherTone: 'warm', art: 'savanna' },
    swamp: { terrain: 'marsh', palette: 'swamp', water: 'pool', vegetation: 'reeds', weatherTone: 'humid', art: 'swamp' },
    ashland: { terrain: 'ash', palette: 'ashland', water: 'runoff', vegetation: 'scrub', weatherTone: 'hazy', art: 'ashland' },
    taiga: { terrain: 'conifer', palette: 'taiga', water: 'meltwater', vegetation: 'pine', weatherTone: 'crisp', art: 'taiga' },
    hellscape: { terrain: 'cinder', palette: 'hellscape', water: 'lava', vegetation: 'thorn', weatherTone: 'sulfur', art: 'hellscape' },
    eden: { terrain: 'garden', palette: 'eden', water: 'spring', vegetation: 'lush', weatherTone: 'bright', art: 'eden' }
});

function freezeBiomeProfile(id, family = genericBiomeProfile) {
    return Object.freeze({ ...genericBiomeProfile, ...family, id, fallback: !biomeFamilies[id] });
}

/** @param {Record<string, object>} [definitions] */
export function createBiomeVisualProfileRegistry(definitions = {}) {
    return Object.freeze({
        ...Object.fromEntries(Object.keys(definitions).map((id) => [id, freezeBiomeProfile(id, biomeFamilies[id])])),
        fallback: genericBiomeProfile
    });
}

/** Registro vacío y seguro; el adaptador inyecta todos los biomas del motor. */
export const BiomeVisualProfileRegistry = createBiomeVisualProfileRegistry();
const dynamicBiomeProfiles = new Map();

function getDynamicBiomeProfile(id) {
    if (!dynamicBiomeProfiles.has(id)) {
        dynamicBiomeProfiles.set(id, freezeBiomeProfile(id || 'generic', biomeFamilies[id]));
    }
    return dynamicBiomeProfiles.get(id);
}

/** @param {{ id?: string|null }|null|undefined} biome @param {Record<string, object>} [registry] */
export function getBiomeVisualProfile(biome, registry = BiomeVisualProfileRegistry) {
    const id = typeof biome?.id === 'string' ? biome.id : '';
    return registry[id] || getDynamicBiomeProfile(id);
}

const genericPlanetOverlay = Object.freeze({ id: 'generic', art: 'generic', tone: 'neutral', className: 'has-overlay-generic', fallback: true });
const planetOverlayFamilies = Object.freeze({
    toxic: { art: 'toxic', tone: 'verdant' },
    mellow: { art: 'bloom', tone: 'soft' },
    rage: { art: 'ember', tone: 'hot' },
    stormy: { art: 'storm', tone: 'electric' },
    ozone: { art: 'halo', tone: 'blue' },
    magnetic: { art: 'magnetic', tone: 'violet' },
    trashed: { art: 'debris', tone: 'rust' },
    elliptical: { art: 'rings', tone: 'gold' },
    flare: { art: 'flare', tone: 'bright' },
    dense: { art: 'crystal', tone: 'deep' },
    unstable: { art: 'rift', tone: 'volatile' },
    permafrost: { art: 'frost', tone: 'cold' },
    retrograde: { art: 'orbit', tone: 'indigo' },
    kamikaze: { art: 'meteor', tone: 'red' }
});

function freezePlanetOverlay(id, family = genericPlanetOverlay) {
    const art = family.art || genericPlanetOverlay.art;
    return Object.freeze({
        ...genericPlanetOverlay,
        ...family,
        id,
        className: `has-overlay-${art}`,
        fallback: !planetOverlayFamilies[id]
    });
}

/** @param {Record<string, object>} [definitions] */
export function createPlanetOverlayRegistry(definitions = {}) {
    return Object.freeze({
        ...Object.fromEntries(Object.keys(definitions).map((id) => [id, freezePlanetOverlay(id, planetOverlayFamilies[id])])),
        fallback: genericPlanetOverlay
    });
}

/** Registro vacío y seguro; el adaptador inyecta todos los rasgos planetarios. */
export const PlanetOverlayRegistry = createPlanetOverlayRegistry();
const dynamicPlanetOverlays = new Map();

function getDynamicPlanetOverlay(id) {
    if (!dynamicPlanetOverlays.has(id)) {
        dynamicPlanetOverlays.set(id, freezePlanetOverlay(id || 'generic', planetOverlayFamilies[id]));
    }
    return dynamicPlanetOverlays.get(id);
}

/** @param {string} id @param {Record<string, object>} [registry] */
export function getPlanetOverlayProfile(id, registry = PlanetOverlayRegistry) {
    return registry[id] || getDynamicPlanetOverlay(id);
}

/**
 * Las eras llegan en TownSnapshot desde las definiciones de acciones del
 * motor. No se importa actions.js aquí para evitar un ciclo con el puente;
 * las eras no conocidas reciben una piel neutral y siguen siendo visibles.
 */
export const TechnologyEraVisualRegistry = Object.freeze({
    foundational: Object.freeze({ id: 'foundational', buildingTone: 'craft', lightLevel: 'low', className: 'era-foundational' }),
    industrialized: Object.freeze({ id: 'industrialized', buildingTone: 'industry', lightLevel: 'medium', className: 'era-industrialized' }),
    advanced: Object.freeze({ id: 'advanced', buildingTone: 'luminous', lightLevel: 'high', className: 'era-advanced' }),
    fallback: Object.freeze({ id: 'unclassified', buildingTone: 'neutral', lightLevel: 'low', className: 'era-unclassified' })
});

/**
 * Catálogo de perfiles de una sesión. Sus tres registros por id se generan de
 * las definiciones originales que entrega el adaptador autorizado, sin que la
 * escena tenga que importar global ni que una lista manual decida cobertura.
 *
 * @param {{ genera?: Record<string, object>, species?: Record<string, { type?: string }>, biomes?: Record<string, object>, planetTraits?: Record<string, object> }} [definitions]
 */
export function createTownVisualProfileCatalog(definitions = {}) {
    return Object.freeze({
        RaceVisualProfileRegistry: createRaceVisualProfileRegistry({
            genera: definitions.genera,
            species: definitions.species
        }),
        BiomeVisualProfileRegistry: createBiomeVisualProfileRegistry(definitions.biomes),
        TechnologyEraVisualRegistry,
        PlanetOverlayRegistry: createPlanetOverlayRegistry(definitions.planetTraits)
    });
}

/** Catálogo neutral para demo, pruebas y contenido no reconocido. */
export const TownVisualProfileCatalog = createTownVisualProfileCatalog();

const dynamicEraProfiles = new Map();

/** @param {{ id?: string, era?: string|null }[]} technologies */
export function getTechnologyEraVisualProfile(technologies = []) {
    const eraIds = technologies
        .map((technology) => typeof technology?.era === 'string' ? technology.era : '')
        .filter(Boolean);
    const id = eraIds[eraIds.length - 1] || 'foundational';
    if (TechnologyEraVisualRegistry[id]) {
        return TechnologyEraVisualRegistry[id];
    }
    if (!dynamicEraProfiles.has(id)) {
        dynamicEraProfiles.set(id, Object.freeze({
            ...TechnologyEraVisualRegistry.fallback,
            id,
            className: `era-${toCssToken(id)}`
        }));
    }
    return dynamicEraProfiles.get(id);
}

const seasonIds = Object.freeze(['spring', 'summer', 'autumn', 'winter']);
const weatherIds = Object.freeze(['rain', 'overcast', 'clear']);

/**
 * @typedef {Object} TownVisualProfile
 * @property {typeof BaseSettlementLayout} baseLayout Composición base sin estado jugable.
 * @property {object} race Perfil de género o especie sólo de apariencia.
 * @property {object} biome Perfil de terreno, agua, vegetación y paleta.
 * @property {object} technologyEra Piel derivada de las eras ya informadas por el motor.
 * @property {object[]} planetOverlays Rasgos planetarios convertidos a overlays decorativos.
 * @property {object} weatherAndSeason Estado de clima y estación ya codificado por el motor.
 * @property {string} waterways Forma de agua decorativa, independiente del bioma si la raza es acuática.
 * @property {{ builtCount: number, activeCount: number, activeDistricts: string[] }} buildingState Resumen visual de edificios ya presentes.
 * @property {string[]} classNames Clases SVG resueltas fuera de los componentes.
 */

function toCssToken(value) {
    return String(value || 'generic').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'generic';
}

/** @param {{ season?: number|null, weather?: number|null, temperature?: number|null, wind?: number|null }} environment */
export function getWeatherAndSeasonProfile(environment = {}) {
    const season = seasonIds[environment.season] || 'temperate';
    const weather = environment.weather === 0 && environment.temperature === 0
        ? 'snow'
        : (weatherIds[environment.weather] || 'settled');
    return Object.freeze({
        season,
        weather,
        windy: environment.wind === 1,
        classNames: Object.freeze([
            `is-season-${season}`,
            `is-weather-${weather}`,
            ...(environment.wind === 1 ? ['is-windy'] : [])
        ])
    });
}

/** @param {import('../adapters/town-scene-contracts.js').TownVisualBuilding[]} buildings */
function getBuildingState(buildings = []) {
    const built = buildings.filter((building) => building.count > 0);
    return Object.freeze({
        builtCount: built.reduce((total, building) => total + building.count, 0),
        activeCount: built.filter((building) => building.on === null || building.on > 0).length,
        activeDistricts: Object.freeze([...new Set(built.map((building) => building.district))])
    });
}

/**
 * Compone un perfil efímero y de presentación a partir de TownSnapshot. No
 * modifica el snapshot, no conserva referencias al motor y no contiene reglas
 * de costes, producción, desbloqueos ni guardado.
 *
 * @param {import('../adapters/town-scene-contracts.js').TownSnapshot} snapshot
 * @param {{ RaceVisualProfileRegistry?: object, BiomeVisualProfileRegistry?: object, PlanetOverlayRegistry?: object }} [catalog]
 */
export function resolveTownVisualProfile(snapshot, catalog = TownVisualProfileCatalog) {
    const context = snapshot?.context || {};
    const race = getRaceVisualProfile(context.species, catalog.RaceVisualProfileRegistry);
    const biome = getBiomeVisualProfile(context.biome, catalog.BiomeVisualProfileRegistry);
    const weatherAndSeason = getWeatherAndSeasonProfile(context.environment);
    const overlays = Object.freeze((context.environment?.planetTraits || [])
        .filter((trait, index, traits) => typeof trait === 'string' && traits.indexOf(trait) === index)
        .map((trait) => getPlanetOverlayProfile(trait, catalog.PlanetOverlayRegistry)));
    const technologyEra = getTechnologyEraVisualProfile(context.technologies || []);
    const waterways = race.waterways ? 'channels' : biome.water;
    const classNames = Object.freeze([
        ...weatherAndSeason.classNames,
        `is-biome-${toCssToken(biome.art)}`,
        `is-waterways-${toCssToken(waterways)}`,
        ...overlays.map((overlay) => overlay.className)
    ]);

    return Object.freeze({
        baseLayout: BaseSettlementLayout,
        race,
        biome,
        technologyEra,
        planetOverlays: overlays,
        weatherAndSeason,
        waterways,
        buildingState: getBuildingState(snapshot?.visualBuildings),
        classNames
    });
}
