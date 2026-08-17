const ACTOR_MODULE_ID = "edited-campaign-tools";
const ACTOR_MODULE_PATH = `modules/${ACTOR_MODULE_ID}`;
const GENERATED_FLAG = "campaignActorInstaller";
const RULES = "2014";

const art = relative => `${ACTOR_MODULE_PATH}/assets/art/actors/${relative}`;
const roll = (formula, label = formula) => `[[/r ${formula}]] ${label}`;
const paragraph = text => `<p>${text}</p>`;
const list = entries => `<ul>${entries.map(entry => `<li>${entry}</li>`).join("")}</ul>`;

function sourceData() {
  return {custom: "Uneraseable Notes — Monster Stat Blocks", rules: RULES};
}

function generatedFlags(kind = "item") {
  return {[ACTOR_MODULE_ID]: {[GENERATED_FLAG]: true, kind, version: 1}};
}

function feature(name, description, {img = "icons/svg/book.svg", activation = "special"} = {}) {
  return {
    name,
    type: "feat",
    img,
    system: {
      description: {value: description, chat: ""},
      source: sourceData(),
      activation: {type: activation, cost: 1, condition: ""},
      uses: {spent: 0, max: "", recovery: []},
      activities: {}
    },
    flags: generatedFlags("feature")
  };
}

function noteItem(name, description, img = "icons/svg/book.svg") {
  return feature(name, description, {img, activation: "special"});
}

function npcSystem({ac, hp, cr, speed = 30, fly = 0, swim = 0, climb = 0, abilities, saves = [], biography = "", legact = 0, legres = 0, lair = false}) {
  const abilityData = {};
  for (const key of ["str", "dex", "con", "int", "wis", "cha"]) {
    abilityData[key] = {value: abilities[key], proficient: saves.includes(key) ? 1 : 0, bonuses: {check: "", save: ""}};
  }
  return {
    abilities: abilityData,
    attributes: {
      ac: {calc: "flat", flat: ac},
      hp: {value: hp, max: hp, temp: 0, tempmax: 0, formula: `${hp}`},
      movement: {burrow: 0, climb, fly, swim, walk: speed, units: "ft", hover: fly > 0},
      senses: {darkvision: 60, blindsight: 0, tremorsense: 0, truesight: 0, units: "ft", special: ""},
      spellcasting: ""
    },
    details: {
      biography: {value: biography, public: ""},
      alignment: "Unaligned",
      cr,
      source: sourceData(),
      type: {value: "custom", subtype: "Edited monster", swarm: "", custom: "Edited monster"}
    },
    traits: {
      size: "med",
      di: {value: [], bypasses: [], custom: ""},
      dr: {value: [], bypasses: [], custom: ""},
      dv: {value: [], bypasses: [], custom: ""},
      ci: {value: [], custom: ""},
      languages: {value: ["common"], custom: ""}
    },
    resources: {
      legact: {value: legact, max: legact},
      legres: {value: legres, max: legres},
      lair: {value: lair, initiative: 20}
    },
    currency: {pp: 0, gp: 0, ep: 0, sp: 0, cp: 0}
  };
}

function npc({name, img, token, ac, hp, cr, speed, fly, swim, climb, abilities, saves, biography, items, size = 1, legact = 0, legres = 0, lair = false, traits = {}, disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE, actorLink = false}) {
  const system = npcSystem({ac, hp, cr, speed, fly, swim, climb, abilities, saves, biography, legact, legres, lair});
  system.traits = foundry.utils.mergeObject(system.traits, traits, {inplace: false});
  if (size >= 2) system.traits.size = "lg";
  return {
    name,
    type: "npc",
    img,
    system,
    prototypeToken: {
      name,
      texture: {src: token, scaleX: 1, scaleY: 1},
      width: size,
      height: size,
      disposition,
      actorLink,
      displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      bar1: {attribute: "attributes.hp"},
      sight: {enabled: true, range: 60, visionMode: "basic"}
    },
    ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED},
    items,
    flags: generatedFlags("actor")
  };
}

