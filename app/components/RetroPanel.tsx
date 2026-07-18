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
    <div className="mt-8">
      <button
        type="button"
        onClick={toggle}
        className="text-xs text-neutral-400 transition hover:text-neutral-600"
      >
        {open ? "Hide weekly review" : "Weekly review"}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-neutral-100 bg-white px-4 py-3">
          {loading ? (
            <p className="text-sm text-neutral-400">Looking at your week…</p>
          ) : retro ? (
            <>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                Week of {new Date(retro.week_start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
              <p className="text-sm leading-relaxed text-neutral-700">{retro.content}</p>
            </>
          ) : (
            <p className="text-sm text-neutral-400">Couldn't load your review right now.</p>
          )}
        </div>
      )}
    </div>
  );
}
