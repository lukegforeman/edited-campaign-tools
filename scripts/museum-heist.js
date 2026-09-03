const MUSEUM_MODULE_ID = "edited-campaign-tools";
const MUSEUM_SOCKET = `module.${MUSEUM_MODULE_ID}`;
const MUSEUM_ROOT = `modules/${MUSEUM_MODULE_ID}`;
const MUSEUM_SCENE_NAME = "Tablet Museum Gallery — Night Spotlight";
const COVERED_BACKGROUND = `${MUSEUM_ROOT}/assets/art/scenes/tablet-museum-gallery-night-spotlight-covered.webp`;
const EXPOSED_BACKGROUND = `${MUSEUM_ROOT}/assets/art/scenes/tablet-museum-gallery-night-spotlight-exposed.webp`;
const CLAW_EMPTY = `${MUSEUM_ROOT}/assets/art/tiles/museum-claw/claw-empty.webp`;
const CLAW_GLASS = `${MUSEUM_ROOT}/assets/art/tiles/museum-claw/claw-with-glass.webp`;
const BEEP_TRACK = `${MUSEUM_ROOT}/assets/audio/museum-beeps-60s.ogg`;
const MUSEUM_LEVEL_ID = "museumGalleryLvl";
const MUSEUM_VERSION = 2;

let museumBeepAudio = null;
let clawBusy = false;
let localClawAnimation = null;

Hooks.once("init", () => {
  game.settings.register(MUSEUM_MODULE_ID, "museumCountdownValue", {
    name: "Museum Countdown Value",
    scope: "world",
    config: false,
    type: Number,
    default: -1,
    onChange: value => renderMuseumCountdown(Number(value))
  });
  game.settings.register(MUSEUM_MODULE_ID, "museumGlassRaised", {
    name: "Museum Display Glass Raised",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  });
});

Hooks.once("ready", () => {
  game.socket.on(MUSEUM_SOCKET, handleMuseumPacket);
  renderMuseumCountdown(Number(game.settings.get(MUSEUM_MODULE_ID, "museumCountdownValue")));
  globalThis.EditedMuseumHeist = {
    install: installMuseumHeist,
    toggleClaw: toggleMuseumClaw,
    countdown: advanceMuseumCountdown,
    resetCountdown: resetMuseumCountdown
  };
});

function museumFlags(kind) {
  return {[MUSEUM_MODULE_ID]: {museumHeist: true, kind, version: MUSEUM_VERSION}};
}

function museumLevelData(backgroundSrc = COVERED_BACKGROUND, id = MUSEUM_LEVEL_ID) {
  return {
    _id: id,
    name: "Gallery Floor",
    background: {
      color: "#000000",
      src: backgroundSrc,
      tint: "#ffffff",
      alphaThreshold: 0.75
    },
    elevation: {bottom: 0, top: 20},
    foreground: {src: null, tint: "#ffffff", alphaThreshold: 0.75},
    fog: {src: null},
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
    visibility: {levels: []},
    sort: 0,
    flags: museumFlags("Level")
  };
}

function museumSceneData(folderId) {
  return {
    name: MUSEUM_SCENE_NAME,
    folder: folderId,
    width: 3072,
    height: 2048,
    padding: 0,
    shiftX: 0,
    shiftY: 0,
    initial: {x: 1536, y: 1024, scale: 0.5},
    grid: {
      type: 1,
      size: 100,
      distance: 5,
      units: "ft",
      color: "#68758a",
      alpha: 0.2,
      style: "solidLines",
      thickness: 1
    },
    tokenVision: false,
    navigation: false,
    navName: "",
    navOrder: 22,
    environment: {
      globalLight: {enabled: true, bright: false},
      darknessLevel: 0,
      darknessLock: false,
      cycle: false
    },
    fog: {mode: 0, reset: null, colors: {explored: null, unexplored: null}},
    flags: museumFlags("Scene")
  };
}

function getMuseumLevel(scene) {
  if (!scene) return null;
  return scene.levels?.get?.(MUSEUM_LEVEL_ID)
    ?? scene.initialLevel
    ?? scene.firstLevel
    ?? scene.levels?.find?.(level => level.getFlag?.(MUSEUM_MODULE_ID, "museumHeist"))
    ?? null;
}