function monsterActors() {
  const underReview = `<h3>Under Review</h3>${paragraph("A campaign condition imposed by Editorial effects. Apply the specific consequences stated by the triggering feature and mark the target for the GM's revision mechanics.")}`;
  return [
    npc({
      name: "Gordon (Edited Gorgon)",
      img: art("gordon/gordon-profile.webp"), token: art("gordon/gordon-token.webp"),
      ac: 13, hp: 30, cr: 1, speed: 30,
      abilities: {str: 15, dex: 12, con: 16, int: 7, wis: 13, cha: 9}, saves: ["con", "wis"],
      biography: paragraph("An inky, letter-shifted gorgon reconstructed from the canonical Monster Stat Blocks tab."),
      items: [
        feature("Multiattack", paragraph("Gordon makes its available melee attacks.")),
        feature("Headbutt", paragraph(`<strong>Melee Weapon Attack:</strong> ${roll("1d20+4", "+4 to hit")}. Hit: ${roll("1d8+2", "bludgeoning damage")}.`)),
        feature("Editorial Glare (Recharge 5–6)", paragraph(`One creature Gordon can see within 30 feet must succeed on a <strong>DC 13 Wisdom save</strong>. On a failure, its speed becomes 0 and it cannot take reactions until the end of its next turn.`))
      ]
    }),
    npc({
      name: "Harps (Edited Harpy)",
      img: art("harps/harps-profile.webp"), token: art("harps/harps-token.webp"),
      ac: 14, hp: 36, cr: 2, speed: 25,
      abilities: {str: 12, dex: 16, con: 13, int: 8, wis: 13, cha: 14}, saves: ["dex", "wis"],
      biography: paragraph("A grounded living harp-creature: clawed feet form the harp's base, while its neck and head shape the harp's crown and the stringed frame only suggests wings."),
      items: [
        feature("Talons", paragraph(`<strong>Melee Weapon Attack:</strong> ${roll("1d20+5", "+5 to hit")}. Hit: ${roll("1d6+3", "slashing damage")}.`)),
        feature("Discordant Song", paragraph(`Creatures in a 15-foot radius must make a <strong>DC 13 Wisdom save</strong>. On a failure, a creature has disadvantage on its next attack and cannot use Legend until then.`)),
        feature("Clawfoot Scuttle", paragraph("Harps is a grounded living floor harp. Its clawed furniture feet ignore nonmagical difficult terrain made from rubble, furniture, and loose objects."))
      ]
    }),
    npc({
      name: "Satyn (Edited Satyr)",
      img: art("satyn/satyn-profile.webp"), token: art("satyn/satyn-token.webp"),
      ac: 15, hp: 52, cr: 3, speed: 35,
      abilities: {str: 16, dex: 14, con: 15, int: 12, wis: 14, cha: 16}, saves: ["wis", "cha"],
      biography: paragraph("A charming, desire-twisting letter-shifted monster with the campaign's black-ink influence."),
      items: [
        feature("Multiattack", paragraph("Satyn makes its available attacks.")),
        feature("Horn Gore", paragraph(`<strong>Melee Weapon Attack:</strong> ${roll("1d20+5", "+5 to hit")}. Hit: ${roll("2d6+3", "piercing damage")}.`)),
        feature("Silver Tongue", paragraph(`One creature within 30 feet must succeed on a <strong>DC 14 Wisdom save</strong> or use its reaction to move toward Satyn by the safest available route.`)),
        feature("Twisting Desire (Recharge 6)", paragraph(`One creature within 30 feet must succeed on a <strong>DC 14 Charisma save</strong> or be unable to willingly target Satyn with attacks or harmful spells until the end of its next turn.`))
      ]
    }),
    npc({
      name: "Hydrant (Edited Hydra)",
      img: art("hydrant/hydrant-profile.webp"), token: art("hydrant/hydrant-token.webp"),
      ac: 16, hp: 88, cr: 5, speed: 25, size: 2,
      abilities: {str: 18, dex: 12, con: 18, int: 6, wis: 11, cha: 8}, saves: ["con", "dex"],
      biography: paragraph("A multi-valved inky hydrant beast reconstructed from the canonical Monster Stat Blocks tab."),
      items: [
        feature("Slam", paragraph(`<strong>Melee Weapon Attack:</strong> ${roll("1d20+7", "+7 to hit")}. Hit: ${roll("2d8+4", "bludgeoning damage")}.`)),
        feature("Ink Spray (Recharge 5–6)", paragraph(`Hydrant sprays a 30-foot cone. Each creature in the cone makes a <strong>DC 15 Dexterity save</strong>, taking ${roll("3d6", "necrotic damage")} and becoming <strong>Under Review</strong> on a failure, or half damage on a success.`) + underReview),
        feature("Burst Valve", paragraph("The first time Hydrant falls below half its hit points, Ink Spray immediately recharges and Hydrant uses it."))
      ]
    }),
    npc({
      name: "Medulas (Edited Medusa)",
      img: art("medulas/medulas-profile.webp"), token: art("medulas/medulas-token.webp"),
      ac: 15, hp: 68, cr: 4, speed: 0, fly: 30,
      abilities: {str: 10, dex: 14, con: 15, int: 16, wis: 16, cha: 12}, saves: ["int", "wis"],
      biography: paragraph("A hovering, brain-and-tendril letter-shifted monster infused with living editorial ink."),
      items: [
        feature("Psychic Tendrils", paragraph(`<strong>Attack:</strong> ${roll("1d20+6", "+6 to hit")}. Hit: ${roll("2d6+4", "psychic damage")}.`)),
        feature("Nervous Gaze", paragraph(`One creature within 60 feet makes a <strong>DC 15 Wisdom save</strong>. On a failure, it loses concentration and becomes <strong>Dazed</strong>—disadvantage on attacks, saves, and checks—until it takes damage.`)),
        feature("Brain Fog Aura", paragraph("A creature entering the 20-foot aura must succeed on a <strong>DC 13 Intelligence save</strong> or be unable to take bonus actions until the start of its next turn."))
      ]
    }),
    npc({
      name: "Minowtaur (Edited Minotaur)",
      img: art("minowtaur/minowtaur-profile.webp"), token: art("minowtaur/minowtaur-token.webp"),
      ac: 16, hp: 112, cr: 6, speed: 35, swim: 40, size: 2,
      abilities: {str: 19, dex: 12, con: 18, int: 8, wis: 12, cha: 9}, saves: ["str", "con"],
      biography: paragraph("An amphibious, ink-touched minotaur with human-shaped scaly legs, equally usable on land or underwater."),
      items: [
        feature("Multiattack", paragraph("Minowtaur makes one Anchor Slam and one Horn Gore attack.")),
        feature("Anchor Slam", paragraph(`<strong>Melee Weapon Attack:</strong> ${roll("1d20+7", "+7 to hit")}, reach 10 feet. Hit: ${roll("2d8+4", "bludgeoning damage")}; the target must succeed on a <strong>DC 15 Strength save</strong> or fall prone.`)),
        feature("Horn Gore", paragraph(`<strong>Melee Weapon Attack:</strong> ${roll("1d20+7", "+7 to hit")}. Hit: ${roll("2d6+4", "piercing damage")}.`)),
        feature("Net Toss (Recharge 5–6)", paragraph("One creature within 30 feet must succeed on a <strong>DC 15 Dexterity save</strong> or become restrained. It can escape with a DC 15 Strength (Athletics) check.")),
        feature("Drag Under", paragraph(`Against a restrained creature, Minowtaur automatically grapples it. At the start of the target's turn it makes a <strong>DC 15 Constitution save</strong>, taking ${roll("1d8", "bludgeoning damage")} on a failure and beginning to suffocate if underwater.`))
      ]
    }),
    npc({
      name: "The Redactor",
      img: art("redactor/redactor-profile.webp"), token: art("redactor/redactor-token.webp"),
      ac: 18, hp: 185, cr: 10, speed: 40, climb: 40, size: 2, legact: 3,
      abilities: {str: 18, dex: 20, con: 18, int: 16, wis: 16, cha: 15}, saves: ["dex", "con", "wis"],
      traits: {
        dr: {value: ["psychic"], bypasses: [], custom: "Bludgeoning, piercing, and slashing from nonmagical attacks"},
        ci: {value: ["charmed", "frightened", "grappled", "restrained"], custom: ""}
      },
      biography: `<blockquote>There is no hatred in its eyes. Only the certainty that your story requires revision.</blockquote>${paragraph("A tall humanoid of flowing black ink. Its face continuously becomes blurred memories while letters and pages nearby lose their words.")}`,
      items: [
        feature("Multiattack", paragraph("The Redactor makes two Ink Blade attacks and one Editorial Touch attack.")),
        feature("Ink Blade", paragraph(`<strong>Melee Weapon Attack:</strong> ${roll("1d20+9", "+9 to hit")}. Hit: ${roll("2d8+5", "slashing damage")} plus ${roll("2d6", "psychic damage")}.`)),
        feature("Editorial Touch", paragraph(`<strong>Melee Attack:</strong> ${roll("1d20+9", "+9 to hit")}. Hit: ${roll("3d8", "psychic damage")}, and immediately roll on the campaign's Memory Revision table.`)),
        feature("Impossible Form", paragraph("At the beginning of each round, the Redactor copies the silhouette of a creature it has seen. Attacks against it have disadvantage unless the attacker first uses a bonus action and succeeds on a DC 15 Wisdom (Insight) check.")),
        feature("Editorial Revision (Recharge 5–6)", paragraph("The Redactor changes one letter in one visible word of 3–8 letters. The revised word changes reality as adjudicated by the GM.") + list(["Wall → Well", "Chain → Chair", "Gate → Gaze", "Torch → Torso", "Floor → Flood", "Light → Fight", "Vine → Wine"])),
        feature("Legendary: Ink Step", paragraph("The Redactor spends 1 legendary action to teleport up to 30 feet between areas of shadow or ink.")),
        feature("Legendary: Smear", paragraph("The Redactor spends 1 legendary action. Creatures within 15 feet make a <strong>DC 16 Dexterity save</strong> or fall prone.")),
        feature("Legendary: Strike Through (Costs 2)", paragraph("The Redactor erases one condition affecting it, or suppresses one beneficial magical effect on a target until the end of that target's next turn.")),
        feature("Death Burst: The Scribe Awaits", paragraph("At 0 hit points, the Redactor does not simply die. Creatures within 20 feet make a <strong>DC 16 Dexterity save</strong>, then become Under Review and make a <strong>DC 16 Wisdom save</strong> for the permanent Memory Table. The ink writes: <em>The Scribe awaits.</em>") + underReview)
      ]
    }),
    npc({
      name: "The Scribe",
      img: art("scribe/scribe-profile.webp"), token: art("scribe/scribe-token.webp"),
      ac: 19, hp: 250, cr: 13, speed: 30, fly: 30, size: 2, legact: 3, legres: 3, lair: true,
      abilities: {str: 14, dex: 16, con: 18, int: 20, wis: 20, cha: 22}, saves: ["int", "wis", "cha"],
      traits: {
        dr: {value: ["psychic", "force", "radiant"], bypasses: [], custom: "Bludgeoning, piercing, and slashing from nonmagical attacks"},
        ci: {value: ["charmed", "frightened", "prone"], custom: ""}
      },
      biography: `<blockquote>History is only cruel because no one bothered to edit it.</blockquote>${paragraph("The final boss: a larger-than-life hooded figure whose overcloak shadows the eyes, surrounded by living ink and an unfinished manuscript.")}`,
      items: [
        feature("Legendary Resistance (3/Day)", paragraph("If the Scribe fails a saving throw, it can choose to succeed instead.")),
        feature("Multiattack", paragraph("The Scribe makes two Ink Quill attacks, or makes one Ink Quill attack and casts a spell.")),
        feature("Ink Quill", paragraph(`<strong>Ranged Spell Attack:</strong> ${roll("1d20+10", "+10 to hit")}, range 120 feet. Hit: ${roll("3d8+5", "force damage")} plus ${roll("2d8", "psychic damage")}; the target must succeed on a <strong>DC 15 Wisdom save</strong> or become Under Review.`) + underReview),
        feature("Spellcasting (18th Level)", paragraph("The Scribe is an 18th-level Intelligence spellcaster (spell save DC 18, +10 to hit).") + list([
          "Cantrips: Fire Bolt, Mage Hand, Mind Sliver, Minor Illusion",
          "1st: Shield, Magic Missile",
          "2nd: Mirror Image, Misty Step",
          "3rd: Counterspell, Fireball, Hypnotic Pattern",
          "4th: Dimension Door, Greater Invisibility",
          "5th: Wall of Force, Hold Monster",
          "6th: Chain Lightning",
          "7th: Forcecage"
        ])),
        spell("Fire Bolt", 0), spell("Mage Hand", 0), spell("Mind Sliver", 0), spell("Minor Illusion", 0),
        spell("Shield", 1), spell("Magic Missile", 1),
        spell("Mirror Image", 2), spell("Misty Step", 2),
        spell("Counterspell", 3), spell("Fireball", 3), spell("Hypnotic Pattern", 3),
        spell("Dimension Door", 4), spell("Greater Invisibility", 4),
        spell("Wall of Force", 5), spell("Hold Monster", 5),
        spell("Chain Lightning", 6), spell("Forcecage", 7),
        feature("Edit Dice (5d8)", paragraph("The Scribe has five d8 Edit Dice. Spend and roll one die to reduce damage, alter a saving throw, subtract from a successful attack roll, move a creature 5 × the roll feet, or cancel a reaction/opportunity attack.")),
        feature("Rewrite Fate (1/Day)", paragraph("When a creature rolls a natural 20 against the Scribe, the critical hit instead resolves against the attacker, who also becomes Under Review without a save.")),
        feature("Ink Echo", paragraph("After the Scribe casts a spell of 3rd level or higher, choose one echo:") + list(["Create ink difficult terrain.", `Creatures within 10 feet take ${roll("2d6", "force damage")}.`, "A pool forces a DC 16 Dexterity save or restrains.", "A shadow repeats the spell at half effect."])),
        feature("Legendary: Ink Step", paragraph("Spend 1 legendary action to teleport up to 40 feet.")),
        feature("Legendary: Cross Out (Costs 2)", paragraph("Suppress one effect or condition until the appropriate end point chosen by the GM.")),
        feature("Legendary: Margin Note (Costs 3)", paragraph("Summon a Gordon, Harps, or Satyn in an unoccupied space within 30 feet.")),
        feature("Lair: Living Manuscript", paragraph("At initiative count 20, roll 1d8. At 25% hit points or fewer, roll twice.") + list([
          "1 — Pull every creature 15 feet toward the center.",
          "2 — Summon a Gordon, Harps, Satyn, or Medulas.",
          "3 — Halve all weapon and spell ranges.",
          "4 — Damage splashes for half to a nearby creature.",
          "5 — The outer 15 feet becomes impassable.",
          "6 — All healing is halved.",
          "7 — No creature can gain advantage.",
          "8 — Living ink fills 10 feet around the Scribe; it is difficult terrain, and creatures there make a DC 16 Dexterity save or become Under Review."
        ]))
      ]
    }),
    npc({
      name: "The Final Draft Pen",
      img: art("the-pen/the-pen-token.webp"), token: art("the-pen/the-pen-token.webp"),
      ac: 19, hp: 3, cr: 13, speed: 0, fly: 30, size: 2,
      abilities: {str: 1, dex: 18, con: 20, int: 20, wis: 20, cha: 20}, saves: [],
      biography: paragraph("Encounter object, not a conventional creature. Its 3 hit points represent Integrity, not ordinary damage. Track sentence completion as Progress 0/5."),
      items: [
        feature("Integrity 3 / Progress 0–5", paragraph("The Pen has no normal hit points. Treat its displayed 3 HP as Integrity. Each uninterrupted round completes one sentence and adds 1 Progress. Each hero has one Author's Revision—a fifth-level Rewrite—to interrupt a sentence; a successful interruption removes 1 Integrity.")),
        feature("Sentence 1: Heroes Never Arrived", paragraph("All heroes are dazed.")),
        feature("Sentence 2: Roads Were Never Found", paragraph("The Lost Roads pull the party away.")),
        feature("Sentence 3: Hope Succumbs to Fear", paragraph("Each hero makes a DC 18 Wisdom save. On a failure, the hero is frightened, uses its reaction to move its full speed away, and cannot use Legend.")),
        feature("Sentence 4: Heroes Became Monsters", paragraph("Create 1-HP inky duplicates of the heroes.")),
        feature("Sentence 5: Final Draft Complete", paragraph("Under Review becomes permanent; divine lineage is stripped; the PCs remain home.")),
        feature("At Integrity 0", paragraph("The Pen falls. The heroes choose whether to destroy it, attune to it, or attempt one final one-letter revision."))
      ]
    })
  ];
}

