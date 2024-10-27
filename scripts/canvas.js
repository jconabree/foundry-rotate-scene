import settings from './settings.js';

class FRSCanvas {
    #flagKey = 'foundry-rotate-scene'

    init() {
        this._initCanvasOptions();
        this._initCanvasRotate();
    }

    _initCanvasOptions() {
        Hooks.on('renderSceneConfig', (config) => {
            this._initSceneRotationInput(config);
        })
    }

    _initCanvasRotate() {
        Hooks.on('canvasReady', (canvas) => {
            this._rotateCanvas(
                this.getShouldRotate(
                    canvas.scene._view,
                    this.getValue(canvas.scene, 'enabled')
                )
            );         
        })
        Hooks.on('updateScene', (scene, changed) => {
            this._rotateCanvas(
                this.getShouldRotate(
                    changed._view ?? scene._view,
                    this.getFlagValue(changed?.flags, 'enabled') ?? this.getValue(scene, 'enabled')
                )
            );
        })
    }

    _initSceneRotationInput(config) {
        const $basicTabContent = $(config.form).find('.tab[data-group="main"][data-tab="basic"]')
        $basicTabContent.append('<hr>');
        const isChecked = config.object && this.getValue(config.object, 'enabled') === '1' ? 'checked=""' : '';
        const $enableRotationCheckbox = $(`
            <div class="form-group">
                <label>Scene Rotation</label>
                <div class="form-fields">
                    <label class="checkbox">
                        Rotate Scene Background
                        <input type="checkbox" name="frs-rotate-scene" ${isChecked}>
                    </label>                
                </div>
                <p class="notes">Scene will be rotated for Monk's Common Display.</p>
            </div>
        `)
        $basicTabContent.append($enableRotationCheckbox);
        $(config.form).find('button[type="submit"]').on('click', () => {
            const isEnabled = $(config.form).find('[name="frs-rotate-scene"]').is(':checked') ? '1' : '2';
            this.setValue(config.object, 'enabled', isEnabled);
        });
    }

    getShouldRotate(isInView, enabled) {
        return isInView && ((settings.getValue('all-scenes') && enabled !== '2') || enabled === '1');
    }

    _rotateCanvas(sceneShouldRotate) {
        if (
            game.settings.get('monks-common-display', 'startupdata') &&
            sceneShouldRotate
        ) {
            document.querySelector('canvas#board').classList.add(`frs-rotate-${settings.getValue('rotation-degrees')}`)
            
            return;
        }

        document.querySelector('canvas#board').classList.remove(...[90, 180, 270].map((deg) => `frs-rotate-${deg}`));
    }

    setValue(entity, key, value) {
        if (typeof value === 'undefined') {
            return entity.unsetFlag(this.#flagKey, key);
        }

        return entity.setFlag(this.#flagKey, key, value);
    }

    getValue(entity, key) {
        return entity.getFlag(this.#flagKey, key);
    }

    getFlagValue(flags, key) {
        return flags?.[this.#flagKey]?.[key];
    }
}

export default new FRSCanvas();