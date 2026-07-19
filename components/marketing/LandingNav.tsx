"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features",     href: "#features" },
  { label: "Pricing",      href: "#pricing" },
  { label: "Blog",         href: "/blog" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change (escape key or outside click)
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: scrolled ? 12 : 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: scrolled ? "min(900px, calc(100% - 32px))" : "100%",
          zIndex: 100,
          transition: "all 0.3s ease",
          borderRadius: scrolled ? 999 : 0,
          background: scrolled ? "rgba(7,7,15,0.90)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
          padding: scrolled ? "0 20px" : "0 40px",
          height: scrolled ? 52 : 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: "#2563EB",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="0" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#E8E8F0", letterSpacing: "-0.02em" }}>
            Flow<span style={{ color: "#2563EB" }}>Todo</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{ color: "rgba(232,232,240,0.60)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8E8F0")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,232,240,0.60)")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Single CTA — desktop */}
          <Link
            href="/sign-up"
            className="nav-desktop"
            style={{
              background: "#2563EB", color: "#fff", textDecoration: "none",
              fontSize: 13.5, fontWeight: 600, padding: "8px 18px",
              borderRadius: 999, letterSpacing: "-0.01em", transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Get started
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="nav-mobile"
            aria-label="Open menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ display: "block", width: 20, height: 1.5, background: "#E8E8F0", borderRadius: 2 }} />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 99, background: "#07070F",
            display: "flex", flexDirection: "column", padding: "0 24px 32px",
          }}
        >
          {/* Mobile header bar */}
          <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" onClick={() => setOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: "#2563EB",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <span style={{ fontSize: 17, fontWeight: 600, color: "#E8E8F0", letterSpacing: "-0.02em" }}>
                Flow<span style={{ color: "#2563EB" }}>Todo</span>
              </span>
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Close menu"
              style={{ background: "none", border: "none", color: "rgba(232,232,240,0.60)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>
              ✕
            </button>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 8 }}>
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  color: "#E8E8F0", textDecoration: "none", fontSize: 20, fontWeight: 500,
                  padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href="/sign-up"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 28, background: "#2563EB", color: "#fff", textDecoration: "none",
              fontSize: 16, fontWeight: 600, padding: "15px", borderRadius: 14, textAlign: "center",
              display: "block",
            }}
          >
            Get started free
          </Link>

          <Link
            href="/sign-in"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 12, color: "rgba(232,232,240,0.45)", textDecoration: "none",
              fontSize: 14, textAlign: "center", display: "block", padding: "8px",
            }}
          >
            Already have an account? Sign in
          </Link>
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile  { display: none  !important; }
        @media (max-width: 640px) {
          .nav-desktop { display: none  !important; }
          .nav-mobile  { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