function classItem(name, hitDice, description, progression = "none", ability = "") {
  return {
    name, type: "class", img: "icons/svg/book.svg",
    system: {identifier: name.toLowerCase(), levels: 1, hitDice, advancement: [], spellcasting: {progression, ability}, description: {value: description, chat: ""}, source: sourceData()},
    flags: generatedFlags("class")
  };
}

function subclassItem(name, classIdentifier, description) {
  return {
    name, type: "subclass", img: "icons/svg/book.svg",
    system: {identifier: name.toLowerCase().replaceAll(" ", "-"), classIdentifier, advancement: [], description: {value: description, chat: ""}, source: sourceData()},
    flags: generatedFlags("subclass")
  };
}

function raceItem(name, description) {
  return {
    name, type: "race", img: "icons/svg/mystery-man.svg",
    system: {identifier: name.toLowerCase().replaceAll(" ", "-"), advancement: [], description: {value: description, chat: ""}, source: sourceData()},
    flags: generatedFlags("race")
  };
}

function equipment(name, description, img = "icons/svg/item-bag.svg") {
  return {
    name, type: "equipment", img,
    system: {description: {value: description, chat: ""}, source: sourceData(), quantity: 1, equipped: true, identified: true, activities: {}},
    flags: generatedFlags("equipment")
  };
}

