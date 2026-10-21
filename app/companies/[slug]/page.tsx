import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  CheckCircle,
  Globe,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  Sparkles,
  MapPin,
} from "lucide-react";
import { getAllJobs, getJobsByCompanySlug } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";
import { formatSalary } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const companyJobs = getJobsByCompanySlug(slug);

  if (!companyJobs || companyJobs.length === 0) {
    return { title: "Company Not Found | Remote Work Daily" };
  }

  const company = companyJobs[0].company;
  const count = companyJobs.length;

  // Compute salary range if available
  const salariesWithMax = companyJobs.map((j) => j.salaryMax || j.salaryMin || 0).filter((s) => s > 0);
  const minSal = salariesWithMax.length > 0 ? Math.min(...salariesWithMax) : 0;
  const maxSal = salariesWithMax.length > 0 ? Math.max(...salariesWithMax) : 0;
  const salarySnippet = maxSal > 0 ? ` (${formatSalary(minSal, maxSal, "USD")})` : "";

  const title = `${company} Remote Jobs & Salaries: ${count} Verified Openings${salarySnippet} | Remote Work Daily`;
  const description = `Explore ${count} verified remote career openings at ${company}. 100% upfront salary disclosures, zero ghost jobs, and direct company ATS application links.`;
  const canonicalUrl = `${SITE_URL}/companies/${slug}`;
  const ogImageUrl = `${SITE_URL}/api/og`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Remote Work Daily",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${company} Remote Jobs`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CompanyHubPage({ params }: PageProps) {
  const { slug } = await params;
  const allJobs = getAllJobs();
  const companyJobs = getJobsByCompanySlug(slug);

  if (!companyJobs || companyJobs.length === 0) {
    notFound();
  }

  const primaryJob = companyJobs[0];
  const companyName = primaryJob.company;
  const companyLogo = primaryJob.companyLogo;
  const companyWebsite = primaryJob.companyWebsite;

  // Financial & Role Analytics
  const salaries = companyJobs.map((j) => j.salaryMax || j.salaryMin || 0).filter((s) => s > 0);
  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
  const salaryRangeStr = maxSalary > 0 ? formatSalary(minSalary, maxSalary, "USD") : "Competitive (Market Rate)";

  const remoteCount = companyJobs.filter((j) => j.workplaceType === "remote" || !j.workplaceType).length;
  const hybridCount = companyJobs.filter((j) => j.workplaceType === "hybrid").length;
  const isWorldwide = companyJobs.some((j) => (j.location || "").toLowerCase().includes("worldwide"));

  // Structured Data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: companyName,
    url: companyWebsite || `${SITE_URL}/companies/${slug}`,
    logo: companyLogo || `${SITE_URL}/icon.png`,
    sameAs: companyWebsite ? [companyWebsite] : [],
  };

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
        name: companyName,
        item: `${SITE_URL}/companies/${slug}`,
      },
    ],
  };

  const jobSchemas = companyJobs.slice(0, 10).map((job) => generateJobPostingSchema(job));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Does ${companyName} hire remote workers?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, ${companyName} currently has ${companyJobs.length} active verified positions listed on Remote Work Daily, including ${remoteCount} 100% remote roles and ${hybridCount} high-paying hybrid opportunities.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the average remote salary at ${companyName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: maxSalary > 0
            ? `Remote positions at ${companyName} offer compensation ranges between ${salaryRangeStr} with verified transparent salary disclosures.`
            : `Remote positions at ${companyName} feature verified market-rate compensation with direct company benefits and equity.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I apply for remote jobs at ${companyName}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `All listings on Remote Work Daily link directly to ${companyName}'s official applicant tracking system (ATS) such as Greenhouse, Lever, or Ashby. There are no recruiter intermediaries or third-party spam.`,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#FF4742] dark:hover:text-[#FF4742] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>All Remote Jobs</span>
        </Link>

        {/* Company Hero Profile */}
        <header className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-black text-2xl sm:text-3xl text-neutral-700 dark:text-neutral-200">
                    {companyName.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                    {companyName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                    <CheckCircle className="w-3.5 h-3.5 fill-current" />
                    <span>Verified Employer</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 flex-wrap">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {companyJobs.length} Active Remote Openings
                  </span>
                  <span>•</span>
                  <span>Direct ATS Applications</span>
                  {companyWebsite && (
                    <>
                      <span>•</span>
                      <a
                        href={companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-300 hover:text-[#FF4742] transition-colors"
                      >
                        <span>Careers Site</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Ghost Jobs</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Globe className="w-3.5 h-3.5" />
                <span>{isWorldwide ? "Worldwide Hiring" : "Remote & Hybrid"}</span>
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 font-medium block">Total Openings</span>
              <strong className="text-base sm:text-lg font-black text-neutral-900 dark:text-white mt-0.5 block">
                {companyJobs.length} roles
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 font-medium block">Compensation Band</span>
              <strong className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block truncate">
                {salaryRangeStr}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 font-medium block">Work Arrangement</span>
              <strong className="text-base sm:text-lg font-black text-neutral-900 dark:text-white mt-0.5 block">
                {remoteCount} Remote / {hybridCount} Hybrid
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-400 font-medium block">Direct ATS Verification</span>
              <strong className="text-base sm:text-lg font-black text-sky-600 dark:text-sky-400 mt-0.5 block">
                100% Verified Direct
              </strong>
            </div>
          </div>
        </header>

        {/* AEO / Generative Engine Answer Block */}
        <section className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-red-500/5 via-neutral-100 to-white dark:from-red-950/20 dark:via-neutral-900 dark:to-neutral-950 border border-red-200/60 dark:border-red-900/40">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#FF4742] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
                About Working Remotely at {companyName}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                {companyName} hires remote candidates across engineering, product, design, and operations.
                All {companyJobs.length} positions featured on Remote Work Daily include verified salary transparency
                ({salaryRangeStr}) and link straight to {companyName}&apos;s official careers portal, bypassing agency recruiters.
              </p>
            </div>
          </div>
        </section>

        {/* Live Job Board for this Company */}
        <section className="mb-16">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
              Open Positions at {companyName} ({companyJobs.length})
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Filter roles by salary, seniority, and location with transparent compensation.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-16 text-center text-sm text-neutral-400">
                <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Loading open roles at {companyName}...</span>
              </div>
            }
          >
            <JobBoardClient
              initialJobs={allJobs}
              initialCompany={slug}
            />
          </Suspense>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto mb-16 border-t border-neutral-200 dark:border-neutral-800 pt-10">
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#FF4742]" />
            <span>Frequently Asked Questions About {companyName} Careers</span>
          </h2>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                How often are {companyName} jobs updated on Remote Work Daily?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Our ingestion pipeline syncs directly with {companyName}&apos;s verified applicant tracking system daily.
                Filled and closed jobs are archived automatically within 24 hours so you never waste time applying to ghost listings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                Are salary numbers for {companyName} guaranteed?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Compensation figures are extracted directly from official job specifications or regional salary disclosure mandates.
                Final offers may vary based on experience, location, and seniority tier.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
