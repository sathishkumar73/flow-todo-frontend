"use client";

import { useState } from "react";
import Link from "next/link";

const T = {
  border: "rgba(255,255,255,0.07)",
  ink: "#E8E8F0",
  ink2: "rgba(232,232,240,0.62)",
  ink3: "rgba(232,232,240,0.38)",
  blue: "#2563EB",
  card: "#0C0C1D",
};

const FREE_FEATURES = [
  "AI auto-categorization on every task",
  "Eisenhower + Impact/Effort scoring",
  "Deadline-aware priority (auto-boosts as due dates near)",
  "AI duration estimates",
  "Top-10 focus view + backlog",
  "Stack & Priority sort modes",
  "PWA — add to home screen",
];

const PRO_FEATURES = [
  "Everything in Free",
  "AI Daily Briefing — your day at a glance",
  "Weekly Triage — clear stale tasks in 3 minutes",
  "Sharpen — AI rewrites vague tasks into actions",
  "Weekly Retrospective — see your patterns",
  "Pace insights — a heads-up when you're overloaded",
  "Priority email support",
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const proMonthly = 12;
  const proAnnual = 8;

  return (
    <div style={{ width: "100%", maxWidth: 780, margin: "0 auto" }}>
      {/* Billing toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 40 }}>
        <span style={{ fontSize: 14, color: !annual ? T.ink : T.ink3, fontWeight: 500, transition: "color 0.2s" }}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual((v) => !v)}
          role="switch"
          aria-checked={annual}
          style={{
            position: "relative",
            width: 44,
            height: 24,
            borderRadius: 999,
            background: annual ? T.blue : "rgba(255,255,255,0.1)",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: annual ? 23 : 3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
            }}
          />
        </button>
        <span style={{ fontSize: 14, color: annual ? T.ink : T.ink3, fontWeight: 500, transition: "color 0.2s" }}>
          Annual
          <span
            style={{
              marginLeft: 6,
              fontSize: 11,
              fontWeight: 600,
              color: "#34D399",
              background: "rgba(52,211,153,0.12)",
              padding: "2px 7px",
              borderRadius: 999,
            }}
          >
            Save 33%
          </span>
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Free */}
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 20,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: T.ink3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Free
          </p>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 42, fontWeight: 700, color: T.ink, letterSpacing: "-0.03em" }}>$0</span>
          </div>
          <p style={{ fontSize: 13.5, color: T.ink3, marginBottom: 28 }}>Forever. No credit card needed.</p>
          <Link
            href="/sign-up"
            style={{
              display: "block",
              textAlign: "center",
              padding: "12px",
              borderRadius: 12,
              border: `1px solid ${T.border}`,
              color: T.ink,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 28,
              transition: "background 0.15s",
            }}
          >
            Get started free
          </Link>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
            {FREE_FEATURES.map((f) => (
              <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: T.ink2 }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                  <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(37,99,235,0.2)" />
                  <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div
          style={{
            background: "linear-gradient(160deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 100%)",
            border: "1px solid rgba(37,99,235,0.3)",
            borderRadius: 20,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -13,
              left: "50%",
              transform: "translateX(-50%)",
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: 999,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Coming soon
          </span>
          <p style={{ fontSize: 12, fontWeight: 600, color: T.ink3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Pro
          </p>
          <div style={{ marginBottom: 4, display: "flex", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontSize: 42, fontWeight: 700, color: T.ink, letterSpacing: "-0.03em" }}>
              ${annual ? proAnnual : proMonthly}
            </span>
            <span style={{ fontSize: 14, color: T.ink3, paddingBottom: 8 }}>/month</span>
          </div>
          {annual && (
            <p style={{ fontSize: 12, color: "#34D399", marginBottom: 4 }}>
              Billed annually (${proAnnual * 12}/year)
            </p>
          )}
          <p style={{ fontSize: 13.5, color: T.ink3, marginBottom: 28 }}>
            {annual ? `Save $${(proMonthly - proAnnual) * 12}/year` : "Billed monthly"}
          </p>
          <button
            disabled
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              padding: "12px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 28,
              opacity: 0.5,
              cursor: "not-allowed",
            }}
          >
            Notify me when ready
          </button>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
            {PRO_FEATURES.map((f) => (
              <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13.5, color: T.ink2 }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
                  <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(124,58,237,0.2)" />
                  <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
