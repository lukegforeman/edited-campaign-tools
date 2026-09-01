(async () => {
if (!game.user.isGM) return ui.notifications.warn("Only the GM can place museum extras.");
if (!canvas.scene) return ui.notifications.warn("Activate the museum Scene first.");

const MODULE_PATH = "modules/edited-campaign-tools/assets/art/tiles/museum-extras";
const existing = canvas.scene.tiles.filter(tile => tile.getFlag("edited-campaign-tools", "museumExtra"));

const extras = [
  {name: "Museum Goer 1", src: `${MODULE_PATH}/museum-goer-01.webp`, x: 560, y: 1420},
  {name: "Museum Goer 2", src: `${MODULE_PATH}/museum-goer-02.webp`, x: 2350, y: 610},
  {name: "Museum Guard 1", src: `${MODULE_PATH}/museum-guard-01.webp`, x: 1420, y: 210},
  {name: "Museum Guard 2", src: `${MODULE_PATH}/museum-guard-02.webp`, x: 2660, y: 980}
];

if (!existing.length) await canvas.scene.createEmbeddedDocuments("Tile", extras.map(extra => ({
  texture: {src: extra.src},
  x: extra.x,
  y: extra.y,
  width: 100,
  height: 100,
  rotation: 0,
  alpha: 1,
  hidden: false,
  overhead: false,
  sort: 100,
  flags: {
    "edited-campaign-tools": {
      museumExtra: true,
      label: extra.name,
      version: 1
    }
  }
})));

const journal = game.journal.getName("The Beacon Tablet — First Contact");
const existingTabletNote = canvas.scene.notes.find(note => note.getFlag("edited-campaign-tools", "tabletJournalNote"));
if (journal && !existingTabletNote) {
  await canvas.scene.createEmbeddedDocuments("Note", [{
    entryId: journal.id,
    pageId: journal.pages.contents[0]?.id ?? null,
    x: 1536,
    y: 950,
    icon: "icons/svg/book.svg",
    iconSize: 42,
    text: "Beacon Tablet",
    fontSize: 18,
    textColor: "#efe4c4",
    flags: {
      "edited-campaign-tools": {
        tabletJournalNote: true,
        version: 1
      }
    }
  }]);
}

ui.notifications.info(journal
  ? "Museum visitors, guards, and the tablet Journal link are ready."
  : "Museum visitors and guards are ready. Import the tablet Journal, then rerun this macro to add its map link.");
})();
