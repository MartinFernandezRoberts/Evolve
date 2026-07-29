import { TOWN_SCENE_CONTRACT_VERSION } from '../adapters/town-scene-contracts.js';

// Datos exclusivamente temporales para la demo. No representan el estado del juego, acciones,
// costes, requisitos ni valores reales de Evolve.
const mockResources = [
    { id: 'provisions', label: 'Provisiones', value: '428', accent: '#f6c65f' },
    { id: 'timber', label: 'Madera', value: '312', accent: '#d88a4b' },
    { id: 'stone', label: 'Piedra', value: '186', accent: '#a9c1c7' },
    { id: 'insight', label: 'Saber', value: '74', accent: '#70d7dc' },
    { id: 'coin', label: 'Monedas', value: '1.240', accent: '#ffd668' }
];

const mockDistricts = [
    {
        id: 'center',
        label: 'Centro del poblado',
        summary: 'La plaza, la fuente y el salón comunitario organizan los caminos.',
        detail: 'Un punto de encuentro para los servicios y las rutas del prototipo.',
        status: 'Núcleo activo',
        accent: '#f0ba55',
        position: { x: 790, y: 425 },
        art: 'hall',
        marker: 1
    },
    {
        id: 'housing',
        label: 'Viviendas',
        summary: 'Tejados cálidos escalonados en una ladera protegida.',
        detail: 'El distrito enseña cómo un conjunto de edificios puede representarse como un único nodo.',
        status: '6 hogares',
        accent: '#e98b71',
        position: { x: 545, y: 285 },
        art: 'homes',
        marker: 6
    },
    {
        id: 'agriculture',
        label: 'Agricultura',
        summary: 'Parcelas, molino y canales de riego junto al agua.',
        detail: 'Los surcos y la rueda hidráulica son decoración SVG; no simulan producción.',
        status: 'Campos listos',
        accent: '#badb56',
        position: { x: 355, y: 535 },
        art: 'farm',
        marker: 4
    },
    {
        id: 'forest',
        label: 'Bosque y madera',
        summary: 'Un aserradero pequeño se abre paso entre pinos y rocas cubiertas de musgo.',
        detail: 'El icono combina árboles y un taller original temporal.',
        status: 'Sendero forestal',
        accent: '#55b775',
        position: { x: 335, y: 245 },
        art: 'lumber',
        marker: 3
    },
    {
        id: 'quarry',
        label: 'Cantera y minería',
        summary: 'Terrazas de piedra, una grúa manual y vetas expuestas en la montaña.',
        detail: 'La elevación se resuelve con capas y sombras, no con una cuadrícula de juego.',
        status: 'Veta abierta',
        accent: '#9eb1c4',
        position: { x: 1180, y: 230 },
        art: 'quarry',
        marker: 2
    },
    {
        id: 'science',
        label: 'Ciencia y educación',
        summary: 'Una cúpula de observación vigila el pueblo desde una colina.',
        detail: 'El brillo azul comunica investigación sin usar datos del motor.',
        status: 'Archivo abierto',
        accent: '#75d7e0',
        position: { x: 1050, y: 505 },
        art: 'observatory',
        marker: 2
    },
    {
        id: 'religion',
        label: 'Religión',
        summary: 'Un santuario de piedra rodeado de flores y estandartes.',
        detail: 'La silueta vertical ayuda a separar el distrito en una vista compacta.',
        status: 'Santuario sereno',
        accent: '#c68de8',
        position: { x: 865, y: 660 },
        art: 'shrine',
        marker: 1
    },
    {
        id: 'industry',
        label: 'Industria',
        summary: 'Talleres de metal y hornos bajos dan vida a la ribera.',
        detail: 'El humo es una animación breve y decorativa que respeta la reducción de movimiento.',
        status: 'Talleres encendidos',
        accent: '#e37c4f',
        position: { x: 1180, y: 625 },
        art: 'workshop',
        marker: 3
    },
    {
        id: 'government',
        label: 'Gobierno',
        summary: 'El salón del consejo se sitúa junto a la plaza principal.',
        detail: 'Los paneles muestran sólo información mock; no hay decisiones ni acciones conectadas.',
        status: 'Consejo reunido',
        accent: '#f1bf57',
        position: { x: 755, y: 190 },
        art: 'council',
        marker: 1
    },
    {
        id: 'military',
        label: 'Ejército',
        summary: 'Una empalizada y torres de vigilancia custodian el paso del sur.',
        detail: 'El nodo demuestra un estado seleccionable; no representa combate ni tropas reales.',
        status: 'Guardia en ronda',
        accent: '#df6d62',
        position: { x: 605, y: 705 },
        art: 'fort',
        marker: 2
    }
];

