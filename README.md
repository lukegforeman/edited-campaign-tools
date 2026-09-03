# Edited Campaign Tools

Foundry VTT module for **The Margin**, currently compatible with Foundry **14.365** and D&D5e **5.3.3**.

## Included

- Campaign actors, tokens, portraits, scenes, journals, macros, and audio cues
- Shared Legend HUD with a hover-only Legend Shop reference
- Synchronized crash flash, red-alert, battle-audio, and ambience effects
- Edward Dravin's Olympus/Hades sheet and token toggle
- Museum gallery, roof, visitors, guards, and Beacon Tablet journal assets
- Reversible civilian-to-monster token transformations for every campaign monster
- Mixed, sheetless bystander crowd generator for the Token layer
- Lost Roads travel tools and Session 1 setup utilities

## Foundry installation

Install or update the module using:

`https://raw.githubusercontent.com/lukegforeman/edited-campaign-tools/main/module.json`

Updating the module does not delete world-created scenes, actors, journals, or tokens. Do not rerun the full Session 1 installer merely to update module code.

## Creating a release

Bumping the root `module.json` version on `main` automatically runs **Build Foundry release**. Manual workflow dispatch remains available for rebuilding an existing semantic version tag. The workflow:

1. Updates the root manifest version and download URL.
2. Commits that manifest change to `main` when needed.
3. Creates the GitHub release if it does not already exist.
4. Packages the module with exactly one `edited-campaign-tools/` directory.
5. Validates the archive and uploads it to the release.

The obsolete nested source copy was removed. `module.json` at the repository root is the only live manifest.

## Museum heist and token controls (v1.1.6)

After updating to v1.1.6 and reloading the world, run these once as the GM from Script Macros or the browser console:

```javascript
await EditedMuseumHeist.install();
await EditedTokenTools.install();
```

This repairs or creates the Foundry v14 spotlighted nighttime tablet gallery, adds the reversible glass-lifting claw, synchronized `00:18` countdown, one-minute quiet beep track, eleven monster transformation controls, and two crowd-builder controls. See `MUSEUM_HEIST_v1.1.6.md` for the controls.

Run **Refresh Monster Sheets — No PCs** once to create or refresh only the module's named monster NPCs and their rollable D&D5e activities. Existing player-character Actors are preserved and are never modified by the monster refresh.
