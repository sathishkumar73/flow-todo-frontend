import Link from "next/link";

const PRODUCT_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features",     href: "/#features" },
  { label: "Pricing",      href: "/pricing" },
  { label: "Blog",         href: "/blog" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "#07070F" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 40px 32px" }}>

        {/* Top row */}
        <div style={{ display: "flex", gap: 64, flexWrap: "wrap", marginBottom: 48 }}>

          {/* Brand */}
          <div style={{ flex: "0 0 220px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, background: "#2563EB",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <span style={{ fontSize: 17, fontWeight: 600, color: "#E8E8F0", letterSpacing: "-0.02em" }}>
                Flow<span style={{ color: "#2563EB" }}>Todo</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: "rgba(232,232,240,0.38)", lineHeight: 1.6, margin: 0 }}>
              Focus on your top 10. Everything else waits.
            </p>
          </div>

          {/* Product */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(232,232,240,0.30)", marginBottom: 16, margin: "0 0 16px" }}>
              Product
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PRODUCT_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ color: "rgba(232,232,240,0.45)", textDecoration: "none", fontSize: 13.5, transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#E8E8F0")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,232,240,0.45)")}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(232,232,240,0.30)", marginBottom: 16, margin: "0 0 16px" }}>
              Legal
            </p>
            <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{ color: "rgba(232,232,240,0.45)", textDecoration: "none", fontSize: 13.5, transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#E8E8F0")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,232,240,0.45)")}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <span style={{ color: "rgba(232,232,240,0.28)", fontSize: 12.5 }}>
            © {new Date().getFullYear()} FlowTodo. All rights reserved.
          </span>
          <a
            href="mailto:hello@flowtodo.app"
            style={{ color: "rgba(232,232,240,0.35)", fontSize: 12.5, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E8E8F0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,232,240,0.35)")}
          >
            hello@flowtodo.app
          </a>
        </div>
      </div>
    </footer>
  );
}
