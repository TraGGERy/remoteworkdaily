import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
  Clock,
  Building2,
  DollarSign,
  Layers,
  ExternalLink,
  Zap,
  Target,
  Award,
  FileText,
  RefreshCw,
  ArrowRight,
  Database,
  Lock,
  Compass,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Remote Work Daily — Our Mission, Verification Methodology & Zero-Ghost-Job Standard",
  description:
    "Learn how Remote Work Daily verifies 72,000+ remote and high-paying hybrid jobs directly from company ATS portals, enforces a 60-day zero-ghost-job deletion policy, and connects candidates directly with hiring managers.",
  keywords: [
    "about remote work daily",
    "zero ghost jobs policy",
    "remote job verification methodology",
    "direct ats job board",
    "transparent salary remote jobs",
    "ats job indexing",
    "remote work hiring transparency",
  ],
  alternates: {
    canonical: "https://remoteworkdaily.com/about",
  },
  openGraph: {
    title: "About Remote Work Daily — Our Mission & Verification Methodology",
    description:
      "Learn how Remote Work Daily verifies 72,000+ remote and high-paying hybrid jobs directly from company ATS portals with a strict 60-day zero-ghost-job policy.",
    url: "https://remoteworkdaily.com/about",
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Remote Work Daily — Zero Ghost Jobs Standard",
    description:
      "Direct ATS verification, transparent salaries, and automated 60-day deletion. Discover our editorial methodology.",
  },
};

