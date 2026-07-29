import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { assertProductionBundleHasNoMocks } from '../../buildRemasterValidation.js';
import { createGameActionBridge } from '../../src/remaster/adapters/game-action-bridge.js';
import { createEvolutionCoverageMatrix, hasCompleteEvolutionCoverage } from '../../src/remaster/adapters/evolution-coverage.js';
import { createGamePhaseSnapshot } from '../../src/remaster/adapters/game-phase-adapter.js';
import { captureTownActionParityState, captureTownSaveParityState, compareTownActionParity } from '../../src/remaster/adapters/town-action-parity-harness.js';
import { getRemasterPreferences, migrateLegacyRemasterPreferences, setRemasterEnabled, setRemasterView } from '../../src/remaster/config/remaster-preferences.js';
import { resolvePhaseRoute } from '../../src/remaster/config/phase-routing.js';
import { resolveSettlementVisualProgression } from '../../src/remaster/config/visual-progression.js';
import { getPopulationVisualCount, getSpeciesArchitectureProfile } from '../../src/remaster/config/town-life-config.js';
import { KenneyTownAssets } from '../../src/remaster/assets/kenney-assets.js';

function createStorage() {
    const values = new Map();
    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        }
    };
}

function testPreferencesDoNotMutateSaveSchema() {
    const previousWindow = globalThis.window;
    globalThis.window = { localStorage: createStorage() };
    try {
        assert.deepEqual(getRemasterPreferences(), { version: 1, enabled: false, view: 'scene' });

        const legacySettings = { pause: false, visualRemaster: true, visualRemasterView: 'classic' };
        assert.deepEqual(migrateLegacyRemasterPreferences(legacySettings), { version: 1, enabled: true, view: 'classic' });
        assert.deepEqual(legacySettings, { pause: false });
        assert.deepEqual(setRemasterEnabled(false), { version: 1, enabled: false, view: 'classic' });
        assert.deepEqual(setRemasterView('scene'), { version: 1, enabled: false, view: 'scene' });
    }
    finally {
        if (typeof previousWindow === 'undefined') {
            delete globalThis.window;
        }
        else {
            globalThis.window = previousWindow;
        }
    }
}

function testViewPreferenceLeavesImportedStateIntact() {
    const previousWindow = globalThis.window;
    globalThis.window = { localStorage: createStorage() };
    try {
        const importedState = {
            race: { species: 'human' },
            settings: { showCity: true },
            resource: { human: { amount: 2, max: 10 } },
            city: { basic_housing: { count: 1 } }
        };
        const before = JSON.parse(JSON.stringify(importedState));
        setRemasterEnabled(true);
        setRemasterView('classic');
        assert.deepEqual(importedState, before);
    }
    finally {
        if (typeof previousWindow === 'undefined') {
            delete globalThis.window;
        }
        else {
            globalThis.window = previousWindow;
        }
    }
}

function testActionBridgeOnlyDelegates() {
    const calls = [];
    const bridge = createGameActionBridge({
        build: (id, amount) => {
            calls.push(['build', id, amount]);
            return { success: true, built: amount };
        },
        setPower: (id, enabled) => {
            calls.push(['power', id, enabled]);
            return { success: true };
        },
        executeEvolutionAction: (id) => {
            calls.push(['evolution', id]);
            return { success: true };
        }
    });

    assert.deepEqual(bridge.build('farm', 5), { success: true, built: 5 });
    assert.deepEqual(bridge.setPower('coal_power', false), { success: true });
    assert.deepEqual(bridge.executeEvolutionAction('membrane'), { success: true });
    assert.deepEqual(bridge.setWorkers('farmer', 'farmer', 1), { success: false, reason: 'unsupported' });
    assert.deepEqual(calls, [['build', 'farm', 5], ['power', 'coal_power', false], ['evolution', 'membrane']]);
    assert.equal(Object.isFrozen(bridge), true);
}

function testEvolutionCoverageMatrixProvidesAnExplicitFallback() {
    const matrix = createEvolutionCoverageMatrix([
        { id: 'rna', visible: true, executable: true },
        { id: 'future_branch', visible: false, executable: true },
        { id: 'classic_only', visible: true, executable: false }
    ]);
    assert.deepEqual(matrix, [
        { id: 'rna', represented: true, executable: true, fallback: null },
        { id: 'future_branch', represented: false, executable: false, fallback: 'classic-hidden-until-available' },
        { id: 'classic_only', represented: false, executable: false, fallback: 'classic-unsupported' }
    ]);
    assert.equal(hasCompleteEvolutionCoverage(matrix), true);
}

