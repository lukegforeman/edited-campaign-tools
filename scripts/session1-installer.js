const S1_MODULE_ID = "edited-campaign-tools";
const S1_PATH = `modules/${S1_MODULE_ID}`;
const S1_FLAG = "session1Installer";

const journalDefinitions = [
  {
    name: "Main Inn",
    content: `<h1>The Margin</h1><p>The repurposed MARiGold INn is the heart of the refuge. Michael keeps the common room warm and the kitchen working; the cabins and improvised additions shelter the other Edited.</p><h2>Session 1</h2><p>The party arrives here after the Fates finish the escape blanket. Let the fire, food, and strange mixture of eras establish that this is a home assembled from people reality misplaced.</p>`
  },
  {
    name: "Naomi's Clue Board",
    content: `<h1>Naomi's Clue Board</h1><p>Naomi tracks reality edits, the physical Fragments they leave behind, and the competing stories attached to them. Open the additional pages for the four active leads, known Fragment rules, unanswered questions, and an editable evidence log.</p>`
  },
  {
    name: "Legend Rules",
    content: `<h1>Legend Shop</h1><p>Legend is a shared party resource. Double-click the on-screen Legend counter to reopen this page.</p><table><thead><tr><th>Cost</th><th>Use</th></tr></thead><tbody><tr><td>1</td><td>Gain advantage.</td></tr><tr><td>1</td><td>Add a d6 before a roll.</td></tr><tr><td>2</td><td>Reroll any d20.</td></tr><tr><td>2</td><td>Add a d6 after a roll.</td></tr><tr><td>2</td><td>Add a Wordcraft edit without using your normal limit.</td></tr><tr><td>3</td><td>Invoke a divine boon.</td></tr><tr><td>3</td><td>Pass a check automatically.</td></tr><tr><td>4</td><td>Regain consciousness.</td></tr><tr><td>5</td><td>Automatically score a critical hit.</td></tr></tbody></table>`
  },
  {
    name: "Campfire Downtime",
    content: `<h1>Campfire Downtime</h1><p>Use the fire for quiet introductions, recovery, short bonds, and questions about life at The Margin. The figure tending it in the hub art can open either this journal or the camp roster.</p>`
  },
  {
    name: "The Edited",
    content: `<h1>The Edited</h1><p><img src="${S1_PATH}/assets/art/scenes/edited-group-portrait.webp" style="width:100%;height:auto"></p><ul><li><strong>Naomi</strong> — anomaly and Fragment researcher.</li><li><strong>Michael</strong> — camp dad, pancakes, and practical warmth.</li><li><strong>Anna Smith</strong> — field nurse from another era.</li><li><strong>Rosa</strong> — performer and daughter of Apollo.</li><li><strong>Frank</strong> — mechanic and determined skeptic.</li><li><strong>Lilly Carter</strong> — physically eleven, Edited since 1991.</li><li><strong>Theodore Finch</strong> — librarian, footnotes, and theory board.</li></ul>`
  },
  {
    name: "Lost Roads Travel Guide",
    content: `<h1>The Lost Roads</h1><p>Routes joined by story instead of geography. Known entrances near The Margin include the ordinary-looking maintenance shed, a closed trail that remembers Roman paving, and a nearly dry creek where a silent boatman waits with an absurdly small skiff.</p><p>They are faster than normal travel, but navigation is wonky. Roll on <strong>Lost Roads Travel</strong> whenever the journey should matter.</p>`
  },
  {
    name: "Session 1 — GM Runbook",
    content: `<h1>Session 1: You're Early—or Are You Late?</h1><ol><li>Begin on <strong>Bus Opening</strong>; narrate the heat, high winds, and DCA news.</li><li>Run <strong>Crash Flash</strong> at impact.</li><li>Activate <strong>Fates' Open-Air Library</strong>.</li><li>Introduce the three Fates and the party.</li><li>Reveal the two visible Satyns and start battle music.</li><li>Hold for three rounds while the Fates weave. Reveal the two hidden reinforcements during round two.</li><li>Stop battle music when the blanket finishes.</li><li>Activate <strong>The Margin</strong> and award Legend when earned.</li></ol>`
  }
];

