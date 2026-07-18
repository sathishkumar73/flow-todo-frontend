"use client";

import { useState } from "react";

interface Retro {
  week_start: string;
  content: string;
}

interface RetroPanelProps {
  fetchRetro: () => Promise<Retro>;
}

export default function RetroPanel({ fetchRetro }: RetroPanelProps) {
  const [open, setOpen] = useState(false);
  const [retro, setRetro] = useState<Retro | null>(null);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!retro) {
      setLoading(true);
      try {
        setRetro(await fetchRetro());
      } catch {
        setRetro(null);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="mt-8 pb-8">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-white/25 transition hover:text-white/50"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open ? "Hide weekly review" : "Weekly review"}
      </button>

      {open && (
        <div className="mt-3 animate-slide-down rounded-2xl border border-white/7 bg-surface px-4 py-3">
          {loading ? (
            <p className="text-sm text-white/30">Reviewing your week…</p>
          ) : retro ? (
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                Week of{" "}
                {new Date(retro.week_start).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm leading-relaxed text-ink-2">{retro.content}</p>
            </>
          ) : (
            <p className="text-sm text-white/30">Couldn&apos;t load your review right now.</p>
          )}
        </div>
      )}
    </div>
  );
}
