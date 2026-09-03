# Museum Heist — v1.1.5

After updating the module and reloading the world, run this once as GM from a Script Macro or the browser console:

```javascript
await EditedMuseumHeist.install();
```

This creates the managed **Tablet Museum Gallery — Night Spotlight** Scene and four controls:

- **Museum Claw — Raise / Replace Glass**
- **Museum Countdown — Advance 6 Seconds**
- **Museum Countdown — Reset**
- **Refresh Monster Sheets — No PCs**

The first countdown press displays `00:18` and begins quiet beeps every two seconds for one minute. Later presses display `00:12`, `00:06`, and `00:00`.

The claw toggles in both directions. It descends empty, lifts the glass and retracts; on the next press it returns carrying the glass, replaces it, and retracts empty.

The monster refresh converts the module's monster actions into rollable D&D5e activities. It does not update or replace any existing player-character Actor.
