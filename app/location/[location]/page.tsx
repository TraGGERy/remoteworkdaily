import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";
import { formatSalary } from "@/lib/utils";
import { ArrowLeft, Globe, MapPin, DollarSign, ShieldCheck, HelpCircle, Sparkles } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location } = await params;
  const decodedLoc = decodeURIComponent(location).replace(/-/g, " ");
  const capitalizedLoc = decodedLoc
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const canonicalUrl = `${SITE_URL}/remote-jobs-in-${location.toLowerCase()}`;

  return {
    title: `Remote Jobs in ${capitalizedLoc} (2026) | Verified Work From Home Roles`,
    description: `Discover verified remote jobs hiring in ${capitalizedLoc}. High salaries, 100% transparent compensation, and direct company ATS application links on Remote Work Daily.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Remote Jobs in ${capitalizedLoc} (2026) | Remote Work Daily`,
      description: `Browse verified remote jobs for candidates living in ${capitalizedLoc}. Transparent salaries and zero ghost listings.`,
      url: canonicalUrl,
      siteName: "Remote Work Daily",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Remote Jobs in ${capitalizedLoc} | Remote Work Daily`,
      description: `Find verified remote roles hiring in ${capitalizedLoc} with transparent pay.`,
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { location } = await params;
  const decodedLoc = decodeURIComponent(location).replace(/-/g, " ");
  const capitalizedLoc = decodedLoc
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const allJobs = getAllJobs();
  const matchingJobs = filterJobs(allJobs, {
    location: decodedLoc,
  });

  // Calculate live salary range for this location
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
        name: `Remote Jobs in ${capitalizedLoc}`,
        item: `${SITE_URL}/remote-jobs-in-${location.toLowerCase()}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Can I work remotely from ${capitalizedLoc} for international tech companies?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, ${matchingJobs.length} verified listings on Remote Work Daily specifically welcome applicants based in ${capitalizedLoc}. Top global companies hire engineers, designers, product managers, and customer specialists from this region.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the average salary for remote jobs in ${capitalizedLoc}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: maxSal > 0
            ? `Compensation for remote roles accepting candidates in ${capitalizedLoc} typically ranges between ${salaryText} per year with verified upfront salary disclosures.`
            : `Remote positions in ${capitalizedLoc} offer competitive international and market-rate salaries with equity and healthcare stipends.`,
        },
      },
      {
        "@type": "Question",
        name: `How does Remote Work Daily verify listings in ${capitalizedLoc}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Every listing is synced directly from company applicant tracking systems (Greenhouse, Lever, Ashby, Workable) with explicit telecommute eligibility verified daily to eliminate ghost jobs.`,
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Regional Remote Eligibility</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Remote Jobs in {capitalizedLoc}
          </h1>

          <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
            Browse {matchingJobs.length} verified remote career openings accepting candidates living in {capitalizedLoc}.
            Every job includes 100% upfront compensation disclosures and direct ATS application links.
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
              {matchingJobs.length} Verified Positions
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-neutral-500 dark:text-neutral-400">
              Direct ATS Apply • No Recruiter Spam
            </span>
          </div>
        </header>

        {/* Live Filterable Job Board */}
        <section className="mb-16">
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-neutral-400">
                <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Loading jobs in {capitalizedLoc}...</span>
              </div>
            }
          >
            <JobBoardClient
              initialJobs={allJobs}
              initialLocation={decodedLoc}
            />
          </Suspense>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16 border-t border-neutral-200 dark:border-neutral-800 pt-10">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF4742]" />
            <span>Frequently Asked Questions: Remote Work in {capitalizedLoc}</span>
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                How do currency and taxes work for remote roles in {capitalizedLoc}?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Most international employers hire candidates in {capitalizedLoc} as independent contractors (B2B invoices)
                or through an Employer of Record (EOR) service such as Deel, Remote.com, or OysterHR, ensuring full local labor law and tax compliance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                How frequently are new remote jobs in {capitalizedLoc} added?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Our automated ATS ingestion pipeline verifies and refreshes company listings daily.
                Any filled position is removed within 24 hours so your applications only go to open requisitions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
