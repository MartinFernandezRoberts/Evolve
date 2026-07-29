import assert from 'node:assert/strict';
import { assertProductionBundleHasNoMocks } from '../../buildRemasterValidation.js';
import { createGameActionBridge } from '../../src/remaster/adapters/game-action-bridge.js';
import { captureTownActionParityState, captureTownSaveParityState, compareTownActionParity } from '../../src/remaster/adapters/town-action-parity-harness.js';
import { getRemasterPreferences, migrateLegacyRemasterPreferences, setRemasterEnabled, setRemasterView } from '../../src/remaster/config/remaster-preferences.js';

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

testPreferencesDoNotMutateSaveSchema();
testActionBridgeOnlyDelegates();
testParityReducers();
testMockImportBuildGuard();
console.log('remaster integration contract tests passed');
