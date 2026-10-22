import {
    MODULE_ID,
    FLAG_KEY,
    ROTATION_CLASS_PREFIX,
    ROTATION_DEGREES,
    MCD_MODULE_ID,
    MCD_DISPLAY_SETTING,
    SETTINGS,
} from './constants.js';
import { shouldRotate } from './rotation.js';
import { getSetting } from './settings.js';

/**
 * Whether this client is the Monk's Common Display client. Never throws.
 * @returns {boolean}
 */
export function isCommonDisplay() {
    try {
        return (
            game.modules.get(MCD_MODULE_ID)?.active === true &&
            game.settings.get(MCD_MODULE_ID, MCD_DISPLAY_SETTING) === true
        );
    } catch {
        return false;
    }
}

function sceneShouldRotate(scene) {
    return (
        isCommonDisplay() &&
        shouldRotate({
            isView: scene?.isView === true,
            sceneSetting: scene?.getFlag(MODULE_ID, FLAG_KEY),
            allScenes: getSetting(SETTINGS.ALL_SCENES),
        })
    );
}

/**
 * Set the body rotation class for a scene, removing any previous one.
 * @param {Scene|null|undefined} scene
 */
export function applyRotation(scene) {
    const { classList } = document.body;
    for (const degrees of ROTATION_DEGREES) classList.remove(`${ROTATION_CLASS_PREFIX}${degrees}`);
    const degrees = getSetting(SETTINGS.ROTATION_DEGREES);
    if (degrees > 0 && sceneShouldRotate(scene))
        classList.add(`${ROTATION_CLASS_PREFIX}${degrees}`);
}

/**
 * Build the argument for `canvas.pan`; a zoom of 0 keeps the current zoom.
 * @param {{x: number, y: number, zoom: number}} position
 * @returns {{x: number, y: number, scale?: number}}
 */
export function panTarget({ x, y, zoom }) {
    return zoom > 0 ? { x, y, scale: zoom } : { x, y };
}

/**
 * `canvasReady` handler: rotate, then position the view on the display client.
 * @param {Canvas} canvas
 */
export function onCanvasReady(canvas) {
    applyRotation(canvas.scene);
    if (!getSetting(SETTINGS.APPLY_POSITIONS) || !(getSetting(SETTINGS.ROTATION_DEGREES) > 0))
        return;
    if (!sceneShouldRotate(canvas.scene)) return;
    canvas.pan(
        panTarget({
            x: getSetting(SETTINGS.DEFAULT_X),
            y: getSetting(SETTINGS.DEFAULT_Y),
            zoom: getSetting(SETTINGS.DEFAULT_ZOOM),
        }),
    );
}

/**
 * `updateScene` handler: re-apply rotation when the viewed scene changes.
 * @param {Scene} scene
 */
export function onUpdateScene(scene) {
    if (scene?.isView) applyRotation(scene);
}
