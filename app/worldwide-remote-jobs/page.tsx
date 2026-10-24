import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  HelpCircle,
  Sparkles,
  Zap,
  Building2,
  Plane,
} from "lucide-react";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Worldwide Remote Jobs (2026) | Work From Anywhere in the World",
  description:
    "Explore verified worldwide remote jobs with 100% upfront salary transparency. Filter out US-only geo-traps and find true global remote roles hiring anywhere.",
  keywords: [
    "worldwide remote jobs",
    "remote jobs worldwide",
    "work from anywhere jobs",
    "remote jobs anywhere in the world",
    "remote jobs for anyone in the world",
    "international remote jobs",
    "global remote jobs",
    "work from home worldwide",
    "borderless remote work",
  ],
  alternates: {
    canonical: "https://remoteworkdaily.com/worldwide-remote-jobs",
  },
  openGraph: {
    title: "Worldwide Remote Jobs (2026) — Work From Anywhere",
    description:
      "Stop wasting hours on jobs that secretly require US residency. Discover 100% verified worldwide remote roles with transparent salaries and direct ATS links.",
    url: "https://remoteworkdaily.com/worldwide-remote-jobs",
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Worldwide Remote Jobs (2026) | True Global Remote Work",
    description:
      "Find genuine work-from-anywhere jobs with upfront pay and direct company application links.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function WorldwideRemoteJobsPage() {
  const allJobs = getAllJobs();
  const worldwideJobs = filterJobs(allJobs, { worldwideOnly: true });

  const jobSchemas = worldwideJobs.slice(0, 10).map((job) => generateJobPostingSchema(job));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does 'Worldwide Remote Job' actually mean?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A true worldwide remote job means the hiring employer accepts candidates regardless of their physical country of residence, citizenship, or time zone. These companies hire either as independent B2B contractors or via Employer of Record (EOR) services like Deel, Remote.com, or Oyster.",
        },
      },
      {
        "@type": "Question",
        name: "How do international remote workers handle taxes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most global remote workers pay income tax and social contributions in the country where they are tax residents. Employers typically hire global candidates through an Employer of Record (EOR) which handles local tax withholding, or via an independent contractor invoice agreement.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need a US or European work permit for worldwide remote jobs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Genuine worldwide remote jobs do not require US green cards or EU work permits because you are not legally working on US or European soil. You work under your local country's jurisdiction or as an international contractor.",
        },
      },
      {
        "@type": "Question",
        name: "Which companies hire worldwide remote workers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Leading remote-first companies such as GitLab, Automattic (WordPress), Buffer, DuckDuckGo, Zapier, Ghost, and Kraken regularly hire across Europe, Latin America, Asia, Africa, and North America with localized or global benchmark salaries.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://remoteworkdaily.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Worldwide Remote Jobs",
        item: "https://remoteworkdaily.com/worldwide-remote-jobs",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#FF4742] dark:hover:text-[#FF4742] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>All Remote Jobs</span>
        </Link>

        {/* Hero Banner */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 mb-3">
            <Globe2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>100% Borderless &bull; Zero Geo-Traps</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Worldwide Remote Jobs:{" "}
            <span className="text-[#FF4742]">Work From Anywhere</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
            Tired of applying for "remote" jobs only to discover in the interview
            that you must live in California or New York? Every job below is
            verified to accept candidates <strong>anywhere in the world</strong>,
            with 100% upfront salary disclosures and direct company ATS application links.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center sm:text-left">
              <span className="text-2xl font-black text-neutral-900 dark:text-white block">
                {worldwideJobs.length}+
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Active Worldwide Roles
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center sm:text-left">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                100%
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Salary Disclosed
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center sm:text-left">
              <span className="text-2xl font-black text-[#FF4742] block">
                0
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Candidate Paywalls
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center sm:text-left">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">
                Direct ATS
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Greenhouse, Lever, Ashby
              </span>
            </div>
          </div>
        </header>

        {/* The Geo-Trap Guide Callout */}
        <section className="mb-10 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            How Remote Work Daily Filters the "Worldwide Remote Job Trap"
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600 dark:text-neutral-300">
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                What We Verify for Worldwide Jobs:
              </h3>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs sm:text-sm">
                <li>Company employs through Deel, Remote, Oyster, or B2B contractor agreements.</li>
                <li>No requirement for US citizenship, green cards, or specific country work visas.</li>
                <li>Asynchronous communication expectations allowing multi-timezone collaboration.</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-[#FF4742]" />
                Top Countries Hiring Worldwide Talent:
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                Global companies actively source top software engineers, designers,
                technical writers, and customer support specialists across Latin America
                (Brazil, Argentina, Mexico), Europe (UK, Poland, Germany, Spain),
                Asia-Pacific (India, Philippines, Australia), and Africa (Nigeria, Kenya, South Africa).
              </p>
            </div>
          </div>
        </section>

        {/* Live Job Board Client with Worldwide Filter Pre-selected */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Live Worldwide Job Listings ({worldwideJobs.length})
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Updated in real time directly from company ATS career portals.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="py-16 text-center text-sm text-neutral-400">
                <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Loading worldwide remote jobs...</span>
              </div>
            }
          >
            <JobBoardClient
              initialJobs={allJobs}
              initialWorldwideOnly={true}
            />
          </Suspense>
        </section>

        {/* In-Depth FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#FF4742]" />
            Frequently Asked Questions: Worldwide Remote Jobs
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                What does "Worldwide Remote" really mean?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                A true worldwide remote job allows you to live and work in any country.
                Unlike "US Remote" or "EU Remote", your location does not disqualify you.
                Companies either establish local contracts using global Employer of Record
                (EOR) platforms like Deel or Remote.com, or engage you as an independent contractor.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Do worldwide remote jobs pay in US Dollars (USD)?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Many US and international tech firms pay global contractors and employees
                in USD or local currency equivalent. On Remote Work Daily, every listing
                clearly states the base salary and currency upfront so you can evaluate the
                rate before applying.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                How can I stand out when applying for international roles?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Because worldwide remote roles receive applicants from across the globe,
                submitting a generic resume is rarely enough. Use our{" "}
                <Link href="/tools/cv-tailor" className="text-[#FF4742] underline font-semibold">
                  AI CV Tailor
                </Link>{" "}
                to match ATS keywords and record a 60-second personalized Loom video pitch
                directly to the hiring manager on LinkedIn.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