const lostRoadsResults = [
  "Smooth Journey — the route is clear and fast.",
  "Echoes of Another Story — glimpse an erased timeline or forgotten place.",
  "The Roads Have Shifted — lose time or emerge slightly off target.",
  "A Chance Encounter — meet another traveler on the Lost Roads.",
  "Corrector Patrol — evade, outmaneuver, or confront a patrol.",
  "The Roads Remember — a vivid Echo reveals lore, foreshadowing, or a clue."
];

const macroFiles = [
  "00_Create_World_Placeholders.js", "01_Open_The_Margin.js", "02_Bus_Opening.js", "03_Crash_Flash.js",
  "04_Enter_The_Fates.js", "05_Start_Satyn_Battle.js", "06_Stop_Satyn_Battle.js", "07_Naomi_Briefing.js",
  "08_Roll_Lost_Roads.js", "09_Campfire_Downtime.js", "10_Edited_Group_Photo.js", "11_Add_Legend.js",
  "12_Remove_Legend.js", "13_Reset_Legend.js", "14_Toggle_Legend_HUD.js", "15_Install_Campaign_Actors.js",
  "16_Toggle_Edward_Duality.js", "17_Apply_Targeted_Fixes.js"
];

const macroNames = {
  "00_Create_World_Placeholders.js": "Install / Refresh Edited Session 1",
  "01_Open_The_Margin.js": "Open The Margin",
  "02_Bus_Opening.js": "Bus Opening",
  "03_Crash_Flash.js": "Crash Flash",
  "04_Enter_The_Fates.js": "Enter The Fates",
  "05_Start_Satyn_Battle.js": "Start Satyn Battle",
  "06_Stop_Satyn_Battle.js": "Stop Satyn Battle",
  "07_Naomi_Briefing.js": "Naomi Briefing",
  "08_Roll_Lost_Roads.js": "Roll Lost Roads",
  "09_Campfire_Downtime.js": "Campfire Downtime",
  "10_Edited_Group_Photo.js": "The Edited Roster",
  "11_Add_Legend.js": "+1 Legend",
  "12_Remove_Legend.js": "-1 Legend",
  "13_Reset_Legend.js": "Reset Legend",
  "14_Toggle_Legend_HUD.js": "Toggle Legend HUD",
  "15_Install_Campaign_Actors.js": "Install / Refresh Campaign Actors",
  "16_Toggle_Edward_Duality.js": "Toggle Edward: Olympus / Hades",
  "17_Apply_Targeted_Fixes.js": "Apply Targeted Session 1 Fixes"
};

function managedFlags(kind) {
  return {[S1_MODULE_ID]: {[S1_FLAG]: true, kind, version: 1}};
}

async function ensureFolder(name, type) {
  return game.folders.find(folder => folder.type === type && folder.name === name)
    ?? Folder.create({name, type, sorting: "a"});
}

async function upsertWorldDocument(collection, documentClass, data, folder = null) {
  const existing = collection.getName(data.name);
  if (existing && !existing.getFlag(S1_MODULE_ID, S1_FLAG)) {
    return {document: existing, status: "skipped"};
  }
  data.flags = foundry.utils.mergeObject(data.flags ?? {}, managedFlags(documentClass.documentName), {inplace: false});
  if (folder) data.folder = folder.id;
  if (existing) {
    await existing.update(data);
    return {document: existing, status: "updated"};
  }
  return {document: await documentClass.create(data), status: "created"};
}

async function installJournals() {
  const folder = await ensureFolder("Edited — Journals", "JournalEntry");
  const results = [];
  for (const definition of journalDefinitions) {
    const data = {
      name: definition.name,
      ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED},
      pages: [{name: "Overview", type: "text", text: {content: definition.content}}]
    };
    const current = game.journal.getName(definition.name);
    if (current?.getFlag(S1_MODULE_ID, S1_FLAG)) {
      data._id = current.id;
      data.folder = folder.id;
      data.flags = managedFlags("JournalEntry");
      await current.update({name: data.name, folder: folder.id, ownership: data.ownership, flags: data.flags});
      const page = current.pages.contents[0];
      if (page) await page.update({name: "Overview", "text.content": definition.content});
      else await current.createEmbeddedDocuments("JournalEntryPage", data.pages);
      results.push({document: current, status: "updated"});
    } else if (current) results.push({document: current, status: "skipped"});
    else results.push({document: await JournalEntry.create({...data, folder: folder.id, flags: managedFlags("JournalEntry")}), status: "created"});
  }
  return results;
}

