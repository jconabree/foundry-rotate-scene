# foundry-rotate-scene

Shared standards live in `.claude/rules/` (loaded automatically); this file covers only what is specific to this package.

## What this is
Foundry VTT module (id `foundry-rotate-scene`). Rotates the whole page (`body`) by 0/90/180/270 degrees, only on the Monk's Common Display client, for table-top displays. The GM view is never rotated. Requires the `monks-common-display` module. Plain ESM JavaScript: no build step; unit tests use `node --test`; `package.json` holds lint/format devDependencies only.

## Commands
No build step; edit files in place.
- `npm ci`: install lint/format tooling (devDependencies only).
- `npm run test`: unit tests (`node --test`, files in `test/`).
- `npm run check`: ESLint, Prettier check, JSON validation of `module.json` and `languages/en.json`, then tests; run before every commit.
- `npm run lint:fix` / `npm run format`: apply fixes.

## Layout
- `module.json`: manifest (tokens `#{VERSION}#` etc. filled by the release workflow).
- `scripts/module.js`: entry (`esmodules`). Registers settings on `init` and the `renderSceneConfig`, `canvasReady`, `updateScene` hooks, each wrapped in `guard`.
- `scripts/constants.js`: module id, flag key, scene rotation values, setting keys, MCD ids.
- `scripts/rotation.js`: pure `shouldRotate()` decision.
- `scripts/settings.js`: `registerSettings()` (DataField-typed world settings) and `getSetting()`.
- `scripts/display.js`: `isCommonDisplay()`, `applyRotation()` (body class), `panTarget()`, `onCanvasReady`, `onUpdateScene`.
- `scripts/scene-config.js`: adds the per-scene rotation select to Scene Config > Basics.
- `scripts/guard.js`: `guard()` wraps hook handlers so none throws into Foundry.
- `scripts/logger.js`: the only file that may use `console`.
- `test/*.test.js`: `node --test` unit tests for the above.
- `styles/module.css`: `body.frs-rotate-90|180|270 { transform: rotate(...) }`.
- `languages/en.json`: all setting and Scene Config strings (`foundry-rotate-scene.*`).
- `.github/workflows/main.yml`: release workflow (runs on published release only).

## Foundry integration
- Settings (scope `world`, module id `foundry-rotate-scene`): `rotation-degrees` (NumberField 0-270 step 90), `all-scenes`, `apply-positions`, `default-zoom`, `default-x`, `default-y`. Changing `rotation-degrees` or `all-scenes` re-applies rotation without a reload.
- Per-scene override: flag `flags.foundry-rotate-scene.enabled`, a string: `''` inherit (use world default), `'1'` always, `'2'` never. Logic in `shouldRotate()`; rotation only applies to the viewed scene (`scene.isView`).
- Hooks: `renderSceneConfig` (injects the select), `canvasReady` (rotate, then `canvas.pan` to the configured position), `updateScene` (re-apply rotation on the viewed scene).
- Rotation is one body class `frs-rotate-<deg>`; `applyRotation` removes any previous one first, and none is set for 0.
- Common Display detection: module `monks-common-display` active and its `startupdata` setting true, in `isCommonDisplay()`. It reads another module's setting and returns false (never throws) if that is missing.
- Position/zoom (`apply-positions`): `canvas.pan` on the Common Display client only; a zoom of 0 omits `scale` so the scene zoom is kept.

## Known legacy patterns
Per the strict upgrade rule in `.claude/rules/code-quality.md`, touching any of these files means upgrading the whole file in a preceding commit; if migration-sized, ask first.
- `module.json` `media` icon URL points at the `foundry-wled` repo. Replacement: this repo's own icon (needs an icon file added first); ask.

## Verification checklist
Static (run and paste real output):
1. `npm run check` exits 0.
2. Every path in `module.json` (`esmodules`, `styles`, `languages`) exists.
3. `grep -rn "console\.\|innerHTML" scripts/` shows only `scripts/logger.js`.

Manual steps in Foundry v14 + Monk's Common Display 14.01, GM client and display client (list them for the user; never claim they pass):
1. Scene Config > Basics shows "Scene rotation" with three options; choose and save; reopening shows the saved choice.
2. A scene saved earlier with the old checkbox shows "Always rotate" / "Never rotate" accordingly.
3. "Apply to all scenes" off: an "Always rotate" scene rotates on the display only; the GM view does not rotate.
4. "Apply to all scenes" on: a "Use world default" scene rotates; a "Never rotate" scene does not.
5. Change the rotation (90 to 180): the display updates immediately with no reload and no stacked rotation.
6. Switching the viewed scene to/from a rotated scene adds/removes rotation.
7. "Apply zoom and positioning" on: the display pans/zooms to the configured X/Y/zoom on load and MCD does not immediately override it.
8. MCD disabled: no errors; nothing rotates.
9. No deprecation warnings in either client's console.
10. (Optional) steps 1 and 3 on Foundry v13 + MCD 13.01.

## Gotchas
- The body-level `frs-rotate-*` selector in `styles/module.css` is the one intentional global (rotation must hit the whole page); do not add other bare selectors.
- Canvas interaction is inverted by design (CSS rotates the page, not the canvas). Do not "fix" mouse mapping; for illustrative scenes only (see README).
- Monk's Common Display can change its display mode at runtime; `isCommonDisplay()` is read on each call, but rotation is only re-applied on the next `canvasReady`/`updateScene` (or a rotation-setting change) — a runtime MCD display-mode toggle does not re-apply it. Do not assume its API beyond the `startupdata` setting.
- Scene Config field targets the `basics` part (`[data-application-part="basics"]`), verified against v13/v14 core templates; if it is missing, the module logs one warning.
- `module.json`: `library` must be boolean `false` (not a string) and `compatibility.minimum` is `13`.
- The release workflow's `zip` step lists folders explicitly, and its "Verify Archive Contents" step fails the release if a path referenced by `module.json` is missing. Add any new top-level folder to the `zip` step.
- Release CI only runs on a published release and replaces tokens in `module.json`; never hard-code them. The `zip` step silently skips missing paths.
- `README.md` badges show Foundry v13 and v14; new `CHANGELOG.md` entries go under the "Unreleased" heading.
