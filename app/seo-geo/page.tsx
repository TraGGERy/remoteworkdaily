import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cpu, Globe2, CheckCircle2, ShieldCheck, Zap, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "GEO Guide: Generative Engine Optimization for Jobs | Remote Work Daily",
  description:
    "Master Generative Engine Optimization (GEO) for remote careers. How AI engines cite jobs posted on company websites with llms.txt and schema markup.",
  openGraph: {
    title: "GEO Guide: Generative Engine Optimization for Jobs | Remote Work Daily",
    description: "Learn how Generative Engine Optimization connects job seekers with company career pages.",
    url: "https://remoteworkdaily.com/seo-geo",
    siteName: "Remote Work Daily",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "GEO Guide: Generative Engine Optimization for Remote Jobs",
    description: "Discover how AI engines select and cite direct company website listings.",
  },
};

export default function SeoGeoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "GEO Guide: Generative Engine Optimization for Remote Employment Discovery",
    description: "A framework for getting remote job postings and compensation benchmarks cited by AI search engines.",
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
    datePublished: "2026-03-21",
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
            <Cpu className="w-4 h-4" />
            <span>Generative Engine Optimization Framework</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
            GEO Guide: Generative Engine Optimization for Remote Jobs
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            How modern AI search systems discover, evaluate, and cite jobs posted directly on company websites.
          </p>
        </div>

        {/* Citability Answer Block (134-167 words standard) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>GEO Definition & Citability Standards</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            What is Generative Engine Optimization (GEO)?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <strong>Generative Engine Optimization (GEO)</strong> is the systematic methodology of structuring content, datasets, and digital architectures so generative AI engines (including Google AI Overviews, OpenAI ChatGPT, Perplexity, and Claude) can seamlessly parse and cite information in real-time user answers. While traditional search optimization prioritized backlink volume and keyword density to capture click-through traffic, GEO rewards verifiable authority, direct-to-source provenance, and passage-level readability. In modern job discovery, AI engines actively filter out aggregator spam and recruiter reposts in favor of direct company website listings. Remote Work Daily leads GEO best practices by serving server-side rendered (SSR) job records, enabling AI crawlers (GPTBot, ClaudeBot, PerplexityBot) via robots.txt, providing an open <code>/llms.txt</code> roadmap, and embedding rich JSON-LD structured schemas with verified salary compensation benchmarks across all indexed roles.
          </p>
        </div>

        {/* 5 Core GEO Pillars */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            The 5 Pillars of Generative Engine Optimization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>1. Direct Source Citability</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Primary company websites correlate 3x higher in AI citation rates than secondary aggregator reposts. Direct ATS links provide undeniable provenance.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                <Globe2 className="w-4 h-4 text-blue-500" />
                <span>2. Technical Accessibility & SSR</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                AI crawlers do not execute heavy client-side JavaScript. All Remote Work Daily job listings are server-rendered with zero gating.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <span>3. Salary Transparency Data</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Factual statistics and specific compensation numbers generate a +37% citation lift in AI answers (Princeton KDD study).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                <Zap className="w-4 h-4 text-[#FF4742]" />
                <span>4. Machine-Readable Feeds</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Public JSON feeds (<code>/remote-jobs.json</code>) and standardized <code>/llms.txt</code> files provide instant structured guidance for LLM crawlers.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div className="p-6 rounded-2xl bg-neutral-900 dark:bg-neutral-900 text-white border border-neutral-800 space-y-3">
          <h3 className="font-bold text-lg">
            Hiring? Get Your Company Website Jobs Cited Across AI Search
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Submit your company&apos;s career portal or publish a featured job listing to reach 2,500,000+ monthly remote professionals and optimize your roles for AI discovery.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/hire-remotely"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF4742] hover:bg-[#e03a35] text-white transition-all"
            >
              Post a Job ($249)
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all"
            >
              Submit Free ATS Career Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
