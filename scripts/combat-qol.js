const QOL_MODULE_ID = "edited-campaign-tools";

Hooks.once("init", () => {
  game.settings.register(QOL_MODULE_ID, "npcAutoRollAttack", {
    name: "NPC Auto-Roll Attack",
    hint: "Automatically fast-forward NPC attack rolls without showing dialogs.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(QOL_MODULE_ID, "npcAutoRollDamage", {
    name: "NPC Auto-Roll Damage On Hit",
    hint: "Automatically roll damage when an NPC attack hits target AC.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(QOL_MODULE_ID, "npcAutoApplyDamage", {
    name: "NPC Auto-Apply Damage",
    hint: "Automatically apply NPC damage to targeted token HP.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(QOL_MODULE_ID, "pcPromptSaves", {
    name: "Prompt PC Saving Throws",
    hint: "Prompt players with an interactive card when their character must roll a saving throw.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(QOL_MODULE_ID, "disableDualD20", {
    name: "Disable Duplicate d20 Rolls (Single d20)",
    hint: "Turn off dual d20 rolling to prevent telegraphing advantage/disadvantage to players.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
});

Hooks.once("ready", async () => {
  // 1. If Midi-QOL is active, sync settings
  if (game.modules.get("midi-qol")?.active && game.user.isGM) {
    try {
      const config = foundry.utils.deepClone(game.settings.get("midi-qol", "ConfigSettings") || {});
      config.autoRollAttack = true;
      config.autoRollDamage = "onHit";
      config.autoApplyDamage = "yesCard";
      config.playerSaveBehavior = "prompt";
      config.roll2d20 = false;
      config.fastForwardAttack = true;
      config.fastForwardDamage = true;
      config.gmAutoAttack = true;
      config.gmAutoDamage = "onHit";
      await game.settings.set("midi-qol", "ConfigSettings", config);
      console.log("Edited Campaign Tools: Configured Midi-QOL automation settings.");
    } catch (err) {
      console.warn("Edited Campaign Tools: Could not update Midi-QOL ConfigSettings:", err);
    }
  }

  // 2. Chat listener for PC Save Prompt buttons
  $(document).on("click", ".edited-save-prompt-btn", async function (event) {
    event.preventDefault();
    const btn = $(this);
    const actorId = btn.data("actor-id");
    const ability = btn.data("ability");
    const dc = btn.data("dc");

    const actor = game.actors.get(actorId);
    if (!actor) return ui.notifications.warn("Actor not found.");

    // Check ownership
    if (!actor.isOwner && !game.user.isGM) {
      return ui.notifications.warn("You do not have permission to roll for this character.");
    }

    if (typeof actor.rollSavingThrow === "function") {
      await actor.rollSavingThrow({ ability });
    } else if (typeof actor.rollAbilitySave === "function") {
      await actor.rollAbilitySave(ability);
    } else {
      ui.notifications.error("Could not trigger saving throw for this character.");
    }
  });

  console.log("Edited Campaign Tools: Combat QOL & Automation active.");
});

// Cache recently made attack rolls to correlate with damage
const recentNpcAttacks = new Map();

// Hook: Pre-roll attack (Fast-forward NPC attacks without dialog popups)
Hooks.on("dnd5e.preRollAttack", (itemOrActivity, rollConfig, dialogConfig) => {
  if (!game.settings.get(QOL_MODULE_ID, "npcAutoRollAttack")) return;
  const actor = itemOrActivity.actor;
  if (!actor || actor.hasPlayerOwner) return;

  // Fast forward attack roll for NPCs
  if (rollConfig) {
    rollConfig.fastForward = true;
    rollConfig.chatMessage = true;
  }
  if (dialogConfig) {
    dialogConfig.configure = false;
  }
});

// Hook: Attack rolled (Auto-roll damage on hit)
Hooks.on("dnd5e.rollAttack", async (itemOrActivity, roll, options) => {
  const actor = itemOrActivity.actor;
  if (!actor || actor.hasPlayerOwner) return;
  if (!game.settings.get(QOL_MODULE_ID, "npcAutoRollDamage")) return;

  const targets = Array.from(game.user.targets);
  const rollTotal = roll.total;
  const isCrit = roll.isCritical ?? roll.terms?.[0]?.results?.some(r => r.result === 20);

  // Store targets for damage hook
  const key = `${actor.id}-${itemOrActivity.id ?? itemOrActivity.name}`;
  recentNpcAttacks.set(key, { targets, rollTotal, isCrit, timestamp: Date.now() });

  // Clean old cache entries
  for (const [k, v] of recentNpcAttacks.entries()) {
    if (Date.now() - v.timestamp > 30000) recentNpcAttacks.delete(k);
  }

  // Determine hit against target AC
  let hit = false;
  if (targets.length === 0) {
    hit = true; // No target specified, roll damage by default
  } else {
    for (const target of targets) {
      const ac = target.actor?.system?.attributes?.ac?.value
        ?? target.actor?.system?.attributes?.ac?.flat
        ?? 10;
      if (rollTotal >= ac || isCrit) {
        hit = true;
        break;
      }
    }
  }

  if (hit) {
    try {
      if (typeof itemOrActivity.rollDamage === "function") {
        await itemOrActivity.rollDamage({ fastForward: true });
      } else if (itemOrActivity.item && typeof itemOrActivity.item.rollDamage === "function") {
        await itemOrActivity.item.rollDamage({ fastForward: true });
      }
    } catch (err) {
      console.warn("Edited Campaign Tools: Auto damage roll error:", err);
    }
  }
});

// Hook: Damage rolled (Auto-apply damage to targets)
Hooks.on("dnd5e.rollDamage", async (itemOrActivity, roll, options) => {
  const actor = itemOrActivity.actor;
  if (!actor || actor.hasPlayerOwner) return;
  if (!game.settings.get(QOL_MODULE_ID, "npcAutoApplyDamage")) return;

  const totalDamage = roll.total;
  if (!totalDamage || totalDamage <= 0) return;

  // Retrieve targets from recent attack or active targets
  const key = `${actor.id}-${itemOrActivity.id ?? itemOrActivity.name}`;
  const recent = recentNpcAttacks.get(key);
  const targets = (recent && recent.targets.length > 0) ? recent.targets : Array.from(game.user.targets);

  if (!targets.length) return;

  for (const target of targets) {
    const targetActor = target.actor;
    if (!targetActor) continue;

    // Apply damage via D&D5e core API
    if (typeof targetActor.applyDamage === "function") {
      await targetActor.applyDamage(totalDamage);
    } else {
      const currentHp = Number(targetActor.system.attributes.hp.value) || 0;
      const tempHp = Number(targetActor.system.attributes.hp.temp) || 0;
      let remaining = totalDamage;
      let newTemp = tempHp;
      if (tempHp > 0) {
        newTemp = Math.max(0, tempHp - remaining);
        remaining = Math.max(0, remaining - tempHp);
      }
      const newHp = Math.max(0, currentHp - remaining);
      await targetActor.update({
        "system.attributes.hp.value": newHp,
        "system.attributes.hp.temp": newTemp
      });
    }

    // Chat notification
    ChatMessage.create({
      whisper: ChatMessage.getWhisperRecipients("GM"),
      speaker: { alias: "Combat Automation" },
      content: `<div style="border-left: 3px solid #ff4d4f; padding: 0.5rem; background: #1a0d0d; color: #ffccc7; font-size: 0.9rem;">
        <strong>💥 Damage Applied:</strong> <code>${target.name}</code> took <strong>${totalDamage}</strong> damage from <code>${actor.name}</code>!
      </div>`
    });
  }
});

// Hook: Activity or item use requiring saving throw -> Prompt PC
Hooks.on("dnd5e.postUseActivity", async (activity, usage, results) => {
  if (!game.settings.get(QOL_MODULE_ID, "pcPromptSaves")) return;
  const actor = activity.actor;
  if (!actor || actor.hasPlayerOwner) return;

  const saveConfig = activity.save ?? activity.system?.save;
  if (!saveConfig?.ability) return;

  const dc = saveConfig.dc?.value ?? saveConfig.dc ?? 10;
  const ability = saveConfig.ability;
  const targets = Array.from(game.user.targets);

  for (const target of targets) {
    const targetActor = target.actor;
    if (!targetActor || !targetActor.hasPlayerOwner) continue;

    // Find player owners
    const owners = game.users.filter(u => !u.isGM && targetActor.testUserPermission(u, "OWNER"));
    const recipientNames = owners.map(u => u.name).join(", ") || "Player";

    ChatMessage.create({
      speaker: { alias: "Saving Throw Required" },
      content: `<div style="border: 2px solid #faad14; border-radius: 6px; padding: 0.8rem; background: #2b2111; color: #fffbe6; font-family: 'Inter', sans-serif;">
        <h4 style="margin: 0 0 0.4rem 0; color: #ffe58f; font-size: 1rem;">⚠️ ${recipientNames}: Saving Throw Required!</h4>
        <p style="margin: 0 0 0.6rem 0; font-size: 0.95rem; line-height: 1.4;">
          <strong>${target.name}</strong> must make a <strong>DC ${dc} ${ability.toUpperCase()}</strong> saving throw against <em>${activity.name || actor.name}</em>!
        </p>
        <button class="edited-save-prompt-btn" data-actor-id="${targetActor.id}" data-ability="${ability}" data-dc="${dc}" style="background: #d48806; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer; width: 100%;">
          🎲 Roll ${ability.toUpperCase()} Save (DC ${dc})
        </button>
      </div>`
    });
  }
});