async function installLostRoadsTable() {
  const folder = await ensureFolder("Edited — Tables", "RollTable");
  const existing = game.tables.getName("Lost Roads Travel");
  if (existing && !existing.getFlag(S1_MODULE_ID, S1_FLAG)) return existing;
  if (existing) await existing.deleteEmbeddedDocuments("TableResult", existing.results.map(result => result.id));
  const data = {
    name: "Lost Roads Travel",
    formula: "1d6",
    folder: folder.id,
    flags: managedFlags("RollTable"),
    results: lostRoadsResults.map((text, index) => ({
      type: CONST.TABLE_RESULT_TYPES.TEXT,
      text,
      range: [index + 1, index + 1],
      weight: 1,
      drawn: false
    }))
  };
  if (existing) {
    await existing.update({name: data.name, formula: data.formula, folder: folder.id, flags: data.flags});
    await existing.createEmbeddedDocuments("TableResult", data.results);
    return existing;
  }
  return RollTable.create(data);
}

async function installMacros() {
  const folder = await ensureFolder("Edited — Macros", "Macro");
  const results = [];
  for (const file of macroFiles) {
    const command = await fetch(`${S1_PATH}/macros/${file}`).then(response => response.text());
    results.push(await upsertWorldDocument(game.macros, Macro, {
      name: macroNames[file],
      type: "script",
      command,
      scope: "global",
      ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE}
    }, folder));
  }
  return results;
}

async function installPlaylist() {
  const existing = game.playlists.getName("Edited — Session 1 Audio");
  if (existing && !existing.getFlag(S1_MODULE_ID, S1_FLAG)) return existing;
  const sounds = [
    {name: "Camp Ambience", path: `${S1_PATH}/assets/audio/camp-ambience.ogg`, repeat: true, volume: 0.35},
    {name: "Satyn Battle", path: `${S1_PATH}/assets/audio/satyn-battle-loop.ogg`, repeat: true, volume: 0.38},
    {name: "Crash Ring", path: `${S1_PATH}/assets/audio/ear-ring-3s.ogg`, repeat: false, volume: 0.25},
    {name: "Legend Sting", path: `${S1_PATH}/assets/audio/legend-sting.ogg`, repeat: false, volume: 0.65}
  ];
  if (existing) {
    await existing.deleteEmbeddedDocuments("PlaylistSound", existing.sounds.map(sound => sound.id));
    await existing.update({mode: CONST.PLAYLIST_MODES.SIMULTANEOUS, flags: managedFlags("Playlist")});
    await existing.createEmbeddedDocuments("PlaylistSound", sounds);
    return existing;
  }
  return Playlist.create({name: "Edited — Session 1 Audio", mode: CONST.PLAYLIST_MODES.SIMULTANEOUS, sounds, flags: managedFlags("Playlist")});
}

async function buildToken(actorName, x, y, {hidden = false, disposition = null} = {}) {
  const actor = game.actors.getName(actorName);
  if (!actor) return null;
  const token = await actor.getTokenDocument({x, y, hidden});
  const data = token.toObject();
  data.flags = foundry.utils.mergeObject(data.flags ?? {}, {[S1_MODULE_ID]: {session1Token: true}}, {inplace: false});
  if (disposition !== null) data.disposition = disposition;
  return data;
}

async function refreshFatesTokens(scene) {
  const managed = scene.tokens.filter(token => token.getFlag(S1_MODULE_ID, "session1Token")).map(token => token.id);
  if (managed.length) await scene.deleteEmbeddedDocuments("Token", managed);
  const placements = [
    ["The Fates", 1100, 1050, {disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL}],
    ["Satyn (Edited Satyr)", 350, 850, {}],
    ["Satyn (Edited Satyr)", 1850, 850, {}],
    ["Satyn (Edited Satyr)", 350, 1500, {hidden: true}],
    ["Satyn (Edited Satyr)", 1850, 1500, {hidden: true}],
    ["Edward Dravin", 850, 1750, {}],
    ["Pierre", 1050, 1850, {}],
    ["Sophie", 1250, 1850, {}],
    ["Eusacles", 1450, 1750, {}]
  ];
  const tokens = (await Promise.all(placements.map(([name, x, y, options]) => buildToken(name, x, y, options)))).filter(Boolean);
  if (tokens.length) await scene.createEmbeddedDocuments("Token", tokens);
}

