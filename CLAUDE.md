# foundry-rotate-scene

Shared standards live in `.claude/rules/` (loaded automatically); this file covers only what is specific to this package.

## What this is
Foundry VTT module (id `foundry-rotate-scene`). Rotates the whole page (`body`) by 0/90/180/270 degrees, only on the Monk's Common Display client, for table-top displays. The GM view is never rotated. Requires the `monks-common-display` module. Plain ESM JavaScript: no build step and no tests; `package.json` holds lint/format devDependencies only.

## Commands
No build step; edit files in place.
- `npm ci`: install lint/format tooling (devDependencies only).
- `npm run check`: ESLint, Prettier check, and JSON validation of `module.json` and `languages/en.json`; run before every commit.
- `npm run lint:fix` / `npm run format`: apply fixes.

## Layout
- `module.json`: manifest (tokens `#{VERSION}#` etc. filled by the release workflow).
- `scripts/module.js`: entry (`esmodules`). `init` -> `settings.init()`, `setup` -> `canvas.init()`.
- `scripts/settings.js`: `FRSSettings` singleton; registers world settings; `getValue`/`setValue`.
- `scripts/canvas.js`: `FRSCanvas` singleton; hooks, rotation logic, Scene Config injection, per-scene flag access.
- `styles/module.css`: `body.frs-rotate-90|180|270 { transform: rotate(...) }`.
- `languages/en.json`: only a placeholder key (`MODULE.hello`); no real strings localized yet.
- `.github/workflows/main.yml`: release workflow (runs on published release only).
- `scripts/lib/lib.js`: empty file (see legacy).

## Foundry integration
- Settings (scope `world`, module id `foundry-rotate-scene`): `rotation-degrees` (NumberField 0-270 step 90), `all-scenes`, `apply-positions`, `default-zoom`, `default-x`, `default-y`.
- Per-scene override: flag `flags.foundry-rotate-scene.enabled`, a string: `'1'` force on, `'2'` force off, unset = follow `all-scenes`. Logic in `shouldRotate()`.
- Hooks: `renderSceneConfig` (injects the checkbox), `canvasInit` (applies position), `canvasReady` and `updateScene` (toggle body class `frs-rotate-<deg>`).
- Common Display detection: `game.settings.get('monks-common-display', 'startupdata')` in `_isCommonDisplay()`. This reads another module's setting; it can break if that module changes.
- Position/zoom (`apply-positions`) is applied by writing `canvas.scene.initial.x|y|scale` on the Common Display client only.
- Rotation only applies when `scene._view` is true (private-ish field; verify against v14 docs before relying on it).

## Known legacy patterns
Per the strict upgrade rule in `.claude/rules/code-quality.md`, touching any of these files means upgrading the whole file in a preceding commit; if migration-sized, ask first.
- `scripts/canvas.js` `_initSceneRotationInput`: jQuery (`$(...)`) injection into the SceneConfig DOM, with an append-HTML-string checkbox. Replacement: render a Handlebars template into the AppV2 `SceneConfig` form via `HTMLElement` APIs (`querySelector`, `insertAdjacentElement` of built DOM) in a `renderSceneConfig` handler. Migration-sized: ask before converting.
- `scripts/canvas.js` `_getBasicTabSelector`, `_getEntityFromConfig`, `_getHintClass`, and `getGameVersion` in `scripts/settings.js`: v12/v13 version branching (`=== '13'`; any other version, including 14, takes the v12 path). Replacement: v13+ only, a single v14-verified selector and `config.document`; delete the branching and `getGameVersion`.
- `scripts/canvas.js` `enabled` flag stored as `'1'`/`'2'` strings and `unsetFlag` for undefined. Replacement: a `StringField` with `choices` (on/off/inherit); needs a data migration, so ask first.
- `scripts/settings.js`: hard-coded English `name`/`hint`. Replacement: `game.i18n` keys `foundry-rotate-scene.*` in `languages/en.json`; also remove placeholder `MODULE.hello`.
- `scripts/settings.js`: `game.data?.version` fallback in `getGameVersion`: replacement is `game.release`/`game.version` only (goes away with the branching above).
- `styles/module.css`: unscoped `body { &.frs-rotate-* }` selector. Replacement: keep the body class (rotation must hit the whole page) but document that this is the one intentional global; do not add other bare selectors.
- `module.json` `"scripts": ["scripts/lib/lib.js"]` plus empty `scripts/lib/lib.js`. Replacement: delete both the entry and the file (`esmodules` only).
- `module.json` `media` icon URL points at the `foundry-wled` repo. Replacement: this repo's own icon (needs an icon file added first); ask.

## Verification checklist
Static (run and paste real output):
1. `npm run check` exits 0.
2. Every path in `module.json` (`esmodules`, `styles`, `languages`) exists.
3. `grep -rn "console\.\|innerHTML" scripts/` shows nothing new.

Manual steps in Foundry (list them for the user; never claim they pass):
1. Global rotation: set Rotation amount to 90, enable "Apply to all scenes by default"; load a scene on the Monk's Common Display client and confirm the page is rotated 90 degrees.
2. GM view: confirm the GM client stays unrotated while the Common Display is rotated.
3. Per-scene override: in Scene Config > Basics, tick "Rotate Scene Background" with the global default off; confirm that scene rotates. Untick with the global on; confirm it does not rotate.
4. Rotation values 0, 90, 180, 270 each render correctly on the Common Display client.
5. Default zoom/position: enable "Apply zoom and positioning", set Rotated Zoom/X/Y; confirm the Common Display client opens a rotated scene at that view.
6. Auto-apply option off: confirm zoom/position is not changed.
7. Switching scenes and toggling the flag while a scene is active updates rotation without reload.
8. Browser console shows no deprecation warnings on Scene Config open.

## Gotchas
- Canvas interaction is inverted by design (CSS rotates the page, not the canvas). Do not "fix" mouse mapping; for illustrative scenes only (see README).
- Monk's Common Display may lag v13/v14 support (README note); do not assume its API.
- `module.json`: `library` must be boolean `false` (not a string) and `compatibility.minimum` is `13`.
- The release workflow's `zip` step lists folders explicitly, and its "Verify Archive Contents" step fails the release if a path referenced by `module.json` is missing. Add any new top-level folder to the `zip` step.
- Release CI only runs on a published release and replaces tokens in `module.json`; never hard-code them. The `zip` step silently skips missing paths.
- `README.md` badges show Foundry v13 and v14; new `CHANGELOG.md` entries go under the "Unreleased" heading.
