import { Metadata } from "next";
import Link from "next/link";
import { getTopCompanies, getAllJobs } from "@/lib/jobs-repository";
import {
  Building2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  DollarSign,
  Globe,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

export const metadata: Metadata = {
  title: "Top Remote Companies Hiring in 2026 | Verified Employer Directory",
  description:
    "Explore the official directory of top remote-first companies hiring worldwide. Discover verified open positions at Stripe, OpenAI, GitLab, Elastic, and hundreds more with 100% transparent pay.",
  alternates: {
    canonical: `${SITE_URL}/companies`,
  },
  openGraph: {
    title: "Top Remote Companies Hiring in 2026 | Remote Work Daily",
    description:
      "Directory of verified remote employers with direct ATS links and transparent salary bands.",
    url: `${SITE_URL}/companies`,
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Companies Directory (2026) | Remote Work Daily",
    description: "Browse verified remote companies with transparent salary disclosures.",
  },
};

export default function CompaniesDirectoryPage() {
  const topCompanies = getTopCompanies(120);
  const allJobs = getAllJobs();

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
        name: "Companies",
        item: `${SITE_URL}/companies`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top Remote Companies Hiring",
    description: "Verified remote-first tech companies hiring worldwide.",
    itemListElement: topCompanies.slice(0, 30).map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.name,
      url: `${SITE_URL}/companies/${c.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 py-10 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="max-w-7xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#FF4742] dark:hover:text-[#FF4742] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>All Remote Jobs</span>
        </Link>

        {/* Directory Header */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-[#FF4742] border border-red-200 dark:border-red-900/60 mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Remote Employers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Remote Companies Directory
          </h1>

          <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
            Discover verified companies actively hiring remote talent across engineering, product, design, and operations.
            Every company listed posts verified compensation and links directly to their official careers portal.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm">
            <span className="font-bold text-neutral-900 dark:text-white">
              {topCompanies.length} Top Companies Indexed
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {allJobs.length.toLocaleString()}+ Active Verified Roles
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-neutral-500 dark:text-neutral-400">
              Zero Ghost Postings • Direct ATS Apply
            </span>
          </div>
        </header>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {topCompanies.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="group p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4742] dark:hover:border-[#FF4742] transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="font-black text-lg text-neutral-600 dark:text-neutral-300">
                        {company.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    {company.count} {company.count === 1 ? "role" : "roles"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-bold text-base text-neutral-900 dark:text-white group-hover:text-[#FF4742] transition-colors line-clamp-1">
                    {company.name}
                  </h2>
                  <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  Verified remote openings with transparent compensation and direct ATS applications.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-[#FF4742]">
                <span>View {company.count} open {company.count === 1 ? "job" : "jobs"}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