async function refreshMarginNotes(scene) {
  const managed = scene.notes.filter(note => note.getFlag(S1_MODULE_ID, "session1Note")).map(note => note.id);
  if (managed.length) await scene.deleteEmbeddedDocuments("Note", managed);
  const definitions = [
    ["Main Inn", 1280, 390, "Main Inn"],
    ["Naomi's Clue Board", 1540, 650, "Naomi's Board"],
    ["Campfire Downtime", 1320, 1080, "Campfire"],
    ["The Edited", 1120, 1050, "The Edited"],
    ["Lost Roads Travel Guide", 2140, 610, "Lost Roads" ]
  ];
  const notes = definitions.map(([journalName, x, y, text]) => {
    const journal = game.journal.getName(journalName);
    if (!journal) return null;
    return {
      entryId: journal.id,
      pageId: journal.pages.contents[0]?.id ?? null,
      x, y,
      icon: "icons/svg/book.svg",
      iconSize: 46,
      text,
      fontSize: 22,
      textColor: "#f3dfac",
      flags: {[S1_MODULE_ID]: {session1Note: true}}
    };
  }).filter(Boolean);
  if (notes.length) await scene.createEmbeddedDocuments("Note", notes);
}

async function installScenes() {
  const folder = await ensureFolder("Edited — Session 1", "Scene");
  const definitions = [
    {
      name: "Bus Opening",
      background: {src: `${S1_PATH}/assets/art/scenes/bus-opening.webp`},
      width: 1920, height: 1080, padding: 0, grid: {type: 0, size: 100, distance: 5, units: "ft"},
      tokenVision: false, globalLight: true, navigation: true, navOrder: 1
    },
    {
      name: "Fates' Open-Air Library",
      background: {src: `${S1_PATH}/assets/art/scenes/fates-open-air-library.webp`},
      width: 2400, height: 2400, padding: 0, grid: {type: 1, size: 100, distance: 5, units: "ft", color: "#776f62", alpha: 0.28},
      tokenVision: false, globalLight: true, navigation: true, navOrder: 2
    },
    {
      name: "The Margin",
      background: {src: `${S1_PATH}/assets/art/scenes/margin-hub-night-loop.webm`},
      width: 2560, height: 1440, padding: 0, grid: {type: 0, size: 100, distance: 5, units: "ft"},
      tokenVision: false, globalLight: true, navigation: true, navOrder: 3
    }
  ];
  const results = [];
  for (const data of definitions) results.push(await upsertWorldDocument(game.scenes, Scene, data, folder));
  const fatesScene = results.find(result => result.document.name === "Fates' Open-Air Library")?.document;
  if (fatesScene?.getFlag(S1_MODULE_ID, S1_FLAG)) await refreshFatesTokens(fatesScene);
  const marginScene = results.find(result => result.document.name === "The Margin")?.document;
  if (marginScene?.getFlag(S1_MODULE_ID, S1_FLAG)) await refreshMarginNotes(marginScene);
  return results;
}

async function installSession1() {
  if (!game.user?.isGM) return ui.notifications.warn("Only a GM can install Session 1.");
  if (game.system.id !== "dnd5e") return ui.notifications.error("Edited Session 1 requires the D&D5e system.");
  ui.notifications.info("Installing Edited Session 1…");
  await globalThis.EditedCampaignActors?.installCampaignActors();
  await installJournals();
  await installLostRoadsTable();
  await installMacros();
  await installPlaylist();
  const scenes = await installScenes();
  await globalThis.EditedCampaignFixes?.apply({quiet: true});
  await game.settings.set(S1_MODULE_ID, "session1Installed", true);
  const bus = scenes.find(result => result.document.name === "Bus Opening")?.document;
  if (bus && !game.scenes.active) await bus.activate();
  ui.notifications.info("Edited Session 1 is ready: Actors, scenes, journals, macros, audio, and tokens installed.");
  return {scenes, installed: true};
}

Hooks.once("init", () => {
  game.settings.register(S1_MODULE_ID, "session1Installed", {
    name: "Session 1 Installed",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
});

Hooks.once("ready", () => {
  globalThis.EditedSession1 = {installSession1};
  if (game.user.isGM && !game.settings.get(S1_MODULE_ID, "session1Installed")) {
    ui.notifications.warn("Edited Session 1 is not installed yet. Run the ‘Install / Refresh Edited Session 1’ macro from the module's macros folder.", {permanent: true});
  }
});

export {installSession1};
