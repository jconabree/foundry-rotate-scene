![](https://img.shields.io/badge/Foundry-v13-informational)
![](https://img.shields.io/badge/Foundry-v14-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/jconabree/foundry-rotate-scene/module.zip)


# FoundryVTT Module - Rotate Scene

This module, when paired with Monk's Common Display, will rotate the scene a set amount for the common display.
This is useful for in-person play when using a table display. Rather than rotating the full screen and having the mouse movement inverted for the GM, this will only rotate the visual scene.

## Limitations
Interaction with the canvas is inverted.
This module is meant to be used for illustrative scenes, rather than functional ones.

## Requirements
Requires Monk's Common Display. Use Monk's Common Display 13.01 on Foundry v13 and 14.01 on Foundry v14.

## Scene rotation option
In Scene Config > Basics, each scene has a "Scene rotation" select:
- Use world default: follows the "Apply to all scenes by default" setting.
- Always rotate: rotates this scene on the common display.
- Never rotate: this scene is never rotated.

Rotation only applies on the Monk's Common Display client; the GM view is never rotated.
