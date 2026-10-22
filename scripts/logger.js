/* eslint-disable no-console -- module logger: the sanctioned console sink (.claude/rules/code-quality.md) */
import { MODULE_ID } from './constants.js';

const PREFIX = `[${MODULE_ID}]`;

export default {
    warn: (...args) => console.warn(PREFIX, ...args),
    error: (...args) => console.error(PREFIX, ...args),
};
