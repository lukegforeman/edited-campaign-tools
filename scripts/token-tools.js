const TOKEN_MODULE_ID = "edited-campaign-tools";
const TOKEN_ROOT = `modules/${TOKEN_MODULE_ID}`;
const TOKEN_TOOL_VERSION = 1;

const TRANSFORMATIONS = [
  {
    key: "gordon",
    label: "Gordon",
    actorName: "Gordon (Edited Gorgon)",
    normal: `${TOKEN_ROOT}/assets/art/actors/gordon/gordon-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/gordon/gordon-token.webp`
  },
  {
    key: "harps",
    label: "Harps",
    actorName: "Harps (Edited Harpy)",
    normal: `${TOKEN_ROOT}/assets/art/actors/harps/harps-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/harps/harps-token.webp`
  },
  {
    key: "satyn",
    label: "Satyn",
    actorName: "Satyn (Edited Satyr)",
    normal: `${TOKEN_ROOT}/assets/art/actors/satyn/satyn-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/satyn/satyn-token.webp`
  },
  {
    key: "young-satyn",
    label: "Young Satyn",
    actorName: "Young Satyn Minion",
    normal: `${TOKEN_ROOT}/assets/art/actors/young-satyn/young-satyn-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/young-satyn/young-satyn-token.webp`
  },
  {
    key: "ink-blot",
    label: "Ink Blot",
    actorName: "Ink Blot Minion",
    normal: `${TOKEN_ROOT}/assets/art/actors/ink-blot/ink-blot-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/ink-blot/ink-blot-token.webp`
  },
  {
    key: "hydrant",
    label: "Hydrant",
    actorName: "Hydrant (Edited Hydra)",
    normal: `${TOKEN_ROOT}/assets/art/actors/hydrant/hydrant-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/hydrant/hydrant-token.webp`
  },
  {
    key: "medulas",
    label: "Medulas",
    actorName: "Medulas (Edited Medusa)",
    normal: `${TOKEN_ROOT}/assets/art/actors/medulas/medulas-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/medulas/medulas-token.webp`
  },
  {
    key: "minowtaur",
    label: "Minowtaur",
    actorName: "Minowtaur (Edited Minotaur)",
    normal: `${TOKEN_ROOT}/assets/art/actors/minowtaur/minowtaur-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/minowtaur/minowtaur-token.webp`
  },
  {
    key: "redactor",
    label: "The Redactor",
    actorName: "The Redactor",
    normal: `${TOKEN_ROOT}/assets/art/actors/redactor/redactor-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/redactor/redactor-token.webp`
  },
  {
    key: "scribe",
    label: "The Scribe",
    actorName: "The Scribe",
    normal: `${TOKEN_ROOT}/assets/art/actors/scribe/scribe-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/scribe/scribe-token.webp`
  },
  {
    key: "the-pen",
    label: "The Final Draft Pen",
    actorName: "The Final Draft Pen",
    normal: `${TOKEN_ROOT}/assets/art/actors/the-pen/the-pen-token-normal.webp`,
    monster: `${TOKEN_ROOT}/assets/art/actors/the-pen/the-pen-token.webp`
  }
];

const BYSTANDER_IMAGES = [
  `${TOKEN_ROOT}/assets/art/tiles/museum-extras/museum-goer-01.webp`,
  `${TOKEN_ROOT}/assets/art/tiles/museum-extras/museum-goer-02.webp`,
  `${TOKEN_ROOT}/assets/art/tiles/museum-extras/museum-guard-01.webp`,
  `${TOKEN_ROOT}/assets/art/tiles/museum-extras/museum-guard-02.webp`,
  `${TOKEN_ROOT}/assets/art/tokens/bystanders/bystander-05.webp`,
  `${TOKEN_ROOT}/assets/art/tokens/bystanders/bystander-06.webp`,
  `${TOKEN_ROOT}/assets/art/tokens/bystanders/bystander-07.webp`,
  `${TOKEN_ROOT}/assets/art/tokens/bystanders/bystander-08.webp`
];

function tokenToolFlags(kind, extra = {}) {
  return {
    [TOKEN_MODULE_ID]: {
      tokenTools: true,
      kind,
      version: TOKEN_TOOL_VERSION,
      ...extra
    }
  };
}

function transformationFor(key) {
  return TRANSFORMATIONS.find(entry => entry.key === key) ?? null;
}

function tokenMatches(token, transformation) {
  return token.actor?.name === transformation.actorName
    || token.document.getFlag(TOKEN_MODULE_ID, "transformationKey") === transformation.key;
}

