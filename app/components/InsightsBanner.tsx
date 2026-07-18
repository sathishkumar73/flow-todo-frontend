"use client";

import { useEffect, useState } from "react";

interface Insights {
  burnout_signal: boolean;
  message: string | null;
}

interface InsightsBannerProps {
  fetchInsights: () => Promise<Insights>;
}

const DISMISS_KEY = "flow-insights-dismissed";

export default function InsightsBanner({ fetchInsights }: InsightsBannerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(DISMISS_KEY) === today) return;
    setDismissed(false);
    fetchInsights()
      .then((data) => {
        if (data.burnout_signal && data.message) setMessage(data.message);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dismissed || !message) return null;

  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
      <p className="text-sm leading-relaxed text-violet-800">{message}</p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10));
          setDismissed(true);
        }}
        className="shrink-0 rounded-full p-1 text-violet-400 transition hover:bg-violet-100 hover:text-violet-600"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
