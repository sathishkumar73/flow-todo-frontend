import type { Metadata } from "next";
import PricingSection from "@/components/marketing/PricingSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Flow Todo",
  description: "Flow Todo is free forever. Pro features coming soon.",
};

const T = {
  bg: "#07070F",
  ink: "#E8E8F0",
  ink2: "rgba(232,232,240,0.62)",
  ink3: "rgba(232,232,240,0.38)",
  gradText: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)",
};

export default function PricingPage() {
  return (
    <main style={{ background: T.bg, minHeight: "100vh" }}>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "160px 40px 96px", textAlign: "center" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: T.ink3,
            marginBottom: 16,
            fontFamily: "monospace",
          }}
        >
          · Pricing ·
        </p>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            letterSpacing: "-0.035em",
            color: T.ink,
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Simple,{" "}
          <span
            style={{
              background: T.gradText,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            honest
          </span>{" "}
          pricing
        </h1>
        <p style={{ fontSize: 18, color: T.ink2, maxWidth: 480, margin: "0 auto 64px", lineHeight: 1.6 }}>
          Everything you need to stay focused is free. Pro is on the roadmap for teams and power users.
        </p>

        <PricingSection />

        <p style={{ marginTop: 48, fontSize: 14, color: T.ink3 }}>
          Questions?{" "}
          <Link href="mailto:hello@flowtodo.app" style={{ color: "#60A5FA", textDecoration: "none" }}>
            hello@flowtodo.app
          </Link>
        </p>
      </section>
    </main>
  );
}
