import assert from 'node:assert/strict';
import { assertProductionBundleHasNoMocks } from '../../buildRemasterValidation.js';
import { createGameActionBridge } from '../../src/remaster/adapters/game-action-bridge.js';
import { captureTownActionParityState, captureTownSaveParityState, compareTownActionParity } from '../../src/remaster/adapters/town-action-parity-harness.js';
import { getRemasterPreferences, migrateLegacyRemasterPreferences, setRemasterEnabled, setRemasterView } from '../../src/remaster/config/remaster-preferences.js';
import { resolveSettlementVisualProgression } from '../../src/remaster/config/visual-progression.js';
import { createMockTownSnapshot } from '../../src/remaster/config/town-map.js';
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
        }
    });

    assert.deepEqual(bridge.build('farm', 5), { success: true, built: 5 });
    assert.deepEqual(bridge.setPower('coal_power', false), { success: true });
    assert.deepEqual(bridge.setWorkers('farmer', 'farmer', 1), { success: false, reason: 'unsupported' });
    assert.deepEqual(calls, [['build', 'farm', 5], ['power', 'coal_power', false]]);
    assert.equal(Object.isFrozen(bridge), true);
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

function testVisualScenarioMatrix() {
    const fresh = createMockTownSnapshot('new');
    const small = createMockTownSnapshot('small');
    const intermediate = createMockTownSnapshot('intermediate');
    const industrial = createMockTownSnapshot('industrial');
    const aquatic = createMockTownSnapshot('aquatic');

    assert.equal(fresh.visualBuildings.every((building) => building.count === 0), true);
    assert.equal(getPopulationVisualCount(small.context.population.amount), 2);
    assert.equal(getPopulationVisualCount(intermediate.context.population.amount), 6);
    assert.equal(resolveSettlementVisualProgression(industrial).id, 'industrial');
    assert.equal(getSpeciesArchitectureProfile(aquatic.context.species).key, 'aquatic');
}

function testCuratedAssetsUseLocalBuildPaths() {
    assert.equal(Object.values(KenneyTownAssets).every((asset) => asset.startsWith('evolve/remaster-assets/kenney/')), true);
}

testPreferencesDoNotMutateSaveSchema();
testActionBridgeOnlyDelegates();
testParityReducers();
testMockImportBuildGuard();
testVisualProgressionUsesOnlySnapshotSignals();
testVisualScenarioMatrix();
testCuratedAssetsUseLocalBuildPaths();
console.log('remaster integration contract tests passed');
