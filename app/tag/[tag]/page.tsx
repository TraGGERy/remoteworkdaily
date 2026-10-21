import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";
import { formatSalary } from "@/lib/utils";
import { ArrowLeft, Sparkles, HelpCircle, ShieldCheck, DollarSign } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

interface PageProps {
  params: Promise<{ tag: string }>;
}

const TAG_DISPLAY_NAMES: Record<string, string> = {
  dev: "Software Developer & Engineering",
  design: "UI/UX & Product Design",
  marketing: "Growth & Digital Marketing",
  sales: "Remote Sales & Account Executive",
  ops: "DevOps & Cloud Infrastructure",
  exec: "Executive & Leadership",
  support: "Customer Support & Success",
  finance: "Finance & Accounting",
  medical: "Healthcare & Telehealth",
  react: "React Developer",
  python: "Python Developer",
  "node.js": "Node.js Developer",
  aws: "AWS Cloud Engineer",
  "full-stack": "Full Stack Engineer",
  frontend: "Frontend Engineer",
  backend: "Backend Engineer",
  kubernetes: "Kubernetes & DevOps Engineer",
};

function formatTagLabel(tag: string): string {
  const lower = tag.toLowerCase().trim();
  if (TAG_DISPLAY_NAMES[lower]) return TAG_DISPLAY_NAMES[lower];
  return tag
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const label = formatTagLabel(tag);
  const canonicalUrl = `${SITE_URL}/remote-${tag.toLowerCase()}-jobs`;

  return {
    title: `Remote ${label} Jobs (2026) | 100% Transparent Pay`,
    description: `Discover verified remote ${label} jobs. Transparent upfront compensation, zero recruiter spam, and direct company ATS application links on Remote Work Daily.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Remote ${label} Jobs (2026) | Verified Salaries`,
      description: `Browse verified remote ${label} jobs with direct ATS applications.`,
      url: canonicalUrl,
      siteName: "Remote Work Daily",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Remote ${label} Jobs | Remote Work Daily`,
      description: `Browse verified remote ${label} openings with 100% transparent pay.`,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const allJobs = getAllJobs();
  const lowerTag = tag.toLowerCase();

  const isCategory = ["dev", "design", "marketing", "sales", "ops", "exec", "support", "finance", "medical"].includes(lowerTag);

  const matchingJobs = filterJobs(allJobs, {
    category: isCategory ? lowerTag : undefined,
    tags: !isCategory ? [tag] : undefined,
  });

  const label = formatTagLabel(tag);

  // Compute live salary analytics for this tag
  const salaries = matchingJobs.map((j) => j.salaryMax || j.salaryMin || 0).filter((s) => s > 0);
  const minSal = salaries.length > 0 ? Math.min(...salaries) : 0;
  const maxSal = salaries.length > 0 ? Math.max(...salaries) : 0;
  const salaryText = maxSal > 0 ? formatSalary(minSal, maxSal, "USD") : "Competitive (Market Rate)";

  const schemas = matchingJobs.slice(0, 10).map((job) => generateJobPostingSchema(job));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Remote Jobs",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Remote ${label} Jobs`,
        item: `${SITE_URL}/remote-${lowerTag}-jobs`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the average salary for remote ${label} jobs?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: maxSal > 0
            ? `Based on verified job listings on Remote Work Daily, remote ${label} roles typically range between ${salaryText} per year, depending on seniority, region, and technical specialization.`
            : `Remote ${label} positions feature competitive market rates with upfront salary disclosures required on Remote Work Daily.`,
        },
      },
      {
        "@type": "Question",
        name: `Are these remote ${label} jobs legitimate?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Remote Work Daily monitors verified applicant tracking systems (Greenhouse, Lever, Ashby, Workable) and auto-archives stale postings daily to ensure zero ghost jobs.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I apply for remote ${label} positions?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Every listing on Remote Work Daily connects you directly to the company's official application form without third-party recruiter middle-screens.`,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#FF4742] dark:hover:text-[#FF4742] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>All Remote Jobs</span>
        </Link>

        {/* Hero Header */}
        <header className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-[#FF4742] border border-red-200 dark:border-red-900/60 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Remote Specialization</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Remote {label} Jobs
          </h1>

          <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
            Discover {matchingJobs.length} verified remote {label.toLowerCase()} openings.
            Every role includes 100% upfront salary disclosures, zero ghost listings, and direct company ATS application links.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
              Typical Salary: {salaryText}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              {matchingJobs.length} Verified Active Roles
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-neutral-500 dark:text-neutral-400">
              Updated Daily • Direct Company ATS
            </span>
          </div>
        </header>

        {/* Live Filterable Job Board */}
        <section className="mb-16">
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-400">
                <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Loading {label} jobs...</span>
              </div>
            }
          >
            <JobBoardClient
              initialJobs={allJobs}
              initialCategory={isCategory ? lowerTag : ""}
              initialTag={!isCategory ? tag : ""}
            />
          </Suspense>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16 border-t border-neutral-200 dark:border-neutral-800 pt-10">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF4742]" />
            <span>Frequently Asked Questions: Remote {label} Careers</span>
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                What is the typical salary for remote {label} roles?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Remote {label} positions on Remote Work Daily currently offer salary bands between {salaryText}.
                Senior and lead positions at US or global tech companies often reach upper compensation tiers with equity bonuses.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                How do I know these positions aren&apos;t ghost jobs?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Remote Work Daily checks ATS job board feeds every 24 hours. When an employer closes or fills a requisition,
                the job is archived immediately to preserve candidate time and ensure 100% active hiring.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
