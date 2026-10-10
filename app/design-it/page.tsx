import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Palette, Layout, Eye, Layers, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Design System & UI Standards | Remote Work Daily",
  description:
    "Explore Remote Work Daily's UI design philosophy. Built with Minimalist Slate palette, 60-30-10 color balance, and clean typography.",
  openGraph: {
    title: "Design System & UI Standards | Remote Work Daily",
    description: "The design principles and UI aesthetics powering Remote Work Daily.",
    url: "https://remoteworkdaily.com/design-it",
    siteName: "Remote Work Daily",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design System & UI Standards | Remote Work Daily",
    description: "Minimalist Slate aesthetics and 60-30-10 palette rules.",
  },
};

export default function DesignItPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Remote Work Daily Design System & UI Aesthetic Principles",
    description: "A deep dive into the 60-30-10 color rule, typography, and purposeful data density powering Remote Work Daily.",
    author: {
      "@type": "Organization",
      name: "Remote Work Daily Product Design Team",
      url: "https://remoteworkdaily.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Remote Work Daily",
      url: "https://remoteworkdaily.com",
    },
    datePublished: "2026-06-17",
    dateModified: "2026-10-10",
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 px-4 sm:px-6 text-neutral-800 dark:text-neutral-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Remote Work Daily</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4742]">
            <Palette className="w-4 h-4" />
            <span>UI Standards & Aesthetics</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
            Design-It: The Remote Work Daily UI System
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            How we design for readability, speed, and high-density job discovery without generic AI aesthetic slop.
          </p>
        </div>

        {/* 60-30-10 Rule Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>The 60-30-10 Color Balance Rule</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Minimalist Slate Palette
          </h2>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Rather than relying on unreadable purple-neon gradients, Remote Work Daily implements the award-winning <strong>Minimalist Slate &amp; Modern Editorial</strong> palette. We enforce a strict 60-30-10 distribution across all screens:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
              <div className="text-2xl font-black text-neutral-900 dark:text-white">60%</div>
              <div className="font-bold text-xs mt-1 text-neutral-800 dark:text-neutral-200">Neutral Canvas</div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Subtle backgrounds (#FFFFFF / #0A0A0A) ensuring zero eye fatigue during extended job browsing.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800">
              <div className="text-2xl font-black text-neutral-900 dark:text-white">30%</div>
              <div className="font-bold text-xs mt-1 text-neutral-800 dark:text-neutral-200">Typography &amp; Structure</div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Deep obsidian text, crisp border lines, and clear hierarchy for salary bands and company tags.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-red-50 dark:bg-red-950/30">
              <div className="text-2xl font-black text-[#FF4742]">10%</div>
              <div className="font-bold text-xs mt-1 text-[#FF4742]">Action &amp; Focus</div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                High-visibility orange-red CTA buttons, badges, and verified badges for critical user decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Design Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
              <Layout className="w-4 h-4 text-emerald-500" />
              <span>Data-Dense Table Design</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Remote candidates want information at a glance: verified salary, location restrictions, company logo, and time posted. No oversized hero fluff obscuring listings.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>Accessibility First (WCAG AAA)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every element maintains strong contrast ratios, keyboard navigation, and instant theme switching between daylight slate and midnight dark mode.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Direct ATS Feedback</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Clear visual badges mark direct Greenhouse, Lever, and Ashby listings, signaling immediate connection to the hiring company website.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-[#FF4742]" />
              <span>Zero Artificial Slop</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Refined border radiuses, consistent 4px/8px rhythm, and purposeful typography instead of decorative, distracting AI design artifacts.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#FF4742] hover:bg-[#e03a35] transition-all shadow-sm"
          >
            <span>Explore Live Job Directory</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
