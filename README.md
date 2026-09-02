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

Open **Actions → Build Foundry release → Run workflow**, enter a semantic version tag such as `v1.1.5`, and run it. The workflow:

1. Updates the root manifest version and download URL.
2. Commits that manifest change to `main` when needed.
3. Creates the GitHub release if it does not already exist.
4. Packages the module with exactly one `edited-campaign-tools/` directory.
5. Validates the archive and uploads it to the release.

The obsolete nested source copy was removed. `module.json` at the repository root is the only live manifest.
