const MODULE_ID = "edited-campaign-tools";
const SOCKET = `module.${MODULE_ID}`;
const PATH = `modules/${MODULE_ID}`;
let battleAudio = null;
let campAudio = null;

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "legendCount", {
    name: "Shared Legend",
    hint: "Current shared Legend pool.",
    scope: "world",
    config: false,
    type: Number,
    default: 0,
    onChange: () => renderLegendHUD()
  });
  game.settings.register(MODULE_ID, "legendVisible", {
    name: "Show Legend HUD",
    scope: "world",
    config: false,
    type: Boolean,
    default: true,
    onChange: () => renderLegendHUD()
  });
});

Hooks.once("ready", () => {
  game.socket.on(SOCKET, handlePacket);
  renderLegendHUD();
  globalThis.EditedCampaignTools = {
    addLegend,
    setLegend,
    toggleLegendHUD,
    crashFlash,
    startSatynBattle,
    stopSatynBattle,
    rollLostRoads,
    activateScene,
    openJournal,
    showEditedGroup,
    naomiBriefing,
    campfireDowntime
  };
  if (game.user.isGM) console.log("Edited Campaign Tools ready.");
});

function emitAll(payload) {
  handlePacket(payload);
  game.socket.emit(SOCKET, payload);
}

function handlePacket(payload) {
  if (!payload?.type) return;
  switch (payload.type) {
    case "crashFlash": return localCrashFlash();
    case "legendSting": return localLegendSting(payload.count);
    case "startSatynBattle": return localStartBattle();
    case "stopSatynBattle": return localStopBattle();
    case "startCampAmbience": return localStartCampAmbience();
    case "stopCampAmbience": return localStopCampAmbience();
  }
}

function renderLegendHUD() {
  document.getElementById("edited-legend-hud")?.remove();
  const visible = game.settings.get(MODULE_ID, "legendVisible");
  if (!visible) return;
  const count = Math.max(0, Number(game.settings.get(MODULE_ID, "legendCount")) || 0);
  const hud = document.createElement("div");
  hud.id = "edited-legend-hud";
  hud.title = "Shared Legend Pool";
  const shown = Math.min(count, 10);
  const pips = "✦".repeat(shown) + (count > 10 ? ` +${count - 10}` : "");
  hud.innerHTML = `<div class="edited-legend-label">LEGEND</div><div class="edited-legend-count">${count}</div><div class="edited-legend-pips">${pips || "◇"}</div>`;
  hud.addEventListener("dblclick", event => {
    event.preventDefault();
    openJournal("Legend Rules");
  });
  document.body.appendChild(hud);
}

async function addLegend(amount = 1, playSting = true) {
  if (!game.user.isGM) return ui.notifications.warn("Only the GM can change the shared Legend pool.");
  const current = Number(game.settings.get(MODULE_ID, "legendCount")) || 0;
  const next = Math.max(0, current + Number(amount || 0));
  await game.settings.set(MODULE_ID, "legendCount", next);
  if (playSting && amount > 0) emitAll({type: "legendSting", count: next, nonce: foundry.utils.randomID()});
  return next;
}

async function setLegend(value = 0) {
  if (!game.user.isGM) return ui.notifications.warn("Only the GM can change the shared Legend pool.");
  const next = Math.max(0, Number(value) || 0);
  await game.settings.set(MODULE_ID, "legendCount", next);
  return next;
}

async function toggleLegendHUD() {
  if (!game.user.isGM) return;
  const current = game.settings.get(MODULE_ID, "legendVisible");
  await game.settings.set(MODULE_ID, "legendVisible", !current);
}