async function ensureMuseumLevel(scene) {
  let level = getMuseumLevel(scene);
  if (!level) {
    [level] = await scene.createEmbeddedDocuments("Level", [museumLevelData()]);
  } else {
    const currentSrc = level.background?.src;
    const preservedSrc = [COVERED_BACKGROUND, EXPOSED_BACKGROUND].includes(currentSrc)
      ? currentSrc
      : COVERED_BACKGROUND;
    const update = museumLevelData(preservedSrc, level.id);
    delete update._id;
    await level.update(update);
  }
  if (scene._source?.initialLevel !== level.id) await scene.update({initialLevel: level.id});
  return level;
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function emitMuseum(payload) {
  handleMuseumPacket(payload);
  game.socket.emit(MUSEUM_SOCKET, payload);
}

function handleMuseumPacket(payload) {
  if (!payload?.type) return;
  switch (payload.type) {
    case "museumCountdown":
      renderMuseumCountdown(Number(payload.value));
      if (payload.startBeeping) startMuseumBeeps();
      break;
    case "museumCountdownReset":
      renderMuseumCountdown(-1);
      stopMuseumBeeps();
      break;
    case "museumClaw":
      playLocalClawAnimation(payload);
      break;
  }
}

function renderMuseumCountdown(value) {
  document.getElementById("edited-museum-countdown")?.remove();
  if (!Number.isFinite(value) || value < 0) return;
  const seconds = Math.max(0, Math.min(99, Math.trunc(value)));
  const display = document.createElement("div");
  display.id = "edited-museum-countdown";
  display.className = seconds === 0 ? "zero" : "";
  display.setAttribute("aria-label", `Museum countdown: ${seconds} seconds`);
  display.innerHTML = `<span>00:${String(seconds).padStart(2, "0")}</span>`;
  document.body.appendChild(display);
}

function stopMuseumBeeps() {
  if (!museumBeepAudio) return;
  museumBeepAudio.pause();
  museumBeepAudio.currentTime = 0;
  museumBeepAudio = null;
}

function startMuseumBeeps() {
  stopMuseumBeeps();
  museumBeepAudio = new Audio(BEEP_TRACK);
  museumBeepAudio.volume = 0.4;
  museumBeepAudio.play().catch(error => console.warn("Museum beep playback failed:", error));
  museumBeepAudio.addEventListener("ended", () => { museumBeepAudio = null; }, {once: true});
}

async function advanceMuseumCountdown() {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can advance the museum countdown.");
  const current = Number(game.settings.get(MUSEUM_MODULE_ID, "museumCountdownValue"));
  if (current === 0) return ui.notifications.info("The museum countdown is already at 00:00. Use Reset Museum Countdown to rehearse it again.");
  const firstPress = !Number.isFinite(current) || current < 0;
  const next = firstPress ? 18 : Math.max(0, current - 6);
  await game.settings.set(MUSEUM_MODULE_ID, "museumCountdownValue", next);
  emitMuseum({
    type: "museumCountdown",
    value: next,
    startBeeping: firstPress,
    nonce: foundry.utils.randomID()
  });
  return next;
}

async function resetMuseumCountdown() {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can reset the museum countdown.");
  await game.settings.set(MUSEUM_MODULE_ID, "museumCountdownValue", -1);
  emitMuseum({type: "museumCountdownReset", nonce: foundry.utils.randomID()});
  return -1;
}

function preloadImage(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = image.onerror = () => resolve();
    image.src = src;
  });
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;
}

function positionClawElement(element, sceneX, sceneY, sceneWidth, sceneHeight) {
  if (!canvas?.ready || !canvas.stage || !canvas.app?.renderer) return false;
  const transform = canvas.stage.worldTransform;
  const topLeft = transform.apply(new PIXI.Point(sceneX, sceneY));
  const bottomRight = transform.apply(new PIXI.Point(sceneX + sceneWidth, sceneY + sceneHeight));
  const rect = canvas.app.view.getBoundingClientRect();
  const rendererWidth = canvas.app.renderer.screen?.width || rect.width;
  const rendererHeight = canvas.app.renderer.screen?.height || rect.height;
  const scaleX = rect.width / rendererWidth;
  const scaleY = rect.height / rendererHeight;
  element.style.left = `${rect.left + topLeft.x * scaleX}px`;
  element.style.top = `${rect.top + topLeft.y * scaleY}px`;
  element.style.width = `${Math.abs(bottomRight.x - topLeft.x) * scaleX}px`;
  element.style.height = `${Math.abs(bottomRight.y - topLeft.y) * scaleY}px`;
  return true;
}

