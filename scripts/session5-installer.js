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
    if (installed < 2) {
      console.log("Installing/Updating Session 5 content (scenes, journals, macros)...");
      await installSession5();
    }
  }
});

async function ensureFolder(name, type) {
  return game.folders.find(f => f.type === type && f.name === name)
    ?? Folder.create({ name, type, sorting: "a" });
}

async function upsertScene(sceneDef, folder) {
  const existing = game.scenes.getName(sceneDef.name);
  const levelId = "groundLevel0001";
  const levelData = {
    _id: levelId,
    name: "Ground Floor",
    background: {
      color: "#000000",
      src: sceneDef.src,
      tint: "#ffffff",
      alphaThreshold: 0.75
    },
    elevation: { bottom: 0, top: 20 },
    textures: {
      anchorX: 0.5,
      anchorY: 0.5,
      offsetX: 0,
      offsetY: 0,
      fit: "fill",
      scaleX: 1,
      scaleY: 1,
      rotation: 0
    },
    visibility: { levels: [] },
    sort: 0
  };

  const scenePayload = {
    name: sceneDef.name,
    folder: folder.id,
    background: { src: sceneDef.src },
    width: sceneDef.width,
    height: sceneDef.height,
    padding: 0,
    grid: { size: 100, type: 1, distance: 5, units: "ft" },
    tokenVision: sceneDef.tokenVision ?? true,
    fog: { exploration: sceneDef.fog ?? true },
    darkness: 0,
    globalLight: true,
    flags: { [S5_MODULE_ID]: { [S5_FLAG]: true } }
  };

  if (!existing) {
    if (foundry.utils.isNewerVersion(game.version, "13")) {
      scenePayload.levels = [levelData];
      scenePayload.initialLevel = levelId;
    }
    const created = await Scene.create(scenePayload);
    return created;
  } else {
    await existing.update(scenePayload);
    // Explicitly update or create Foundry 14 Level document
    if (existing.levels) {
      const level = existing.levels.get(levelId) ?? existing.levels.contents[0];
      if (level) {
        await level.update({
          "background.src": sceneDef.src,
          "textures.fit": "fill"
        });
      } else {
        await existing.createEmbeddedDocuments("Level", [levelData]);
        if (existing.initialLevel !== levelId) {
          await existing.update({ initialLevel: levelId });
        }
      }
    }
    return existing;
  }
}

async function upsertJournal(data, folder) {
  const existing = game.journal.getName(data.name);
  data.folder = folder.id;
  data.flags = foundry.utils.mergeObject(data.flags ?? {}, { [S5_MODULE_ID]: { [S5_FLAG]: true } }, { inplace: false });
  
  if (existing) {
    await existing.update({
      name: data.name,
      folder: folder.id,
      ownership: data.ownership,
      flags: data.flags
    });
    // Replace pages
    if (existing.pages.size > 0) {
      await existing.deleteEmbeddedDocuments("JournalEntryPage", existing.pages.map(p => p.id));
    }
    await existing.createEmbeddedDocuments("JournalEntryPage", data.pages);
    return existing;
  }
  return JournalEntry.create(data);
}

async function upsertMacro(mDef, folder) {
  const existing = game.macros.getName(mDef.name);
  const data = {
    name: mDef.name,
    type: "script",
    command: mDef.command,
    img: mDef.img,
    scope: "global",
    folder: folder.id,
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE },
    flags: { [S5_MODULE_ID]: { [S5_FLAG]: true } }
  };
  if (existing) {
    await existing.update(data);
    return existing;
  }
  return Macro.create(data);
}

