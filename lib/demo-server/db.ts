import type { ReportCategory, ReportStatus, StaffMember } from "@/types/admin/report";

// Storage of the demo server: its own IndexedDB database (not "ranger", the phone's outbox), shared by
// every tab of the site, so what /rangers syncs shows up in /admin. Tiny hand-written wrapper, no dependencies.

const DB_NAME = "ibera-demo-server";
/** Bump it to reseed every browser with the current seed (drops what was done in the demo). */
const DB_VERSION = 1;

export const STORES = ["reports", "categories", "users"] as const;
export type StoreName = (typeof STORES)[number];

/** A report as the "server" keeps it: category and reporter by id, resolved when answering */
export type StoredReport = {
  id: string;
  clientId: string | null;
  latitude: number;
  longitude: number;
  notes: string | null;
  captureDate: string;
  syncDate: string | null;
  status: ReportStatus;
  /** A public/img path (seed) or the photo a ranger synced */
  photo: string | Blob | null;
  reportCategoryId: string;
  reportedById: string;
};

export type StoredCategory = ReportCategory;
export type StoredUser = StaffMember;

let dbPromise: Promise<IDBDatabase> | null = null;

/** onSeed writes the initial data: it runs on the first open and whenever DB_VERSION goes up. */
export function openDb(onSeed: (tx: IDBTransaction) => void): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
      }
      onSeed(request.transaction!);
    };
    request.onsuccess = () => {
      const db = request.result;
      // Another tab opened a newer seed version: let it upgrade, and reopen on the next request
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });
  return dbPromise;
}

export function read<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Runs work in one transaction and resolves when it is committed, so a "saved" really means saved on disk.
 * If work throws (e.g. a 404), the transaction is aborted and nothing it wrote is kept.
 */
export async function inTransaction<T>(
  db: IDBDatabase,
  stores: StoreName[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => Promise<T>,
): Promise<T> {
  const tx = db.transaction(stores, mode);
  const committed = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  committed.catch(() => {}); // awaited below; silences the rejection when work fails first

  try {
    const result = await work(tx);
    await committed;
    return result;
  } catch (err) {
    try {
      tx.abort();
    } catch {} // already finished
    throw err;
  }
}
