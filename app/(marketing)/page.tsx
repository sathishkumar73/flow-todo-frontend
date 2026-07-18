import Link from "next/link";
import type { Metadata } from "next";
import PricingSection from "@/components/marketing/PricingSection";

export const metadata: Metadata = {
  title: "Flow Todo — Focus on your top 10 tasks",
  description:
    "Flow Todo forces you to prioritize ruthlessly. Score tasks using Eisenhower and Impact/Effort matrices. Only your top 10 ever show.",
};

const T = {
  bg: "#07070F",
  card: "#0C0C1D",
  card2: "#101028",
  border: "rgba(255,255,255,0.07)",
  ink: "#E8E8F0",
  ink2: "rgba(232,232,240,0.62)",
  ink3: "rgba(232,232,240,0.38)",
  blue: "#2563EB",
  blueLight: "#93C5FD",
  grad: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
  gradText: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)",
  shadow: "0 0 0 1px rgba(255,255,255,0.05), 0 12px 40px rgba(0,0,0,0.6)",
};

// ── App mockup visual ──────────────────────────────────────────────────────────

const MOCK_TASKS = [
  { title: "Launch beta to waitlist", score: 95, color: "#EF4444" },
  { title: "Fix critical auth bug", score: 85, color: "#EF4444" },
  { title: "Write product blog post", score: 70, color: "#F59E0B" },
  { title: "Update pricing page copy", score: 55, color: "#38BDF8" },
  { title: "Review old feature flags", score: 15, color: "#9CA3AF" },
];

function AppMockup() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.08)",
        fontFamily: "inherit",
        maxWidth: 380,
        width: "100%",
      }}
    >
      {/* Header bar */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#111", letterSpacing: "-0.02em" }}>Flow Todo</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            background: "#F3F4F6",
            borderRadius: 999,
            padding: 2,
          }}
        >
          {["Stack", "Priority"].map((m, i) => (
            <span
              key={m}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: 999,
                color: i === 1 ? "#fff" : "#6B7280",
                background: i === 1 ? "#2563EB" : "transparent",
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px" }}>
        <div
          style={{
            borderRadius: 12,
            border: "1.5px solid #E5E7EB",
            padding: "10px 14px",
            fontSize: 13,
            color: "#9CA3AF",
          }}
        >
          Add a task and hit Enter…
        </div>
      </div>

      {/* Tasks */}
      <div style={{ padding: "0 12px 14px" }}>
        {MOCK_TASKS.map((task, i) => (
          <div
            key={task.title}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 8px",
              borderBottom: i < MOCK_TASKS.length - 1 ? "1px solid #F3F4F6" : "none",
              background: i === 0 ? "rgba(37,99,235,0.04)" : "transparent",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                border: "1.5px solid #D1D5DB",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12.5,
                color: "#374151",
                flex: 1,
                fontWeight: i === 0 ? 500 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {task.title}
            </span>
            <span style={{ fontSize: 10, color: task.color, marginRight: 2 }}>●</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#2563EB",
                background: "rgba(37,99,235,0.08)",
                padding: "2px 7px",
                borderRadius: 999,
                minWidth: 28,
                textAlign: "center",
              }}
            >
              {task.score}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 8, paddingLeft: 8 }}>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>Backlog (3) ▾</span>
        </div>
      </div>
    </div>
  );
}

// ── Matrix quadrant visual ─────────────────────────────────────────────────────