async function playLocalClawAnimation({sceneId, direction, nonce}) {
  if (!canvas?.ready || canvas.scene?.id !== sceneId) return;
  if (localClawAnimation?.cancel) localClawAnimation.cancel();
  document.getElementById("edited-museum-claw")?.remove();

  const element = document.createElement("img");
  element.id = "edited-museum-claw";
  element.alt = "";
  element.draggable = false;
  element.src = direction === "lower" ? CLAW_GLASS : CLAW_EMPTY;
  document.body.appendChild(element);

  const controller = {cancelled: false, cancel() { this.cancelled = true; element.remove(); }};
  localClawAnimation = controller;
  const hiddenY = -1580;
  const caseY = -270;
  const sceneX = 1024;
  const sceneWidth = 1024;
  const sceneHeight = 1536;
  const descent = 1550;
  const pause = 300;
  const ascent = 1550;
  const started = performance.now();
  let swapped = false;

  const frame = now => {
    if (controller.cancelled || canvas.scene?.id !== sceneId) return controller.cancel();
    const elapsed = now - started;
    let y;
    if (elapsed < descent) {
      y = hiddenY + (caseY - hiddenY) * easeInOutCubic(elapsed / descent);
    } else if (elapsed < descent + pause) {
      y = caseY;
      if (!swapped) {
        element.src = direction === "lift" ? CLAW_GLASS : CLAW_EMPTY;
        swapped = true;
      }
    } else if (elapsed < descent + pause + ascent) {
      const progress = (elapsed - descent - pause) / ascent;
      y = caseY + (hiddenY - caseY) * easeInOutCubic(progress);
    } else {
      element.remove();
      if (localClawAnimation === controller) localClawAnimation = null;
      return;
    }
    if (!positionClawElement(element, sceneX, y, sceneWidth, sceneHeight)) return controller.cancel();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function activeMuseumScene() {
  const scene = canvas?.scene;
  if (!scene) return null;
  if (scene.getFlag(MUSEUM_MODULE_ID, "museumHeist")) return scene;
  if (scene.name === MUSEUM_SCENE_NAME) return scene;
  return null;
}

async function toggleMuseumClaw() {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can control the museum claw.");
  if (clawBusy) return ui.notifications.warn("The museum claw is already moving.");
  const scene = activeMuseumScene();
  if (!scene) return ui.notifications.warn(`Activate “${MUSEUM_SCENE_NAME}” before running the claw.`);

  clawBusy = true;
  try {
    await Promise.all([CLAW_EMPTY, CLAW_GLASS, COVERED_BACKGROUND, EXPOSED_BACKGROUND].map(preloadImage));
    const level = getMuseumLevel(scene);
    if (!level) return ui.notifications.error("This Scene has no Foundry 14 Level. Run the museum installer again to repair it.");
    const currentBackground = level.background?.src ?? "";
    const raisedSetting = Boolean(game.settings.get(MUSEUM_MODULE_ID, "museumGlassRaised"));
    const currentlyRaised = currentBackground === EXPOSED_BACKGROUND || raisedSetting;
    const direction = currentlyRaised ? "lower" : "lift";
    emitMuseum({type: "museumClaw", sceneId: scene.id, direction, nonce: foundry.utils.randomID()});

    await sleep(1600);
    const nextRaised = !currentlyRaised;
    await level.update({"background.src": nextRaised ? EXPOSED_BACKGROUND : COVERED_BACKGROUND});
    await game.settings.set(MUSEUM_MODULE_ID, "museumGlassRaised", nextRaised);
    await sleep(1800);
    ui.notifications.info(nextRaised ? "The claw raised the tablet's glass cover." : "The claw replaced the tablet's glass cover.");
    return nextRaised;
  } finally {
    clawBusy = false;
  }
}

async function ensureFolder(name, type) {
  return game.folders.find(folder => folder.type === type && folder.name === name)
    ?? Folder.create({name, type, sorting: "a"});
}

async function upsertMuseumMacro(folder, name, command) {
  const existing = game.macros.getName(name);
  const managed = existing?.getFlag(MUSEUM_MODULE_ID, "museumHeist");
  if (existing && !managed) return {status: "skipped", name};
  const data = {
    name,
    type: "script",
    command,
    scope: "global",
    folder: folder.id,
    ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE},
    flags: museumFlags("Macro")
  };
  if (existing) {
    await existing.update(data);
    return {status: "updated", name};
  }
  await Macro.create(data);
  return {status: "created", name};
}

async function installMuseumHeist() {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can install the museum heist controls.");
  const sceneFolder = await ensureFolder("Edited — Museum", "Scene");
  const macroFolder = await ensureFolder("Edited — Museum", "Macro");
  let scene = game.scenes.find(candidate => candidate.getFlag(MUSEUM_MODULE_ID, "museumHeist"));
  const sameName = game.scenes.getName(MUSEUM_SCENE_NAME);
  if (!scene && sameName && !sameName.getFlag(MUSEUM_MODULE_ID, "museumHeist")) {
    ui.notifications.warn(`A custom Scene named “${MUSEUM_SCENE_NAME}” already exists, so it was left untouched.`);
    scene = sameName;
  } else {
    const data = museumSceneData(sceneFolder.id);
    if (scene) await scene.update(data);
    else scene = await Scene.create({...data, levels: [museumLevelData()], initialLevel: MUSEUM_LEVEL_ID});
    await ensureMuseumLevel(scene);
  }

  const macroResults = [];
  macroResults.push(await upsertMuseumMacro(macroFolder, "Museum Claw — Raise / Replace Glass", "await EditedMuseumHeist.toggleClaw();"));
  macroResults.push(await upsertMuseumMacro(macroFolder, "Museum Countdown — Advance 6 Seconds", "await EditedMuseumHeist.countdown();"));
  macroResults.push(await upsertMuseumMacro(macroFolder, "Museum Countdown — Reset", "await EditedMuseumHeist.resetCountdown();"));
  macroResults.push(await upsertMuseumMacro(macroFolder, "Refresh Monster Sheets — No PCs", "await EditedCampaignActors.refreshMonsterActors();"));
  await game.settings.set(MUSEUM_MODULE_ID, "museumGlassRaised", getMuseumLevel(scene)?.background?.src === EXPOSED_BACKGROUND);
  ui.notifications.info("Museum heist Scene and controls are ready. Player-character sheets were not touched.");
  return {scene, macros: macroResults};
}

export {advanceMuseumCountdown, installMuseumHeist, resetMuseumCountdown, toggleMuseumClaw};
