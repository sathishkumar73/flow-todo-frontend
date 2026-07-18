"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: scrolled ? 16 : 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: scrolled ? "min(860px, calc(100% - 32px))" : "100%",
          zIndex: 100,
          transition: "all 0.3s ease",
          borderRadius: scrolled ? 999 : 0,
          background: scrolled
            ? "rgba(7,7,15,0.88)"
            : "rgba(7,7,15,0.0)",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
          padding: scrolled ? "0 24px" : "0 40px",
          height: scrolled ? 52 : 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: "#E8E8F0", letterSpacing: "-0.02em" }}>
            Flow<span style={{ color: "#2563EB" }}>Todo</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }} className="hidden-mobile">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                color: "rgba(232,232,240,0.65)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8E8F0")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,232,240,0.65)")}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/sign-in"
            className="hidden-mobile"
            style={{
              color: "rgba(232,232,240,0.65)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            style={{
              background: "#2563EB",
              color: "#fff",
              textDecoration: "none",
              fontSize: 13.5,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 999,
              letterSpacing: "-0.01em",
            }}
          >
            Get started
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="show-mobile"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
            aria-label="Menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 20,
                  height: 1.5,
                  background: "#E8E8F0",
                  borderRadius: 2,
                }}
              />
            ))}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99,
            background: "#07070F",
            display: "flex",
            flexDirection: "column",
            padding: "80px 32px 32px",
            gap: 8,
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "none",
              border: "none",
              color: "#E8E8F0",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "#E8E8F0",
                textDecoration: "none",
                fontSize: 22,
                fontWeight: 500,
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <Link
              href="/sign-in"
              onClick={() => setMenuOpen(false)}
              style={{
                color: "rgba(232,232,240,0.65)",
                textDecoration: "none",
                fontSize: 16,
                textAlign: "center",
                padding: "12px",
              }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setMenuOpen(false)}
              style={{
                background: "#2563EB",
                color: "#fff",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
                padding: "14px",
                borderRadius: 14,
                textAlign: "center",
              }}
            >
              Get started free
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
