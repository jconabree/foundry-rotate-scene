import { MODULE_ID, FLAG_KEY, SCENE_ROTATION } from './constants.js';
import logger from './logger.js';

const FIELD_NAME = `flags.${MODULE_ID}.${FLAG_KEY}`;
const BASICS_SELECTORS = ['[data-application-part="basics"]', '.tab[data-tab="basics"]'];
const OPTIONS = [
    { value: SCENE_ROTATION.INHERIT, key: 'inherit' },
    { value: SCENE_ROTATION.ALWAYS, key: 'always' },
    { value: SCENE_ROTATION.NEVER, key: 'never' },
];

/**
 * Adds the per-scene rotation select to the Scene Config Basics tab.
 * @param {object} application The Scene Config application.
 * @param {HTMLElement} element The rendered application element.
 */
export function injectSceneRotationField(application, element) {
    const basics = BASICS_SELECTORS.map((selector) => element.querySelector(selector)).find(
        Boolean,
    );
    if (!basics) {
        logger.warn('Scene Config basics section not found; rotation field not added.');
        return;
    }
    if (element.querySelector(`[name="${FIELD_NAME}"]`)) return;

    const { createSelectInput, createFormGroup } = foundry.applications.fields;
    const input = createSelectInput({
        name: FIELD_NAME,
        options: OPTIONS.map(({ value, key }) => ({
            value,
            label: `${MODULE_ID}.sceneConfig.${key}`,
        })),
        value: application.document.getFlag(MODULE_ID, FLAG_KEY) ?? SCENE_ROTATION.INHERIT,
        localize: true,
    });
    basics.append(
        createFormGroup({
            label: `${MODULE_ID}.sceneConfig.label`,
            hint: `${MODULE_ID}.sceneConfig.hint`,
            input,
            localize: true,
        }),
    );
}
