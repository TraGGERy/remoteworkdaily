import { Suspense } from "react";
import { getAllJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";
import { AiSeoKnowledgeSection } from "@/components/seo/ai-seo-knowledge-section";

export default function Home() {
  const allJobs = getAllJobs();
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
          Find your dream <span className="text-[#FF4742]">remote job</span>
        </h1>
        <p className="text-xs sm:text-base text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl mx-auto">
          Browse verified remote positions at top tech companies. Real transparent salaries, no spam, 100% remote.
        </p>
      </div>

      {/* Master Client Job Board */}
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-400">
            <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading remote jobs...</span>
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
