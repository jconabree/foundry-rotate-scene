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
        Hooks.on('canvasInit', (canvas) => {
            this._setCanvasPosition(
                this.shouldRotate(
                    canvas.scene._view,
                    this.getValue(canvas.scene, 'enabled')
                )
            );
        });

        Hooks.on('canvasReady', (canvas) => {
            this._rotateCanvas(
                this.shouldRotate(
                    canvas.scene._view,
                    this.getValue(canvas.scene, 'enabled')
                )
            );         
        })
        Hooks.on('updateScene', (scene, changed) => {
            this._rotateCanvas(
                this.shouldRotate(
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
        `);
        $basicTabContent.append($enableRotationCheckbox);
        $(config.form).find('button[type="submit"]').on('click', () => {
            const isEnabled = $(config.form).find('[name="frs-rotate-scene"]').is(':checked') ? '1' : '2';
            this.setValue(config.object, 'enabled', isEnabled);
        });
    }

    shouldRotate(isInView, enabled) {
        return isInView && ((settings.getValue('all-scenes') && enabled !== '2') || enabled === '1');
    }

    _rotateCanvas(sceneShouldRotate) {
        if (
            !this._isCommonDisplay() ||
            !sceneShouldRotate
        ) {
            document.body.classList.remove(...[90, 180, 270].map((deg) => `frs-rotate-${deg}`));
            
            return;
        }

        document.body.classList.add(`frs-rotate-${settings.getValue('rotation-degrees')}`)
    }

    _setCanvasPosition(sceneShouldRotate) {
        if (
            !this._isCommonDisplay() ||
            !sceneShouldRotate ||
            !settings.getValue('apply-positions')
        ) {
            return;
        }

        canvas.scene.initial.x = settings.getValue('default-x');
        canvas.scene.initial.x = settings.getValue('default-y');
        canvas.scene.initial.scale = settings.getValue('default-zoom');
    }

    _isCommonDisplay() {
        return game.settings.get('monks-common-display', 'startupdata');
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