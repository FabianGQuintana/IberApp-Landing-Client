/** A report saved on the phone (IndexedDB) until it reaches the server. */
export type PendingReport = {
  /** Generated on the phone: lets the backend ignore a report sent twice (idempotent sync) */
  clientId: string;
  categoryId: string;
  latitude: number | null;
  longitude: number | null;
  /** GPS accuracy in meters, to know how trustworthy the position is */
  accuracy: number | null;
  notes: string;
  /** ISO date (UTC) of when the ranger saved it in the field */
  captureDate: string;
  /** Compressed JPEG. IndexedDB stores Blobs natively (localStorage could not). */
  photo: Blob | null;
  /** Filled after the data reached the server but the photo is still missing */
  serverId?: string;
};

// Backend contracts (IberaReclamos.Application.DTOs.Report)

export type SyncReportsRequest = {
  reports: {
    clientId: string;
    latitude: number;
    longitude: number;
    notes?: string;
    captureDate: string;
    reportCategoryId: string;
  }[];
};

export type SyncReportsResult = {
  received: number;
  created: number;
  alreadySynced: number;
  items: { clientId: string; reportId: string; created: boolean }[];
};
