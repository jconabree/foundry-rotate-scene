import settings from './settings.js';
import canvas from './canvas.js';

Hooks.once('init', async function() {
    settings.init();
});

Hooks.once('setup', async function() {
    canvas.init();
});
