import { SCENE_ROTATION } from './constants.js';

/**
 * Decide whether the viewed scene should be rotated.
 * @param {object} options
 * @param {boolean} options.isView Whether the scene is the one currently viewed.
 * @param {string|undefined} options.sceneSetting The scene flag: '' / undefined (inherit), '1' (always), '2' (never).
 * @param {boolean} options.allScenes The world "apply to all scenes" setting.
 * @returns {boolean}
 */
export function shouldRotate({ isView, sceneSetting, allScenes }) {
    if (!isView) return false;
    if (sceneSetting === SCENE_ROTATION.ALWAYS) return true;
    return Boolean(allScenes) && sceneSetting !== SCENE_ROTATION.NEVER;
}
