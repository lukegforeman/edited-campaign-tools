# Red Alert Sequence — v1.1.3

This is a changed-files-only update for `edited-campaign-tools`.

## Effect timing

- 0:00–0:03 — quiet alarm at the crash ring's current volume (`0.125`) while the screen flashes red
- 0:03–0:05 — red flashing continues silently
- 0:05–0:10 — solid black screen
- 0:10 — overlay is removed and the normal Foundry view returns

The effect is synchronized to the GM and every connected player through the module socket.

## Repository update

Upload the five module files in this package to their matching paths in the GitHub repository and replace the old versions when prompted:

- `module.json`
- `scripts/edited-tools.js`
- `styles/edited-tools.css`
- `macros/18_Red_Alert_Sequence.js`
- `assets/audio/red-alert-3s.ogg`

Create and publish release tag `v1.1.3`, then update the module in Foundry.

## Add the macro to the existing World

Do not rerun **Install / Refresh Edited Session 1**.

1. Open the Macro Directory in Foundry.
2. Create a new **Script** macro named **Red Alert Sequence**.
3. Paste this single line:

   `EditedCampaignTools.redAlert();`

4. Save it and drag it to the GM hotbar.

Only a GM can trigger the synchronized sequence.
