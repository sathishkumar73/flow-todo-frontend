"use client";

import { useEffect, useRef, useState } from "react";

interface BrainDumpProps {
  onSubmit: (titles: string[]) => Promise<number>;
  onClose: () => void;
}

export default function BrainDump({ onSubmit, onClose }: BrainDumpProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [capturedCount, setCapturedCount] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const count = lines.length;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Escape to close (unless submitted)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && capturedCount === null) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, capturedCount]);

  async function handleSubmit() {
    if (!count || submitting) return;
    setSubmitting(true);
    try {
      const n = await onSubmit(lines);
      setCapturedCount(n);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07070f]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/7 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" opacity=".0"/>
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity=".4"/>
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h2 className="text-[15px] font-semibold text-ink">Brain Dump</h2>
          </div>
          <p className="mt-0.5 text-[11px] text-white/30">
            One task per line. Don&apos;t filter, don&apos;t organize. Just dump.
          </p>
        </div>
        {capturedCount === null && (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/25 transition hover:bg-white/5 hover:text-white/60"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </header>

      {capturedCount === null ? (
        <>
          {/* Textarea */}
          <div className="flex-1 overflow-hidden p-4">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                "Fix login bug on mobile\n" +
                "Call accountant about Q2 taxes\n" +
                "Buy birthday gift for mom\n" +
                "Review last month's spending\n" +
                "Update LinkedIn profile\n" +
                "Research competitor pricing\n" +
                "...\n\n" +
                "Keep going. Get everything out."
              }
              className="h-full w-full resize-none rounded-2xl border border-white/7 bg-surface p-4 text-[15px] leading-[1.75] text-ink placeholder-white/12 outline-none transition focus:border-white/14"
              spellCheck={false}
            />
          </div>

          {/* Footer */}
          <footer className="border-t border-white/7 bg-[#07070f] px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-white/30">
                {count > 0 ? (
                  <>
                    <span className="font-semibold text-ink">{count}</span>
                    {" "}task{count !== 1 ? "s" : ""} ready
                    <span className="ml-2 text-white/20">· AI will score them in the background</span>
                  </>
                ) : (
                  <span className="text-white/20">Start typing…</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!count || submitting}
                className="shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-40"
              >
                {submitting
                  ? "Capturing…"
                  : count > 0
                  ? `Dump ${count} task${count !== 1 ? "s" : ""}`
                  : "Dump tasks"}
              </button>
            </div>
          </footer>
        </>
      ) : (
        /* ── Done state ── */
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-green-950/40 border border-green-800/30">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M8 18l7 7L28 10"
                stroke="#4ade80"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-ink">{capturedCount} tasks captured</h3>
            <p className="mt-2 text-sm text-white/40">
              Your brain is free now. AI is scoring them in the background —
              <br />
              quadrants and priority will appear within seconds.
            </p>
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setText("");
                setCapturedCount(null);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10"
            >
              Dump more
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              Back to board
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
