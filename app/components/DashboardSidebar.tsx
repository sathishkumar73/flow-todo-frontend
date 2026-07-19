"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    href: "/dashboard/tasks",
    label: "Tasks",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/dashboard/search",
    label: "Search",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
];

function NavLink({ item, compact = false }: { item: NavItem; compact?: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  if (compact) {
    return (
      <Link
        href={item.href}
        className={`flex flex-col items-center gap-1 px-3 py-2 text-[10px] font-medium transition ${
          isActive ? "text-accent" : "text-white/35 hover:text-white/70"
        }`}
      >
        <span className={isActive ? "text-accent" : ""}>{item.icon}</span>
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        isActive
          ? "bg-accent/15 text-accent"
          : "text-white/40 hover:bg-white/5 hover:text-white/70"
      }`}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

export function DashboardSidebar() {
  const { user } = useUser();
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[220px] lg:fixed lg:inset-y-0 border-r border-white/8 bg-[#0c0c12]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.09] px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-ink">Flow Todo</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        {/* User section */}
        {user && (
          <div className="border-t border-white/[0.09] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-purple-600 text-[11px] font-bold text-white">
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.imageUrl} alt={initials} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white/70">
                  {user.firstName} {user.lastName}
                </p>
                <p className="truncate text-[11px] text-white/30">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/8 bg-[#0f0f14]/96 backdrop-blur-md">
        {NAV.map((item) => (
          <NavLink key={item.href} item={item} compact />
        ))}
      </nav>
    </>
  );
}
