import logger from './logger.js';

/**
 * Wraps a hook handler so it never throws into Foundry.
 * @param {(...args: any[]) => any} handler The handler to protect.
 * @returns {(...args: any[]) => any} A handler that logs errors and returns undefined on failure.
 */
export function guard(handler) {
    return (...args) => {
        try {
            return handler(...args);
        } catch (error) {
            logger.error(`Hook handler "${handler.name || 'anonymous'}" failed`, error);
            return undefined;
        }
    };
}
