export type Rating = 1 | 2 | 3 | 4 | 5;

/** What a tourist sends from the "Valorar" modal. Mirrors the backend contract (multipart/form-data). */
export interface FeedbackInput {
  portalId: string;
  rating: Rating;
  message: string;
  email?: string;
  photo?: File;
}

export interface FeedbackResult {
  /** Reference returned by the backend, or a local one while there is no API */
  code: string;
}