export default function AboutPage() {
  const jsonLdAbout = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": "https://remoteworkdaily.com/about#webpage",
        url: "https://remoteworkdaily.com/about",
        name: "About Remote Work Daily — Our Mission, Verification Methodology & Zero-Ghost-Job Standard",
        description:
          "Learn how Remote Work Daily verifies 72,000+ remote and high-paying hybrid jobs directly from company ATS portals, enforces a 60-day zero-ghost-job deletion policy, and connects candidates directly with hiring managers.",
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://remoteworkdaily.com/#website",
          name: "Remote Work Daily",
          url: "https://remoteworkdaily.com",
        },
        about: {
          "@id": "https://remoteworkdaily.com/#organization",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://remoteworkdaily.com/#organization",
        name: "Remote Work Daily",
        url: "https://remoteworkdaily.com",
        logo: "https://remoteworkdaily.com/icon.png",
        foundingDate: "2024",
        knowsAbout: [
          "Remote Work",
          "Applicant Tracking Systems",
          "Salary Transparency",
          "AI Resume Tailoring",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: "support@remoteworkdaily.com",
          contactType: "customer support",
        },
      },
    ],
  };

  const verificationStages = [
    {
      step: "Stage 01",
      title: "Hourly Direct ATS & Carrier Harvesting",
      description:
        "We bypass third-party job aggregators entirely. Our platform directly polls enterprise Applicant Tracking Systems (ATS) including Greenhouse, Lever, Ashby, Workable, SmartRecruiters, ReliefWeb, USAJobs, Arbeitnow, and We Work Remotely every single hour. When an engineering or product role opens on a company's careers portal, it enters our ingestion queue within minutes.",
      icon: Database,
      highlight: "Greenhouse • Lever • Ashby • USAJobs",
    },
    {
      step: "Stage 02",
      title: "High-Paying Hybrid & Remote Classification",
      description:
        "Every listing undergoes automated natural language classification. True remote roles must allow candidates to work from anywhere in their designated country or worldwide. For hybrid roles, we mandate a strict $90,000/year salary floor to filter out low-quality listings, while our semantic heuristics detect and flag sneaky return-to-office (RTO) bait phrases.",
      icon: DollarSign,
      highlight: "$90k+ Hybrid Floor • Zero RTO Bait",
    },
    {
      step: "Stage 03",
      title: "Cryptographic SHA-256 Deduplication & Live HTTP Health Checks",
      description:
        "Each incoming requisition is fingerprinted using a SHA-256 hash across canonical company domain, normalized job title, and unique ATS board ID. This prevents the same role from cluttering candidate search results. Concurrently, automated health checkers periodically ping application endpoints—if an ATS requisition closes or returns an HTTP 404/410, it is immediately flagged for retirement.",
      icon: ShieldCheck,
      highlight: "SHA-256 Fingerprinting • Live 200 OK Checks",
    },
    {
      step: "Stage 04",
      title: "Strict 60-Day Max Retention & Automatic Database Purge",
      description:
        "Unlike legacy aggregators that retain year-old ghost positions to artificially inflate their SEO page count and ad impressions, Remote Work Daily enforces a strict 60-day maximum lifetime. Every night at 00:00 UTC, any job exceeding 60 days of age is automatically deleted from our production database, public JSON feeds, and XML sitemaps.",
      icon: Trash2,
      highlight: "Automatic 60-Day Expiry • Zero Ghost Listings",
    },
  ];

  const editorialPrinciples = [
    {
      title: "100% Salary Transparency Mandate",
      description:
        "Every job listing prominently displays verified compensation bands (USD, EUR, GBP). We believe applying without knowing the compensation range is a waste of a professional's time and talent.",
      icon: Award,
    },
    {
      title: "Direct-to-Company Redirection",
      description:
        "We never trap candidates inside walled gardens or sell your contact information to data brokers. Every 'Apply' button takes you straight to the employer's official career portal.",
      icon: ExternalLink,
    },
    {
      title: "Zero Ghost Job Philosophy",
      description:
        "Over 40% of postings on major platforms are phantom listings with no intention of hiring. We proactively purge stale roles so you only invest time into active, funded requisitions.",
      icon: Target,
    },
    {
      title: "Equal Voice for Modern Operators",
      description:
        "From early-stage Y Combinator startups to Fortune 500 enterprises, roles are indexed based on recency, salary transparency, and role clarity—not who paid the most ad spend to dominate rankings.",
      icon: Users,
    },
  ];

  const guarantees = [
    {
      badge: "Candidate Protection",
      title: "7-Day 100% Money-Back Guarantee",
      description:
        "Try Remote Work Daily Pro completely risk-free. If you are not completely satisfied within your first 7 days, email support@remoteworkdaily.com for a no-questions-asked refund.",
    },
    {
      badge: "Interview Guarantee",
      title: "60-Day Recruiter Screening Guarantee",
      description:
        "Apply to at least 15 verified jobs using Pro within 60 days. If you do not receive at least 2 recruiter screening invitations, we will refund 100% of your subscription fees upon request.",
    },
    {
      badge: "Employer Guarantee",
      title: "14-Day Candidate Quality Guarantee",
      description:
        "Employers who post a verified listing receive direct, qualified ATS applicants or our support team will re-pin and boost your listing for an additional 30 days at zero additional charge.",
    },
  ];

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAbout) }}
      />

      <main className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-[#FF4742]/20 selection:text-[#FF4742]">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50/80 via-white to-white dark:from-neutral-900/40 dark:via-neutral-950 dark:to-neutral-950">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs font-bold text-[#FF4742] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Anti-Ghost-Job Movement</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
              We built Remote Work Daily to destroy the{" "}
              <span className="text-[#FF4742] underline decoration-red-200 dark:decoration-red-950 underline-offset-8">
                ghost job crisis
              </span>
              .
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal mb-10">
              Modern job boards are plagued with 6-month-old phantom listings, deceptive recruiter
              middlemen, and roles with 800+ blind applicants within hours. Remote Work Daily
              indexes active jobs directly from official company ATS systems with 100% salary
              transparency and a strict 60-day auto-deletion policy.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-neutral-200 dark:border-neutral-800 text-left">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
                <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-1">
                  72,000+
                </div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Verified Direct ATS Postings
                </div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
                <div className="text-2xl sm:text-3xl font-black text-[#FF4742] mb-1">
                  60 Days
                </div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Strict Auto-Deletion Lifetime
                </div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
                <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-1">
                  100%
                </div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Direct Company Career Links
                </div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
                <div className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-1">
                  $90k+
                </div>
                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Quality Floor for Hybrid Roles
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The 4-Stage Verification Pipeline */}
        <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>E-E-A-T Technical Standards</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Our 4-Stage Job Verification & Deletion Pipeline
            </h2>
            <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400">
              Every job listing you see on Remote Work Daily is authenticated by automated technical
              checks designed to keep out recruiters, fake listings, and stale requisitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {verificationStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {stage.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-[#FF4742]">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-3">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                      {stage.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-[#FF4742] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{stage.highlight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Editorial Standards & Core Principles */}
        <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Editorial Integrity & Salary Transparency
              </h2>
              <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                We believe candidates are professionals who deserve respect, accurate pay information,
                and direct access to hiring managers. Here is how we enforce that:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {editorialPrinciples.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                  >
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-4">
                      <Icon className="w-4 h-4 text-[#FF4742]" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-normal">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="py-16 md:py-24 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Backed by Real Guarantees
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              We stand behind our data accuracy, early access delivery, and employer candidate flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guarantees.map((g, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mb-3">
                    {g.badge}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">
                    {g.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {g.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conversion & Explore CTAs */}
        <section className="py-16 md:py-20 bg-neutral-900 text-white border-t border-neutral-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
              Ready to find verified remote work without the ghost listings?
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto text-sm sm:text-base mb-8">
              Explore thousands of direct ATS roles, get 6-hour early access notifications, or
              tailor your resume with our AI CV Studio.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pro"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-bold text-sm shadow-lg transition-all"
              >
                <span>⚡ Get Pro Early Access ($6.99/wk)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition-all"
              >
                <span>View All Plans & Pricing</span>
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition-all"
              >
                <span>Explore Features</span>
              </Link>
              <Link
                href="/hire-remotely"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition-all"
              >
                <span>Post a Job ($249)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Site Directory / House Links for Crawlability */}
        <section className="py-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-6 text-center sm:text-left">
              Quick Navigation & House Directory
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Plans & Access</span>
                <Link href="/pricing" className="hover:text-[#FF4742] transition-colors">
                  Pricing Plans & Guarantee
                </Link>
                <Link href="/pro" className="hover:text-[#FF4742] transition-colors">
                  Pro 6-Hour Early Access
                </Link>
                <Link href="/features" className="hover:text-[#FF4742] transition-colors">
                  Platform Architecture & Features
                </Link>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Tools & Feeds</span>
                <Link href="/tools/cv-tailor" className="hover:text-[#FF4742] transition-colors">
                  AI CV & Resume Tailor Studio
                </Link>
                <Link href="/tools/remote-savings-calculator" className="hover:text-[#FF4742] transition-colors">
                  Remote Savings Calculator
                </Link>
                <Link href="/remote-jobs.json" className="hover:text-[#FF4742] transition-colors" target="_blank">
                  Public Jobs API (JSON)
                </Link>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Employers</span>
                <Link href="/hire-remotely" className="hover:text-[#FF4742] transition-colors">
                  Post a Remote Job ($249)
                </Link>
                <Link href="/contact" className="hover:text-[#FF4742] transition-colors">
                  Submit Company Career ATS
                </Link>
                <Link href="/companies" className="hover:text-[#FF4742] transition-colors">
                  Browse Verified Companies
                </Link>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">Trust & Legal</span>
                <Link href="/about" className="hover:text-[#FF4742] transition-colors font-bold text-[#FF4742]">
                  About & Zero Ghost Jobs
                </Link>
                <Link href="/privacy-policy" className="hover:text-[#FF4742] transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms-and-conditions" className="hover:text-[#FF4742] transition-colors">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
