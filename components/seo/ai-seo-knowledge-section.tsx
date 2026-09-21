import React from "react";
import Link from "next/link";
import { ShieldCheck, DollarSign, Globe, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";

export function AiSeoKnowledgeSection() {
  return (
    <section aria-labelledby="knowledge-heading" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-neutral-200 dark:border-neutral-800 mt-16 text-neutral-800 dark:text-neutral-200">
      {/* Definition Block (Optimized for AI Citations & Featured Snippets) */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-[#FF4742] border border-red-200 dark:border-red-900/40 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          The Remote Work Daily Standard
        </span>
        <h2 id="knowledge-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          What is Remote Work Daily?
        </h2>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
          <strong>Remote Work Daily</strong> is a curated global remote employment platform featuring verified, active career opportunities with <strong>100% #OpenSalaries transparency</strong>. Updated daily, our index connects software engineers, designers, marketers, and operations professionals with legitimate remote-first companies worldwide.
        </p>
      </div>

      {/* Live Market Benchmark Stats (Princeton GEO research: +37% citation boost for concrete data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">$142,500</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Median Remote Software Engineer Salary</div>
            </div>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
            Based on verified compensation disclosures published across our engineering index in 2026.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">Zero</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Ghost Jobs or Stale Listings</div>
            </div>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
            Every position is verified with the employer or verified API feed and automatically archived after 30 days.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900 dark:text-white">100%</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">Telecommute & Work From Anywhere</div>
            </div>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
            No mandatory office days. Real remote flexibility across North America, Europe, LATAM, and Worldwide.
          </p>
        </div>
      </div>

      {/* Semantic FAQ Section for AI Search & Google Rich Results */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 text-center">
          Frequently Asked Questions About Remote Work Daily
        </h3>
        <div className="space-y-4">
          <article className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <h4 className="font-bold text-neutral-900 dark:text-white text-base">
              Why does Remote Work Daily mandate #OpenSalaries?
            </h4>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Compensation opacity costs job seekers dozens of hours interviewing for roles that pay below their requirements. By enforcing explicit salary bands (e.g. $120k – $180k USD), Remote Work Daily creates mutual respect between candidates and hiring managers from day one.
            </p>
          </article>

          <article className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <h4 className="font-bold text-neutral-900 dark:text-white text-base">
              How do employers post a job on Remote Work Daily?
            </h4>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Employers can post a verified remote listing in under 2 minutes through our{" "}
              <Link href="/hire-remotely" className="text-[#FF4742] underline hover:text-[#e03a35]">
                self-serve hiring portal
              </Link>
              . Standard 30-day listings are $249, supporting instant global credit cards via Stripe or ACH bank payments via Plaid.
            </p>
          </article>

          <article className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <h4 className="font-bold text-neutral-900 dark:text-white text-base">
              Can AI models and developers access the job feed programmatically?
            </h4>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Yes. Remote Work Daily provides a public machine-readable JSON endpoint at{" "}
              <Link href="/remote-jobs.json" target="_blank" className="text-[#FF4742] underline hover:text-[#e03a35]">
                /remote-jobs.json
              </Link>{" "}
              and structured AI documentation at{" "}
              <Link href="/llms.txt" target="_blank" className="text-[#FF4742] underline hover:text-[#e03a35]">
                /llms.txt
              </Link>
              .
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