function testParityReducers() {
    const snapshot = {
        visualBuildings: [{ id: 'farm', count: 3, on: null, active: null, affordable: true, detail: { queue: { count: 0, amount: 0 } } }],
        resources: [{ id: 'Food', amount: 12, max: 20, diff: 1, trade: { enabled: false, amount: 0, tradable: false } }],
        context: { workers: [{ id: 'farmer', workers: 2, assigned: 2, max: 4 }], energy: { available: 3, generated: 5, consumed: 2, powered: true } }
    };
    const captured = captureTownActionParityState(snapshot, 'farm');
    assert.equal(compareTownActionParity(captured, captured).equal, true);
    assert.equal(compareTownActionParity(captured, { ...captured, building: { ...captured.building, count: 4 } }).equal, false);

    const save = captureTownSaveParityState({
        resource: { Food: { amount: 12, max: 20, diff: 1, trade: 0 } },
        city: { farm: { count: 3, on: 0 }, power: 3, power_total: -2, powered: true },
        civic: { farmer: { workers: 2, assigned: 2, max: 4 } }
    }, ['farm']);
    assert.deepEqual(save.buildings, [{ id: 'farm', count: 3, on: 0 }]);
    assert.deepEqual(save.energy, { power: 3, power_total: -2, powered: true });
}

function testMockImportBuildGuard() {
    const permitted = {
        metafile: { outputs: { 'evolve/main.js': { inputs: { 'src/main.js': {} } } } }
    };
    assert.doesNotThrow(() => assertProductionBundleHasNoMocks(permitted));
    const forbidden = {
        metafile: { outputs: { 'evolve/main.js': { inputs: { 'src/remaster/config/town-map.js': {} } } } }
    };
    assert.throws(() => assertProductionBundleHasNoMocks(forbidden), /datos mock/);
}

function visualSnapshot(population, technologies = [], visualBuildings = []) {
    return {
        context: { population: { amount: population }, technologies },
        visualBuildings
    };
}

function testVisualProgressionUsesOnlySnapshotSignals() {
    assert.equal(resolveSettlementVisualProgression(visualSnapshot(0)).id, 'outpost');
    assert.equal(resolveSettlementVisualProgression(visualSnapshot(12)).id, 'village');
    assert.equal(resolveSettlementVisualProgression(visualSnapshot(61)).id, 'town');
    assert.equal(resolveSettlementVisualProgression(visualSnapshot(1, [{ id: 'electricity', level: 1 }])).id, 'industrial');
    assert.equal(resolveSettlementVisualProgression(visualSnapshot(1, [{ id: 'fission', level: 1 }], [{ id: 'fission_power', district: 'industry', count: 1 }])).id, 'electrified');
}

function testVisualScenarioHelpers() {
    assert.equal(getPopulationVisualCount(6), 2);
    assert.equal(getPopulationVisualCount(32), 6);
    assert.equal(getSpeciesArchitectureProfile({ type: 'aquatic' }).key, 'aquatic');
}

function testCuratedAssetsUseLocalBuildPaths() {
    assert.equal(Object.values(KenneyTownAssets).every((asset) => asset.startsWith('evolve/remaster-assets/kenney/')), true);
}

function testPhaseRouterUsesOnlyResolvedSignals() {
    assert.equal(resolvePhaseRoute({ hasSpecies: true, protoplasm: true, sentienceReady: false }).kind, 'evolution');
    assert.equal(resolvePhaseRoute({ hasSpecies: true, protoplasm: true, sentienceReady: true }).kind, 'sentience-transition');
    assert.equal(resolvePhaseRoute({ hasSpecies: true, cityAvailable: true, hasBuiltStructure: false }).kind, 'early-settlement');
    assert.equal(resolvePhaseRoute({ hasSpecies: true, cityAvailable: true, hasBuiltStructure: true }).kind, 'civilization');
    assert.deepEqual(resolvePhaseRoute({ hasSpecies: true, creationActive: true }), { kind: 'unsupported', reason: 'creation-screen' });
}

