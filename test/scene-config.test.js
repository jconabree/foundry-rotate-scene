import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { MODULE_ID, FLAG_KEY } from '../scripts/constants.js';
import logger from '../scripts/logger.js';
import { injectSceneRotationField } from '../scripts/scene-config.js';

const FIELD_NAME = `flags.${MODULE_ID}.enabled`;
const originals = { game: globalThis.game, foundry: globalThis.foundry, warn: logger.warn };
let selectCalls;
let groupCalls;
let warnings;

function fakeNode() {
    const children = [];
    return { children, append: (child) => children.push(child) };
}

function fakeElement(map) {
    return { querySelector: (selector) => map[selector] ?? null };
}

function fakeApplication(flag) {
    return {
        document: {
            getFlag: (scope, key) => (scope === MODULE_ID && key === FLAG_KEY ? flag : undefined),
        },
    };
}

beforeEach(() => {
    selectCalls = [];
    groupCalls = [];
    warnings = [];
    logger.warn = (...args) => warnings.push(args);
    globalThis.game = { i18n: { localize: (key) => key } };
    globalThis.foundry = {
        applications: {
            fields: {
                createSelectInput: (config) => {
                    selectCalls.push(config);
                    return { select: config };
                },
                createFormGroup: (config) => {
                    groupCalls.push(config);
                    return { group: config };
                },
            },
        },
    };
});

afterEach(() => {
    globalThis.game = originals.game;
    globalThis.foundry = originals.foundry;
    logger.warn = originals.warn;
});

test('injects into [data-application-part="basics"] when present', () => {
    const basics = fakeNode();
    injectSceneRotationField(
        fakeApplication('1'),
        fakeElement({ '[data-application-part="basics"]': basics }),
    );
    assert.equal(selectCalls.length, 1);
    assert.equal(selectCalls[0].name, FIELD_NAME);
    assert.equal(selectCalls[0].value, '1');
    assert.equal(selectCalls[0].localize, true);
    assert.deepEqual(
        selectCalls[0].options,
        [
            ['', 'inherit'],
            ['1', 'always'],
            ['2', 'never'],
        ].map(([value, key]) => ({ value, label: `${MODULE_ID}.sceneConfig.${key}` })),
    );
    assert.equal(groupCalls.length, 1);
    assert.equal(groupCalls[0].label, `${MODULE_ID}.sceneConfig.label`);
    assert.equal(groupCalls[0].hint, `${MODULE_ID}.sceneConfig.hint`);
    assert.equal(groupCalls[0].localize, true);
    assert.deepEqual(groupCalls[0].input, { select: selectCalls[0] });
    assert.deepEqual(basics.children, [{ group: groupCalls[0] }]);
    assert.equal(warnings.length, 0);
});

test('falls back to .tab[data-tab="basics"]', () => {
    const tab = fakeNode();
    injectSceneRotationField(
        fakeApplication(undefined),
        fakeElement({ '.tab[data-tab="basics"]': tab }),
    );
    assert.equal(tab.children.length, 1);
});

test("uses '' when the scene has no flag", () => {
    injectSceneRotationField(
        fakeApplication(undefined),
        fakeElement({ '[data-application-part="basics"]': fakeNode() }),
    );
    assert.equal(selectCalls[0].value, '');
});

test('does not inject twice when the field already exists', () => {
    const basics = fakeNode();
    injectSceneRotationField(
        fakeApplication('2'),
        fakeElement({
            '[data-application-part="basics"]': basics,
            [`[name="${FIELD_NAME}"]`]: {},
        }),
    );
    assert.equal(basics.children.length, 0);
    assert.equal(selectCalls.length, 0);
    assert.equal(warnings.length, 0);
});

test('logs one warning and does not throw when no basics part exists', () => {
    assert.doesNotThrow(() => injectSceneRotationField(fakeApplication('1'), fakeElement({})));
    assert.equal(warnings.length, 1);
    assert.equal(selectCalls.length, 0);
});
