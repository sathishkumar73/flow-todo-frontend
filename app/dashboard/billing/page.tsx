"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { createApi } from "@/lib/api";

interface MeResponse {
  user_id: string;
  is_pro: boolean;
  pro_since: string | null;
  pro_gating_enforced: boolean;
}

const FREE_FEATURES = [
  { label: "Unlimited tasks", included: true },
  { label: "AI scoring & prioritization", included: true },
  { label: "Eisenhower matrix", included: true },
  { label: "Daily dump & streaks", included: true },
  { label: "Routines tracker", included: true },
  { label: "Focus on 10 tasks", included: true },
  { label: "Daily AI briefing", included: false },
  { label: "AI triage suggestions", included: false },
  { label: "Retrospective insights", included: false },
  { label: "Pace & velocity analytics", included: false },
];

const PRO_FEATURES = [
  "Everything in Free",
  "Daily AI briefing",
  "AI triage suggestions",
  "Retrospective insights",
  "Pace & velocity analytics",
  "Priority support",
];

function Skeleton({ cls }: { cls: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.05] ${cls}`} />;
}

function CheckIcon({ filled }: { filled: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
        filled
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-white/[0.06] text-white/25"
      }`}
    >
      {filled ? "✓" : "—"}
    </span>
  );
}

export default function BillingPage() {
  const { getToken } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    const api = createApi(getToken);
    api
      .get<MeResponse>("/api/v1/me")
      .then(setMe)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  const isPro = me?.is_pro ?? false;

  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8 max-w-[1200px] mx-auto w-full">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-ink">Plan &amp; Billing</h1>
        <p className="mt-1 text-[13px] text-white/40">
          Manage your subscription and feature access
        </p>
      </div>

      <div className="xl:grid xl:grid-cols-[1fr_340px] xl:gap-6 xl:items-start space-y-5 xl:space-y-0">
        {/* ── LEFT: current plan ─────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Plan card */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-semibold text-ink">Current Plan</h2>
              {loading ? (
                <Skeleton cls="h-6 w-16" />
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide ${
                    isPro
                      ? "bg-accent/15 text-accent"
                      : "bg-white/[0.08] text-white/55"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPro ? "bg-accent" : "bg-white/40"
                    }`}
                  />
                  {isPro ? "Pro" : "Free"}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton cls="h-9 w-28" />
                <Skeleton cls="h-4 w-48" />
                <div className="mt-5 space-y-2.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} cls="h-5 w-full" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <p className="text-[32px] font-bold text-ink mb-1 leading-none">
                  {isPro ? "$12" : "$0"}
                  <span className="text-[14px] font-normal text-white/35 ml-2">
                    {isPro ? "/ month" : "forever"}
                  </span>
                </p>
                <p className="text-[12px] text-white/35 mb-6">
                  {isPro && me?.pro_since
                    ? `Active since ${new Date(me.pro_since).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : "No credit card required"}
                </p>

                <div className="space-y-3">
                  {FREE_FEATURES.map((f) => (
                    <div key={f.label} className="flex items-center gap-3">
                      <CheckIcon filled={f.included || isPro} />
                      <span
                        className={`text-[13px] ${
                          f.included || isPro
                            ? "text-white/65"
                            : "text-white/28"
                        }`}
                      >
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pro users: manage section */}
          {!loading && isPro && (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
              <h3 className="text-[13px] font-semibold text-ink mb-2">
                Manage Subscription
              </h3>
              <p className="text-[12px] text-white/40 mb-4 leading-relaxed">
                To cancel, pause, or update your billing details, reach out and
                we&apos;ll take care of it within one business day.
              </p>
              <a
                href="mailto:hello@flowtodo.app?subject=Billing%20Request"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:text-accent/75 transition"
              >
                hello@flowtodo.app
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          )}

          {/* FAQ */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
            <h3 className="text-[13px] font-semibold text-ink mb-3">
              Common Questions
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. Cancel before your next billing date and you won't be charged again. Access continues until the period ends.",
                },
                {
                  q: "Is there a free trial?",
                  a: "The Free plan gives you full access to core features forever. Pro adds AI-powered briefings and deeper insights.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit and debit cards via our secure payment provider.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="text-[12px] font-semibold text-white/60 mb-1">{q}</p>
                  <p className="text-[12px] text-white/35 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: upgrade card (free users) ──────────────────────── */}
        {!loading && !isPro && (
          <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-6 xl:sticky xl:top-8 xl:self-start">
            {/* Billing cycle toggle */}
            <div className="flex rounded-xl bg-white/[0.06] p-1 mb-5">
              <button
                onClick={() => setCycle("monthly")}
                className={`flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition ${
                  cycle === "monthly"
                    ? "bg-white/10 text-ink shadow-sm"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setCycle("annual")}
                className={`flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition flex items-center justify-center gap-1.5 ${
                  cycle === "annual"
                    ? "bg-white/10 text-ink shadow-sm"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                Annual
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                  −33%
                </span>
              </button>
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-accent/50 mb-2">
              Pro Plan
            </p>
            <p className="text-[36px] font-bold text-ink mb-0.5 leading-none">
              {cycle === "monthly" ? "$12" : "$8"}
              <span className="text-[14px] font-normal text-white/35 ml-2">/ month</span>
            </p>
            <p className="text-[12px] text-white/35 mb-5">
              {cycle === "annual" ? "$96 billed annually · save $48/year" : "Billed monthly · cancel anytime"}
            </p>

            <div className="space-y-2.5 mb-6">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    ✓
                  </span>
                  <span className="text-[13px] text-white/65">{f}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pricing"
              className="flex w-full items-center justify-center rounded-xl bg-accent py-3 text-[14px] font-semibold text-white transition hover:bg-accent/85 active:scale-[0.98]"
            >
              Upgrade to Pro
            </Link>

            <p className="mt-4 text-center text-[11px] text-white/28 leading-relaxed">
              Payment integration is coming soon.{" "}
              <a
                href="mailto:hello@flowtodo.app?subject=Pro%20Early%20Access"
                className="text-accent/55 hover:text-accent transition"
              >
                Join the waitlist →
              </a>
            </p>
          </div>
        )}

        {/* RIGHT: pro users feature panel */}
        {!loading && isPro && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 xl:sticky xl:top-8 xl:self-start">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent text-[11px] font-bold">
                ★
              </span>
              <h3 className="text-[13px] font-semibold text-ink">Pro Features Active</h3>
            </div>
            <div className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] font-bold text-accent">
                    ✓
                  </span>
                  <span className="text-[13px] text-white/65">{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="text-[11px] text-white/35 leading-relaxed">
                Thank you for supporting Flow Todo. Your subscription keeps AI features running for everyone.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