function localLegendSting(count) {
  playOneShot(`${PATH}/assets/audio/legend-sting.ogg`, 0.65);
  const old = document.getElementById("edited-legend-splash");
  old?.remove();
  const el = document.createElement("div");
  el.id = "edited-legend-splash";
  el.innerHTML = `<div>LLLLLEGEND!</div><small>Shared pool: ${count}</small>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => el.classList.remove("show"), 1650);
  setTimeout(() => el.remove(), 2300);
}

async function crashFlash() {
  if (!game.user.isGM) return;
  const fates = game.scenes.getName("Fates' Open-Air Library");
  try {
    if (fates && typeof game.scenes.preload === "function") await game.scenes.preload(fates.id);
    else if (fates && typeof fates.preload === "function") await fates.preload();
  } catch (error) {
    console.warn("Edited Campaign Tools could not preload the Fates scene:", error);
  }
  emitAll({type: "crashFlash", nonce: foundry.utils.randomID()});
  if (!fates) return ui.notifications.warn("Fates' Open-Air Library was not found; whiteout and ringing still played.");
  setTimeout(() => fates.activate(), 2400);
}

function localCrashFlash() {
  playOneShot(`${PATH}/assets/audio/ear-ring-3s.ogg`, 0.25);
  document.getElementById("edited-whiteout")?.remove();
  const flash = document.createElement("div");
  flash.id = "edited-whiteout";
  document.body.appendChild(flash);
  requestAnimationFrame(() => flash.classList.add("active"));
  setTimeout(() => flash.classList.add("fade"), 2850);
  setTimeout(() => flash.remove(), 4250);
}

function playOneShot(src, volume = 0.5) {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(err => console.warn("Edited Campaign Tools audio playback failed:", err));
  return audio;
}

function startSatynBattle() {
  if (!game.user.isGM) return;
  emitAll({type: "startSatynBattle", nonce: foundry.utils.randomID()});
}

function stopSatynBattle() {
  if (!game.user.isGM) return;
  emitAll({type: "stopSatynBattle", nonce: foundry.utils.randomID()});
}

function localStartBattle() {
  localStopBattle();
  battleAudio = new Audio(`${PATH}/assets/audio/satyn-battle-loop.ogg`);
  battleAudio.loop = true;
  battleAudio.volume = 0.38;
  battleAudio.play().catch(err => console.warn("Battle audio playback failed:", err));
}

function localStopBattle() {
  if (!battleAudio) return;
  battleAudio.pause();
  battleAudio.currentTime = 0;
  battleAudio = null;
}

function localStartCampAmbience() {
  localStopCampAmbience();
  campAudio = new Audio(`${PATH}/assets/audio/camp-ambience.ogg`);
  campAudio.loop = true;
  campAudio.volume = 0.28;
  campAudio.play().catch(err => console.warn("Camp ambience playback failed:", err));
}

function localStopCampAmbience() {
  if (!campAudio) return;
  campAudio.pause();
  campAudio.currentTime = 0;
  campAudio = null;
}

async function rollLostRoads() {
  if (!game.user.isGM) return ui.notifications.warn("The GM rolls Lost Roads travel.");
  const table = game.tables.getName("Lost Roads Travel");
  if (table) return table.draw({displayChat: true});
  const roll = await (new Roll("1d6")).evaluate();
  const results = {
    1: "Smooth Journey — the route is clear and fast.",
    2: "Echoes of Another Story — glimpse an erased timeline or forgotten place.",
    3: "The Roads Have Shifted — lose time or emerge slightly off target.",
    4: "A Chance Encounter — meet another traveler on the Lost Roads.",
    5: "Corrector Patrol — evade, outmaneuver, or confront a patrol.",
    6: "The Roads Remember — a vivid Echo reveals lore, foreshadowing, or a clue."
  };
  return ChatMessage.create({content: `<h2>Lost Roads Travel</h2><p><b>d6: ${roll.total}</b> — ${results[roll.total]}</p>`});
}

async function activateScene(name) {
  if (!game.user.isGM) return;
  const scene = game.scenes.getName(name);
  if (!scene) return ui.notifications.warn(`Scene not found: ${name}`);
  const activated = await scene.activate();
  if (name === "The Margin") emitAll({type: "startCampAmbience", nonce: foundry.utils.randomID()});
  else emitAll({type: "stopCampAmbience", nonce: foundry.utils.randomID()});
  return activated;
}

function openJournal(name) {
  const journal = game.journal.getName(name);
  if (!journal) return ui.notifications.warn(`Journal not found: ${name}`);
  journal.sheet.render(true);
}

const showEditedGroup = () => openJournal("The Edited");
const naomiBriefing = () => openJournal("Naomi's Clue Board");
const campfireDowntime = () => openJournal("Campfire Downtime");
