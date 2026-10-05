import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppAuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Header } from "@/components/navigation/header";
import { NoticeBanner } from "@/components/navigation/notice-banner";
import { CatchEmailsBanner } from "@/components/navigation/catch-emails-banner";
import { Footer } from "@/components/navigation/footer";
import { SiteChrome } from "@/components/navigation/site-chrome";
import { generateWebsiteSchema, generateFAQSchema } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Remote Work Daily — Verified Remote Jobs & Transparent Pay",
    template: "%s | Remote Work Daily",
  },
  description:
    "Looking for a verified remote job? Remote Work Daily indexes hand-curated remote careers in Software Engineering, Design, Product, Marketing, Sales, and Ops with 100% transparent salary ranges. Work from anywhere.",
  keywords: [
    "remote work daily",
    "remote jobs",
    "work from home",
    "remote software engineer",
    "remote developer",
    "transparent salaries",
    "salary transparency",
    "digital nomad jobs",
    "verified remote work",
    "high paying remote jobs",
  ],
  authors: [{ name: "Remote Work Daily Editorial Team", url: SITE_URL }],
  creator: "Remote Work Daily",
  publisher: "Remote Work Daily",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Remote Work Daily — Verified Remote Jobs with Transparent Pay",
    description: "Looking for a verified remote job? Discover high-paying remote roles updated daily with 100% transparent compensation.",
    url: SITE_URL,
    siteName: "Remote Work Daily",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "Remote Work Daily — Verified Remote Jobs with Transparent Pay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Work Daily — Verified Remote Jobs with Transparent Pay",
    description: "Browse verified remote jobs with transparent pay. Real salaries, no spam, updated daily.",
    creator: "@remoteworkdaily",
    images: [`${SITE_URL}/api/og`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebsiteSchema();
  const faqSchema = generateFAQSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans antialiased flex flex-col transition-colors selection:bg-[#FF4742]/20 selection:text-[#FF4742]`}
      >
        <ClerkProvider>
          <AppAuthProvider>
            <ThemeProvider>
              <SiteChrome>{children}</SiteChrome>
            </ThemeProvider>
          </AppAuthProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}