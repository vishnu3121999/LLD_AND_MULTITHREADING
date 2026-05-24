const LEGACY_PREFIXES = ["lld-docs.", "lld-playbook."];
let migrationPromise;
const writeQueues = new Map();

export async function migrateLegacyBrowserStorage() {
  if (typeof window === "undefined") return;
  if (!migrationPromise) {
    migrationPromise = migrateOnce();
  }
  await migrationPromise;
}

export async function fileStorageGetItem(key) {
  await migrateLegacyBrowserStorage();
  const response = await fetch(`/api/local-data?key=${encodeURIComponent(key)}`);
  if (!response.ok) return null;
  const payload = await response.json();
  return typeof payload.value === "string" ? payload.value : null;
}

export async function fileStorageSetItem(key, value) {
  const previousWrite = writeQueues.get(key) || Promise.resolve();
  const nextWrite = previousWrite
    .catch(() => {})
    .then(async () => {
      try {
        await fetch("/api/local-data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value })
        });
      } catch {
        // Storage is best-effort; keep the UI responsive if the local API is unavailable.
      }
    });

  writeQueues.set(key, nextWrite);
  nextWrite.finally(() => {
    if (writeQueues.get(key) === nextWrite) {
      writeQueues.delete(key);
    }
  }).catch(() => {});

  await nextWrite;
}

export async function fileStorageRemoveItem(key) {
  await fetch("/api/local-data", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });
}

async function migrateOnce() {
  const entries = {};
  const keys = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !LEGACY_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;
    entries[key] = window.localStorage.getItem(key);
    keys.push(key);
  }

  if (keys.length === 0) return;

  const response = await fetch("/api/local-data/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries })
  });

  if (!response.ok) return;

  for (const key of keys) {
    window.localStorage.removeItem(key);
  }
}
