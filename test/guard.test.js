import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import logger from '../scripts/logger.js';
import { guard } from '../scripts/guard.js';

const originalError = logger.error;
let errors;

beforeEach(() => {
    errors = [];
    logger.error = (...args) => errors.push(args);
});

afterEach(() => {
    logger.error = originalError;
});

test('passes all arguments through and returns the handler result', () => {
    const guarded = guard((a, b) => [a, b]);
    assert.deepEqual(guarded(1, 2), [1, 2]);
    assert.equal(errors.length, 0);
});

test('catches a throwing handler, logs it, and returns undefined', () => {
    const failure = new Error('boom');
    const guarded = guard(() => {
        throw failure;
    });
    assert.equal(guarded(), undefined);
    assert.equal(errors.length, 1);
    assert.ok(errors[0].includes(failure));
});
