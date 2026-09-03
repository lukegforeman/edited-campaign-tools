# Museum Heist and Token Tools — v1.1.7

After updating the module and reloading the world, run these once as GM from Script Macros or the browser console:

```javascript
await EditedMuseumHeist.install();
await EditedTokenTools.install();
```

## Museum claw sequence

Press **Museum Claw — Raise / Replace Glass** to run the synchronized reversible sequence.

When raising the glass:

1. The empty claw descends slowly for five seconds.
2. It grabs the display glass and the Scene switches to the exposed-tablet background.
3. It raises the glass about two feet and remains hovering there.

Press the same macro again to lower the held glass, replace it, switch back to the covered-tablet background, and retract the empty claw out of sight over five seconds.

## Other controls

- **Museum Countdown — Advance 6 Seconds** starts at `00:18` and advances through `00:12`, `00:06`, and `00:00`.
- The first countdown press starts quiet beeps every two seconds for one minute.
- **Museum Countdown — Reset** clears the display and stops the beeps.
- **Refresh Monster Sheets — No PCs** refreshes only the module's named monster NPCs and their rollable actions.

Existing player-character Actors are never modified by the monster refresh.
