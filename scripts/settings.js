class FRSSettings {
    #SETTINGS_ID = 'foundry-rotate-scene';

    /**
     * 
     * @param {string} configName 
     * @param {SettingsConfig} setting
     * @public 
     */
    registerSetting(configName, setting) {
        game.settings.register(
            this.#SETTINGS_ID,
            configName,
            setting
        );
    }

    /**
     * @public
     */
    init() {
        this.registerSetting(
            'rotation-degrees',
            {
                name: 'Rotation amount',
                hint: 'In degrees',
                scope: 'world',
                config: true,
                type: new foundry.data.fields.NumberField({
                    min: 0,
                    max: 270,
                    step: 90,
                    initial: 0,
                    nullable: false
                }),
                default: 0
            }
        );

        this.registerSetting(
            'all-scenes',
            {
                name: 'Apply to all scenes by default',
                hint: 'Scenes can override this value',
                scope: 'world',
                config: true,
                type: Boolean,
                default: false
            }
        );

        this.registerSetting(
            'apply-positions',
            {
                name: 'Apply zoom and positioning',
                hint: 'Automatically applies configured zoom and positioning to rotated scenes',
                scope: 'world',
                config: true,
                type: Boolean,
                default: false
            }
        );

        this.registerSetting(
            'default-zoom',
            {
                name: 'Rotated Zoom',
                scope: 'world',
                config: true,
                type: Number,
                default: 0
            }
        );

        this.registerSetting(
            'default-x',
            {
                name: 'Rotated X Position',
                scope: 'world',
                config: true,
                type: Number,
                default: 0
            }
        );

        this.registerSetting(
            'default-y',
            {
                name: 'Rotated Y Position',
                scope: 'world',
                config: true,
                type: Number,
                default: 0
            }
        );
    }

    getValue(key) {
        return game.settings.get(this.#SETTINGS_ID, key);
    }

    setValue(key, value) {
        return game.settings.set(this.#SETTINGS_ID, key, value);
    }
}

export default new FRSSettings();