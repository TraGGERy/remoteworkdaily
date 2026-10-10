import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Tag, CheckCircle2, Sparkles, Sliders, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "SEO Meta Optimizer: High-CTR Job Posting Metadata | Remote Work Daily",
  description:
    "Master SEO metadata for remote job posts. Formulas for 50-60 character titles, 150-160 character meta descriptions, and verified salary snippets.",
  openGraph: {
    title: "SEO Meta Optimizer: High-CTR Job Posting Metadata | Remote Work Daily",
    description: "Learn how to optimize job titles, meta descriptions, and URLs for maximum applicant clicks.",
    url: "https://remoteworkdaily.com/seo-meta-optimizer",
    siteName: "Remote Work Daily",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Meta Optimizer for Remote Jobs",
    description: "Actionable formulas for high-converting job board metadata.",
  },
};

export default function SeoMetaOptimizerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Remote Work SEO Meta Optimizer: High-CTR Job Posting Formulas",
    description: "A practical guide to crafting click-worthy metadata and salary-transparent descriptions for remote jobs.",
    author: {
      "@type": "Organization",
      name: "Remote Work Daily Editorial Team",
      url: "https://remoteworkdaily.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Remote Work Daily",
      url: "https://remoteworkdaily.com",
    },
    datePublished: "2026-02-27",
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
            <Tag className="w-4 h-4" />
            <span>Metadata & CTR Optimization</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
            Remote Work SEO Meta Optimizer
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Proven formulas for high-converting title tags, meta descriptions, and URLs for jobs posted on company websites.
          </p>
        </div>

        {/* Core Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-[#FF4742]">
              <Sliders className="w-4 h-4" />
              <span>Title Tags (50-60 chars)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Place primary role and remote scope in the first 30 characters. Always include salary range if competitive.
            </p>
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200">
              Senior React Engineer ($160k) | Stripe
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-500">
              <Sparkles className="w-4 h-4" />
              <span>Descriptions (150-160 chars)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Lead with an active verb, mention perks (100% remote, async), and conclude with an explicit application CTA.
            </p>
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200">
              Join Stripe as a Senior React Engineer. $140k-$180k USD, 100% remote worldwide, async culture. Apply direct.
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-blue-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>Clean URLs (&lt; 60 chars)</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Use lowercase hyphens, eliminate stop words, and place the canonical slug right after the ID.
            </p>
            <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200">
              /jobs/stripe-senior-react-engineer
            </div>
          </div>
        </div>

        {/* Practical Template Showcase */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            High-Converting Job Metadata Package
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Use this standard when posting a job or configuring your company ATS feed for Remote Work Daily:
          </p>

          <div className="space-y-3 font-mono text-xs bg-neutral-900 text-neutral-100 p-4 sm:p-6 rounded-xl overflow-x-auto">
            <div>
              <span className="text-neutral-400">{"// Optimized Title:"}</span>
              <div className="text-emerald-400">&ldquo;Remote Senior Fullstack Engineer ($150k-$190k) | Acme Corp&rdquo;</div>
              <div className="text-[10px] text-neutral-500">Length: 57 characters (Optimal 50-60)</div>
            </div>

            <div>
              <span className="text-neutral-400">{"// Optimized Meta Description:"}</span>
              <div className="text-emerald-400">&ldquo;Work remotely worldwide at Acme Corp. Build high-scale Next.js apps with $150k-$190k pay, equity, and unlimited PTO. Apply directly on company website.&rdquo;</div>
              <div className="text-[10px] text-neutral-500">Length: 156 characters (Optimal 150-160)</div>
            </div>

            <div>
              <span className="text-neutral-400">{"// OpenGraph Card Type:"}</span>
              <div className="text-purple-400">&lt;meta property=&quot;og:type&quot; content=&quot;article&quot; /&gt;</div>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-neutral-900 dark:text-white">Ready to hire remote talent?</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Post your role with automatic metadata optimization and social reach.</p>
          </div>
          <Link
            href="/hire-remotely"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#FF4742] hover:bg-[#e03a35] text-white flex items-center gap-1.5 shrink-0"
          >
            <span>Post a Job ($249)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
