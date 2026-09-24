const S5_MODULE_ID = "edited-campaign-tools";
const S5_PATH = `modules/${S5_MODULE_ID}`;
const S5_FLAG = "session5Installer";

Hooks.once("init", () => {
  game.settings.register(S5_MODULE_ID, "session5InstalledVer", {
    name: "Session 5 Installed Version",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
});

Hooks.once("ready", async () => {
  globalThis.EditedSession5Installer = {
    install: installSession5,
    setupHotbar: setupSession5Hotbar
  };

  if (game.user.isGM) {
    const installed = Number(game.settings.get(S5_MODULE_ID, "session5InstalledVer")) || 0;
    if (installed < 1) {
      console.log("Auto-installing Session 5 content (scenes, journals, macros)...");
      await installSession5();
    }
  }
});

async function ensureFolder(name, type) {
  return game.folders.find(f => f.type === type && f.name === name)
    ?? Folder.create({ name, type, sorting: "a" });
}

async function upsertDocument(collection, docClass, data, folder = null) {
  const existing = collection.getName(data.name);
  if (folder) data.folder = folder.id;
  data.flags = foundry.utils.mergeObject(data.flags ?? {}, { [S5_MODULE_ID]: { [S5_FLAG]: true } }, { inplace: false });
  
  if (existing) {
    await existing.update(data);
    return existing;
  }
  return docClass.create(data);
}

async function installSession5() {
  if (!game.user.isGM) return ui.notifications.warn("Only the GM can install Session 5 content.");
  ui.notifications.info("Installing Session 5 scenes, journals, and macros...");

  // 1. SCENES
  const sceneFolder = await ensureFolder("Edited — Session 5 Scenes", "Scene");
  
  const sceneDefinitions = [
    {
      name: "The Margin — Daytime Hub",
      background: { src: `${S5_PATH}/assets/art/scenes/margin-hub-day.jpg` },
      width: 2752,
      height: 1536,
      grid: { size: 100, type: 1, distance: 5, units: "ft" },
      tokenVision: true,
      fog: { exploration: false },
      darkness: 0,
      globalLight: true
    },
    {
      name: "Campus Quad & Forgotten Trail",
      background: { src: `${S5_PATH}/assets/art/scenes/campus-quad-battlemap.jpg` },
      width: 2752,
      height: 1536,
      grid: { size: 100, type: 1, distance: 5, units: "ft" },
      tokenVision: true,
      fog: { exploration: true },
      darkness: 0,
      globalLight: true
    },
    {
      name: "University Lecture Hall — Auditorium",
      background: { src: `${S5_PATH}/assets/art/scenes/lecture-hall-battlemap.jpg` },
      width: 2752,
      height: 1536,
      grid: { size: 100, type: 1, distance: 5, units: "ft" },
      tokenVision: true,
      fog: { exploration: true },
      darkness: 0,
      globalLight: true
    }
  ];

  for (const sDef of sceneDefinitions) {
    await upsertDocument(game.scenes, Scene, sDef, sceneFolder);
  }

  // 2. JOURNALS
  const journalFolder = await ensureFolder("Edited — Session 5 Journals", "JournalEntry");

  const flyerJournal = {
    name: "Handout: Campus Book Tour Flyer (Dr. Aris Thorne)",
    ownership: { default: 2 }, // Observer for players
    pages: [
      {
        name: "Flyer Front: STABLE or STALE?",
        type: "text",
        text: {
          format: 1,
          content: `<div class="journal-flyer" style="border: 2px solid #b38f3f; padding: 1.5rem; background: #161b22; color: #f0f6fc; font-family: 'Cinzel', serif;">
<div style="text-align: center; border-bottom: 1px solid #b38f3f; padding-bottom: 1rem; margin-bottom: 1rem;">
<h4 style="letter-spacing: 3px; color: #d4af37; margin: 0;">UNIVERSITY DISTINGUISHED GUEST LECTURE</h4>
<h2 style="font-size: 1.8rem; margin: 0.5rem 0; color: #ffffff;">THE 1948 ARCHIVES: STABLE OR STALE?</h2>
<p style="font-style: italic; color: #8b949e; margin: 0;">Investigative Author & Historian <strong>Dr. Aris Thorne</strong></p>
<p style="font-size: 0.9rem; color: #58a6ff;">📍 Humanities Hall B &bull; 11:00 AM &bull; Open to All Faculty &amp; Students</p>
</div>

<p style="font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.6;">
For over seven decades, standard pharmacology curriculum dismissed the controversial 1948 post-war clinical trials as a catastrophic batch failure—a compound that went <strong>STALE</strong> on the shelf, leaving terminal patients to perish without relief.
</p>
<p style="font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.6;">
Join bestselling investigative author <strong>Dr. Aris Thorne</strong> as she presents never-before-seen original handwritten laboratory logs and clinical charts. Her groundbreaking new book proves the compound was, in fact, chemically <strong>STABLE</strong>—and that historical records were deliberately altered to conceal the breakthrough that laid the foundation for modern antivirals.
</p>

<div style="border-top: 1px solid #30363d; margin-top: 1rem; padding-top: 0.75rem; text-align: center;">
<p style="font-size: 0.85rem; color: #d4af37; margin: 0;"><strong>⚠️ Open Floor Q&amp;A to Follow the Presentation</strong></p>
</div>
</div>`
        }
      },
      {
        name: "Flyer Back: Discussion Prompts & Naomi's Notes",
        type: "text",
        text: {
          format: 1,
          content: `<div style="padding: 1.2rem; background: #0d1117; color: #c9d1d9; font-family: 'Courier Prime', monospace;">
<h3 style="color: #f0883e; margin-top: 0;">📌 NAOMI'S HANDWRITTEN MARGIN NOTES</h3>
<ul style="line-height: 1.6;">
<li><strong>The Core Edit:</strong> The author found an unedited primary source. In reality, the Scribe changed <em>STABLE</em> to <em>STALE</em>. She thinks it was a human bureaucratic coverup.</li>
<li><strong>The Target:</strong> She is carrying the original brass-bound research binder holding the handwritten 1948 log. <em>Do not let that binder get taken.</em></li>
<li><strong>The Risk:</strong> Correctors (Scribe's collectors) will trigger a disruption to steal or destroy the binder once it is displayed.</li>
</ul>
</div>`
        }
      }
    ]
  };

  const gmGuideJournal = {
    name: "Session 5 GM Guide: 3 Audience Question Sources & Q&A Matrix",
    ownership: { default: 0 }, // GM Only
    pages: [
      {
        name: "Audience Question Sources (Act 3 Matrix)",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6; font-family: 'Inter', sans-serif;">
<h2 style="color: #d4af37; border-bottom: 1px solid #30363d;">3 Audience Question &amp; Debate Sources</h2>
<h3>Source 1: Hallway Chatter (Overheard outside the auditorium doors)</h3>
<ul>
  <li><strong>Pre-Med Debate:</strong> <em>"If the batch was actually STABLE back in 1948, why did every federal archive seal the chemical formula until last year? Is Thorne's book just sensationalist pharma-conspiracy, or did the board suppress the cure to sell lifetime palliative treatments?"</em></li>
  <li><strong>Ethics Major:</strong> <em>"Even if it worked, the terminal patients never consented to the agony. Does synthesizing a universal cure decades later excuse thirty days of unmonitored human suffering?"</em></li>
</ul>

<h3>Source 2: Naomi's Handout Flyer Prompts</h3>
<ul>
  <li><strong>Prompt A (The Archival Anomaly):</strong> <em>"How could a single-letter transcription error in a refrigeration log persist unchallenged across three generations of peer-reviewed literature?"</em></li>
  <li><strong>Prompt B (The Missing Patients):</strong> <em>"What happened to the surviving families of the five terminal patients who were administered the compound before the ward was shut down?"</em></li>
</ul>

<h3>Source 3: Faculty Reviewer / Campus Op-Ed Pamphlet (Handed out at the door)</h3>
<ul>
  <li><strong>The Ink Discrepancy:</strong> <em>"Why does the handwriting in the 1948 binder shift from standard iron-gall black ink to an unidentifiable dense charcoal pigment halfway through page 14?"</em></li>
  <li><strong>The Unknown Sign-Off:</strong> <em>"Who is the unidentified researcher with the initials 'S.C.' who signed off on the final patient release form?"</em></li>
  <li><strong>The Chemical Stability:</strong> <em>"Modern synthesis of the published formula requires refrigeration tech that did not exist in 1948. How could it have remained stable without external intervention?"</em></li>
</ul>
</div>`
        }
      },
      {
        name: "PC Birthright Triggers in the Lecture Hall",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6;">
<h3 style="color: #58a6ff;">PC Birthright Interactions:</h3>
<ul>
  <li><strong>Edward (Persephone / 3-Seed Signet):</strong> Recognizing the dual threshold of life vs underworld suffering. Spend 1 seed for +1d4/advantage on insight/medicine questions.</li>
  <li><strong>Pierre (Echidna &amp; Aphrodite / Beret of Normalcy):</strong> Senses serpentine monster kinship with the mysterious reviewer in Row 3 (Medula).</li>
  <li><strong>Alfie (Argo Driftwood / Inscribed Runes):</strong> Can etch a stored Wordcraft edit into his forearm while analyzing Dr. Thorne's syntax.</li>
  <li><strong>Eusacles (Thanatos / Last Hour Watch):</strong> Watch ticks heavily at the stillness of the disguised Corrector in the crowd.</li>
</ul>
</div>`
        }
      }
    ]
  };

  await upsertDocument(game.journal, JournalEntry, flyerJournal, journalFolder);
  await upsertDocument(game.journal, JournalEntry, gmGuideJournal, journalFolder);

  // 3. MACROS
  const macroFolder = await ensureFolder("Edited — Session 5 Macros", "Macro");

  const macroDefinitions = [
    {
      name: "01. +1 Legend",
      command: `EditedCampaignTools.addLegend(1);`
    },
    {
      name: "02. -1 Legend",
      command: `const current = Number(game.settings.get("edited-campaign-tools", "legendCount")) || 0;\nEditedCampaignTools.setLegend(Math.max(0, current - 1));`
    },
    {
      name: "03. Lost Roads Travel",
      command: `EditedCampaignTools.rollLostRoads();`
    },
    {
      name: "04. Open Book Tour Flyer",
      command: `game.journal.getName("Handout: Campus Book Tour Flyer (Dr. Aris Thorne)")?.sheet.render(true);`
    },
    {
      name: "05. Open Session 5 GM Guide",
      command: `game.journal.getName("Session 5 GM Guide: 3 Audience Question Sources & Q&A Matrix")?.sheet.render(true);`
    },
    {
      name: "06. Activate Scene — Daytime Margin",
      command: `EditedCampaignTools.activateScene("The Margin — Daytime Hub");`
    },
    {
      name: "07. Activate Scene — Campus Quad",
      command: `EditedCampaignTools.activateScene("Campus Quad & Forgotten Trail");`
    },
    {
      name: "08. Activate Scene — Lecture Hall",
      command: `EditedCampaignTools.activateScene("University Lecture Hall — Auditorium");`
    },
    {
      name: "09. Red Alert Sequence",
      command: `EditedCampaignTools.redAlert();`
    },
    {
      name: "10. Setup Session 5 GM Hotbar",
      command: `EditedSession5Installer.setupHotbar();`
    }
  ];

  for (const mDef of macroDefinitions) {
    await upsertDocument(game.macros, Macro, {
      name: mDef.name,
      type: "script",
      command: mDef.command,
      img: "icons/svg/book.svg"
    }, macroFolder);
  }

  // Set installed version
  await game.settings.set(S5_MODULE_ID, "session5InstalledVer", 1);
  ui.notifications.info("Session 5 content (3 Scenes, 2 Journals, 10 Macros) installed successfully!");
}

async function setupSession5Hotbar(page = 1) {
  if (!game.user.isGM) return ui.notifications.warn("Only the GM can set up the hotbar.");
  
  const macroSlots = [
    { slot: 1, name: "01. +1 Legend" },
    { slot: 2, name: "02. -1 Legend" },
    { slot: 3, name: "03. Lost Roads Travel" },
    { slot: 4, name: "04. Open Book Tour Flyer" },
    { slot: 5, name: "05. Open Session 5 GM Guide" },
    { slot: 6, name: "06. Activate Scene — Daytime Margin" },
    { slot: 7, name: "07. Activate Scene — Campus Quad" },
    { slot: 8, name: "08. Activate Scene — Lecture Hall" },
    { slot: 9, name: "09. Red Alert Sequence" },
    { slot: 10, name: "10. Setup Session 5 GM Hotbar" }
  ];

  for (const item of macroSlots) {
    const macro = game.macros.getName(item.name);
    if (macro) {
      const targetSlot = (page - 1) * 10 + item.slot;
      await game.user.assignHotbarMacro(macro, targetSlot);
    }
  }

  ui.notifications.info(`Assigned Session 5 Macros to GM Hotbar Page ${page}!`);
}
