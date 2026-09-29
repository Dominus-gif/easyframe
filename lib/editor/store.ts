// Tiny IndexedDB blob store for the editor's local autosave.
//
// Images are far too big for localStorage, so the *binary* part of a session
// (the screenshot, collage photos, the carousel source, uploaded layers) lives
// here while all the small stuff stays in localStorage. Everything is local to
// the browser — nothing is ever uploaded.

const DB_NAME = "easyframe";
const DB_VERSION = 1;
const STORE = "blobs";

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      // Private mode / blocked upgrades shouldn't hang the editor.
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null);
        try {
          const t = db.transaction(STORE, mode);
          const req = run(t.objectStore(STORE));
          req.onsuccess = () => resolve(req.result as T);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      })
  );
}

export function putBlob(key: string, blob: Blob): Promise<unknown> {
  return tx("readwrite", (s) => s.put(blob, key) as IDBRequest<unknown>);
}

export function getBlob(key: string): Promise<Blob | null> {
  return tx<Blob>("readonly", (s) => s.get(key) as IDBRequest<Blob>);
}

export function deleteBlob(key: string): Promise<unknown> {
  return tx("readwrite", (s) => s.delete(key) as IDBRequest<unknown>);
}

export function listKeys(): Promise<string[]> {
  return tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys() as IDBRequest<IDBValidKey[]>).then(
    (keys) => (keys ?? []).map(String)
  );
}

/** Drop every stored blob except the ones still referenced. */
export async function pruneBlobs(keep: Set<string>): Promise<void> {
  const keys = await listKeys();
  await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => deleteBlob(k)));
}

/** Re-encode a loaded image back to a Blob so it can be stored. */
export function imageToBlob(img: CanvasImageSource, w: number, h: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(w));
      c.height = Math.max(1, Math.round(h));
      const ctx = c.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b), "image/webp", 0.95);
    } catch {
      resolve(null);
    }
  });
}

/** Load a stored blob back into an HTMLImageElement. */
export function blobToImage(blob: Blob): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
