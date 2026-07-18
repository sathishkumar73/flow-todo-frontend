import Link from "next/link";

export default function Footer() {
  const links = [
    { label: "Pricing", href: "/pricing" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <span style={{ color: "rgba(232,232,240,0.35)", fontSize: 13.5 }}>
        © {new Date().getFullYear()} FlowTodo. All rights reserved.
      </span>
      <nav style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            style={{
              color: "rgba(232,232,240,0.40)",
              textDecoration: "none",
              fontSize: 13.5,
              transition: "color 0.15s",
            }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
