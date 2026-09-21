import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobById, getAllJobs } from "@/lib/jobs-repository";
import { formatSalary, timeAgo } from "@/lib/utils";
import { generateJobPostingSchema } from "@/lib/seo";
import { BENEFITS_LIST } from "@/lib/constants";
import {
  ExternalLink,
  Globe,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Share2,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = getJobById(id);
  if (!job) return { title: "Job Not Found | Remote Work Daily" };

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return {
    title: `${job.title} at ${job.company} (${salary}) | Remote Work Daily`,
    description: `Apply for ${job.title} at ${job.company}. Salary: ${salary}. Location: ${job.location}. Verified remote opportunity on Remote Work Daily.`,
    openGraph: {
      title: `${job.title} at ${job.company}`,
      description: `Remote salary: ${salary} • Location: ${job.location}`,
      images: job.companyLogo ? [{ url: job.companyLogo }] : [],
    },
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

  const schema = generateJobPostingSchema(job);
  const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <main className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 py-8 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all jobs</span>
        </Link>

        {/* Job Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-extrabold text-2xl text-neutral-600 dark:text-neutral-300">
                    {job.company.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-neutral-900 dark:text-white">
                    {job.company}
                  </span>
                  {job.verified && (
                    <CheckCircle className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                  )}
                </div>
                <h1 className="font-black text-xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
                  {job.title}
                </h1>
              </div>
            </div>

            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/25 active:scale-95 transition-all"
            >
              <span>Apply for this job</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
              <div className="text-neutral-400 font-medium">Verified Salary</div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 tabular-nums">
                {salaryText}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
              <div className="text-neutral-400 font-medium">Location</div>
              <div className="font-bold text-neutral-900 dark:text-white text-sm mt-0.5 truncate">
                {job.location}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 col-span-2 sm:col-span-1">
              <div className="text-neutral-400 font-medium">Published</div>
              <div className="font-bold text-neutral-900 dark:text-white text-sm mt-0.5">
                {timeAgo(job.postedAt)}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {job.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits Card */}
        {job.benefits && job.benefits.length > 0 && (
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Perks & Benefits
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((bId) => {
                const b = BENEFITS_LIST.find((item) => item.id === bId);
                if (!b) return null;
                return (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Description Body */}
        <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4 prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed">
          <div className="whitespace-pre-line">
            {job.description}
          </div>

          <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 flex justify-center">
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all"
            >
              <span>Apply now on {job.company} Careers</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