function testPhaseSnapshotsAreFrozenAndDoNotRequireGlobal() {
    const state = {
        race: { species: 'octigoran', universe: 'standard' },
        evolution: { membrane: { count: 2 } },
        tech: { evo: 7, agriculture: 1 },
        resource: { octigoran: { amount: 4, max: 10 } },
        city: { biome: 'oceanic', ptrait: ['stormy'], calendar: { season: 1, weather: 2, temp: 1, wind: 0, day: 3 }, farm: { count: 1 } }
    };
    const town = Object.freeze({ contractVersion: 3, source: 'engine' });
    const snapshot = createGamePhaseSnapshot(state, {
        readPhase: () => ({ kind: 'civilization' }),
        readEvolution: () => ({
            sentienceReady: false,
            progress: { final: 40 },
            resources: [{ id: 'RNA', label: 'RNA', value: '12 / 20', amount: 12, max: 20, diff: 1 }],
            actions: [{
                id: 'membrane',
                actionId: 'evolution-membrane',
                label: 'Membrane',
                description: 'A real engine description.',
                effect: 'A real engine effect.',
                requirements: [{ id: 'evo', level: 1 }],
                grant: { id: 'evo', level: 2 },
                costs: [{ id: 'RNA', text: 'RNA: 2', status: 'sufficient' }],
                affordable: true,
                available: true,
                locked: false,
                active: false,
                count: 2,
                emblem: '',
                stage: 1
            }],
            coverage: [{ id: 'membrane', represented: true, executable: true, fallback: null }]
        }),
        readRace: () => ({ label: 'Octigoran', type: 'aquatic' }),
        readEnvironment: () => ({ biomeLabel: 'Oceanic' }),
        readCivilization: () => town
    });

    assert.equal(snapshot.phase.kind, 'civilization');
    assert.equal(snapshot.race.type, 'aquatic');
    assert.deepEqual(snapshot.settlement.buildings, [{ id: 'farm', count: 1 }]);
    assert.equal(snapshot.civilization.town, town);
    assert.equal(snapshot.evolution.progress.final, 40);
    assert.deepEqual(snapshot.evolution.resources, [{ id: 'RNA', label: 'RNA', value: '12 / 20', amount: 12, max: 20, diff: 1 }]);
    assert.equal(snapshot.evolution.actions[0].actionId, 'evolution-membrane');
    assert.equal(snapshot.evolution.actions[0].available, true);
    assert.deepEqual(snapshot.evolution.coverage, [{ id: 'membrane', represented: true, executable: true, fallback: null }]);
    assert.equal(Object.isFrozen(snapshot), true);
    assert.equal(Object.isFrozen(snapshot.environment.calendar), true);
    assert.equal(Object.isFrozen(snapshot.settlement.buildings), true);
}

function placeholders(value) {
    return [...String(value).matchAll(/%\d+(?!\d)/g)].map((match) => match[0]).sort();
}

function testRemasterLocaleParity() {
    const stringsPath = path.resolve(__dirname, '../../strings');
    const base = JSON.parse(fs.readFileSync(path.join(stringsPath, 'strings.json'), 'utf8'));
    const remasterKeys = Object.keys(base).filter((key) => key.startsWith('remaster_'));
    const localeFiles = fs.readdirSync(stringsPath).filter((file) => /^strings\.[\w-]+\.json$/.test(file));

    assert.ok(remasterKeys.length > 0, 'the base locale must declare remaster keys');
    localeFiles.forEach((file) => {
        const locale = JSON.parse(fs.readFileSync(path.join(stringsPath, file), 'utf8'));
        remasterKeys.forEach((key) => {
            assert.ok(Object.hasOwn(locale, key), `${file} is missing ${key}`);
            assert.deepEqual(placeholders(locale[key]), placeholders(base[key]), `${file} changes placeholders for ${key}`);
        });
    });
}

testPreferencesDoNotMutateSaveSchema();
testViewPreferenceLeavesImportedStateIntact();
testActionBridgeOnlyDelegates();
testEvolutionCoverageMatrixProvidesAnExplicitFallback();
testParityReducers();
testMockImportBuildGuard();
testVisualProgressionUsesOnlySnapshotSignals();
testVisualScenarioHelpers();
testCuratedAssetsUseLocalBuildPaths();
testPhaseRouterUsesOnlyResolvedSignals();
testPhaseSnapshotsAreFrozenAndDoNotRequireGlobal();
testRemasterLocaleParity();
console.log('remaster integration contract tests passed');