const mockVisualBuildings = Object.freeze([
    { id: 'basic_housing', district: 'housing', label: 'Viviendas de muestra', count: 7, on: null, unlocked: true, affordable: true },
    { id: 'farm', district: 'agriculture', label: 'Granja de muestra', count: 4, on: null, unlocked: true, affordable: true },
    { id: 'lumber_yard', district: 'forest', label: 'Aserradero de muestra', count: 2, on: null, unlocked: true, affordable: true },
    { id: 'rock_quarry', district: 'quarry', label: 'Cantera de muestra', count: 3, on: 3, unlocked: true, affordable: true },
    { id: 'mine', district: 'quarry', label: 'Mina de muestra', count: 1, on: 0, unlocked: true, affordable: true },
    { id: 'library', district: 'science', label: 'Biblioteca de muestra', count: 2, on: null, unlocked: true, affordable: true },
    { id: 'university', district: 'science', label: 'Universidad disponible', count: 0, on: null, unlocked: true, affordable: false },
    { id: 'temple', district: 'religion', label: 'Templo de muestra', count: 1, on: null, unlocked: true, affordable: true },
    { id: 'garrison', district: 'military', label: 'Cuartel de muestra', count: 2, on: 2, unlocked: true, affordable: true },
    { id: 'foundry', district: 'industry', label: 'Fundición de muestra', count: 3, on: 2, unlocked: true, affordable: true },
    { id: 'factory', district: 'industry', label: 'Fábrica de muestra', count: 1, on: 0, unlocked: true, affordable: true },
    { id: 'coal_power', district: 'industry', label: 'Central de carbón', count: 1, on: 1, unlocked: true, affordable: true },
    { id: 'oil_power', district: 'industry', label: 'Central de petróleo bloqueada', count: 0, on: 0, unlocked: false, affordable: null },
    { id: 'fission_power', district: 'industry', label: 'Central de fisión bloqueada', count: 0, on: 0, unlocked: false, affordable: null }
]);

// Variantes de inspección aisladas; no se importan en la interfaz de partida.
const mockScenarioOptions = Object.freeze({
    new: { population: 0, counts: { basic_housing: 0 }, onlyCounts: true, unlocked: ['basic_housing'], species: { id: 'mock', label: 'Muestra', type: 'humanoid' } },
    small: { population: 6, counts: { basic_housing: 1, farm: 1 }, onlyCounts: true, unlocked: ['basic_housing', 'farm'], species: { id: 'mock', label: 'Muestra', type: 'humanoid' } },
    intermediate: { population: 32, counts: {}, unlocked: null, species: { id: 'mock', label: 'Muestra', type: 'humanoid' } },
    industrial: { population: 240, counts: { basic_housing: 48, farm: 15, lumber_yard: 8, rock_quarry: 11, mine: 9, library: 5, university: 3, temple: 4, garrison: 6, foundry: 13, factory: 10, coal_power: 4, oil_power: 2 }, unlocked: null, technologies: [{ id: 'electricity', level: 1 }], species: { id: 'mock', label: 'Muestra', type: 'humanoid' } },
    aquatic: { population: 32, counts: {}, unlocked: null, species: { id: 'octigoran', label: 'Octigoran de muestra', type: 'aquatic' } }
});

/**
 * Crea un snapshot nuevo para que la demo no pueda modificar las plantillas.
 * Un adaptador real deberá devolver este mismo contrato, sin fórmulas en la UI.
 *
 * @param {'new'|'small'|'intermediate'|'industrial'|'aquatic'} [scenario]
 * @returns {import('../adapters/town-scene-contracts.js').TownSnapshot}
 */
export function createMockTownSnapshot(scenario = 'intermediate') {
    const option = mockScenarioOptions[scenario] || mockScenarioOptions.intermediate;
    return {
        contractVersion: TOWN_SCENE_CONTRACT_VERSION,
        source: 'mock',
        title: 'Pueblo de demostración',
        subtitle: 'Mapa original aislado — datos de muestra, sin partida conectada.',
        resources: mockResources.map((resource) => ({ ...resource })),
        districts: mockDistricts.map((district) => ({
            ...district,
            position: { ...district.position },
            buildings: []
        })),
        visualBuildings: mockVisualBuildings.map((building) => {
            const count = Object.prototype.hasOwnProperty.call(option.counts, building.id) ? option.counts[building.id] : (option.onlyCounts ? 0 : building.count);
            const unlocked = option.unlocked ? option.unlocked.includes(building.id) : building.unlocked;
            return { ...building, count, unlocked, locked: !unlocked };
        }),
        context: {
            species: { ...option.species },
            biome: { id: 'grassland', label: 'Pradera' },
            planet: 'Mundo de demostración',
            season: 0,
            weather: 0,
            environment: { season: 0, weather: 0, temperature: 1, wind: 0, day: 42, planetTraits: [] },
            population: { amount: option.population, max: 500, label: 'Habitantes' },
            workers: [],
            buildings: [],
            technologies: (option.technologies || []).map((technology) => ({ ...technology })),
            energy: { available: null, powered: null },
            morale: { current: null, potential: null },
            government: { id: null, label: null }
        }
    };
}
