import type { PendingReport } from "@/types/rangers/report";

// Reports wait here (IndexedDB) until there is signal. Unlike localStorage, IndexedDB keeps photos as Blobs
// and has room for many of them. Tiny hand-written wrapper, no dependencies.

const DB_NAME = "ranger";
const DB_VERSION = 1;
const STORE = "reports";

let dbPromise: Promise<IDBDatabase> | null = null;
const listeners = new Set<() => void>();

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: "clientId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

async function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    // Resolve when the transaction is committed, so a "saved" really means saved on disk
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

const notify = () => listeners.forEach((l) => l());

export async function listReports(): Promise<PendingReport[]> {
  const items = await run<PendingReport[]>("readonly", (s) => s.getAll());
  return items.sort((a, b) => a.captureDate.localeCompare(b.captureDate));
}

export async function saveReport(report: PendingReport) {
  await run("readwrite", (s) => s.put(report));
  notify();
}

export async function deleteReport(clientId: string) {
  await run("readwrite", (s) => s.delete(clientId));
  notify();
}

/** Called whenever the list changes (saved, sent, deleted). Returns the unsubscribe function. */
export function subscribeReports(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Asks the browser not to erase our data when the phone is low on space (best effort). */
export async function requestPersistentStorage() {
  try {
    await navigator.storage?.persist?.();
  } catch {}
}
