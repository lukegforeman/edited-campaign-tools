const RELIC_MODULE_ID = "edited-campaign-tools";

const RELIC_DEFINITIONS = [
  {
    name: "Beret of Normalcy",
    type: "equipment",
    img: "icons/equipment/head/hat-cap-simple-green.webp",
    system: {
      description: {
        value: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6;">
<h3 style="color: #7ee787; border-bottom: 1px solid #30363d; margin-top: 0;">🐍 RELIC: THE BERET OF NORMALCY</h3>
<p><strong>Owner:</strong> Pierre (Luke S) &bull; <strong>Attunement:</strong> Required (Attuned)</p>
<p>A stylish dark slouch beret that acts as a psychic dampener, keeping Pierre's monster nature hidden behind an aura of innocuous Parisian charm while channeling his monster brood conduit.</p>

<h4 style="color: #58a6ff; margin-bottom: 0.3rem;">HERITAGE &amp; MYTHIC CONCEPT:</h4>
<ul>
  <li><strong>True Heritage:</strong> Biological son of <strong>Echidna</strong> (Mother of All Monsters) and <strong>Aphrodite</strong> (Goddess of Beauty), arranged by Eris.</li>
  <li><strong>Upbringing:</strong> Raised in secret by Gorgons in hiding from Olympus. Sent on a pilgrimage to America.</li>
</ul>

<h4 style="color: #d4af37; margin-bottom: 0.3rem;">ACTIVE TIER 1 FEATURES (Levels 1–3 — In Play):</h4>
<ul>
  <li><strong>Gorgon Affinity:</strong> Your touch can absorb and reverse petrification. You have <strong>Advantage</strong> on saving throws against gaze attacks, petrification, and poison.</li>
  <li><strong>Monster Kin Resonance:</strong> The Beret warms pleasantly within 60 ft of monstrous, serpentine, or aberration entities.</li>
</ul>

<h4 style="color: #8b949e; margin-bottom: 0.3rem;">FUTURE PROGRESSION:</h4>
<ul>
  <li><strong>Tier 2 (Levels 4–6):</strong> <em>Hydra's Vigor</em> (Dropping below 50% HP triggers 1d8+Cha HP regen per turn for 3 rounds once per long rest); <em>Nemean Toughness</em> (+1 Natural AC, nonmagical slashing resistance).</li>
  <li><strong>Tier 3 (Levels 7–10):</strong> <em>Chimera's Tri-Breath</em> (+2d8 fire/poison/acid spell infusion); <em>Gorgon's Gaze of Stone</em> (Drop glamour for 1 action to petrify target, DC 16 Con save).</li>
</ul>
</div>`
      },
      source: { custom: "Uneraseable Mistakes — PC Birthrights" },
      quantity: 1,
      weight: { value: 0.5, units: "lb" },
      price: { value: 0, denomination: "gp" },
      attuned: 2,
      equipped: true,
      rarity: "artifact",
      identified: true,
      armor: { value: 0, type: "trinket" },
      type: { value: "wondrous" },
      activities: {
        actGorgonTouch01: {
          _id: "actGorgonTouch01",
          type: "utility",
          name: "Gorgon Affinity Touch",
          activation: { type: "action", value: 1 },
          range: { units: "touch" },
          target: { affects: { count: "1", type: "creature" } },
          description: { chatFlavor: "Touch absorbs and reverses petrification." }
        },
        actMonsterKin002: {
          _id: "actMonsterKin002",
          type: "utility",
          name: "Monster Kin Resonance",
          activation: { type: "special" },
          range: { value: "60", units: "ft" },
          description: { chatFlavor: "The Beret warms pleasantly near monstrous or serpentine kin." }
        }
      }
    },
    flags: { [RELIC_MODULE_ID]: { birthright: true, pc: "Pierre" } }
  },
  {
    name: "The Pomegranate Pin (The Three-Seed Signet)",
    type: "equipment",
    img: "icons/accessories/jewelry/brooch-gold-ruby.webp",
    system: {
      description: {
        value: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6;">
<h3 style="color: #f0883e; border-bottom: 1px solid #30363d; margin-top: 0;">🌸 SIGNET: THE POMEGRANATE PIN</h3>
<p><strong>Owner:</strong> Edward Dravin (William) &bull; <strong>Attunement:</strong> Required (Attuned)</p>
<p>An antique brooch fashioned from blackened Greek silver depicting an opened pomegranate. Three glowing ruby seeds rest in its hollow core, measuring Edward's authority over the threshold of spring and underworld rot.</p>

<h4 style="color: #58a6ff; margin-bottom: 0.3rem;">HERITAGE &amp; MYTHIC CONCEPT:</h4>
<ul>
  <li><strong>True Heritage:</strong> Child of <strong>Persephone</strong> (Queen of the Underworld &amp; Goddess of Spring Renewal).</li>
  <li><strong>Dual Threshold:</strong> The duality of agonized earthly suffering (the root/tomb) and vibrant renewal (spring harvest).</li>
</ul>

<h4 style="color: #d4af37; margin-bottom: 0.3rem;">ACTIVE TIER 1 FEATURES (Levels 1–3 — In Play):</h4>
<p><strong>Charges:</strong> Exactly <strong>3 Seeds (Charges)</strong> per long rest.</p>
<ul>
  <li><strong>Spring Seed (Cost: 1 Seed):</strong> Bonus action or action. Choose one creature within 30 ft: they gain <strong>+1d4</strong> to their next ability check or saving throw, or you instantly end the <strong>Poisoned</strong> condition on them.</li>
  <li><strong>Underworld Seed (Cost: 1 Seed):</strong> When casting a damaging spell, spend 1 seed to convert the damage type to <strong>Necrotic</strong>. The target's movement speed is reduced by <strong>10 feet</strong> until the start of your next turn.</li>
</ul>

<h4 style="color: #8b949e; margin-bottom: 0.3rem;">FUTURE PROGRESSION:</h4>
<ul>
  <li><strong>Tier 2 (Levels 4–6):</strong> <em>Vernal Aura</em> (Twilight Sanctuary sprouts white asphodel flowers; allies gain temp HP + advantage vs Frightened/Charmed); <em>Winter's Chill</em> (Spend 2 seeds to impose Disadvantage on enemy attack rolls in Twilight Sanctuary for 1 round).</li>
  <li><strong>Tier 3 (Levels 7–10):</strong> <em>Cycle of Pomegranates</em> (When ally drops to 0 HP within 30 ft, spend 3 seeds as reaction to stabilize at 1 HP + 20 ft blinding pollen burst).</li>
</ul>
</div>`
      },
      source: { custom: "Uneraseable Mistakes — PC Birthrights" },
      quantity: 1,
      weight: { value: 0.2, units: "lb" },
      price: { value: 0, denomination: "gp" },
      attuned: 2,
      equipped: true,
      rarity: "artifact",
      identified: true,
      uses: { value: 3, max: "3", per: "lr", recovery: "3" },
      armor: { value: 0, type: "trinket" },
      type: { value: "wondrous" },
      activities: {
        actSpringSeed001: {
          _id: "actSpringSeed001",
          type: "utility",
          name: "Spring Seed (Renewal)",
          activation: { type: "bonus", value: 1 },
          consumption: { targets: [{ type: "itemUses", value: "1" }], scaling: { allowed: false } },
          range: { value: "30", units: "ft" },
          target: { affects: { count: "1", type: "creature" } },
          description: { chatFlavor: "Spend 1 Seed: Target gains +1d4 to next check/save or cures Poisoned." }
        },
        actUnderworld002: {
          _id: "actUnderworld002",
          type: "utility",
          name: "Underworld Seed (Decay)",
          activation: { type: "special", value: 1 },
          consumption: { targets: [{ type: "itemUses", value: "1" }], scaling: { allowed: false } },
          range: { value: "30", units: "ft" },
          description: { chatFlavor: "Spend 1 Seed: Convert spell damage to Necrotic & reduce target speed by 10 ft." }
        }
      }
    },
    flags: { [RELIC_MODULE_ID]: { birthright: true, pc: "Edward" } }
  },
  {
    name: "Living Argo Timber (Inscribed Forearm)",
    type: "feat",
    img: "icons/commodities/wood/wood-log-oak.webp",
    system: {
      description: {
        value: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6;">
<h3 style="color: #58a6ff; border-bottom: 1px solid #30363d; margin-top: 0;">🪵 BIRTHRIGHT: LIVING ARGO TIMBER</h3>
<p><strong>Owner:</strong> Alfie (Sophie) &bull; <strong>Origin:</strong> The Keel of the Argo</p>
<p>Alfie is a living sailor doll carved from the sacred talking driftwood keel of the <strong>Argo</strong> (Dodona prophetic oak). Animated timber pulses beneath his joints, retaining echoes of prophecy, seafaring camaraderie, and linguistic power.</p>

<h4 style="color: #d4af37; margin-bottom: 0.3rem;">ACTIVE TIER 1 FEATURES (Levels 1–3 — In Play):</h4>
<ul>
  <li><strong>Construct Resilience:</strong> You are immune to <strong>Poison damage</strong> and the <strong>Poisoned condition</strong>. You do not need to eat, drink, sleep, or breathe.</li>
  <li><strong>Engraved Inscription (Stored Wordcraft):</strong> During a short rest or downtime, Alfie can physically carve <strong>1 Wordcraft spell alteration</strong> (Rank 1, 1-letter substitute/addition) directly into his wooden forearm. When casting that spell in combat, this stored alteration releases <strong>instantly as a free action or bonus action</strong> without expending your turn's Wordcraft allowance!</li>
  <li><strong>Sound Mimicry:</strong> You can flawlessly mimic any sound or voice heard within the past 24 hours. A listener can detect it is an imitation with a successful DC 13 Wisdom (Insight) check.</li>
</ul>

<h4 style="color: #8b949e; margin-bottom: 0.3rem;">FUTURE PROGRESSION:</h4>
<ul>
  <li><strong>Tier 2 (Levels 4–6):</strong> <em>Double Inscription</em> (Store up to 2 simultaneous engraved Wordcraft runes, Rank 2 Wordcraft); <em>Speaking Timber</em> (Touch natural wood to hear past 30 days of conversation); <em>Saltwater Ward &amp; Buoyancy</em> (Fire resistance while damp, water walking).</li>
  <li><strong>Tier 3 (Levels 7–10):</strong> <em>Argonaut Chorus</em> (30 ft phantom sea-surge: 15 ft push, knock prone [DC 16 Str save], +10 ft speed to allies).</li>
</ul>
</div>`
      },
      source: { custom: "Uneraseable Mistakes — PC Birthrights" },
      type: { value: "supernaturalGift", subtype: "" },
      activities: {
        actReleaseRune01: {
          _id: "actReleaseRune01",
          type: "utility",
          name: "Release Engraved Wordcraft Rune",
          activation: { type: "bonus", value: 1 },
          description: { chatFlavor: "Releases stored forearm Wordcraft alteration instantly on spellcast." }
        },
        actSoundMimic002: {
          _id: "actSoundMimic002",
          type: "utility",
          name: "Sound Mimicry",
          activation: { type: "action", value: 1 },
          description: { chatFlavor: "Flawlessly mimics voice or sound heard within the past 24 hours (DC 13 Insight)." }
        }
      }
    },
    flags: { [RELIC_MODULE_ID]: { birthright: true, pc: "Alfie" } }
  },
  {
    name: "The Last Hour Watch",
    type: "equipment",
    img: "icons/commodities/clocks/pocketwatch-brass.webp",
    system: {
      description: {
        value: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6;">
<h3 style="color: #d2a8ff; border-bottom: 1px solid #30363d; margin-top: 0;">⏳ RELIC: THE LAST HOUR WATCH</h3>
<p><strong>Owner:</strong> Eusacles (John) &bull; <strong>Attunement:</strong> Required (Attuned)</p>
<p>A heavy brass pocket watch with a cracked crystal and a single obsidian hand that measures mortal lifespan and cosmic tempo rather than ordinary minutes.</p>

<h4 style="color: #58a6ff; margin-bottom: 0.3rem;">HERITAGE &amp; MYTHIC CONCEPT:</h4>
<ul>
  <li><strong>True Heritage:</strong> Son of <strong>Thanatos</strong> (God of Peaceful, Natural Death).</li>
  <li><strong>Mythic Duty:</strong> Protecting the peaceful threshold against violent editorial erasure and unnatural abominations.</li>
</ul>

<h4 style="color: #d4af37; margin-bottom: 0.3rem;">ACTIVE TIER 1 FEATURES (Levels 1–3 — In Play):</h4>
<ul>
  <li><strong>Mortality Gauge:</strong> As a bonus action, consult the watch: you instantly perceive whether any creature you can see within 30 feet is below half its maximum hit points (<strong>Bloodied</strong>).</li>
  <li><strong>Irregular Ticking:</strong> The watch ticks with loud, irregular resonance within 60 feet of unnatural immortals, undead, Edited anomalies, or petrified beings.</li>
</ul>

<h4 style="color: #8b949e; margin-bottom: 0.3rem;">FUTURE PROGRESSION:</h4>
<ul>
  <li><strong>Tier 2 (Levels 4–6):</strong> <em>Eleventh Hour Surge</em> (Dropping below 25% HP triggers +2 AC and +1d8 Radiant/Necrotic weapon damage for 1 min); <em>Severing Smite</em> (Divine Smite ignores damage resistances of aberrations, undead, and constructs).</li>
  <li><strong>Tier 3 (Levels 7–10):</strong> <em>Thanatos' Veto</em> (Once per long rest reaction when ally drops to 0 HP: damage becomes 0 and ally teleports 15 ft in shadow mist).</li>
</ul>
</div>`
      },
      source: { custom: "Uneraseable Mistakes — PC Birthrights" },
      quantity: 1,
      weight: { value: 0.5, units: "lb" },
      price: { value: 0, denomination: "gp" },
      attuned: 2,
      equipped: true,
      rarity: "artifact",
      identified: true,
      armor: { value: 0, type: "trinket" },
      type: { value: "wondrous" },
      activities: {
        actMortality0001: {
          _id: "actMortality0001",
          type: "utility",
          name: "Mortality Gauge",
          activation: { type: "bonus", value: 1 },
          range: { value: "30", units: "ft" },
          target: { affects: { count: "1", type: "creature" } },
          description: { chatFlavor: "Bonus action: reveals if target is Bloodied (<50% HP)." }
        },
        actTicking000002: {
          _id: "actTicking000002",
          type: "utility",
          name: "Check Irregular Ticking",
          activation: { type: "special" },
          range: { value: "60", units: "ft" },
          description: { chatFlavor: "Ticks irregularly near unnatural immortals, undead, petrified beings, or anomalies." }
        }
      }
    },
    flags: { [RELIC_MODULE_ID]: { birthright: true, pc: "Eusacles" } }
  },
  {
    name: "Ancient Spartan Hoplon (Greek Shield)",
    type: "equipment",
    img: "icons/equipment/shield/round-wooden-red-boss.webp",
    system: {
      description: {
        value: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6;">
<h3 style="color: #d4af37; border-bottom: 1px solid #30363d; margin-top: 0;">🛡️ ANCIENT SPARTAN HOPLON</h3>
<p><strong>Type:</strong> Shield (+2 AC) &bull; <strong>Origin:</strong> Looted from City Antiquities Museum (Session 4)</p>
<p>A heavy, concave wooden shield faced with beaten bronze, bearing the weathered crimson chevron (Lambda) of ancient Sparta. Recovered from the antiquities display pedestal during the museum heist.</p>

<h4 style="color: #58a6ff; margin-bottom: 0.3rem;">PROPERTIES &amp; FEATURES:</h4>
<ul>
  <li><strong>Armor Class:</strong> +2 AC while equipped.</li>
  <li><strong>Spartan Phalanx Guard:</strong> While wielding this shield, when an adjacent ally is targeted by an attack, you can use your <strong>Reaction</strong> to impose <strong>Disadvantage</strong> on the attack roll.</li>
  <li><strong>Dorian Inscription:</strong> Archaic Greek characters pressed into the bronze rim resonate faintly with divine Greek bloodlines.</li>
</ul>
</div>`
      },
      source: { custom: "Uneraseable Mistakes — Museum Antiquities" },
      quantity: 1,
      weight: { value: 6, units: "lb" },
      price: { value: 150, denomination: "gp" },
      equipped: true,
      rarity: "rare",
      identified: true,
      armor: { value: 2, type: "shield" },
      type: { value: "shield" },
      activities: {
        actPhalanxGrd01: {
          _id: "actPhalanxGrd01",
          type: "utility",
          name: "Phalanx Guard",
          activation: { type: "reaction", value: 1, condition: "When an adjacent ally is targeted by an attack" },
          range: { value: "5", units: "ft" },
          description: { chatFlavor: "Reaction: Impose Disadvantage on an attack targeting an adjacent ally." }
        }
      }
    },
    flags: { [RELIC_MODULE_ID]: { museumRelic: true, session: 4 } }
  },
  {
    name: "Ancient Greek Bronze Cuirass",
    type: "equipment",
    img: "icons/equipment/chest/breastplate-sculpted-gold.webp",
    system: {
      description: {
        value: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6;">
<h3 style="color: #d4af37; border-bottom: 1px solid #30363d; margin-top: 0;">⚔️ ANCIENT GREEK BRONZE CUIRASS</h3>
<p><strong>Type:</strong> Medium Armor (Breastplate) &bull; <strong>Origin:</strong> Looted from City Antiquities Museum (Session 4)</p>
<p>A sculpted bronze breastplate and backplate depicting idealized musculature, salvaged from the central gallery pedestal of the City Museum of Antiquities. Despite being forged over two millennia ago, the bronze gleams with a polished golden-brown luster and bears no verdigris or corrosion.</p>

<h4 style="color: #58a6ff; margin-bottom: 0.3rem;">PROPERTIES &amp; FEATURES:</h4>
<ul>
  <li><strong>Armor Class:</strong> 14 + Dex modifier (max 2). Does not impose disadvantage on Stealth checks.</li>
  <li><strong>Hoplite Resilience:</strong> You have <strong>Resistance to nonmagical piercing damage</strong> from ranged attacks (arrows, bolts, javelins).</li>
  <li><strong>Weight of History:</strong> The armor feels unnaturally light and balanced to anyone carrying divine Greek blood.</li>
</ul>
</div>`
      },
      source: { custom: "Uneraseable Mistakes — Museum Antiquities" },
      quantity: 1,
      weight: { value: 20, units: "lb" },
      price: { value: 400, denomination: "gp" },
      equipped: true,
      rarity: "rare",
      identified: true,
      armor: { value: 14, dex: 2, type: "medium" },
      type: { value: "medium" }
    },
    flags: { [RELIC_MODULE_ID]: { museumRelic: true, session: 4 } }
  },
  {
    name: "Sunstone Embers of Apollo",
    type: "consumable",
    img: "icons/commodities/materials/ember-glowing.webp",
    system: {
      description: {
        value: `<div style="font-family: 'Inter', sans-serif; line-height: 1.6;">
<h3 style="color: #faad14; border-bottom: 1px solid #30363d; margin-top: 0;">☀️ SUNSTONE EMBERS OF APOLLO</h3>
<p><strong>Owner:</strong> Alfie (Sophie) &bull; <strong>Origin:</strong> Session 4.5 Sunstone Memory Transcription</p>
<p>Warm, iridescent golden embers glowing with solar radiance inside a small sealed crystal vial. In Session 4.5, Alfie sat with the ancient stone, transcribing forgotten memories and melodies from the sunstone into song and living wood.</p>

<h4 style="color: #d4af37; margin-bottom: 0.3rem;">PROPERTIES &amp; CHARGES:</h4>
<p><strong>Charges:</strong> <strong>3 Embers (Charges)</strong>. Regains 1 charge at dawn if placed in direct sunlight.</p>
<ul>
  <li><strong>Solar Radiance:</strong> Sheds bright light in a 20-foot radius and dim light for an additional 20 feet. Can be covered or unveiled as a free action.</li>
  <li><strong>Memory Hearth (1 Charge):</strong> When Alfie sings or performs during a short or long rest, expend 1 ember: grant up to 4 allies temporary hit points equal to <code>1d6 + Charisma modifier</code>.</li>
  <li><strong>Solar Ignition (1 Charge):</strong> As a bonus action, touch a weapon or spell focus: for 1 minute, weapon attacks or cantrips deal an additional <code>1d4 Radiant damage</code>.</li>
  <li><strong>Song Echo:</strong> Touching an ember to natural wood reveals faint musical staves and poetic fragments recorded by ancient lyricists.</li>
</ul>
</div>`
      },
      source: { custom: "Uneraseable Mistakes — Session 4.5" },
      quantity: 3,
      weight: { value: 0.1, units: "lb" },
      price: { value: 100, denomination: "gp" },
      equipped: true,
      rarity: "rare",
      identified: true,
      uses: { value: 3, max: "3", per: "charges", recovery: "1" },
      type: { value: "trinket" },
      activities: {
        actMemHearth001: {
          _id: "actMemHearth001",
          type: "utility",
          name: "Memory Hearth (Rest Temp HP)",
          activation: { type: "special" },
          consumption: { targets: [{ type: "itemUses", value: "1" }], scaling: { allowed: false } },
          range: { value: "30", units: "ft" },
          target: { affects: { count: "4", type: "creature" } },
          description: { chatFlavor: "Spend 1 Ember: Grants 4 allies 1d6 + Cha temporary hit points during a rest." }
        },
        actSolarIgnite02: {
          _id: "actSolarIgnite02",
          type: "utility",
          name: "Solar Ignition (+1d4 Radiant)",
          activation: { type: "bonus", value: 1 },
          consumption: { targets: [{ type: "itemUses", value: "1" }], scaling: { allowed: false } },
          duration: { value: "1", units: "minute" },
          description: { chatFlavor: "Spend 1 Ember: Weapon attacks and cantrips deal +1d4 Radiant damage for 1 minute." }
        }
      }
    },
    flags: { [RELIC_MODULE_ID]: { session45: true, pc: "Alfie" } }
  }
];

async function ensureItemFolder(name) {
  return game.folders.find(f => f.type === "Item" && f.name === name)
    ?? Folder.create({ name, type: "Item", sorting: "a" });
}

export async function installPCRelics() {
  if (!game.user?.isGM) return;
  const folder = await ensureItemFolder("Edited — PC Relics & Birthrights");

  const results = [];
  for (const def of RELIC_DEFINITIONS) {
    const existing = game.items.getName(def.name);
    const data = foundry.utils.deepClone(def);
    data.folder = folder.id;

    if (existing) {
      await existing.update(data);
      results.push({ name: def.name, status: "updated" });
    } else {
      await Item.create(data);
      results.push({ name: def.name, status: "created" });
    }
  }

  console.log(`Edited Campaign Tools: Installed/Updated ${results.length} PC Relics & Birthrights into world Items folder.`);
  return results;
}

Hooks.once("ready", async () => {
  globalThis.EditedRelicInstaller = {
    install: installPCRelics,
    definitions: RELIC_DEFINITIONS
  };

  if (game.user.isGM) {
    await installPCRelics();
  }
});