function compendiumItem(name, type, {rename = name, fallback} = {}) {
  return {_editedCompendiumLookup: {name, type, rename, fallback}};
}

function spell(name, level, description = "") {
  const fallback = {
    name, type: "spell", img: "icons/svg/daze.svg",
    system: {
      description: {value: description || paragraph(`Standard 2014 ${name} spell. If this fallback appears, drag the full ${name} spell from the installed D&D5e compendium onto the sheet.`), chat: ""},
      source: sourceData(), level, school: "", preparation: {mode: level === 0 ? "always" : "prepared", prepared: true}, activities: {}
    },
    flags: generatedFlags("spell")
  };
  return compendiumItem(name, "spell", {fallback});
}

function dualitySpell(name, level, state, {always = false, description = ""} = {}) {
  const item = spell(name, level, description);
  item._editedDuality = {state, always, cantrip: level === 0};
  return item;
}

function standardEquipment(name, {rename = name, description = ""} = {}) {
  return compendiumItem(name, "equipment", {rename, fallback: equipment(rename, description || paragraph(`Standard ${name} equipment.`))});
}

function standardWeapon(name, {rename = name, description = ""} = {}) {
  const fallback = {
    name: rename, type: "weapon", img: "icons/svg/sword.svg",
    system: {description: {value: description || paragraph(`Standard ${name} weapon.`), chat: ""}, source: sourceData(), quantity: 1, equipped: true, identified: true, activities: {}},
    flags: generatedFlags("weapon")
  };
  return compendiumItem(name, "weapon", {rename, fallback});
}