function MatrixVisual({
  label,
  rows,
  cols,
  cells,
}: {
  label: string;
  rows: [string, string];
  cols: [string, string];
  cells: { label: string; color: string; bg: string }[][];
}) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: T.ink3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
        {label}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gridTemplateRows: "auto 1fr 1fr", gap: 4 }}>
        {/* Empty corner */}
        <div />
        {cols.map((c) => (
          <div key={c} style={{ fontSize: 10, color: T.ink3, textAlign: "center", paddingBottom: 4, fontWeight: 500 }}>
            {c}
          </div>
        ))}
        {rows.map((row, ri) => (
          <>
            <div
              key={row}
              style={{
                fontSize: 10,
                color: T.ink3,
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                textAlign: "center",
                paddingRight: 4,
                fontWeight: 500,
              }}
            >
              {row}
            </div>
            {cells[ri].map((cell) => (
              <div
                key={cell.label}
                style={{
                  background: cell.bg,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "12px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 600, color: cell.color, lineHeight: 1.3 }}>{cell.label}</span>
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

// ── Section helpers ────────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 56 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: T.ink3,
          marginBottom: 14,
          fontFamily: "monospace",
        }}
      >
        · {eyebrow} ·
      </p>
      <h2
        style={{
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: T.ink,
          lineHeight: 1.15,
          marginBottom: sub ? 16 : 0,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 18, color: T.ink2, maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>{sub}</p>
      )}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        padding: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const sectionPad: React.CSSProperties = {
  padding: "96px 40px",
  maxWidth: 1200,
  margin: "0 auto",
  width: "100%",
};

export default function LandingPage() {
  return (
    <main style={{ background: T.bg }}>

      {/* ── Hero ── */}
      <section style={{ ...sectionPad, paddingTop: 160, paddingBottom: 80 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
          className="hero-grid"
        >
          {/* Left */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.25)",
                borderRadius: 999,
                padding: "5px 12px",
                marginBottom: 24,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.blue }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#93C5FD", letterSpacing: "0.04em" }}>
                Simple. Focused. Ruthless.
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(36px, 5vw, 62px)",
                fontWeight: 700,
                letterSpacing: "-0.035em",
                lineHeight: 1.08,
                color: T.ink,
                marginBottom: 20,
              }}
            >
              Your top{" "}
              <span
                style={{
                  background: T.gradText,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                10 tasks.
              </span>
              <br />
              Nothing more.
            </h1>

            <p style={{ fontSize: 18, color: T.ink2, lineHeight: 1.65, maxWidth: "46ch", marginBottom: 36 }}>
              Flow Todo forces you to prioritize ruthlessly. Score every task using two proven frameworks,
              then focus only on what your score surfaces.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <Link
                href="/sign-up"
                style={{
                  background: T.grad,
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "13px 28px",
                  borderRadius: 14,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 4px 24px rgba(37,99,235,0.35)",
                }}
              >
                Start for free
              </Link>
              <Link
                href="/sign-in"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${T.border}`,
                  color: T.ink,
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "13px 24px",
                  borderRadius: 14,
                }}
              >
                Sign in
              </Link>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {["No credit card required", "Free forever", "Works on any device"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="7" fill="rgba(37,99,235,0.15)" />
                    <path d="M4 7L6 9L10 5" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{ fontSize: 13, color: T.ink3 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — App mockup */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              {/* Glow */}
              <div
                style={{
                  position: "absolute",
                  inset: -40,
                  background: "radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "0 40px 80px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
          className="stats-grid"
        >
          {[
            { stat: "10", label: "Max tasks in focus at once", sub: "Everything else lives in the backlog" },
            { stat: "2×", label: "Prioritization frameworks", sub: "Eisenhower + Impact/Effort combined" },
            { stat: "0–100", label: "Priority score range", sub: "Auto-calculated from both matrices" },
          ].map(({ stat, label, sub }) => (
            <Card key={stat}>
              <p
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  background: T.gradText,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: 6,
                  lineHeight: 1,
                }}
              >
                {stat}
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 12.5, color: T.ink3, fontFamily: "monospace" }}>{sub}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={sectionPad}>
        <SectionHead
          eyebrow="How it works"
          title="Three steps to clarity"
          sub="No onboarding. No setup. Open the app, add a task, score it, and focus."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="steps-grid">
          {[
            {
              n: "01",
              title: "Add a task",
              body: "Type anything. No mandatory fields, no categories. Just your task and Enter.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              ),
            },
            {
              n: "02",
              title: "Score it",
              body: "Open the matrix panel. Plot the task on Eisenhower and Impact/Effort. Your priority score updates instantly.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
                  <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
                </svg>
              ),
            },
            {
              n: "03",
              title: "Stay focused",
              body: "Only your top 10 tasks show. Work the list. Complete tasks and watch your score board evolve.",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                </svg>
              ),
            },
          ].map(({ n, title, body, icon }) => (
            <Card key={n} style={{ position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.ink3,
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  marginBottom: 20,
                }}
              >
                STEP {n}
              </div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(37,99,235,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {icon}
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 600, color: T.ink, marginBottom: 10, letterSpacing: "-0.02em" }}>{title}</h3>
              <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.65 }}>{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={sectionPad}>
        <SectionHead
          eyebrow="Features"
          title={
            <>
              Built for{" "}
              <span
                style={{
                  background: T.gradText,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ruthless
              </span>{" "}
              focus
            </>
          }
          sub="Every feature exists to help you answer one question: what should I work on right now?"
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto auto", gap: 16 }} className="features-grid">
          {/* Eisenhower — wide */}
          <Card style={{ gridColumn: "span 2" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: T.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Framework 1
                </p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 12, letterSpacing: "-0.02em" }}>
                  Eisenhower Matrix
                </h3>
                <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.65 }}>
                  Urgent × Important. See every task through the lens that separates what demands attention now from what can wait — or what shouldn't exist.
                </p>
              </div>
              <MatrixVisual
                label="Eisenhower"
                rows={["Urgent", "Not urgent"]}
                cols={["Important", "Not important"]}
                cells={[
                  [
                    { label: "Do First", color: "#FCA5A5", bg: "rgba(239,68,68,0.08)" },
                    { label: "Delegate", color: "#93C5FD", bg: "rgba(59,130,246,0.08)" },
                  ],
                  [
                    { label: "Schedule", color: "#FCD34D", bg: "rgba(245,158,11,0.08)" },
                    { label: "Eliminate", color: T.ink3, bg: "rgba(255,255,255,0.03)" },
                  ],
                ]}
              />
            </div>
          </Card>

          {/* Priority score */}
          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Auto-calculated
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 10, letterSpacing: "-0.02em" }}>
              Priority Score
            </h3>
            <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.65, marginBottom: 24 }}>
              Both matrices feed a single 0–100 score. No guessing. The number tells you exactly what's next.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[95, 85, 70, 55, 15].map((score, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: `linear-gradient(to top, rgba(37,99,235,${score / 100}) 0%, rgba(124,58,237,${score / 100 * 0.6}) 100%)`,
                    borderRadius: 6,
                    height: `${score * 0.6 + 20}px`,
                    minHeight: 20,
                    border: `1px solid rgba(37,99,235,0.2)`,
                    transition: "height 0.3s",
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: 11, color: T.ink3, marginTop: 8, fontFamily: "monospace" }}>priority scores across your tasks</p>
          </Card>

          {/* Impact/Effort — wide */}
          <Card style={{ gridColumn: "span 2" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Framework 2
                </p>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: T.ink, marginBottom: 12, letterSpacing: "-0.02em" }}>
                  Impact/Effort Matrix
                </h3>
                <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.65 }}>
                  Quick Wins vs Major Projects. Weigh every task against its return on effort so you can stack quick wins and plan big bets.
                </p>
              </div>
              <MatrixVisual
                label="Impact / Effort"
                rows={["High impact", "Low impact"]}
                cols={["Low effort", "High effort"]}
                cells={[
                  [
                    { label: "Quick Win", color: "#86EFAC", bg: "rgba(34,197,94,0.08)" },
                    { label: "Major Project", color: "#FCD34D", bg: "rgba(245,158,11,0.08)" },
                  ],
                  [
                    { label: "Fill-in", color: "#93C5FD", bg: "rgba(59,130,246,0.08)" },
                    { label: "Thankless", color: T.ink3, bg: "rgba(255,255,255,0.03)" },
                  ],
                ]}
              />
            </div>
          </Card>

          {/* Focus limit */}
          <Card>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              By design
            </p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 10, letterSpacing: "-0.02em" }}>
              Focus Limit
            </h3>
            <p style={{ fontSize: 14, color: T.ink2, lineHeight: 1.65, marginBottom: 24 }}>
              Only your top 10 tasks are shown. Everything else waits in the backlog, out of sight. The constraint is the feature.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: n <= 7 ? `rgba(37,99,235,${1 - n * 0.07})` : "rgba(255,255,255,0.06)",
                  }}
                />
              ))}
              <p style={{ fontSize: 11, color: T.ink3, marginTop: 4, fontFamily: "monospace" }}>10 slots. All occupied.</p>
            </div>
          </Card>
        </div>

        {/* Bottom row — 3 equal cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }} className="features-bottom">
          {[
            {
              title: "Stack Mode",
              color: T.blue,
              desc: "See tasks in the order you added them. Your natural thought flow, preserved.",
              icon: "☰",
            },
            {
              title: "Priority Mode",
              color: "#A78BFA",
              desc: "Sort by score. The highest-priority task is always at the top. No thinking required.",
              icon: "↑",
            },
            {
              title: "PWA Ready",
              color: "#34D399",
              desc: "Add Flow Todo to your home screen. One tap to your task list, on any device.",
              icon: "⊕",
            },
          ].map(({ title, color, desc, icon }) => (
            <Card key={title}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  marginBottom: 16,
                }}
              >
                {icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 8, letterSpacing: "-0.01em" }}>{title}</h3>
              <p style={{ fontSize: 13.5, color: T.ink2, lineHeight: 1.6 }}>{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={sectionPad}>
        <SectionHead
          eyebrow="Pricing"
          title="Free to start, always"
          sub="Everything you need to stay focused is free. Pro features are on the roadmap."
        />
        <PricingSection />
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ ...sectionPad, maxWidth: 720 }}>
        <SectionHead eyebrow="FAQ" title="Common questions" />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            {
              q: "Is Flow Todo really free?",
              a: "Yes. The core app — unlimited tasks, both matrices, priority scoring, and the top-10 focus view — is free forever. No credit card, no trial period.",
            },
            {
              q: "What is the Eisenhower Matrix?",
              a: "A 2×2 grid of Urgent vs Important. Tasks land in one of four quadrants: Do First (urgent + important), Schedule (not urgent + important), Delegate (urgent + not important), or Eliminate (neither).",
            },
            {
              q: "What is the Impact/Effort Matrix?",
              a: "A 2×2 grid of Impact vs Effort. Quick Wins (high impact, low effort) should be done immediately. Major Projects need planning. Fill-ins are low-priority. Thankless Tasks should be questioned or dropped.",
            },
            {
              q: "Why only 10 tasks in focus?",
              a: "The limit forces you to choose. If everything is a priority, nothing is. Tasks beyond 10 go to the backlog — you can always see them, but they stay out of the way until you're ready.",
            },
            {
              q: "How is the priority score calculated?",
              a: "It's the average of your Eisenhower score and Impact/Effort score, each mapped to a 0–100 scale. If only one matrix is filled in, that score is used directly. Unscored tasks default to 0.",
            },
          ].map(({ q, a }, i) => (
            <details
              key={i}
              style={{
                borderBottom: `1px solid ${T.border}`,
                padding: "20px 0",
              }}
            >
              <summary
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: T.ink,
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  letterSpacing: "-0.01em",
                }}
              >
                {q}
                <span style={{ color: T.ink3, fontSize: 20, fontWeight: 300 }}>+</span>
              </summary>
              <p style={{ fontSize: 14.5, color: T.ink2, lineHeight: 1.7, marginTop: 12, paddingRight: 24 }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ ...sectionPad, textAlign: "center" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 100%)",
            border: `1px solid rgba(37,99,235,0.2)`,
            borderRadius: 28,
            padding: "64px 40px",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 700,
              color: T.ink,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Ready to focus?
          </h2>
          <p style={{ fontSize: 18, color: T.ink2, marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
            Sign up in seconds. No credit card. Start clearing your head today.
          </p>
          <Link
            href="/sign-up"
            style={{
              display: "inline-block",
              background: T.grad,
              color: "#fff",
              textDecoration: "none",
              fontSize: 16,
              fontWeight: 600,
              padding: "14px 36px",
              borderRadius: 14,
              boxShadow: "0 4px 32px rgba(37,99,235,0.4)",
              letterSpacing: "-0.01em",
            }}
          >
            Get started free →
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .features-grid > *[style*="span 2"] { grid-column: span 1 !important; }
          .features-bottom { grid-template-columns: 1fr !important; }
          section { padding-left: 20px !important; padding-right: 20px !important; }
        }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary span { transform: rotate(45deg); display: inline-block; }
      `}</style>
    </main>
  );
}
