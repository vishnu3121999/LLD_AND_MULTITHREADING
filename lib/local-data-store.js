import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "content", "local-data");
const dataPath = path.join(dataDir, "browser-state.json");
let writeQueue = Promise.resolve();

export async function readLocalData() {
  try {
    const raw = await readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function writeLocalData(data) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function getLocalDataValue(key) {
  const data = await readLocalData();
  return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
}

export async function setLocalDataValue(key, value) {
  return enqueueWrite(async () => {
    const data = await readLocalData();
    data[key] = value;
    await writeLocalData(data);
    return data[key];
  });
}

export async function deleteLocalDataValue(key) {
  return enqueueWrite(async () => {
    const data = await readLocalData();
    delete data[key];
    await writeLocalData(data);
  });
}

export async function migrateLocalData(entries) {
  return enqueueWrite(async () => {
    const data = await readLocalData();
    let migrated = 0;

    for (const [key, value] of Object.entries(entries || {})) {
      if (!Object.prototype.hasOwnProperty.call(data, key) || shouldReplaceWithMigratedValue(key, data[key], value)) {
        data[key] = value;
        migrated += 1;
      }
    }

    if (migrated > 0) {
      await writeLocalData(data);
    }

    return migrated;
  });
}

function enqueueWrite(operation) {
  const next = writeQueue.then(operation, operation);
  writeQueue = next.catch(() => {});
  return next;
}

function shouldReplaceWithMigratedValue(key, currentValue, nextValue) {
  if (!key.startsWith("lld-docs.layouts.")) return false;
  return layoutSpecificityScore(nextValue) > layoutSpecificityScore(currentValue);
}

function layoutSpecificityScore(value) {
  try {
    const layout = JSON.parse(value || "{}");
    return Object.values(layout).reduce((score, item) => {
      if (!item || typeof item !== "object") return score;
      const hasCustomPosition = !isDefaultGridPosition(item.x, item.y);
      const hasCustomSize = item.width !== 560 || item.height !== 420;
      const hasCustomZoom = item.zoom && item.zoom !== 1;
      return score + (hasCustomPosition ? 2 : 0) + (hasCustomSize ? 2 : 0) + (hasCustomZoom ? 1 : 0);
    }, 0);
  } catch {
    return 0;
  }
}

function isDefaultGridPosition(x, y) {
  if (typeof x !== "number" || typeof y !== "number") return false;
  for (let index = 0; index < 120; index += 1) {
    const column = index % 3;
    const row = Math.floor(index / 3);
    if (x === 24 + column * 620 && y === 24 + row * 500) return true;
  }
  return false;
}