async function toggleMonster(key) {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can transform monster tokens.");
  if (!canvas?.ready) return ui.notifications.warn("Open a Scene before transforming tokens.");
  const transformation = transformationFor(key);
  if (!transformation) return ui.notifications.error(`Unknown monster transformation: ${key}`);

  let targets = canvas.tokens.controlled.filter(token => tokenMatches(token, transformation));
  if (!targets.length) targets = canvas.tokens.placeables.filter(token => tokenMatches(token, transformation));
  if (!targets.length) return ui.notifications.warn(`No ${transformation.label} tokens are on the active Scene.`);

  const allMonsters = targets.every(token => token.document.texture?.src === transformation.monster);
  const monsterForm = !allMonsters;
  const targetSrc = monsterForm ? transformation.monster : transformation.normal;
  const updates = targets.map(token => ({
    _id: token.document.id,
    "texture.src": targetSrc,
    [`flags.${TOKEN_MODULE_ID}.transformationKey`]: transformation.key,
    [`flags.${TOKEN_MODULE_ID}.monsterForm`]: monsterForm
  }));
  await canvas.scene.updateEmbeddedDocuments("Token", updates);
  ui.notifications.info(`${targets.length} ${transformation.label} token${targets.length === 1 ? "" : "s"} changed to ${monsterForm ? "monster" : "normal"} form.`);
  return {count: targets.length, monsterForm};
}

function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function sceneBounds(scene) {
  const dimensions = scene.dimensions;
  return {
    left: dimensions.sceneX,
    top: dimensions.sceneY,
    right: dimensions.sceneX + dimensions.sceneWidth,
    bottom: dimensions.sceneY + dimensions.sceneHeight
  };
}

function placementCenter(mode, bounds) {
  if (mode === "selected") {
    const selected = canvas.tokens.controlled[0];
    if (selected) return {x: selected.center.x, y: selected.center.y};
    ui.notifications.warn("No token was selected, so the crowd is centered on the current view instead.");
  }
  if (mode === "view" || mode === "selected") {
    const pivot = canvas.stage?.pivot;
    if (pivot && Number.isFinite(pivot.x) && Number.isFinite(pivot.y)) return {x: pivot.x, y: pivot.y};
  }
  return {x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2};
}

function crowdPositions({count, mode, spread, gridSize, bounds}) {
  const positions = [];
  const center = placementCenter(mode, bounds);
  const radius = Math.max(gridSize * 2, spread * gridSize);
  const minimumDistance = gridSize * 0.72;
  const inset = gridSize * 0.55;
  const halfStep = gridSize / 2;
  let attempts = 0;

  while (positions.length < count && attempts < count * 120) {
    attempts += 1;
    let x;
    let y;
    if (mode === "scene") {
      x = bounds.left + inset + Math.random() * Math.max(1, bounds.right - bounds.left - inset * 2);
      y = bounds.top + inset + Math.random() * Math.max(1, bounds.bottom - bounds.top - inset * 2);
    } else {
      const angle = Math.random() * Math.PI * 2;
      const distance = radius * Math.sqrt(Math.random());
      x = center.x + Math.cos(angle) * distance;
      y = center.y + Math.sin(angle) * distance;
      x = Math.min(bounds.right - inset, Math.max(bounds.left + inset, x));
      y = Math.min(bounds.bottom - inset, Math.max(bounds.top + inset, y));
    }
    x = Math.round(x / halfStep) * halfStep;
    y = Math.round(y / halfStep) * halfStep;
    if (positions.every(position => Math.hypot(position.x - x, position.y - y) >= minimumDistance)) {
      positions.push({x, y});
    }
  }
  return positions;
}

async function clearCrowd({quiet = false} = {}) {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can remove generated bystanders.");
  if (!canvas?.ready) return ui.notifications.warn("Open a Scene before removing bystanders.");
  const ids = canvas.scene.tokens
    .filter(token => token.getFlag(TOKEN_MODULE_ID, "crowdBystander"))
    .map(token => token.id);
  if (ids.length) await canvas.scene.deleteEmbeddedDocuments("Token", ids);
  if (!quiet) ui.notifications.info(`${ids.length} generated bystander token${ids.length === 1 ? "" : "s"} removed.`);
  return ids.length;
}

