import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_ID, SETTINGS } from '../scripts/constants.js';
import { registerSettings, getSetting } from '../scripts/settings.js';

const originals = { game: globalThis.game, foundry: globalThis.foundry };
let registered;
let reads;

class FakeField {
    constructor(options) {
        this.options = options;
    }
}
class BooleanField extends FakeField {}
class NumberField extends FakeField {}

beforeEach(() => {
    registered = new Map();
    reads = [];
    globalThis.game = {
        settings: {
            register(namespace, key, config) {
                registered.set(key, { namespace, config });
            },
            get(namespace, key) {
                reads.push([namespace, key]);
                return 42;
            },
        },
    };
    globalThis.foundry = { data: { fields: { BooleanField, NumberField } } };
});

afterEach(() => {
    globalThis.game = originals.game;
    globalThis.foundry = originals.foundry;
});

test('registers exactly the six existing keys under foundry-rotate-scene', () => {
    registerSettings({ onRotationChange: () => {} });
    assert.deepEqual([...registered.keys()].sort(), Object.values(SETTINGS).sort());
    for (const { namespace } of registered.values()) {
        assert.equal(namespace, MODULE_ID);
    }
});

test('every setting is world-scoped, visible, and uses i18n keys', () => {
    registerSettings({ onRotationChange: () => {} });
    for (const [key, { config }] of registered) {
        assert.equal(config.scope, 'world');
        assert.equal(config.config, true);
        assert.equal(config.name, `${MODULE_ID}.settings.${key}.name`);
        assert.equal(config.hint, `${MODULE_ID}.settings.${key}.hint`);
        assert.equal(
            config.default,
            key.startsWith('all-') || key === SETTINGS.APPLY_POSITIONS ? false : 0,
        );
    }
});

test('rotation-degrees uses NumberField {min 0, max 270, step 90, initial 0, nullable false}', () => {
    registerSettings({ onRotationChange: () => {} });
    const { type } = registered.get(SETTINGS.ROTATION_DEGREES).config;
    assert.ok(type instanceof NumberField);
    assert.deepEqual(type.options, { min: 0, max: 270, step: 90, initial: 0, nullable: false });
});

test('other settings use the specified field types and options', () => {
    registerSettings({ onRotationChange: () => {} });
    for (const key of [SETTINGS.ALL_SCENES, SETTINGS.APPLY_POSITIONS]) {
        const { type } = registered.get(key).config;
        assert.ok(type instanceof BooleanField);
        assert.deepEqual(type.options, { initial: false });
    }
    const zoom = registered.get(SETTINGS.DEFAULT_ZOOM).config.type;
    assert.ok(zoom instanceof NumberField);
    assert.deepEqual(zoom.options, { min: 0, initial: 0 });
    for (const key of [SETTINGS.DEFAULT_X, SETTINGS.DEFAULT_Y]) {
        const { type } = registered.get(key).config;
        assert.ok(type instanceof NumberField);
        assert.deepEqual(type.options, { integer: true, initial: 0 });
    }
});

test('rotation-degrees and all-scenes onChange call onRotationChange; others have no onChange', () => {
    let calls = 0;
    registerSettings({ onRotationChange: () => (calls += 1) });
    const withHandler = [SETTINGS.ROTATION_DEGREES, SETTINGS.ALL_SCENES];
    for (const [key, { config }] of registered) {
        if (withHandler.includes(key)) {
            const before = calls;
            config.onChange();
            assert.equal(calls, before + 1);
        } else {
            assert.equal(config.onChange, undefined);
        }
    }
});

test('getSetting reads from the module namespace', () => {
    assert.equal(getSetting(SETTINGS.DEFAULT_X), 42);
    assert.deepEqual(reads, [[MODULE_ID, SETTINGS.DEFAULT_X]]);
});
