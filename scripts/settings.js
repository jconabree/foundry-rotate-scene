import { MODULE_ID, SETTINGS } from './constants.js';

const i18nKeys = (key) => ({
    name: `${MODULE_ID}.settings.${key}.name`,
    hint: `${MODULE_ID}.settings.${key}.hint`,
});

/**
 * Registers the module's world settings.
 * @param {{ onRotationChange: () => void }} options Called when a setting that affects rotation changes.
 */
export function registerSettings({ onRotationChange }) {
    const { BooleanField, NumberField } = foundry.data.fields;
    const register = (key, type, extra = {}) =>
        game.settings.register(MODULE_ID, key, {
            ...i18nKeys(key),
            scope: 'world',
            config: true,
            type,
            ...extra,
        });

    register(
        SETTINGS.ROTATION_DEGREES,
        new NumberField({ min: 0, max: 270, step: 90, initial: 0, nullable: false }),
        { onChange: () => onRotationChange() },
    );
    register(SETTINGS.ALL_SCENES, new BooleanField({ initial: false }), {
        onChange: () => onRotationChange(),
    });
    register(SETTINGS.APPLY_POSITIONS, new BooleanField({ initial: false }));
    register(SETTINGS.DEFAULT_ZOOM, new NumberField({ min: 0, initial: 0 }));
    register(SETTINGS.DEFAULT_X, new NumberField({ integer: true, initial: 0 }));
    register(SETTINGS.DEFAULT_Y, new NumberField({ integer: true, initial: 0 }));
}

export function getSetting(key) {
    return game.settings.get(MODULE_ID, key);
}

function getGameVersion() {
    return game.version?.split('.')[0] || game.data?.version?.split('.')[0];
}

// Transitional: removed with canvas.js in the Scene Config rebuild.
export default { getValue: getSetting, getGameVersion };
