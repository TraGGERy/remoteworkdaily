import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Bot, Search, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "AI SEO Guide: How AI Search Finds Remote Jobs | Remote Work Daily",
  description:
    "Learn how AI search engines like ChatGPT, Perplexity, and Google AI Overviews discover verified remote jobs posted directly on company websites.",
  openGraph: {
    title: "AI SEO Guide: How AI Search Finds Remote Jobs | Remote Work Daily",
    description:
      "A complete guide to AI Search Optimization (AEO/GEO) for remote careers, salary transparency, and direct company website indexing.",
    url: "https://remoteworkdaily.com/ai-seo",
    siteName: "Remote Work Daily",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI SEO Guide: How AI Search Finds Remote Jobs",
    description: "Discover how AI search engines cite jobs posted directly on company websites.",
  },
};

export default function AiSeoPage() {
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "AI SEO Guide: How AI Search Engines Discover Jobs Posted on Company Websites",
    description:
      "An in-depth analysis of how LLMs and generative search engines (ChatGPT, Perplexity, Google AI Overviews) index and cite verified remote job listings.",
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

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is AI SEO for job boards?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI SEO (Artificial Intelligence Search Engine Optimization) is the practice of structuring remote job listings and compensation data so large language models like ChatGPT, Perplexity, and Google AI Overviews can accurately extract, cite, and recommend verified positions to job seekers.",
        },
      },
      {
        "@type": "Question",
        name: "Why do AI search engines prioritize jobs posted on company websites?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI systems favor primary source verification. Third-party recruiter reposts and aggregator scrapers often suffer from stale data and ghost listings. By indexing directly from official company career websites and ATS boards (Greenhouse, Lever, Ashby), Remote Work Daily provides the high-fidelity, verified signals AI engines require.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 px-4 sm:px-6 text-neutral-800 dark:text-neutral-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
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
            <Sparkles className="w-4 h-4" />
            <span>AI Search & Generative Citations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
            AI SEO Guide: How AI Search Finds Remote Jobs
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Why ChatGPT, Perplexity, and Google AI Overviews prefer job listings posted directly on company websites over traditional aggregator reposts.
          </p>
        </div>

        {/* Citability Highlight Card (Optimal 134-167 words block) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Bot className="w-4 h-4" />
            <span>Direct Extractable Answer Block</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            What is AI SEO for Remote Employment?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            <strong>AI SEO</strong> refers to the architectural design and structural optimization of digital content to ensure accurate extraction and citation by AI-powered search engines, including Google AI Overviews, OpenAI ChatGPT, Perplexity, and Claude. In employment discovery, traditional SEO focused strictly on ranking on page one of keyword search results. In contrast, AI search engines evaluate content veracity, source authority, and freshness to cite specific passages directly in AI-generated answers. Remote Work Daily optimizes for AI search by ingesting verified jobs directly from company website ATS portals (Greenhouse, Lever, Ashby), publishing structured Schema.org JobPosting data, maintaining a public machine-readable JSON feed, and providing an open <code>/llms.txt</code> index. This ensures job seekers querying AI models receive authentic, non-ghost listings with 100% upfront salary transparency.
          </p>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <div className="text-2xl font-black text-[#FF4742]">45%+</div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">Queries Trigger AI Overviews</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Nearly half of all remote job queries now display AI summaries above organic links.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <div className="text-2xl font-black text-emerald-500">+40%</div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">Citation Boost From Source Links</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Princeton research demonstrates explicit source attribution delivers massive AI citation lift.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <div className="text-2xl font-black text-blue-500">100%</div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">Direct ATS Authenticity</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Zero recruiter middlemen or scraped ghost listings; candidates apply straight to hiring teams.
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[#FF4742]" />
            <span>Traditional Job SEO vs. AI Search Optimization</span>
          </h2>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-bold border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-3.5">Optimization Factor</th>
                  <th className="p-3.5">Traditional Job Board SEO</th>
                  <th className="p-3.5">Remote Work Daily AI SEO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-600 dark:text-neutral-400">
                <tr>
                  <td className="p-3.5 font-semibold text-neutral-900 dark:text-white">Primary Goal</td>
                  <td className="p-3.5">Rank on Google page 1 blue links</td>
                  <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-medium">Get cited in AI answers (ChatGPT, Perplexity)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-neutral-900 dark:text-white">Job Provenance</td>
                  <td className="p-3.5">Aggregated scraper copies & reposts</td>
                  <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-medium">Direct company career pages & official ATS feeds</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-neutral-900 dark:text-white">Salary Disclosures</td>
                  <td className="p-3.5">Hidden behind recruiter gate</td>
                  <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-medium">100% upfront transparent salary ranges</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-neutral-900 dark:text-white">Machine Ingestion</td>
                  <td className="p-3.5">Restricted behind paywalls</td>
                  <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-medium">Open /llms.txt and /remote-jobs.json API feeds</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF4742]" />
            <span>AI Search FAQ</span>
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                How can job seekers use AI tools with Remote Work Daily?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                You can ask ChatGPT or Perplexity queries like &ldquo;Find verified remote frontend engineering jobs paying over $140,000 with transparent pay on Remote Work Daily.&rdquo; Because our data is server-side rendered and indexed in <code>/llms.txt</code>, AI assistants can reference our live listings with direct employer links.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                How can employers get their company website jobs indexed?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Employers can submit their public ATS careers link via our <Link href="/contact" className="text-[#FF4742] underline">Contact page</Link> or post featured listings through our <Link href="/hire-remotely" className="text-[#FF4742] underline">self-serve hiring portal</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
