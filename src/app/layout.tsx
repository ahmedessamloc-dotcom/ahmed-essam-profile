import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import PortfolioLayout from "@/components/PortfolioLayout";

// ─── Font Loading Strategy (FCP / LCP optimization) ───
// Only load the exact weights and subsets used on the page.
// Geist Sans: body text — swap for fast FCP
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  weight: '400',
  preload: true,
});

// Geist Mono: rare usage — optional, no layout shift
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'optional',
  weight: '500',
  preload: false,
});

// Playfair Display: headings — swap, only used weights
// Reduced from 5 weights to 3: 400 (regular), 700 (bold), 900 (black)
// 600 and 500 were barely distinguishable and added ~30KB to font payload
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: 'swap',
  weight: ['400', '700', '900'],
  preload: true,
});

// ─── Viewport (separated for Next.js 16 best practice) ───
export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

// ─── Metadata (SEO + Social — zero runtime cost) ───
export const metadata: Metadata = {
  title: "Ahmed Essam — Architecture & Engineering Portfolio",
  description: "Portfolio of Ahmed Essam — Project Manager in Design & Development Management with 20 years of experience in hospitality, educational, commercial, residential, and urban planning sectors across 6+ countries.",
  keywords: ["Architecture", "Engineering", "Portfolio", "Ahmed Essam", "Project Manager", "Design", "Development", "Real Estate", "Luxury"],
  authors: [{ name: "Ahmed Essam" }],
  openGraph: {
    title: "Ahmed Essam — Architecture & Engineering Portfolio",
    description: "20 Years | 150+ Projects | 6+ Countries",
    type: "website",
    siteName: "Ahmed Essam Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmed Essam — Architecture & Engineering Portfolio",
    description: "20 Years | 150+ Projects | 6+ Countries",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* ─── Critical: prevent FOUC with blocking theme script ─── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t||t==='dark'){document.documentElement.classList.add('dark')}else if(t==='light'){document.documentElement.classList.remove('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
        {/* ─── Preconnect to Google Fonts (FCP critical) ─── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* ─── LCP critical: preload the hero image ─── */}
        <link
          rel="preload"
          as="image"
          href="/portfolio/image3.webp"
          type="image/webp"
          fetchPriority="high"
        />
        {/* ─── DNS prefetch for Vercel endpoints (non-critical, early hint) ─── */}
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
      >
        <PortfolioLayout>
          {children}
        </PortfolioLayout>

        {/* ─── Vercel Speed Insights (auto-tracks CWV: LCP, FID, CLS, INP, TTFB) ─── */}
        <SpeedInsights />
        {/* ─── Vercel Web Analytics (page views + custom events) ─── */}
        <Analytics />
      </body>
    </html>
  );
}