function pcSystem({abilities, hp, ac, speed, saves, biography, skills = {}, spellSlots = 0}) {
  const abilityData = {};
  for (const key of ["str", "dex", "con", "int", "wis", "cha"]) {
    abilityData[key] = {value: abilities[key], proficient: saves.includes(key) ? 1 : 0, bonuses: {check: "", save: ""}};
  }
  const skillData = {};
  for (const [key, value] of Object.entries(skills)) skillData[key] = {value, ability: "", bonuses: {check: "", passive: ""}};
  return {
    abilities: abilityData,
    skills: skillData,
    attributes: {
      ac: {calc: "flat", flat: ac},
      hp: {value: hp, max: hp, temp: 0, tempmax: 0},
      movement: {burrow: 0, climb: 0, fly: 0, swim: 0, walk: speed, units: "ft", hover: false},
      senses: {darkvision: 0, blindsight: 0, tremorsense: 0, truesight: 0, units: "ft", special: ""},
      spellcasting: "cha"
    },
    details: {biography: {value: biography, public: ""}, alignment: "", faith: "", appearance: "", trait: "", ideal: "", bond: "", flaw: "", source: sourceData()},
    traits: {
      size: "med",
      di: {value: [], bypasses: [], custom: ""},
      dr: {value: [], bypasses: [], custom: ""},
      dv: {value: [], bypasses: [], custom: ""},
      ci: {value: [], custom: ""},
      languages: {value: ["common"], custom: ""},
      weaponProf: {value: [], custom: ""},
      armorProf: {value: [], custom: ""},
      toolProf: {value: [], custom: ""}
    },
    spells: {spell1: {value: spellSlots, max: spellSlots, override: spellSlots || null}},
    currency: {pp: 0, gp: 0, ep: 0, sp: 0, cp: 0}
  };
}

function pc({name, img, token, abilities, hp, ac, speed, saves, biography, items, skills, spellcasting = "cha", spellSlots = 0, tokenScale = 1, actorFlags = {}}) {
  const system = pcSystem({abilities, hp, ac, speed, saves, biography, skills, spellSlots});
  system.attributes.spellcasting = spellcasting;
  return {
    name, type: "character", img,
    system,
    prototypeToken: {
      name,
      texture: {src: token, scaleX: tokenScale, scaleY: tokenScale},
      width: 1, height: 1,
      disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      actorLink: true,
      displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
      displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      bar1: {attribute: "attributes.hp"},
      sight: {enabled: true, range: 60, visionMode: "basic"}
    },
    ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED},
    items,
    flags: foundry.utils.mergeObject(generatedFlags("actor"), actorFlags, {inplace: false})
  };
}

