"use client";

import { useEffect, useState } from "react";

interface Briefing {
  date: string;
  content: string;
}

interface BriefingCardProps {
  fetchBriefing: () => Promise<Briefing>;
}

const DISMISS_KEY = "flow-briefing-dismissed";

export default function BriefingCard({ fetchBriefing }: BriefingCardProps) {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(DISMISS_KEY) === today) return;
    setDismissed(false);
    fetchBriefing()
      .then(setBriefing)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dismissed || !briefing) return null;

  return (
    <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-accent">
            Today's briefing
          </p>
          <p className="text-sm leading-relaxed text-neutral-700">{briefing.content}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss briefing"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, briefing.date);
            setDismissed(true);
          }}
          className="shrink-0 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
