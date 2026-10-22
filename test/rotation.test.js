import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldRotate } from '../scripts/rotation.js';

const settings = [undefined, '', '1', '2'];
const expectedWhenView = (sceneSetting, allScenes) =>
    sceneSetting === '1' || (allScenes && sceneSetting !== '2');

for (const isView of [false, true]) {
    for (const sceneSetting of settings) {
        for (const allScenes of [false, true]) {
            const expected = isView && expectedWhenView(sceneSetting, allScenes);
            test(`shouldRotate isView=${isView} setting=${sceneSetting === undefined ? 'undefined' : `'${sceneSetting}'`} allScenes=${allScenes}`, () => {
                assert.equal(shouldRotate({ isView, sceneSetting, allScenes }), expected);
            });
        }
    }
}