function pcActors() {
  return [
    pc({
      name: "Edward Dravin",
      img: art("edward-dravin/edward-dravin-profile-olympus.webp"),
      token: art("edward-dravin/edward-dravin-token-olympus.webp"),
      actorFlags: {[ACTOR_MODULE_ID]: {edwardDuality: true, persephoneState: "olympus"}},
      abilities: {str: 13, dex: 10, con: 15, int: 8, wis: 17, cha: 12}, hp: 10, ac: 18, speed: 30, saves: ["wis", "cha"], spellcasting: "wis", spellSlots: 2,
      skills: {ins: 1, med: 1, rel: 1, prc: 1},
      biography: `<h2>Edward Dravin — William's PC</h2>${paragraph("Edward is a wealthy but otherwise ordinary-looking former professor specializing in Greek history and sociology. After his diagnosis with bipolar II disorder, he used his family wealth to found a private residential mental-health treatment center. He continues to help operate the center while receiving treatment there himself. His refined clothes, excellent watch, and academic manner signal quiet wealth without fantasy affectation. An opened pomegranate—and the seeds he sometimes eats—remains the subtle outward symbol of his connection to Persephone. His custom sheet toggle follows Persephone between Olympus and Hades, changing the tone of his appearance and prepared spell loadout while preserving hit points, inventory, and spent spell slots.")}`,
      items: [
        raceItem("Aasimar", paragraph("2014-style aasimar. Celestial heritage is tied to Persephone. Add the table's preferred aasimar subrace and transformation when finalized.")),
        classItem("Cleric", "d8", paragraph("Level 1 cleric using the 2014 rules baseline."), "full", "wis"),
        subclassItem("Twilight Domain", "cleric", paragraph("Twilight cleric. At level 1 this grants Eyes of Night, Vigilant Blessing, martial weapon proficiency, heavy armor proficiency, and domain spells.")),
        feature("Eyes of Night", paragraph("Edward has exceptional darkvision and can share it with allies according to the 2014 Twilight Domain feature.")),
        feature("Vigilant Blessing", paragraph("As an action, grant one creature advantage on its next initiative roll. The blessing ends immediately after the roll or when used on another creature.")),
        feature("Persephone's Duality", paragraph("Use the Olympus/Hades control at the top of Edward's character sheet. Olympus prepares his regular Twilight Cleric list and living-spring appearance; Hades prepares his Underworld necromancy list and shadowed appearance. The switch never restores spent spell slots.")),
        standardEquipment("Chain Mail", {description: paragraph("Base AC 16; the sheet's editable AC is currently set to 18 with a shield.")}),
        standardEquipment("Shield", {description: paragraph("Carried shield; included in the current AC.")}),
        standardWeapon("Mace", {description: paragraph(`Melee attack baseline: ${roll("1d20+3", "+3 to hit")}; ${roll("1d6+1", "bludgeoning damage")}.`)}),
        dualitySpell("Thaumaturgy", 0, "both"),
        dualitySpell("Guidance", 0, "olympus"), dualitySpell("Sacred Flame", 0, "olympus"),
        dualitySpell("Bless", 1, "olympus"), dualitySpell("Cure Wounds", 1, "olympus"), dualitySpell("Guiding Bolt", 1, "olympus"),
        dualitySpell("Faerie Fire", 1, "olympus", {always: true}), dualitySpell("Sleep", 1, "olympus", {always: true}),
        dualitySpell("Chill Touch", 0, "hades"), dualitySpell("Spare the Dying", 0, "hades"), dualitySpell("Toll the Dead", 0, "hades"),
        dualitySpell("Bane", 1, "hades"), dualitySpell("Cause Fear", 1, "hades"), dualitySpell("False Life", 1, "hades"),
        dualitySpell("Inflict Wounds", 1, "hades"), dualitySpell("Ray of Sickness", 1, "hades")
      ]
    }),
    pc({
      name: "Sophie",
      img: art("sophie/sophie-profile.webp"), token: art("sophie/sophie-token.png"),
      abilities: {str: 8, dex: 16, con: 13, int: 10, wis: 12, cha: 16}, hp: 9, ac: 14, speed: 25, saves: ["dex", "cha"], spellSlots: 2,
      skills: {acr: 1, prf: 1, per: 1, dec: 1, ste: 1},
      biography: `<h2>Sophie</h2>${paragraph("A masculine sailor-like wooden doll with long yarn hair, large painted or knot-like eyes, a carved tight smirk, a grizzled cheek crack, a needle rapier, and a fishing hook replacing one hand. Mechanically built as a level-1 halfling bard; Wooden Doll Body is campaign flavor until its exact rules are finalized.")}`,
      items: [
        raceItem("Halfling (Wooden Doll)", paragraph("Uses a 2014 halfling baseline with a custom wooden-doll appearance. Speed is 25 feet.")),
        classItem("Bard", "d8", paragraph("Level 1 bard using the 2014 rules baseline."), "full", "cha"),
        feature("Bardic Inspiration (d6)", paragraph("As a bonus action, inspire a creature within 60 feet that can hear Sophie. The creature adds a d6 to one ability check, attack roll, or saving throw within 10 minutes, subject to the 2014 feature limits.")),
        feature("Wooden Doll Body", paragraph("Campaign flavor placeholder: Sophie is living carved wood, with yarn hair and a fishing-hook hand. No additional resistance or construct immunity is applied unless the GM later approves it.")),
        standardEquipment("Leather Armor", {description: paragraph("Included in the current AC 14.")}),
        standardWeapon("Rapier", {rename: "Needle Rapier", description: paragraph(`Melee attack baseline: ${roll("1d20+5", "+5 to hit")}; ${roll("1d8+3", "piercing damage")}.`)}),
        equipment("Fishing-Hook Hand", paragraph("A character-defining prosthetic hand and sailor's tool. Its combat statistics are intentionally left for GM approval.")),
        spell("Vicious Mockery", 0), spell("Mage Hand", 0),
        spell("Healing Word", 1), spell("Dissonant Whispers", 1), spell("Faerie Fire", 1), spell("Thunderwave", 1)
      ]
    }),
    pc({
      name: "Pierre",
      img: art("pierre/pierre-profile.webp"), token: art("pierre/pierre-token.png"),
      abilities: {str: 9, dex: 15, con: 14, int: 11, wis: 13, cha: 16}, hp: 8, ac: 12, speed: 30, saves: ["con", "cha"], spellSlots: 2,
      skills: {arc: 1, dec: 1, prf: 1, ins: 1},
      biography: `<h2>Pierre</h2>${paragraph("A human Wild Magic sorcerer. His approved portrait includes a heart pin and fox pin, tiny inconspicuous horn protrusions under the beret, barely visible scales at the neck, a trace of animal hair at the sleeve, and an abstract snake-like shape in the sky.")}`,
      items: [
        raceItem("Human", paragraph("2014 human baseline.")),
        classItem("Sorcerer", "d6", paragraph("Level 1 sorcerer using the 2014 rules baseline."), "full", "cha"),
        subclassItem("Wild Magic", "sorcerer", paragraph("Wild Magic sorcerous origin selected at level 1 under the 2014 rules.")),
        feature("Wild Magic Surge", paragraph("After Pierre casts a sorcerer spell of 1st level or higher, the GM can call for a d20 roll. On a 1, roll on the Wild Magic Surge table.")),
        feature("Tides of Chaos", paragraph("Gain advantage on one attack roll, ability check, or saving throw. Regain the feature after a long rest or when the GM triggers a Wild Magic Surge after a spell.")),
        equipment("Arcane Focus", paragraph("Spellcasting focus.")),
        standardWeapon("Dagger", {description: paragraph(`Melee or ranged attack baseline: ${roll("1d20+4", "+4 to hit")}; ${roll("1d4+2", "piercing damage")}.`)}),
        spell("Fire Bolt", 0), spell("Mage Hand", 0), spell("Minor Illusion", 0), spell("Prestidigitation", 0),
        spell("Mage Armor", 1), spell("Shield", 1)
      ]
    }),
    pc({
      name: "Eusacles",
      img: art("eusacles/eusacles-profile.webp"), token: art("eusacles/eusacles-token.webp"),
      abilities: {str: 16, dex: 11, con: 15, int: 9, wis: 13, cha: 14}, hp: 12, ac: 18, speed: 30, saves: ["wis", "cha"],
      skills: {ath: 1, itm: 1, per: 1, prf: 1},
      biography: `<h2>Eusacles — John's PC</h2>${paragraph("A 24-year-old human paladin with lighthearted, brash, frat-boy energy, headed to Las Vegas to gamble. He wears a black watch with a theta symbol. His divine parent may ultimately be Thanatos, Nike, or Momus and is deliberately unresolved.")}`,
      items: [
        raceItem("Human", paragraph("2014 human baseline.")),
        classItem("Paladin", "d10", paragraph("Level 1 paladin using the 2014 rules baseline. No Sacred Oath is selected at level 1."), "half", "cha"),
        feature("Divine Sense", paragraph("As an action, detect celestial, fiend, and undead presences and consecrated or desecrated places according to the 2014 paladin feature.")),
        feature("Lay on Hands", paragraph("Healing pool: 5 hit points at level 1. As an action, restore hit points or spend 5 points to neutralize one poison or cure one disease.")),
        feature("Unresolved Divine Parent", paragraph("Thanatos, Nike, or Momus. Do not mechanically favor one lineage until the campaign reveals it.")),
        standardEquipment("Chain Mail", {description: paragraph("Base AC 16; the sheet's current AC is 18 with a shield.")}),
        standardEquipment("Shield", {description: paragraph("Carried shield; included in current AC.")}),
        standardWeapon("Longsword", {description: paragraph(`Melee attack baseline: ${roll("1d20+5", "+5 to hit")}; ${roll("1d8+3", "slashing damage one-handed")}.`)}),
        standardWeapon("Javelin", {rename: "Javelins", description: paragraph(`Ranged or melee attack baseline: ${roll("1d20+5", "+5 to hit")}; ${roll("1d6+3", "piercing damage")}.`)}),
        equipment("Black Theta Watch", paragraph("A black wristwatch marked with the theta symbol; narrative significance remains open."))
      ]
    })
  ];
}

