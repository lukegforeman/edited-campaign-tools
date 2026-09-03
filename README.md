# Edited Campaign Tools

Foundry VTT module for **The Margin**, currently compatible with Foundry **14.365** and D&D5e **5.3.3**.

## Included

- Campaign actors, tokens, portraits, scenes, journals, macros, and audio cues
- Shared Legend HUD with a hover-only Legend Shop reference
- Synchronized crash flash, red-alert, battle-audio, and ambience effects
- Edward Dravin's Olympus/Hades sheet and token toggle
- Museum gallery, roof, visitors, guards, and Beacon Tablet journal assets
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

## Museum heist controls (v1.1.5)

After updating to v1.1.5 and reloading the world, run this once as the GM from a Script Macro or the browser console:

```javascript
await EditedMuseumHeist.install();
```

This adds the spotlighted nighttime tablet gallery, reversible glass-lifting claw, synchronized `00:18` countdown, one-minute quiet beep track, and a monster-only sheet refresh control. See `MUSEUM_HEIST_v1.1.5.md` for the controls.

Existing player-character Actors are preserved. The museum installer and monster refresh do not modify PC sheets.
