const ED_MODULE_ID = "edited-campaign-tools";
const EDWARD_NAME = "Edward Dravin";
const STATE_FLAG = "persephoneState";
const ART_ROOT = `modules/${ED_MODULE_ID}/assets/art/actors/edward-dravin`;

const STATE_DATA = {
  olympus: {
    label: "Persephone in Olympus",
    short: "Olympus",
    profile: `${ART_ROOT}/edward-dravin-profile-olympus.webp`,
    token: `${ART_ROOT}/edward-dravin-token-olympus.webp`
  },
  hades: {
    label: "Persephone in Hades",
    short: "Hades",
    profile: `${ART_ROOT}/edward-dravin-profile-hades.webp`,
    token: `${ART_ROOT}/edward-dravin-token-hades.webp`
  }
};

function isEdward(actor) {
  return actor?.type === "character" && (actor.name === EDWARD_NAME || actor.getFlag(ED_MODULE_ID, "edwardDuality"));
}

function currentState(actor) {
  const state = actor?.getFlag(ED_MODULE_ID, STATE_FLAG);
  return state === "hades" ? "hades" : "olympus";
}

async function updatePlacedTokens(actor, textureSrc) {
  for (const scene of game.scenes) {
    const updates = scene.tokens
      .filter(token => token.actorId === actor.id && token.actorLink)
      .map(token => ({_id: token.id, "texture.src": textureSrc}));
    if (updates.length) await scene.updateEmbeddedDocuments("Token", updates);
  }
}

async function setPersephoneState(actor, state, {announce = true} = {}) {
  if (!game.user.isGM && !actor?.isOwner) {
    return ui.notifications.warn("You do not have permission to change Edward's Persephone state.");
  }
  if (!isEdward(actor)) return ui.notifications.warn("The Persephone toggle is only available to Edward Dravin.");
  if (!STATE_DATA[state]) return ui.notifications.error(`Unknown Persephone state: ${state}`);

  const appearance = STATE_DATA[state];
  const itemUpdates = [];
  for (const item of actor.items.filter(item => item.type === "spell")) {
    const mode = item.getFlag(ED_MODULE_ID, "dualityState");
    if (!mode) continue;
    const active = mode === "both" || mode === state;
    const isCantrip = Boolean(item.getFlag(ED_MODULE_ID, "dualityCantrip"));
    const isAlways = Boolean(item.getFlag(ED_MODULE_ID, "dualityAlways"));
    itemUpdates.push({
      _id: item.id,
      "system.preparation.prepared": active,
      "system.preparation.mode": active && (isCantrip || isAlways) ? "always" : "prepared",
      [`flags.${ED_MODULE_ID}.dualityInactive`]: !active
    });
  }

  await actor.update({
    img: appearance.profile,
    "prototypeToken.texture.src": appearance.token,
    [`flags.${ED_MODULE_ID}.${STATE_FLAG}`]: state,
    [`flags.${ED_MODULE_ID}.edwardDuality`]: true
  });
  if (itemUpdates.length) await actor.updateEmbeddedDocuments("Item", itemUpdates);
  await updatePlacedTokens(actor, appearance.token);

  actor.sheet?.render(false);
  if (announce) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({actor}),
      content: `<div class="edited-duality-chat ${state}"><strong>${appearance.label}</strong><br>Edward's appearance and prepared spell loadout have shifted to ${appearance.short}.</div>`
    });
  }
  ui.notifications.info(`Edward is now in ${appearance.short} mode.`);
  return state;
}

async function togglePersephoneState(actor = null) {
  actor ??= canvas?.tokens?.controlled?.[0]?.actor;
  actor ??= game.actors.getName(EDWARD_NAME);
  if (!actor) return ui.notifications.warn("Edward Dravin was not found. Install the campaign Actors first.");
  return setPersephoneState(actor, currentState(actor) === "olympus" ? "hades" : "olympus");
}

function rootElement(html) {
  if (html instanceof HTMLElement) return html;
  if (html?.[0] instanceof HTMLElement) return html[0];
  if (html?.element instanceof HTMLElement) return html.element;
  return null;
}

function actorFromApplication(app) {
  const candidate = app?.actor ?? app?.document ?? app?.object;
  return candidate?.documentName === "Actor" ? candidate : null;
}

function renderEdwardControl(app, html) {
  const actor = actorFromApplication(app);
  if (!isEdward(actor)) return;
  const root = rootElement(html);
  if (!root || root.querySelector(".edited-duality-panel")) return;

  const state = currentState(actor);
  const other = state === "olympus" ? "hades" : "olympus";
  const panel = document.createElement("section");
  panel.className = `edited-duality-panel ${state}`;
  panel.innerHTML = `
    <div class="edited-duality-copy">
      <span class="edited-duality-eyebrow">PERSEPHONE'S REALM</span>
      <strong>${STATE_DATA[state].label}</strong>
      <small>${state === "olympus" ? "Twilight Cleric loadout · living spring and gold" : "Underworld loadout · necromancy and violet shadow"}</small>
    </div>
    <button type="button" class="edited-duality-toggle" data-edited-state="${other}" ${(!game.user.isGM && !actor.isOwner) ? "disabled" : ""}>
      Switch to ${STATE_DATA[other].short}
    </button>`;
  panel.querySelector("button")?.addEventListener("click", event => {
    event.preventDefault();
    setPersephoneState(actor, event.currentTarget.dataset.editedState);
  });

  const target = root.querySelector(".sheet-header") ?? root.querySelector("form") ?? root.querySelector(".window-content") ?? root;
  target.prepend(panel);

  for (const item of actor.items.filter(item => item.getFlag(ED_MODULE_ID, "dualityInactive"))) {
    root.querySelectorAll(`[data-item-id="${item.id}"]`).forEach(element => element.classList.add("edited-duality-inactive"));
  }
}

Hooks.on("renderActorSheet", renderEdwardControl);
Hooks.on("renderApplicationV2", renderEdwardControl);

Hooks.once("ready", async () => {
  globalThis.EdwardDuality = {currentState, setPersephoneState, togglePersephoneState};
  if (!game.user.isGM) return;
  const actor = game.actors.getName(EDWARD_NAME);
  if (isEdward(actor) && !actor.getFlag(ED_MODULE_ID, STATE_FLAG)) {
    await setPersephoneState(actor, "olympus", {announce: false});
  }
});

export {currentState, setPersephoneState, togglePersephoneState};
