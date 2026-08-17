const FIX_MODULE_ID = "edited-campaign-tools";
const FIX_ROOT = `modules/${FIX_MODULE_ID}`;
const FIX_VERSION = 1;

const legendShop = `
  <h1>Legend Shop</h1>
  <p><strong>Legend is a shared party resource.</strong> The GM removes the listed cost from the shared pool when a benefit is used.</p>
  <table>
    <thead><tr><th style="width:70px">Cost</th><th>Use</th></tr></thead>
    <tbody>
      <tr><td><strong>1</strong></td><td>Gain advantage.</td></tr>
      <tr><td><strong>1</strong></td><td>Add a d6 before a roll.</td></tr>
      <tr><td><strong>2</strong></td><td>Reroll any d20.</td></tr>
      <tr><td><strong>2</strong></td><td>Add a d6 after a roll.</td></tr>
      <tr><td><strong>2</strong></td><td>Add a Wordcraft edit without using your normal limit.</td></tr>
      <tr><td><strong>3</strong></td><td>Invoke a divine boon.</td></tr>
      <tr><td><strong>3</strong></td><td>Pass a check automatically.</td></tr>
      <tr><td><strong>4</strong></td><td>Regain consciousness.</td></tr>
      <tr><td><strong>5</strong></td><td>Automatically score a critical hit.</td></tr>
    </tbody>
  </table>
  <p><em>Double-click the on-screen Legend box to reopen this shop.</em></p>`;

const naomiPages = [
  {
    name: "Overview",
    content: `<h1>Naomi's Clue Board</h1><p>Naomi tracks reality edits, the physical <strong>Fragments</strong> they leave behind, and the two competing stories attached to each event.</p><p>Use the pages in this journal as the campaign's living investigation board. The GM can edit the Evidence Log and Archive pages during play without affecting the module.</p><h2>Current Pattern</h2><ul><li>Each known anomaly centers on a one-letter edit.</li><li>A physical Fragment appears after roughly one week.</li><li>Fragments grow more revealing with repeated contact.</li><li>The Scribe and the Correctors are trying to collect or destroy them.</li><li>The same target cannot be edited twice.</li></ul>`
  },
  {
    name: "Active Leads",
    content: `<h1>Active Leads</h1><section><h2>Ancient Greek Tablet</h2><p><strong>Edit:</strong> BEACON → BECKON</p><p>A museum exhibit contains an ancient tablet connected to the oldest known alteration.</p><p><strong>Next questions:</strong> Who translated it? What did the beacon originally warn about? What is now being beckoned?</p><hr><h2>Child Engineer's Catapult</h2><p><strong>Edit:</strong> STAY → STRAY</p><p>A toy catapult connected to a child engineer has surfaced through a pawn-shop lead.</p><p><strong>Next questions:</strong> What was told to stay? Where did it stray? Who currently owns the toy?</p><hr><h2>The Mad Doctor Binder</h2><p><strong>Edit:</strong> STABLE → STALE</p><p>An investigative journalist's research binder is tied to a book-signing lead and a medical disaster.</p><p><strong>Next questions:</strong> What treatment or condition became stale? Which records disagree? Who survived?</p><hr><h2>DCA Hijacking Evidence</h2><p><strong>Edit:</strong> DOA → DCA</p><p>Zip ties no one remembers placing are physical evidence from the aircraft that unexpectedly arrived at DCA.</p><p><strong>Next questions:</strong> Who restrained the hijacker? What happened in the erased version? Why DCA?</p></section>`
  },
  {
    name: "Fragment Rules",
    content: `<h1>Fragment Contact</h1><ol><li><strong>First Fragment:</strong> experience both versions of the event.</li><li><strong>Second Fragment:</strong> glimpse the hand making the change.</li><li><strong>Third Fragment:</strong> witness the change and hear the Scribe's thoughts or conversation.</li><li><strong>Fourth Fragment:</strong> receive the clearest vision yet, including the bus edit and its alternate future.</li></ol><h2>Known Limits</h2><ul><li>Fragments generally appear about one week after an edit.</li><li>Their power and clarity increase as the party gathers more of them.</li><li>The Scribe cannot edit the same target twice.</li><li>Correctors may capture, ink, collect, or destroy evidence.</li></ul>`
  },
  {
    name: "Evidence Log",
    content: `<h1>Evidence Log</h1><p><em>Editable working space for the party's discoveries.</em></p><table><thead><tr><th>Date</th><th>Lead</th><th>Evidence</th><th>Interpretation</th></tr></thead><tbody><tr><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>—</td><td>—</td><td>—</td><td>—</td></tr><tr><td>—</td><td>—</td><td>—</td><td>—</td></tr></tbody></table>`
  },
  {
    name: "Unanswered Questions",
    content: `<h1>Unanswered Questions</h1><ul><li>Who is making the edits, and what outcome are they trying to prevent?</li><li>Why do the Correctors capture some Edited instead of killing them?</li><li>Why are the party members difficult to record on cameras and identify in databases?</li><li>What connects the known edits beyond their one-letter structure?</li><li>Why did the Fates say the party was early—or late?</li></ul>`
  },
  {
    name: "Archive",
    content: `<h1>Completed and Archived Leads</h1><p><em>Move resolved leads, disproven theories, and recovered Fragments here during the campaign.</em></p>`
  }
];

function fixFlags(kind) {
  return {[FIX_MODULE_ID]: {targetedFix: true, kind, version: FIX_VERSION}};
}

async function ensureFolder(name, type) {
  return game.folders.find(folder => folder.type === type && folder.name === name)
    ?? Folder.create({name, type, sorting: "a"});
}

