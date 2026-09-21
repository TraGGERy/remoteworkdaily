import { Suspense } from "react";
import { Metadata } from "next";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location } = await params;
  const decodedLoc = decodeURIComponent(location).replace(/-/g, " ");
  const capitalizedLoc = decodedLoc.charAt(0).toUpperCase() + decodedLoc.slice(1);

  return {
    title: `Remote Jobs in ${capitalizedLoc} #OpenSalaries | Remote Work Daily`,
    description: `Browse remote job listings for candidates living in ${capitalizedLoc}. High salaries, verified perks, and asynchronous culture on Remote Work Daily.`,
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { location } = await params;
  const decodedLoc = decodeURIComponent(location).replace(/-/g, " ");
  const allJobs = getAllJobs();

  const matchingJobs = filterJobs(allJobs, {
    location: decodedLoc,
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
          Remote Jobs in {decodedLoc}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {matchingJobs.length} remote positions accepting candidates in {decodedLoc}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-400">
            <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading jobs in {decodedLoc}...</span>
          </div>
        }
      >
        <JobBoardClient
          initialJobs={allJobs}
          initialLocation={decodedLoc}
        />
      </Suspense>
    </main>
  );
}
