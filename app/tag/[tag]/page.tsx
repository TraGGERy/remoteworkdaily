import { Suspense } from "react";
import { Metadata } from "next";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return {
    title: `Remote ${capitalizedTag} Jobs #OpenSalaries | Remote Work Daily`,
    description: `Find the best remote ${capitalizedTag} jobs from top companies with verified open salaries. Filter by salary, location, and benefits. Apply today on Remote Work Daily.`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const allJobs = getAllJobs();

  const isCategory = ["dev", "design", "marketing", "sales", "ops", "exec", "support", "finance", "medical"].includes(tag.toLowerCase());

  const matchingJobs = filterJobs(allJobs, {
    category: isCategory ? tag.toLowerCase() : undefined,
    tags: !isCategory ? [tag] : undefined,
  });

  const schemas = matchingJobs.slice(0, 10).map((job) => generateJobPostingSchema(job));

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <div className="max-w-7xl mx-auto px-4 pt-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white capitalize">
          Remote {tag} Jobs
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {matchingJobs.length} open remote positions with verified compensation
        </p>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-400">
            <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading {tag} jobs...</span>
          </div>
        }
      >
        <JobBoardClient
          initialJobs={allJobs}
          initialCategory={isCategory ? tag.toLowerCase() : ""}
          initialTag={!isCategory ? tag : ""}
        />
      </Suspense>
    </main>
  );
}
