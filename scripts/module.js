import { registerSettings } from './settings.js';
import canvas from './canvas.js';

Hooks.once('init', async function () {
    registerSettings({ onRotationChange: () => {} });
});

Hooks.once('setup', async function () {
    canvas.init();
});