async function installSession5() {
  if (!game.user.isGM) return ui.notifications.warn("Only the GM can install Session 5 content.");
  ui.notifications.info("Setting up Session 5 scenes, journals, and macros...");

  // 1. SCENES (Exact image dimensions: 1376 x 768, padding: 0)
  const sceneFolder = await ensureFolder("Edited — Session 5 Scenes", "Scene");
  
  const sceneDefinitions = [
    {
      name: "The Margin — Daytime Hub",
      src: `${S5_PATH}/assets/art/scenes/margin-hub-day.jpg`,
      width: 1376,
      height: 768,
      tokenVision: false,
      fog: false
    },
    {
      name: "Campus Quad & Forgotten Trail",
      src: `${S5_PATH}/assets/art/scenes/campus-quad-battlemap.jpg`,
      width: 1376,
      height: 768,
      tokenVision: true,
      fog: true
    },
    {
      name: "University Lecture Hall — Auditorium",
      src: `${S5_PATH}/assets/art/scenes/lecture-hall-battlemap.jpg`,
      width: 1376,
      height: 768,
      tokenVision: true,
      fog: true
    }
  ];

  for (const sDef of sceneDefinitions) {
    await upsertScene(sDef, sceneFolder);
  }

  // 2. JOURNALS
  const journalFolder = await ensureFolder("Edited — Session 5 Journals", "JournalEntry");

  // Journal A: Handout Flyer (Player Visible - NO STABLE/STALE, NO AMBUSH SPOILER)
  const flyerJournal = {
    name: "Handout: Campus Book Tour Flyer (Dr. Aris Thorne)",
    ownership: { default: 2 }, // Observer
    pages: [
      {
        name: "Flyer",
        type: "text",
        text: {
          format: 1,
          content: `<div style="text-align: center; background: #0d1117; padding: 1rem; border-radius: 8px;">
<img src="${S5_PATH}/assets/art/journals/campus-book-tour-flyer.jpg" alt="Campus Book Tour Flyer" style="max-width: 100%; height: auto; border: 2px solid #b38f3f; border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);" />
</div>`
        }
      },
      {
        name: "Naomi's Field Notes",
        type: "text",
        text: {
          format: 1,
          content: `<div style="padding: 1.2rem; background: #0d1117; color: #c9d1d9; font-family: 'Courier Prime', monospace; border-left: 4px solid #f0883e;">
<h3 style="color: #f0883e; margin-top: 0;">📌 NAOMI'S FIELD NOTES</h3>
<ul style="line-height: 1.7; font-size: 0.95rem;">
  <li><strong>The Author:</strong> Dr. Aris Thorne is a mortal investigative historian on a university book tour. She doesn't know anything about the Ink, the Fog, or the Greek pantheon. She thinks she's uncovering an ordinary historical coverup.</li>
  <li><strong>The 1948 Trial:</strong> Standard medical curriculum teaches that the 1948 post-war clinical trials were abandoned due to batch spoilage. Thorne's book claims the formula actually worked, but clinical records were deliberately concealed.</li>
  <li><strong>The Primary Source:</strong> She is carrying the original brass-bound research binder with the handwritten 1948 laboratory logs. If those pages are an unedited primary source, that binder is an active Anomaly.</li>
  <li><strong>The Plan:</strong> Attend the 11:00 AM lecture in Humanities Hall B. Keep your eyes on that binder and see what she reveals during the open floor discussion.</li>
</ul>
</div>`
        }
      }
    ]
  };

  // Journal B: Session 5 GM Guide & 3 Audience Sources (GM Only)
  const gmGuideJournal = {
    name: "Session 5 GM Guide: 3 Audience Question Sources & Q&A Matrix",
    ownership: { default: 0 }, // GM Only
    pages: [
      {
        name: "3 Audience Question & Debate Sources",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6; font-family: 'Inter', sans-serif;">
<h2 style="color: #d4af37; border-bottom: 1px solid #30363d; padding-bottom: 0.3rem;">3 AUDIENCE QUESTION &amp; DEBATE SOURCES (ACT 3 MATRIX)</h2>

<h3 style="color: #58a6ff;">Source 1: Hallway Chatter (Overheard outside the auditorium doors)</h3>
<ul>
  <li><strong>Pre-Med Debate:</strong> <em>"If the compound was chemically viable back in 1948, why did every federal archive seal the chemical formula until last year? Is Thorne's book just sensationalist pharma-conspiracy, or did the board suppress the cure to sell lifetime palliative treatments?"</em></li>
  <li><strong>Ethics Major:</strong> <em>"Even if it worked, the terminal patients never consented to the agony. Does synthesizing a universal cure decades later excuse thirty days of unmonitored human suffering?"</em></li>
</ul>

<h3 style="color: #f0883e;">Source 2: Naomi's Briefing Prompts (Archival / Investigative Focus)</h3>
<ul>
  <li><strong>Prompt A (The Archival Discrepancy):</strong> <em>"Every standard textbook says the 1948 compound degraded and was discarded after three weeks. What physical laboratory evidence did Dr. Thorne discover that contradicts seventy years of published medical consensus?"</em></li>
  <li><strong>Prompt B (The Sealed Ward):</strong> <em>"Why were the surviving case files and patient histories of the clinical trial sealed under executive emergency orders the exact week after the trials concluded?"</em></li>
  <li><strong>Prompt C (The Original Binder):</strong> <em>"Where did Dr. Thorne actually locate the handwritten 1948 researcher's logbook, and why has no other historian ever been granted access to inspect it?"</em></li>
</ul>

<h3 style="color: #7ee787;">Source 3: Faculty Reviewer / Campus Op-Ed Pamphlet (Handed out at the doors)</h3>
<ul>
  <li><strong>The Ink Discrepancy:</strong> <em>"Why does the handwriting in the 1948 binder shift from standard iron-gall black ink to an unidentifiable dense charcoal pigment halfway through page 14?"</em></li>
  <li><strong>The Unknown Sign-Off:</strong> <em>"Who is the unidentified researcher with the initials 'S.C.' who signed off on the final patient release form?"</em></li>
  <li><strong>The Chemical Stability:</strong> <em>"Modern synthesis of the published formula requires refrigeration technology that did not exist in 1948. How could the compound have remained viable without external intervention?"</em></li>
</ul>
</div>`
        }
      },
      {
        name: "PC Birthright Triggers in the Lecture Hall",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6; font-family: 'Inter', sans-serif;">
<h2 style="color: #d4af37; border-bottom: 1px solid #30363d; padding-bottom: 0.3rem;">PC BIRTHRIGHT TRIGGERS IN ACT 3</h2>
<ul>
  <li><strong>Edward (Persephone / 3-Seed Signet):</strong> The medical ethics debate touches Edward's dual domain: underworld suffering versus the renewal of spring. Edward's Pomegranate Pin pulses warmly (spend 1 seed for +1d4/advantage on insight or lore).</li>
  <li><strong>Pierre (Echidna &amp; Aphrodite / Beret of Normalcy):</strong> As the debate heats up, Pierre's Beret vibrates with prickling heat. His maternal monster blood senses serpentine kin in Row 3 (the Medula in disguise).</li>
  <li><strong>Alfie (Argo Driftwood / Stored Wordcraft Runes):</strong> Hearing the precise phrasing of Thorne's presentation, Alfie can etch a stored Wordcraft edit into his wooden forearm, capturing the linguistic cadence of the speaker.</li>
  <li><strong>Eusacles (Thanatos / Last Hour Watch):</strong> Thanatos governs peaceful death. The pocket watch ticks with unnatural, heavy resonance, synchronizing with the breathlessly still reviewer in Row 3.</li>
</ul>
</div>`
        }
      }
    ]
  };

  // Journal C: Canonical PC Birthrights & Progression Trees (GM Only)
  const birthrightsJournal = {
    name: "Canonical PC Birthrights & Progression Trees",
    ownership: { default: 0 }, // GM Only
    pages: [
      {
        name: "Pierre — Beret of Normalcy",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6; font-family: 'Inter', sans-serif;">
<h2 style="color: #7ee787;">🐍 PIERRE (Luke S) — Wild Magic Sorcerer</h2>
<ul>
  <li><strong>True Heritage:</strong> Biological son of <strong>Echidna</strong> (Mother of All Monsters) and <strong>Aphrodite</strong> (Goddess of Beauty). Orchestrated by Eris.</li>
  <li><strong>Upbringing:</strong> Raised in secret by Gorgons to hide him from Olympus. Sent on a pilgrimage to America.</li>
  <li><strong>Signature Relic:</strong> <strong>The Beret of Normalcy</strong> (Psychic damper and monster brood conduit).</li>
</ul>
<h3>Mechanical Progression:</h3>
<ol>
  <li><strong>Tier 1 (Levels 1–3 — In Play):</strong>
    <ul>
      <li><em>Gorgon Affinity:</em> Touch can absorb/reverse petrification; advantage on saves vs gaze attacks.</li>
      <li><em>Monster Kin Resonance:</em> Beret warms within 60 ft of monstrous or serpentine entities.</li>
    </ul>
  </li>
  <li><strong>Tier 2 (Levels 4–6):</strong>
    <ul>
      <li><em>Hydra's Vigor:</em> Once per long rest, dropping below 50% HP triggers 1d8 + Cha HP regen per turn for 3 rounds.</li>
      <li><em>Nemean Toughness:</em> +1 Natural AC while wearing Beret; resistance to nonmagical slashing damage.</li>
    </ul>
  </li>
  <li><strong>Tier 3 (Levels 7–10):</strong>
    <ul>
      <li><em>Chimera's Tri-Breath:</em> Once per short rest, infuse spell with fire/poison/acid (+2d8 damage, DC 15 Con save vs blinded/poisoned).</li>
      <li><em>Gorgon's Gaze of Stone:</em> Drop glamour for 1 action to force DC 16 Con save or petrify target.</li>
    </ul>
  </li>
</ol>
</div>`
        }
      },
      {
        name: "Edward Dravin — Pomegranate Pin",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6; font-family: 'Inter', sans-serif;">
<h2 style="color: #f0883e;">🌸 EDWARD DRAVIN (William) — Twilight Cleric</h2>
<ul>
  <li><strong>True Heritage:</strong> Child of <strong>Persephone</strong> (Queen of the Underworld & Goddess of Spring Renewal).</li>
  <li><strong>Mythic Concept:</strong> Dual Aspects of the Threshold: Underworld rot/suffering vs. Spring life/rebirth.</li>
  <li><strong>Signature Relic:</strong> <strong>The Pomegranate Pin (The Three-Seed Signet)</strong>. Exactly 3 ruby seeds (charges) per long rest.</li>
</ul>
<h3>Mechanical Progression:</h3>
<ol>
  <li><strong>Tier 1 (Levels 1–3 — In Play):</strong>
    <ul>
      <li><em>Spring Seed (1 seed):</em> Grant ally within 30 ft +1d4 to ability check/save, or cure Poisoned.</li>
      <li><em>Underworld Seed (1 seed):</em> Convert spell damage to Necrotic and reduce target speed by 10 ft.</li>
    </ul>
  </li>
  <li><strong>Tier 2 (Levels 4–6):</strong>
    <ul>
      <li><em>Vernal Aura (Spring):</em> Twilight Sanctuary sprouts white asphodel flowers; allies gain temp HP + advantage vs Frightened/Charmed.</li>
      <li><em>Winter's Chill (Underworld):</em> Spend 2 seeds to impose Disadvantage on enemy attack rolls in Twilight Sanctuary for 1 round.</li>
    </ul>
  </li>
  <li><strong>Tier 3 (Levels 7–10):</strong>
    <ul>
      <li><em>Cycle of Pomegranates:</em> When ally drops to 0 HP within 30 ft, spend 3 seeds as reaction to stabilize at 1 HP + 20 ft pollen burst that blinds attackers (DC 16 Con save).</li>
    </ul>
  </li>
</ol>
</div>`
        }
      },
      {
        name: "Alfie — Living Argo Timber",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6; font-family: 'Inter', sans-serif;">
<h2 style="color: #58a6ff;">🪵 ALFIE (Sophie) — Lore Bard</h2>
<ul>
  <li><strong>True Heritage:</strong> <strong>Living Sailor Doll</strong> carved from the enchanted talking driftwood keel of the <strong>Argo</strong> (Jason's ship, Dodona oak).</li>
  <li><strong>Mythic Concept:</strong> Animated timber carrying prophetic speech and soul-echoes of seafaring myth.</li>
  <li><strong>Signature Birthright:</strong> <strong>Engraved Timber & Living Argo Inscriptions</strong>.</li>
</ul>
<h3>Mechanical Progression:</h3>
<ol>
  <li><strong>Tier 1 (Levels 1–3 — In Play):</strong>
    <ul>
      <li><em>Construct Resilience:</em> Immune to Poison damage and Poisoned condition; does not eat, sleep, or breathe.</li>
      <li><em>Engraved Inscription (Stored Wordcraft):</em> During short rest or downtime, carve <strong>1 Wordcraft spell alteration</strong> (Rank 1, 1-letter substitute/add) into wooden forearm. Released instantly as bonus action or free action upon casting!</li>
      <li><em>Sound Mimicry:</em> Replicate any voice or ambient sound heard within 24 hours.</li>
    </ul>
  </li>
  <li><strong>Tier 2 (Levels 4–6):</strong>
    <ul>
      <li><em>Double Inscription:</em> Store up to <strong>2 simultaneous engraved Wordcraft runes</strong>; unlocks Rank 2 Wordcraft.</li>
      <li><em>Speaking Timber:</em> Touch natural wood to psychometrically hear conversations from the past 30 days.</li>
      <li><em>Saltwater Ward & Buoyancy:</em> Fire resistance while damp; walk effortlessly on water surfaces.</li>
    </ul>
  </li>
  <li><strong>Tier 3 (Levels 7–10):</strong>
    <ul>
      <li><em>Argonaut Chorus:</em> Unleash 30 ft phantom sea-surge: pushes enemies 15 ft, knocks prone (DC 16 Str save), +10 ft speed to allies.</li>
    </ul>
  </li>
</ol>
</div>`
        }
      },
      {
        name: "Eusacles — The Last Hour Watch",
        type: "text",
        text: {
          format: 1,
          content: `<div style="line-height: 1.6; font-family: 'Inter', sans-serif;">
<h2 style="color: #d2a8ff;">⏳ EUSACLES (John) — Oath of Glory Paladin</h2>
<ul>
  <li><strong>True Heritage:</strong> Son of <strong>Thanatos</strong> (God of Peaceful, Natural Death).</li>
  <li><strong>Mythic Concept:</strong> Guardian of the peaceful threshold against unnatural ink-erasure and monstrous slaughter.</li>
  <li><strong>Signature Relic:</strong> <strong>The Last Hour Watch</strong> (Brass pocket watch measuring mortal tempo).</li>
</ul>
<h3>Mechanical Progression:</h3>
<ol>
  <li><strong>Tier 1 (Levels 1–3 — In Play):</strong>
    <ul>
      <li><em>Mortality Gauge:</em> Bonus action to know if an enemy within 30 ft is below 50% HP (Bloodied).</li>
      <li><em>Irregular Ticking:</em> Ticks audibly near unnatural immortals, undead, or petrified beings.</li>
    </ul>
  </li>
  <li><strong>Tier 2 (Levels 4–6):</strong>
    <ul>
      <li><em>Eleventh Hour Surge:</em> When below 25% HP, watch chimes: gain +2 AC and +1d8 Radiant/Necrotic damage to weapon strikes for 1 minute.</li>
      <li><em>Severing Smite:</em> Divine Smite bypasses damage resistances of aberrations, undead, and constructs.</li>
    </ul>
  </li>
  <li><strong>Tier 3 (Levels 7–10):</strong>
    <ul>
      <li><em>Thanatos' Veto:</em> Once per long rest, when ally within 30 ft takes fatal damage, click crown as reaction: damage becomes 0 and ally teleports 15 ft in shadow mist.</li>
    </ul>
  </li>
</ol>
</div>`
        }
      }
    ]
  };

  await upsertJournal(flyerJournal, journalFolder);
  await upsertJournal(gmGuideJournal, journalFolder);
  await upsertJournal(birthrightsJournal, journalFolder);

  // 3. MACROS (Distinct Icons, Reordered per User Request)
  const macroFolder = await ensureFolder("Edited — Session 5 Macros", "Macro");

  const macroDefinitions = [
    {
      name: "01. +1 Legend",
      command: `EditedCampaignTools.addLegend(1);`,
      img: "icons/svg/upgrade.svg"
    },
    {
      name: "02. -1 Legend",
      command: `const current = Number(game.settings.get("edited-campaign-tools", "legendCount")) || 0;\nEditedCampaignTools.setLegend(Math.max(0, current - 1));`,
      img: "icons/svg/downgrade.svg"
    },
    {
      name: "03. Lost Roads Travel",
      command: `EditedCampaignTools.rollLostRoads();`,
      img: "icons/svg/direction.svg"
    },
    {
      name: "04. Open Book Tour Flyer",
      command: `game.journal.getName("Handout: Campus Book Tour Flyer (Dr. Aris Thorne)")?.sheet.render(true);`,
      img: "icons/svg/book.svg"
    },
    {
      name: "05. Activate Scene — Daytime Margin",
      command: `EditedCampaignTools.activateScene("The Margin — Daytime Hub");`,
      img: "icons/svg/village.svg"
    },
    {
      name: "06. Activate Scene — Campus Quad",
      command: `EditedCampaignTools.activateScene("Campus Quad & Forgotten Trail");`,
      img: "icons/svg/statue.svg"
    },
    {
      name: "07. Activate Scene — Lecture Hall",
      command: `EditedCampaignTools.activateScene("University Lecture Hall — Auditorium");`,
      img: "icons/svg/temple.svg"
    },
    {
      name: "08. Reveal Medula",
      command: `const actor = game.actors.getName("Medulas (Edited Medusa)") ?? game.actors.find(a => a.name.includes("Medula"));
if (canvas.tokens.controlled.length > 0) {
  for (const token of canvas.tokens.controlled) {
    if (actor) {
      await token.document.update({
        name: actor.name,
        texture: { src: actor.prototypeToken?.texture?.src ?? actor.img },
        hidden: false
      });
    }
  }
}
ChatMessage.create({
  speaker: { alias: "Narrator" },
  content: \`<div style="border-left: 3px solid #722ed1; padding: 0.6rem; background: #1a162b; color: #f0f0f0; font-family: 'Inter', sans-serif;">
    <h3 style="margin: 0; color: #b37feb; font-size: 1.1rem;">👁️ THE REVELATION</h3>
    <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; line-height: 1.5;">The academic reviewer in the third row rises. Microscopic copper serpents and living editorial ink hiss beneath her scarf as the <strong>Medula</strong> fixes her gaze upon the stage!</p>
  </div>\`
});
actor?.sheet.render(true);`,
      img: "icons/svg/eye.svg"
    },
    {
      name: "09. Reveal Satyn",
      command: `const actor = game.actors.getName("Satyn (Edited Satyr)") ?? game.actors.find(a => a.name.includes("Satyn"));
if (canvas.tokens.controlled.length > 0) {
  for (const token of canvas.tokens.controlled) {
    if (actor) {
      await token.document.update({
        name: actor.name,
        texture: { src: actor.prototypeToken?.texture?.src ?? actor.img },
        hidden: false
      });
    }
  }
}
ChatMessage.create({
  speaker: { alias: "Narrator" },
  content: \`<div style="border-left: 3px solid #ff4d4f; padding: 0.6rem; background: #261215; color: #f0f0f0; font-family: 'Inter', sans-serif;">
    <h3 style="margin: 0; color: #ff7875; font-size: 1.1rem;">🐐 INKY RIFT</h3>
    <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; line-height: 1.5;">A rift of viscous black ink tears open with a briny hiss. A <strong>Satyn</strong> emerges, curved horns glinting with editorial script!</p>
  </div>\`
});
actor?.sheet.render(true);`,
      img: "icons/svg/combat.svg"
    },
    {
      name: "10. Setup Session 5 GM Hotbar",
      command: `EditedSession5Installer.setupHotbar();`,
      img: "icons/svg/gear.svg"
    }
  ];

  for (const mDef of macroDefinitions) {
    await upsertMacro(mDef, macroFolder);
  }

  // Update installed version tracking
  await game.settings.set(S5_MODULE_ID, "session5InstalledVer", 2);
  ui.notifications.info("Session 5 content (3 Scenes, 3 Journals, 10 Curated Macros) updated and ready!");
}

async function setupSession5Hotbar(page = 1) {
  if (!game.user.isGM) return ui.notifications.warn("Only the GM can configure the hotbar.");
  
  const macroNames = [
    "01. +1 Legend",
    "02. -1 Legend",
    "03. Lost Roads Travel",
    "04. Open Book Tour Flyer",
    "05. Activate Scene — Daytime Margin",
    "06. Activate Scene — Campus Quad",
    "07. Activate Scene — Lecture Hall",
    "08. Reveal Medula",
    "09. Reveal Satyn",
    "10. Setup Session 5 GM Hotbar"
  ];

  for (let i = 0; i < macroNames.length; i++) {
    const macro = game.macros.getName(macroNames[i]);
    if (macro) {
      const slot = (page - 1) * 10 + (i + 1);
      await game.user.assignHotbarMacro(macro, slot);
    }
  }

  ui.notifications.info(`Session 5 Macros successfully assigned to GM Hotbar Page ${page}!`);
}