async function crowdBuilder() {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can create crowd tokens.");
  if (!canvas?.ready) return ui.notifications.warn("Open a Scene before creating a crowd.");

  const form = await foundry.applications.api.DialogV2.input({
    window: {title: "Mixed Bystander Crowd"},
    content: `
      <fieldset class="edited-crowd-builder">
        <legend>Crowd placement</legend>
        <label>Number of bystanders
          <input type="number" name="count" value="12" min="1" max="50" step="1">
        </label>
        <label>Placement area
          <select name="placement">
            <option value="view" selected>Current view</option>
            <option value="selected">Around selected token</option>
            <option value="scene">Across entire Scene</option>
          </select>
        </label>
        <label>Spread radius in grid spaces
          <input type="number" name="spread" value="6" min="2" max="30" step="1">
        </label>
        <label class="checkbox">
          <input type="checkbox" name="clearExisting"> Remove this tool's existing bystanders first
        </label>
      </fieldset>`,
    ok: {label: "Place Crowd"}
  });
  if (!form) return null;

  const count = Math.max(1, Math.min(50, Math.trunc(Number(form.count) || 12)));
  const placement = ["view", "selected", "scene"].includes(form.placement) ? form.placement : "view";
  const spread = Math.max(2, Math.min(30, Number(form.spread) || 6));
  if (form.clearExisting) await clearCrowd({quiet: true});

  const scene = canvas.scene;
  const gridSize = scene.grid?.size || 100;
  const bounds = sceneBounds(scene);
  const positions = crowdPositions({count, mode: placement, spread, gridSize, bounds});
  const images = shuffle(BYSTANDER_IMAGES);
  const level = scene.initialLevel?.id ?? scene.firstLevel?.id ?? null;
  const data = positions.map((position, index) => ({
    name: "Bystander",
    actorId: null,
    actorLink: false,
    x: position.x - gridSize / 2,
    y: position.y - gridSize / 2,
    width: 1,
    height: 1,
    elevation: 0,
    level,
    rotation: Math.round(Math.random() * 360),
    disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    displayName: CONST.TOKEN_DISPLAY_MODES.NONE,
    displayBars: CONST.TOKEN_DISPLAY_MODES.NONE,
    texture: {
      src: images[index % images.length],
      scaleX: 0.92,
      scaleY: 0.92,
      anchorX: 0.5,
      anchorY: 0.5
    },
    flags: tokenToolFlags("Crowd Bystander", {crowdBystander: true})
  }));
  if (!data.length) return ui.notifications.warn("The selected area was too small to place a crowd.");
  const created = await scene.createEmbeddedDocuments("Token", data);
  ui.notifications.info(`${created.length} sheetless bystanders added to the Token layer.`);
  return created;
}

async function ensureMacroFolder() {
  return game.folders.find(folder => folder.type === "Macro" && folder.name === "Edited — Token Tools")
    ?? Folder.create({name: "Edited — Token Tools", type: "Macro", sorting: "a"});
}

async function upsertMacro(folder, {name, command, img}) {
  const existing = game.macros.getName(name);
  const managed = existing?.getFlag(TOKEN_MODULE_ID, "tokenTools");
  if (existing && !managed) return {status: "skipped", name};
  const data = {
    name,
    type: "script",
    command,
    img,
    scope: "global",
    folder: folder.id,
    ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE},
    flags: tokenToolFlags("Macro")
  };
  if (existing) {
    await existing.update(data);
    return {status: "updated", name};
  }
  await Macro.create(data);
  return {status: "created", name};
}

async function installTokenTools() {
  if (!game.user?.isGM) return ui.notifications.warn("Only the GM can install token tools.");
  const folder = await ensureMacroFolder();
  const results = [];

  for (const transformation of TRANSFORMATIONS) {
    const actor = game.actors.getName(transformation.actorName);
    if (actor?.type === "npc") {
      await actor.update({
        "prototypeToken.texture.src": transformation.normal,
        [`flags.${TOKEN_MODULE_ID}.transformationKey`]: transformation.key
      });
    }
    results.push(await upsertMacro(folder, {
      name: `Transform — ${transformation.label}`,
      command: `await EditedTokenTools.toggleMonster("${transformation.key}");`,
      img: transformation.normal
    }));
  }

  results.push(await upsertMacro(folder, {
    name: "Crowd Builder — Mixed Bystanders",
    command: "await EditedTokenTools.crowdBuilder();",
    img: BYSTANDER_IMAGES[0]
  }));
  results.push(await upsertMacro(folder, {
    name: "Crowd Builder — Clear Bystanders",
    command: "await EditedTokenTools.clearCrowd();",
    img: "icons/svg/downgrade.svg"
  }));

  const skipped = results.filter(result => result.status === "skipped").length;
  ui.notifications.info(`Token tools ready: ${TRANSFORMATIONS.length} transformations and 2 crowd controls; ${skipped} name collision${skipped === 1 ? "" : "s"} skipped.`);
  return results;
}

Hooks.once("ready", () => {
  globalThis.EditedTokenTools = {
    install: installTokenTools,
    toggleMonster,
    crowdBuilder,
    clearCrowd,
    transformations: TRANSFORMATIONS
  };
});

export {clearCrowd, crowdBuilder, installTokenTools, toggleMonster};
