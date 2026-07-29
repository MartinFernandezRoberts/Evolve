import { loc } from '../../locale.js';
import { TOWN_SCENE_CONTRACT_VERSION } from '../adapters/town-scene-contracts.js';
import { resolveTownVisualProfile } from './town-visual-profiles.js';

// Isolated mock data for the demo. It contains no game costs, production,
// requirements or action handlers. Visible text always comes from loc().
const mockResources = Object.freeze([
    { id: 'Food', labelKey: 'resource_Food_name', value: '428', accent: '#f6c65f' },
    { id: 'Lumber', labelKey: 'resource_Lumber_name', value: '312', accent: '#d88a4b' },
    { id: 'Stone', labelKey: 'resource_Stone_name', value: '186', accent: '#a9c1c7' },
    { id: 'Knowledge', labelKey: 'resource_Knowledge_name', value: '74', accent: '#70d7dc' },
    { id: 'Money', labelKey: 'resource_Money_name', value: '1,240', accent: '#ffd668' }
]);

const mockDistricts = Object.freeze([
    { id: 'center', accent: '#f0ba55', position: { x: 790, y: 425 }, art: 'hall', marker: 1 },
    { id: 'housing', accent: '#e98b71', position: { x: 545, y: 285 }, art: 'homes', marker: 6 },
    { id: 'agriculture', accent: '#badb56', position: { x: 355, y: 535 }, art: 'farm', marker: 4 },
    { id: 'forest', accent: '#55b775', position: { x: 335, y: 245 }, art: 'lumber', marker: 3 },
    { id: 'quarry', accent: '#9eb1c4', position: { x: 1180, y: 230 }, art: 'quarry', marker: 2 },
    { id: 'science', accent: '#75d7e0', position: { x: 1050, y: 505 }, art: 'observatory', marker: 2 },
    { id: 'religion', accent: '#c68de8', position: { x: 865, y: 660 }, art: 'shrine', marker: 1 },
    { id: 'industry', accent: '#e37c4f', position: { x: 1180, y: 625 }, art: 'workshop', marker: 3 },
    { id: 'government', accent: '#f1bf57', position: { x: 755, y: 190 }, art: 'council', marker: 1 },
    { id: 'military', accent: '#df6d62', position: { x: 605, y: 705 }, art: 'fort', marker: 2 }
]);

const mockVisualBuildings = Object.freeze([
    { id: 'basic_housing', district: 'housing', count: 7, on: null, unlocked: true, affordable: true },
    { id: 'farm', district: 'agriculture', count: 4, on: null, unlocked: true, affordable: true },
    { id: 'lumber_yard', district: 'forest', count: 2, on: null, unlocked: true, affordable: true },
    { id: 'rock_quarry', district: 'quarry', count: 3, on: 3, unlocked: true, affordable: true },
    { id: 'mine', district: 'quarry', count: 1, on: 0, unlocked: true, affordable: true },
    { id: 'library', district: 'science', count: 2, on: null, unlocked: true, affordable: true },
    { id: 'university', district: 'science', count: 0, on: null, unlocked: true, affordable: false },
    { id: 'temple', district: 'religion', count: 1, on: null, unlocked: true, affordable: true },
    { id: 'garrison', district: 'military', count: 2, on: 2, unlocked: true, affordable: true },
    { id: 'foundry', district: 'industry', count: 3, on: 2, unlocked: true, affordable: true },
    { id: 'factory', district: 'industry', count: 1, on: 0, unlocked: true, affordable: true },
    { id: 'coal_power', district: 'industry', count: 1, on: 1, unlocked: true, affordable: true },
    { id: 'oil_power', district: 'industry', count: 0, on: 0, unlocked: false, affordable: null },
    { id: 'fission_power', district: 'industry', count: 0, on: 0, unlocked: false, affordable: null }
]);

const mockBuildingTitleKeys = Object.freeze({
    basic_housing: 'city_basic_housing_title', farm: 'city_farm', lumber_yard: 'city_lumber_yard',
    rock_quarry: 'city_rock_quarry', mine: 'city_mine', library: 'city_library', university: 'city_university',
    temple: 'city_temple', garrison: 'city_garrison', foundry: 'city_foundry', factory: 'city_factory',
    coal_power: 'city_coal_power', oil_power: 'city_oil_power', fission_power: 'city_fission_power'
});

const mockScenarioOptions = Object.freeze({
    new: { population: 0, counts: { basic_housing: 0 }, onlyCounts: true, unlocked: ['basic_housing'], species: { id: 'mock', type: 'humanoid' } },
    small: { population: 6, counts: { basic_housing: 1, farm: 1 }, onlyCounts: true, unlocked: ['basic_housing', 'farm'], species: { id: 'mock', type: 'humanoid' } },
    intermediate: { population: 32, counts: {}, unlocked: null, species: { id: 'mock', type: 'humanoid' } },
    industrial: { population: 240, counts: { basic_housing: 48, farm: 15, lumber_yard: 8, rock_quarry: 11, mine: 9, library: 5, university: 3, temple: 4, garrison: 6, foundry: 13, factory: 10, coal_power: 4, oil_power: 2 }, unlocked: null, technologies: [{ id: 'electricity', level: 1 }], species: { id: 'mock', type: 'humanoid' } },
    aquatic: { population: 32, counts: {}, unlocked: null, species: { id: 'octigoran', type: 'aquatic' } }
});

/**
 * Creates a new snapshot so the demo cannot mutate the templates.
 *
 * @param {'new'|'small'|'intermediate'|'industrial'|'aquatic'} [scenario]
 * @returns {import('../adapters/town-scene-contracts.js').TownSnapshot}
 */
export function createMockTownSnapshot(scenario = 'intermediate') {
    const option = mockScenarioOptions[scenario] || mockScenarioOptions.intermediate;
    const snapshot = {
        contractVersion: TOWN_SCENE_CONTRACT_VERSION,
        source: 'mock',
        title: loc('remaster_visual_title'),
        subtitle: loc('remaster_demo_data'),
        resources: mockResources.map((resource) => {
            const label = loc(resource.labelKey);
            return { ...resource, label, iconText: label.slice(0, 1), tooltip: label };
        }),
        districts: mockDistricts.map((district) => ({
            ...district,
            label: loc(`remaster_district_${district.id}`),
            summary: loc('remaster_district_count', [district.marker]),
            detail: '',
            status: loc('remaster_built_count', [district.marker]),
            position: { ...district.position },
            buildings: []
        })),
        visualBuildings: mockVisualBuildings.map((building) => {
            const count = Object.prototype.hasOwnProperty.call(option.counts, building.id) ? option.counts[building.id] : (option.onlyCounts ? 0 : building.count);
            const unlocked = option.unlocked ? option.unlocked.includes(building.id) : building.unlocked;
            return { ...building, label: loc(mockBuildingTitleKeys[building.id]), count, unlocked, locked: !unlocked };
        }),
        context: {
            species: { ...option.species },
            biome: { id: 'grassland', label: loc('biome_grassland_name') },
            planet: null,
            season: 0,
            weather: 0,
            environment: { season: 0, weather: 0, temperature: 1, wind: 0, day: 42, planetTraits: [] },
            population: { amount: option.population, max: 500, label: loc('citizen') },
            workers: [],
            buildings: [],
            technologies: (option.technologies || []).map((technology) => ({ ...technology })),
            energy: { available: null, powered: null },
            morale: { current: null, potential: null },
            government: { id: null, label: null }
        }
    };
    snapshot.context.visual = resolveTownVisualProfile(snapshot);
    return snapshot;
}
