import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
    MODULE_ID,
    FLAG_KEY,
    MCD_MODULE_ID,
    MCD_DISPLAY_SETTING,
    SETTINGS,
} from '../scripts/constants.js';
import {
    isCommonDisplay,
    applyRotation,
    panTarget,
    onCanvasReady,
    onUpdateScene,
} from '../scripts/display.js';

const originals = { game: globalThis.game, document: globalThis.document };
let classes;
let values;
let mcdActive;
let mcdThrows;
let mcdDisplay;

function fakeScene({ isView = true, flag } = {}) {
    return {
        isView,
        getFlag: (scope, key) => (scope === MODULE_ID && key === FLAG_KEY ? flag : undefined),
    };
}

function fakeCanvas(scene) {
    const pans = [];
    return { scene, pans, pan: (target) => pans.push(target) };
}

beforeEach(() => {
    classes = new Set();
    mcdActive = true;
    mcdThrows = false;
    mcdDisplay = true;
    values = {
        [SETTINGS.ROTATION_DEGREES]: 90,
        [SETTINGS.ALL_SCENES]: true,
        [SETTINGS.APPLY_POSITIONS]: true,
        [SETTINGS.DEFAULT_ZOOM]: 1.5,
        [SETTINGS.DEFAULT_X]: 10,
        [SETTINGS.DEFAULT_Y]: 20,
    };
    globalThis.document = {
        body: {
            classList: {
                add: (name) => classes.add(name),
                remove: (name) => classes.delete(name),
                contains: (name) => classes.has(name),
            },
        },
    };
    globalThis.game = {
        modules: {
            get: (id) => (id === MCD_MODULE_ID && mcdActive ? { active: true } : undefined),
        },
        settings: {
            get(namespace, key) {
                if (namespace === MCD_MODULE_ID && key === MCD_DISPLAY_SETTING) {
                    if (mcdThrows) throw new Error('not registered');
                    return mcdDisplay;
                }
                return namespace === MODULE_ID ? values[key] : undefined;
            },
        },
    };
});

afterEach(() => {
    globalThis.game = originals.game;
    globalThis.document = originals.document;
});

test('isCommonDisplay is false when MCD is not active', () => {
    mcdActive = false;
    assert.equal(isCommonDisplay(), false);
    globalThis.game.modules.get = () => ({ active: false });
    assert.equal(isCommonDisplay(), false);
});

test('isCommonDisplay is false when the MCD setting throws', () => {
    mcdThrows = true;
    assert.equal(isCommonDisplay(), false);
});

test('isCommonDisplay is true only when MCD active and startupdata === true', () => {
    assert.equal(isCommonDisplay(), true);
    mcdDisplay = 'yes';
    assert.equal(isCommonDisplay(), false);
    mcdDisplay = false;
    assert.equal(isCommonDisplay(), false);
});

test('applyRotation adds frs-rotate-90 for a rotating viewed scene on the display', () => {
    applyRotation(fakeScene());
    assert.deepEqual([...classes], ['frs-rotate-90']);
});

test('applyRotation leaves exactly one class after the angle changes 90 -> 180', () => {
    const scene = fakeScene();
    applyRotation(scene);
    values[SETTINGS.ROTATION_DEGREES] = 180;
    applyRotation(scene);
    assert.deepEqual([...classes], ['frs-rotate-180']);
});

test('applyRotation adds no class for angle 0', () => {
    values[SETTINGS.ROTATION_DEGREES] = 0;
    applyRotation(fakeScene());
    assert.equal(classes.size, 0);
});

test('applyRotation removes classes when not the display client', () => {
    applyRotation(fakeScene());
    mcdDisplay = false;
    applyRotation(fakeScene());
    assert.equal(classes.size, 0);
});

test('applyRotation(null) only removes classes and does not throw', () => {
    classes.add('frs-rotate-270');
    assert.doesNotThrow(() => applyRotation(null));
    assert.equal(classes.size, 0);
});

test('panTarget omits scale when zoom is 0', () => {
    assert.deepEqual(panTarget({ x: 10, y: 20, zoom: 0 }), { x: 10, y: 20 });
});

test('panTarget includes scale when zoom > 0', () => {
    assert.deepEqual(panTarget({ x: 10, y: 20, zoom: 1.5 }), { x: 10, y: 20, scale: 1.5 });
});

test('onCanvasReady pans only when display, rotating, and apply-positions is on', () => {
    const positive = fakeCanvas(fakeScene());
    onCanvasReady(positive);
    assert.deepEqual(positive.pans, [{ x: 10, y: 20, scale: 1.5 }]);
    assert.ok(classes.has('frs-rotate-90'));

    const negatives = [
        () => (mcdDisplay = false),
        () => (values[SETTINGS.APPLY_POSITIONS] = false),
        () => (values[SETTINGS.ROTATION_DEGREES] = 0),
        () => (values[SETTINGS.ALL_SCENES] = false),
    ];
    for (const breakIt of negatives) {
        beforeEachReset();
        breakIt();
        const canvas = fakeCanvas(fakeScene());
        onCanvasReady(canvas);
        assert.equal(canvas.pans.length, 0);
    }
});

test('onCanvasReady does not throw without a scene', () => {
    const canvas = fakeCanvas(null);
    assert.doesNotThrow(() => onCanvasReady(canvas));
    assert.equal(canvas.pans.length, 0);
});

test('onUpdateScene ignores scenes that are not viewed', () => {
    onUpdateScene(fakeScene({ isView: true, flag: '1' }));
    assert.ok(classes.has('frs-rotate-90'));
    onUpdateScene(fakeScene({ isView: false, flag: '2' }));
    assert.ok(classes.has('frs-rotate-90'));
});

function beforeEachReset() {
    mcdDisplay = true;
    values[SETTINGS.APPLY_POSITIONS] = true;
    values[SETTINGS.ROTATION_DEGREES] = 90;
    values[SETTINGS.ALL_SCENES] = true;
}
