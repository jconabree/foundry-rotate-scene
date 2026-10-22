import { registerSettings } from './settings.js';
import { applyRotation, onCanvasReady, onUpdateScene } from './display.js';
import { injectSceneRotationField } from './scene-config.js';
import { guard } from './guard.js';

Hooks.once(
    'init',
    guard(() =>
        registerSettings({ onRotationChange: guard(() => applyRotation(canvas?.scene ?? null)) }),
    ),
);
Hooks.on('renderSceneConfig', guard(injectSceneRotationField));
Hooks.on('canvasReady', guard(onCanvasReady));
Hooks.on('updateScene', guard(onUpdateScene));