function campaignNpcs() {
  const common = {
    ac: 10, hp: 1, cr: 0, speed: 30,
    abilities: {str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10},
    saves: [], actorLink: true, disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY
  };
  return [
    npc({
      ...common,
      name: "Naomi",
      img: art("naomi/naomi-profile.webp"), token: art("naomi/naomi-token.webp"),
      biography: `<h2>Naomi</h2>${paragraph("A 22-year-old Edited researcher who tracks anomalies, Fragments, and the competing stories surrounding them. Her clue board presents the party's first real choices after Session 1.")}`,
      items: [noteItem("Fragment Researcher", paragraph("Naomi organizes active leads: the ancient tablet, child engineer's catapult, Mad Doctor binder, and DCA hijacking evidence."))]
    }),
    npc({
      ...common,
      name: "Michael",
      img: art("michael/michael-profile.webp"), token: art("michael/michael-token.webp"),
      biography: `<h2>Michael</h2>${paragraph("A warm, heavier-set camp-dad figure with long shaggy blond hair. He makes pancakes, carries a MARiGold INn mug, and helps The Margin feel like a home.")}`,
      items: [noteItem("Camp Dad", paragraph("Michael's emotional anchor is a card addressed ‘To Dad.’ Its later revision is a major campaign event."))]
    }),
    npc({
      ...common,
      name: "Anna Smith",
      img: art("anna-smith/anna-smith-profile.webp"), token: art("anna-smith/anna-smith-token.webp"),
      biography: `<h2>“Anna Smith” / Anastasia Popovnia</h2>${paragraph("A composed former military nurse, Edited in 1944. Her practical camp clothing still carries a quiet wartime influence.")}`,
      items: [noteItem("Field Nurse", paragraph("Anna is the camp's experienced medical hand and a living link to an earlier Edited generation."))]
    }),
    npc({
      ...common,
      name: "Rosa",
      img: art("rosa/rosa-profile.webp"), token: art("rosa/rosa-token.webp"),
      biography: `<h2>Rosa</h2>${paragraph("A confident singer and performer, Edited in 1978. She carries relaxed 1970s styling and subtle Apollo-gold motifs.")}`,
      items: [noteItem("Daughter of Apollo", paragraph("Rosa treats divine lineage with effortless confidence and a deliberate ‘who cares’ attitude."))]
    }),
    npc({
      ...common,
      name: "Frank",
      img: art("frank/frank-profile.webp"), token: art("frank/frank-token.webp"),
      biography: `<h2>Frank</h2>${paragraph("A strong, thick-set mechanic, Edited in 1986. Grease-stained hands and a skeptical expression accompany his government-experiment theory.")}`,
      items: [noteItem("Mechanic", paragraph("Frank keeps The Margin's improvised infrastructure working and assumes every mystery has a material cause."))]
    }),
    npc({
      ...common,
      name: "Lilly Carter",
      img: art("lilly-carter/lilly-carter-profile.webp"), token: art("lilly-carter/lilly-carter-token.webp"),
      biography: `<h2>Lilly Carter</h2>${paragraph("An ordinary-looking eleven-year-old who was Edited in 1991. Her understated appearance makes the impossible span of her history more unsettling.")}`,
      items: [noteItem("Edited Since 1991", paragraph("Lilly remains physically eleven despite the decades that have passed since her edit."))]
    }),
    npc({
      ...common,
      name: "Theodore Finch",
      img: art("theodore-finch/theodore-finch-profile.webp"), token: art("theodore-finch/theodore-finch-token.webp"),
      biography: `<h2>Theodore Finch</h2>${paragraph("A thin older librarian with spectacles, cardigan and waistcoat layers, Edited in 1891. He is associated with footnotes and The Margin's theory board.")}`,
      items: [noteItem("The Footnotes", paragraph("Theodore records contradictions, vanished details, and recurring editorial patterns in a battered notebook."))]
    }),
    npc({
      ...common,
      name: "The Fates",
      img: art("fates/fates-profile.webp"), token: art("fates/fates-token.webp"),
      size: 2, speed: 0, disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      biography: `<blockquote>You're early? Or are you late?</blockquote>${paragraph("Three eerily elongated elderly weavers gathered around one loom: an eccentric Junk Mother-like matriarch, a quiet measurer of thread, and a severe sister holding the shears.")}`,
      items: [
        noteItem("Weave the Escape Blanket", paragraph("During the Session 1 incursion, one Fate completes the escape blanket over three rounds while the party holds the Satyns back.")),
        noteItem("Threads Outside Time", paragraph("The Fates perceive the Edited as arrivals displaced from their proper line in reality."))
      ]
    })
  ];
}

