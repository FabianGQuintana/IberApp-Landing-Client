"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { feedbackQueue, flushFeedbackQueue } from "@/services/feedback";

/** Pending offline valuations, and sends them when the page loads or the connection comes back. */
export function useFeedbackQueue() {
  const pending = useSyncExternalStore(feedbackQueue.subscribe, feedbackQueue.read, feedbackQueue.serverSnapshot);
  const [justSent, setJustSent] = useState(0);

  useEffect(() => {
    const flush = () => flushFeedbackQueue().then((n) => n > 0 && setJustSent(n));
    flush();
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, []);

  useEffect(() => {
    if (!justSent) return;
    const t = window.setTimeout(() => setJustSent(0), 6000);
    return () => window.clearTimeout(t);
  }, [justSent]);

  return { pending: pending.length, justSent };
}
