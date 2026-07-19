"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { createApi } from "@/lib/api";

interface DashboardStats {
  active: number;
  completed_today: number;
  completed_week: number;
  someday: number;
  ai_scored: number;
  eisenhower: Record<string, number>;
  impact_effort: Record<string, number>;
  daily_completions: { date: string; count: number }[];
  top_tasks: {
    id: number;
    title: string;
    priority_score: number;
    eisenhower_quadrant: string | null;
    impact_effort_quadrant: string | null;
  }[];
}

const DAY_CHARS = ["S", "M", "T", "W", "T", "F", "S"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Hey";
}

// ── Bar Chart ──────────────────────────────────────────────────────────────
function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex h-[88px] items-end gap-1.5">
      {data.map((d, i) => {
        const barH = Math.round((d.count / max) * 60);
        const isToday = i === data.length - 1;
        const dayChar = DAY_CHARS[new Date(d.date + "T12:00:00").getDay()];
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            {d.count > 0 && (
              <span className="text-[9px] font-medium tabular-nums text-white/30">{d.count}</span>
            )}
            {d.count === 0 && <span className="text-[9px]">&nbsp;</span>}
            <div className="flex w-full flex-col justify-end" style={{ height: 60 }}>
              <div
                className={`w-full rounded-t-md transition-all ${
                  isToday
                    ? "bg-accent"
                    : d.count > 0
                    ? "bg-white/20"
                    : "bg-white/[0.05]"
                }`}
                style={{ height: Math.max(barH, d.count > 0 ? 4 : 2) }}
              />
            </div>
            <span
              className={`text-[9px] font-medium ${
                isToday ? "text-accent" : "text-white/25"
              }`}
            >
              {dayChar}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Ring Chart ─────────────────────────────────────────────────────────────
function RingChart({ value, max }: { value: number; max: number }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const pct = Math.round(ratio * 100);
  const offset = circ * (1 - ratio);

  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-ink leading-none">{pct}%</span>
        <span className="text-[9px] text-white/30 leading-none mt-0.5">scored</span>
      </div>
    </div>
  );
}

// ── 2×2 Matrix Grid ────────────────────────────────────────────────────────
interface MatrixCell {
  key: string;
  label: string;
  sublabel: string;
  bg: string;
  border: string;
  count_cls: string;
}

const EIS_CELLS: MatrixCell[] = [
  { key: "do_first",  label: "Do First",  sublabel: "Urgent + Important",     bg: "bg-red-950/40",    border: "border-red-800/25",    count_cls: "text-red-400" },
  { key: "schedule",  label: "Schedule",  sublabel: "Not urgent + Important",  bg: "bg-blue-950/40",   border: "border-blue-800/25",   count_cls: "text-blue-400" },
  { key: "delegate",  label: "Delegate",  sublabel: "Urgent + Not important",  bg: "bg-amber-950/40",  border: "border-amber-800/25",  count_cls: "text-amber-400" },
  { key: "eliminate", label: "Eliminate", sublabel: "Neither urgent nor imp.",  bg: "bg-surface",       border: "border-white/[0.08]",  count_cls: "text-white/35" },
];

const IE_CELLS: MatrixCell[] = [
  { key: "quick_win",     label: "Quick Win",     sublabel: "High impact, low effort",  bg: "bg-green-950/40",  border: "border-green-800/25",  count_cls: "text-green-400" },
  { key: "major_project", label: "Big Bet",       sublabel: "High impact, high effort", bg: "bg-purple-950/40", border: "border-purple-800/25", count_cls: "text-purple-400" },
  { key: "fill_in",       label: "Fill-in",       sublabel: "Low impact, low effort",   bg: "bg-surface",       border: "border-white/[0.08]",  count_cls: "text-white/35" },
  { key: "thankless",     label: "Thankless",     sublabel: "Low impact, high effort",  bg: "bg-red-950/20",    border: "border-red-900/20",    count_cls: "text-red-500/60" },
];

function MatrixGrid({ cells, data }: { cells: MatrixCell[]; data: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {cells.map((c) => {
        const n = data[c.key] ?? 0;
        return (
          <div key={c.key} className={`rounded-xl border ${c.bg} ${c.border} px-3 py-2.5`}>
            <div className={`text-xl font-bold tabular-nums leading-none ${c.count_cls}`}>{n}</div>
            <div className="mt-1 text-[11px] font-medium text-white/60 leading-none">{c.label}</div>
            <div className="mt-0.5 text-[9px] text-white/25 leading-snug">{c.sublabel}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  value,
  label,
  sub,
  accent,
  icon,
}: {
  value: number;
  label: string;
  sub?: string;
  accent?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-surface p-4">
      <div className="flex items-start justify-between">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent ? `bg-[${accent}]/10` : "bg-white/5"}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tabular-nums leading-none text-ink">{value}</div>
        <div className="mt-1 text-[12px] font-medium text-white/45">{label}</div>
        {sub && <div className="mt-0.5 text-[10px] text-white/20">{sub}</div>}
      </div>
    </div>
  );
}

// ── EIS badge inline ───────────────────────────────────────────────────────
const EIS_CLS: Record<string, string> = {
  do_first:  "bg-red-950/60 text-red-400 border-red-800/40",
  schedule:  "bg-blue-950/60 text-blue-400 border-blue-800/40",
  delegate:  "bg-amber-950/60 text-amber-400 border-amber-800/40",
  eliminate: "bg-white/5 text-white/30 border-white/10",
};
const EIS_SHORT: Record<string, string> = {
  do_first: "Do First", schedule: "Schedule", delegate: "Delegate", eliminate: "Eliminate",
};

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton({ cls }: { cls: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.05] ${cls}`} />;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function HomePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const api = useMemo(() => createApi(() => getToken()), [getToken]);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>("/api/v1/tasks/stats")
      .then(setStats)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const firstName = user?.firstName ?? "";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0f0f14]/92 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-purple-600">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-ink">Flow Todo</span>
          </div>
          <span className="hidden lg:block text-sm font-semibold text-white/30">Overview</span>
          <Link
            href="/dashboard/tasks"
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.09] bg-surface px-3 py-1.5 text-xs font-medium text-white/50 transition hover:border-accent/30 hover:text-accent"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Open Tasks
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 space-y-5">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-ink">
            {greeting()}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-white/35">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* ── Stat cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} cls="h-[110px]" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              value={stats.active}
              label="Active tasks"
              accent="#2563eb"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <StatCard
              value={stats.completed_today}
              label="Done today"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-400">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <StatCard
              value={stats.completed_week}
              label="Done this week"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              }
            />
            <StatCard
              value={stats.someday}
              label="Someday"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
        )}

        {/* ── Bar chart + AI ring ── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton cls="h-[160px]" />
            <Skeleton cls="h-[160px]" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* 7-day completions */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white/50">Completed last 7 days</span>
                <span className="text-[11px] text-white/25">{stats.daily_completions.reduce((s, d) => s + d.count, 0)} total</span>
              </div>
              <BarChart data={stats.daily_completions} />
            </div>

            {/* AI coverage */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
              <div className="mb-3">
                <span className="text-[12px] font-semibold text-white/50">AI scoring coverage</span>
              </div>
              <div className="flex items-center gap-5">
                <RingChart value={stats.ai_scored} max={stats.active} />
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Scored</span>
                      <span className="font-medium text-ink">{stats.ai_scored}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-700"
                        style={{ width: stats.active > 0 ? `${(stats.ai_scored / stats.active) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">Unscored</span>
                      <span className="font-medium text-white/50">{stats.active - stats.ai_scored}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-white/20 transition-all duration-700"
                        style={{ width: stats.active > 0 ? `${((stats.active - stats.ai_scored) / stats.active) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2×2 matrices ── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton cls="h-[200px]" />
            <Skeleton cls="h-[200px]" />
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Eisenhower */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white/50">Eisenhower matrix</span>
                <span className="text-[10px] uppercase tracking-widest text-white/20">Urgent × Important</span>
              </div>
              <MatrixGrid cells={EIS_CELLS} data={stats.eisenhower} />
              {(stats.eisenhower["none"] ?? 0) > 0 && (
                <p className="mt-2 text-[10px] text-white/20">
                  +{stats.eisenhower["none"]} not yet categorised
                </p>
              )}
            </div>

            {/* Impact × Effort */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-white/50">Impact × Effort</span>
                <span className="text-[10px] uppercase tracking-widest text-white/20">Return on effort</span>
              </div>
              <MatrixGrid cells={IE_CELLS} data={stats.impact_effort} />
              {(stats.impact_effort["none"] ?? 0) > 0 && (
                <p className="mt-2 text-[10px] text-white/20">
                  +{stats.impact_effort["none"]} not yet categorised
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Top priority tasks ── */}
        {!loading && stats && stats.top_tasks.length > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-white/50">Top priority</span>
              <Link
                href="/dashboard/tasks?mode=priority"
                className="text-[11px] text-accent/70 hover:text-accent transition"
              >
                View all →
              </Link>
            </div>
            <ol className="space-y-2">
              {stats.top_tasks.map((t, i) => {
                const eiCls = t.eisenhower_quadrant ? EIS_CLS[t.eisenhower_quadrant] : null;
                const eiLabel = t.eisenhower_quadrant ? EIS_SHORT[t.eisenhower_quadrant] : null;
                return (
                  <li key={t.id} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-center text-[11px] font-bold tabular-nums text-white/20">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-white/80">{t.title}</span>
                    {eiCls && eiLabel && (
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${eiCls}`}>
                        {eiLabel}
                      </span>
                    )}
                    <span className="shrink-0 text-[11px] tabular-nums text-white/20">{t.priority_score}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/tasks"
              className="flex items-center justify-center gap-2 rounded-2xl border border-accent/25 bg-accent/8 py-3 text-sm font-semibold text-accent transition hover:bg-accent/15"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Task Board
            </Link>
            <Link
              href="/dashboard/search"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.09] bg-surface py-3 text-sm font-medium text-white/45 transition hover:border-white/[0.15] hover:text-white/70"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              Search & Review
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
