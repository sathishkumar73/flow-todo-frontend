"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET) — UTC−5/−4" },
  { value: "America/Chicago", label: "Central Time (CT) — UTC−6/−5" },
  { value: "America/Denver", label: "Mountain Time (MT) — UTC−7/−6" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT) — UTC−8/−7" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris / Berlin (CET/CEST)" },
  { value: "Asia/Dubai", label: "Dubai (GST) — UTC+4" },
  { value: "Asia/Kolkata", label: "India (IST) — UTC+5:30" },
  { value: "Asia/Singapore", label: "Singapore (SGT) — UTC+8" },
  { value: "Asia/Tokyo", label: "Tokyo (JST) — UTC+9" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

function Skeleton({ cls }: { cls: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.05] ${cls}`} />;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [timezone, setTimezone] = useState("America/New_York");
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("flowtodo_timezone");
    if (stored) {
      setTimezone(stored);
    } else {
      try {
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TIMEZONES.some((t) => t.value === detected)) {
          setTimezone(detected);
        }
      } catch {
        // keep default
      }
    }
  }, []);

  function handleSave() {
    localStorage.setItem("flowtodo_timezone", timezone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  }

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6 xl:px-8 xl:py-8 max-w-[800px] mx-auto w-full">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-[13px] text-white/40">
          Manage your profile and preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* ── Profile ────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-4">
            Profile
          </h2>

          {!isLoaded ? (
            <div className="flex items-center gap-4">
              <Skeleton cls="h-14 w-14 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton cls="h-4 w-36" />
                <Skeleton cls="h-3 w-52" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-purple-600 text-[18px] font-bold text-white">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt={initials}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-ink">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[13px] text-white/40 truncate mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          )}

          <p className="mt-4 text-[12px] text-white/28 leading-relaxed">
            Your name and email are managed via your Google account through Clerk
            authentication and cannot be edited here directly.
          </p>
        </section>

        {/* ── Preferences ────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-4">
            Preferences
          </h2>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="tz-select"
                className="block text-[13px] font-medium text-ink mb-1.5"
              >
                Timezone
              </label>
              <p className="text-[12px] text-white/35 mb-2.5">
                Used for daily AI briefings, task scheduling, and streak tracking
              </p>
              <select
                id="tz-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-3 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 transition appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value} className="bg-[#0f0f14] text-ink">
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={handleSave}
              className={`rounded-xl px-5 py-2.5 text-[13px] font-semibold transition active:scale-[0.98] ${
                saved
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-accent text-white hover:bg-accent/85"
              }`}
            >
              {saved ? "Saved ✓" : "Save preferences"}
            </button>
          </div>
        </section>

        {/* ── Notifications placeholder ───────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider">
              Notifications
            </h2>
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-semibold text-white/30 uppercase tracking-wide">
              Coming soon
            </span>
          </div>
          <p className="text-[12px] text-white/28 leading-relaxed mt-2">
            Daily digest emails, streak reminders, and weekly retrospective summaries — arriving soon.
          </p>
        </section>

        {/* ── Account ────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-4">
            Account
          </h2>

          <div className="divide-y divide-white/[0.06]">
            {/* Sign out */}
            <div className="pb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-ink">Sign out</p>
                <p className="text-[12px] text-white/35 mt-0.5">
                  Sign out of your Flow Todo account on this device
                </p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="shrink-0 rounded-xl border border-white/[0.1] px-4 py-2 text-[13px] font-medium text-white/55 hover:bg-white/[0.06] hover:text-white/75 transition disabled:opacity-50"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>

            {/* Delete account */}
            <div className="pt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[13px] font-medium text-red-400">
                  Delete account
                </p>
                <p className="text-[12px] text-white/35 mt-0.5">
                  Permanently delete your account and all task data. This cannot be undone.
                </p>
              </div>
              <a
                href="mailto:hello@flowtodo.app?subject=Delete%20my%20account&body=Hi%2C%20please%20delete%20my%20Flow%20Todo%20account%20and%20all%20associated%20data."
                className="shrink-0 rounded-xl border border-red-500/20 px-4 py-2 text-[13px] font-medium text-red-400/60 hover:bg-red-500/[0.07] hover:text-red-400 transition"
              >
                Request deletion
              </a>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <p className="text-[11px] text-white/20 text-center pb-2">
          Flow Todo · hello@flowtodo.app ·{" "}
          <a href="/privacy" className="hover:text-white/40 transition">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms" className="hover:text-white/40 transition">
            Terms
          </a>
        </p>
      </div>
    </main>
  );
}
