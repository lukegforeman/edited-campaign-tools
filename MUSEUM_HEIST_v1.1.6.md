# Museum Heist and Token Tools — v1.1.6

After updating the module and reloading the world, run these once as GM from Script Macros or the browser console:

```javascript
await EditedMuseumHeist.install();
await EditedTokenTools.install();
```

## Museum Scene repair

The installer creates or repairs the managed **Tablet Museum Gallery — Night Spotlight** Scene using Foundry v14's embedded Scene Level background. This corrects the blank canvas produced by the older Scene export.

The installer adds four controls:

- **Museum Claw — Raise / Replace Glass**
- **Museum Countdown — Advance 6 Seconds**
- **Museum Countdown — Reset**
- **Refresh Monster Sheets — No PCs**

The first countdown press displays `00:18` and begins quiet beeps every two seconds for one minute. Later presses display `00:12`, `00:06`, and `00:00`.

The claw toggles in both directions. It descends empty, lifts the glass and retracts; on the next press it returns carrying the glass, replaces it, and retracts empty.

The monster refresh updates only the module's named NPC monsters with rollable D&D5e activities. It does not update, replace, or inspect player-character Actors.

## Monster transformations

**Edited — Token Tools** contains one transformation macro for each campaign monster. Drop a monster Actor onto a Scene in its normal disguise, then press its matching transformation macro. The macro changes the selected matching token; if no matching token is selected, it changes every matching token on the active Scene. Press it again to restore the normal form.

## Mixed bystander crowds

Run **Crowd Builder — Mixed Bystanders** to choose a crowd size and place varied civilians either in the current view, around a selected token, or across the Scene. These are actorless Tokens with no sheets. **Crowd Builder — Clear Bystanders** removes only bystanders created by this tool.

## Direct Scene import

The corrected standalone export is:

`scenes/fvtt-Scene-tablet-museum-gallery-night-spotlight.json`

Import it through the Scenes sidebar. The imported Scene references artwork inside this module, so v1.1.6 must be installed and enabled first.
