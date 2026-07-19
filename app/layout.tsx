import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const BASE = "https://flowtodo.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    template: "%s | Flow Todo",
    default: "Flow Todo — Focus on your top 10 tasks",
  },
  description:
    "Flow Todo forces you to prioritize ruthlessly. AI scores every task using Eisenhower and Impact/Effort matrices. Only your top 10 ever show — everything else waits.",
  keywords: [
    "todo app", "task manager", "AI prioritization", "Eisenhower matrix",
    "impact effort matrix", "productivity app", "focus app", "task scoring",
    "priority management", "solopreneur tools",
  ],
  authors: [{ name: "Flow Todo" }],
  creator: "Flow Todo",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE,
    siteName: "Flow Todo",
    title: "Flow Todo — Focus on your top 10 tasks",
    description:
      "AI-powered task prioritization. Score every task. Show only your top 10. Ship more.",
    images: [{ url: "/icon.svg", width: 1200, height: 630, alt: "Flow Todo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flow Todo — Focus on your top 10 tasks",
    description: "AI-powered task prioritization. Score every task. Show only your top 10.",
    images: ["/icon.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flow Todo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

const jsonLd = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Flow Todo",
    url: BASE,
    logo: `${BASE}/icon.svg`,
    description: "AI-powered todo app that forces ruthless prioritization.",
    contactPoint: { "@type": "ContactPoint", email: "hello@flowtodo.app", contactType: "customer support" },
  },
  softwareApp: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Flow Todo",
    url: BASE,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web, iOS, Android",
    description:
      "Flow Todo forces you to prioritize ruthlessly. Every task is scored using Eisenhower and Impact/Effort matrices. Only your top 10 ever show.",
    featureList: [
      "AI task scoring (0–100 priority score)",
      "Eisenhower matrix categorization",
      "Impact/Effort matrix",
      "Top 10 task focus view",
      "Daily dump with streaks",
      "Weekly briefing and retrospective",
      "Brain dump mode",
      "Routine tracker",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free forever. Pro features coming soon.",
    },
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flow Todo",
    url: BASE,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE}/blog?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/dashboard">
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.organization) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.softwareApp) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd.website) }}
          />
          <link rel="preconnect" href="https://cdn.flowtodo.app" crossOrigin="anonymous" />
        </head>
        <body className="min-h-screen antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