async function upsertJournal(name, pages) {
  const folder = await ensureFolder("Edited — Journals", "JournalEntry");
  let journal = game.journal.getName(name);
  if (!journal) {
    journal = await JournalEntry.create({
      name,
      folder: folder.id,
      ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED},
      flags: fixFlags("JournalEntry")
    });
  } else {
    await journal.update({ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED}});
  }

  const creates = [];
  for (const spec of pages) {
    const page = journal.pages.find(candidate => candidate.name === spec.name);
    if (page) await page.update({name: spec.name, type: "text", "text.content": spec.content});
    else creates.push({name: spec.name, type: "text", text: {content: spec.content}, flags: fixFlags("JournalEntryPage")});
  }
  if (creates.length) await journal.createEmbeddedDocuments("JournalEntryPage", creates);
  return journal;
}

async function updateEdward() {
  const actor = game.actors.getName("Edward Dravin");
  if (!actor) return {status: "missing"};
  const state = actor.getFlag(FIX_MODULE_ID, "persephoneState") === "hades" ? "hades" : "olympus";
  const profile = `${FIX_ROOT}/assets/art/actors/edward-dravin/edward-dravin-profile-${state}.webp`;
  const token = `${FIX_ROOT}/assets/art/actors/edward-dravin/edward-dravin-token-${state}.webp`;
  const biography = `<h2>Edward Dravin</h2><p>Edward is a wealthy but otherwise ordinary-looking former professor specializing in Greek history and sociology. After his diagnosis with bipolar II disorder, he used his family wealth to found a private residential mental-health treatment center. He continues to help operate the center while receiving treatment there himself.</p><p>His refined contemporary clothes, excellent watch, and academic manner signal quiet wealth without fantasy affectation. An opened pomegranate—and the seeds he sometimes eats—remains the subtle outward symbol of his connection to Persephone.</p><p>His Olympus/Hades control changes the tone of his appearance and prepared spell loadout while preserving hit points, inventory, and spent spell slots.</p>`;
  await actor.update({
    img: profile,
    "prototypeToken.texture.src": token,
    "system.details.biography.value": biography,
    [`flags.${FIX_MODULE_ID}.edwardDuality`]: true,
    [`flags.${FIX_MODULE_ID}.persephoneState`]: state
  });
  for (const scene of game.scenes) {
    const updates = scene.tokens.filter(placed => placed.actorId === actor.id).map(placed => ({_id: placed.id, "texture.src": token}));
    if (updates.length) await scene.updateEmbeddedDocuments("Token", updates);
  }
  return {status: "updated", state};
}

async function upsertRiftActor() {
  const name = "Satyn Rift (Placeable)";
  const token = `${FIX_ROOT}/assets/art/actors/satyn-rift-token.webp`;
  const folder = await ensureFolder("Edited — Campaign Actors", "Actor");
  let actor = game.actors.getName(name);
  const data = {
    name,
    type: "npc",
    img: token,
    folder: folder.id,
    ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE},
    prototypeToken: {
      name: "Satyn Rift",
      texture: {src: token, scaleX: 1, scaleY: 1},
      width: 2,
      height: 2,
      disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      actorLink: false,
      displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
      sight: {enabled: false}
    },
    flags: fixFlags("Actor")
  };
  if (actor?.getFlag(FIX_MODULE_ID, "targetedFix")) await actor.update(data);
  else if (!actor) actor = await Actor.create(data);
  return actor;
}

async function updateFatesScene() {
  const scene = game.scenes.getName("Fates' Open-Air Library");
  if (!scene) return {status: "missing"};
  const src = `${FIX_ROOT}/assets/art/scenes/fates-open-air-library.webp`;
  const level = scene.levels?.get?.(scene.initialLevel) ?? scene.levels?.contents?.[0];
  if (level?.update) await level.update({"background.src": src});
  else await scene.update({"background.src": src});
  await scene.setFlag("simplefog", "visible", false);
  return {status: "updated"};
}

async function disableSimpleFogOnManagedScenes() {
  for (const name of ["Bus Opening", "Fates' Open-Air Library", "The Margin"]) {
    const scene = game.scenes.getName(name);
    if (scene?.getFlag(FIX_MODULE_ID, "session1Installer")) await scene.setFlag("simplefog", "visible", false);
  }
}

async function updateAudioPlaylist() {
  const playlist = game.playlists.getName("Edited — Session 1 Audio");
  if (!playlist) return;
  const updates = [];
  const ring = playlist.sounds.find(sound => sound.name === "Crash Ring");
  const sting = playlist.sounds.find(sound => sound.name === "Legend Sting");
  if (ring) updates.push({_id: ring.id, volume: 0.25});
  if (sting) updates.push({_id: sting.id, path: `${FIX_ROOT}/assets/audio/legend-sting.ogg`, volume: 0.65});
  if (updates.length) await playlist.updateEmbeddedDocuments("PlaylistSound", updates);
}

async function applySession1Fixes({quiet = false} = {}) {
  if (!game.user?.isGM) return ui.notifications.warn("Only a GM can apply the targeted campaign fixes.");
  const results = {};
  results.edward = await updateEdward();
  results.fates = await updateFatesScene();
  results.rift = await upsertRiftActor();
  results.naomi = await upsertJournal("Naomi's Clue Board", naomiPages);
  results.legend = await upsertJournal("Legend Rules", [{name: "Legend Shop", content: legendShop}]);
  await disableSimpleFogOnManagedScenes();
  await updateAudioPlaylist();
  if (!quiet) ui.notifications.info("Targeted Session 1 fixes applied. Custom scenes and unrelated world content were not changed.");
  return results;
}

globalThis.EditedCampaignFixes = {apply: applySession1Fixes};

export {applySession1Fixes};
