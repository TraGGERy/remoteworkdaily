import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllJobs, triggerBackgroundSyncIfStale } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";
import { AiSeoKnowledgeSection } from "@/components/seo/ai-seo-knowledge-section";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

export const metadata: Metadata = {
  title: "Remote Work Daily — Verified Remote Jobs with Transparent Pay",
  description:
    "Find remote jobs posted directly on company websites. Remote Work Daily indexes verified openings straight from Greenhouse, Lever, Ashby, and company career pages with 100% transparent pay.",
  alternates: {
    canonical: SITE_URL,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  // In serverless environments, cron (/api/jobs/sync) handles scheduled scraping.
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    triggerBackgroundSyncIfStale();
  }
  const allJobs = getAllJobs(true);
  const topSchemas = allJobs.slice(0, 10).map((job) => generateJobPostingSchema(job));

  return (
    <main className="min-h-screen">
      {/* Google Jobs Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(topSchemas) }}
      />

      {/* Hero Headline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 text-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
          Find jobs posted on <span className="text-[#FF4742]">company websites</span>
        </h1>
        <p className="text-xs sm:text-base text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl mx-auto">
          Browse verified remote positions straight from official company career portals and direct ATS boards. Zero recruiter spam, 100% transparent pay, direct application links.
        </p>

        {/* Dual Buyer Conversion Banners */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          <Link
            href="/pro"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800/80 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all hover:scale-[1.02] shadow-2xs"
          >
            <span>⚡ Beat 500+ applicants with 6-Hour Early Access</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">→</span>
          </Link>
          <Link
            href="/hire-remotely"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-all hover:scale-[1.02] shadow-2xs"
          >
            <span>🏢 Hiring senior talent? Post to 2.5M+ remote workers ($249)</span>
            <span className="text-[#FF4742] font-extrabold">→</span>
          </Link>
        </div>
      </div>

      {/* Master Client Job Board */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-400">
            <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading jobs...</span>
          </div>
        }
      >
        <JobBoardClient initialJobs={allJobs} />
      </Suspense>

      {/* AI-SEO Structured Knowledge & Market Authority Section */}
      <AiSeoKnowledgeSection />
    </main>
  );
}