async function ensureFolder(name, type = "Actor") {
  return game.folders.find(folder => folder.type === type && folder.name === name)
    ?? Folder.create({name, type, sorting: "a"});
}

const compendiumCache = new Map();

async function resolveCompendiumItem(item) {
  const lookup = item?._editedCompendiumLookup;
  if (!lookup) return item;
  const duality = item._editedDuality;
  const key = `${lookup.type}:${lookup.name}`.toLowerCase();
  if (!compendiumCache.has(key)) {
    let resolved = null;
    const packs = game.packs.filter(pack => pack.documentName === "Item" && pack.metadata?.packageName === "dnd5e");
    for (const pack of packs) {
      const index = await pack.getIndex({fields: ["name", "type"]});
      const match = index.find(entry => entry.name === lookup.name && entry.type === lookup.type);
      if (!match) continue;
      resolved = (await pack.getDocument(match._id)).toObject();
      break;
    }
    compendiumCache.set(key, resolved);
  }
  const source = compendiumCache.get(key);
  const clone = foundry.utils.deepClone(source ?? lookup.fallback);
  delete clone._id;
  delete clone.folder;
  clone.name = lookup.rename;
  clone.flags = foundry.utils.mergeObject(clone.flags ?? {}, generatedFlags(lookup.type), {inplace: false});
  if (duality) {
    clone.flags = foundry.utils.mergeObject(clone.flags, {
      [ACTOR_MODULE_ID]: {
        dualityState: duality.state,
        dualityAlways: duality.always,
        dualityCantrip: duality.cantrip,
        dualityInactive: duality.state === "hades"
      }
    }, {inplace: false});
    clone.system.preparation ??= {};
    const active = duality.state === "olympus" || duality.state === "both";
    clone.system.preparation.prepared = active;
    clone.system.preparation.mode = active && (duality.always || duality.cantrip) ? "always" : "prepared";
  }
  return clone;
}

async function upsertActor(data, folder) {
  const sameName = game.actors.filter(actor => actor.name === data.name);
  const managed = sameName.find(actor => actor.getFlag(ACTOR_MODULE_ID, GENERATED_FLAG));
  const unowned = sameName.find(actor => !actor.getFlag(ACTOR_MODULE_ID, GENERATED_FLAG));
  if (unowned && !managed) {
    return {status: "skipped", name: data.name, reason: "An Actor with this name already exists and was not created by this installer."};
  }

  const {items, ...actorData} = data;
  actorData.folder = folder.id;
  let actor = managed;
  if (actor) {
    await actor.update(actorData);
    const generatedItems = actor.items.filter(item => item.getFlag(ACTOR_MODULE_ID, GENERATED_FLAG)).map(item => item.id);
    if (generatedItems.length) await actor.deleteEmbeddedDocuments("Item", generatedItems);
  } else {
    actor = await Actor.create(actorData, {renderSheet: false});
  }
  const resolvedItems = await Promise.all(items.map(resolveCompendiumItem));
  if (resolvedItems.length) await actor.createEmbeddedDocuments("Item", resolvedItems);
  return {status: managed ? "updated" : "created", name: data.name};
}

export async function installCampaignActors() {
  if (!game.user?.isGM) return ui.notifications.warn("Only a GM can install campaign Actors.");
  if (game.system.id !== "dnd5e") return ui.notifications.error("This installer requires the D&D5e system.");

  const monsterFolder = await ensureFolder("Edited — Monsters");
  const pcFolder = await ensureFolder("Edited — PCs");
  const npcFolder = await ensureFolder("Edited — NPCs");
  const results = [];
  for (const data of monsterActors()) results.push(await upsertActor(data, monsterFolder));
  for (const data of pcActors()) results.push(await upsertActor(data, pcFolder));
  for (const data of campaignNpcs()) results.push(await upsertActor(data, npcFolder));

  const created = results.filter(result => result.status === "created").length;
  const updated = results.filter(result => result.status === "updated").length;
  const skipped = results.filter(result => result.status === "skipped");
  if (skipped.length) console.warn("Edited Campaign actor installer skipped name collisions:", skipped);
  ui.notifications.info(`Edited campaign Actors ready: ${created} created, ${updated} refreshed, ${skipped.length} skipped.`);
  return results;
}

Hooks.once("ready", () => {
  globalThis.EditedCampaignActors = {installCampaignActors};
});
