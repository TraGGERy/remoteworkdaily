import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
  ChevronRight,
  Building2,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Ghost Job Listings on the Rise: How to Spot & Avoid Fake Postings in 2026",
  description:
    "Why up to 20% of job board postings are never intended to be filled, how phantom job listings waste candidates' time, and how RemoteWorkDaily guarantees 100% verified listings with our Zero Ghost Jobs Policy.",
  keywords: [
    "ghost jobs",
    "ghost job listings on the rise",
    "fake job postings",
    "how to spot ghost jobs",
    "avoid ghost job postings",
    "remote work ghost jobs",
    "phantom jobs",
    "zero ghost jobs policy",
    "verified remote jobs",
  ],
  alternates: {
    canonical: "https://remoteworkdaily.com/ghost-job-listings-on-the-rise-how-to",
  },
  openGraph: {
    title: "Ghost Job Listings on the Rise: How to Spot & Avoid Fake Remote Postings",
    description:
      "Learn why companies post jobs they never intend to fill and how to protect your job search with verified remote listings.",
    url: "https://remoteworkdaily.com/ghost-job-listings-on-the-rise-how-to",
    siteName: "Remote Work Daily",
    type: "article",
    publishedTime: "2026-10-07T00:00:00Z",
    authors: ["Remote Work Daily Editorial Team"],
    images: [
      {
        url: "https://remoteworkdaily.com/api/og",
        width: 1200,
        height: 630,
        alt: "Ghost Job Listings on the Rise Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghost Job Listings on the Rise: How to Spot & Avoid Fake Remote Postings",
    description:
      "Why 20% of job postings are phantom openings and how to find 100% verified remote careers.",
  },
};

export default function GhostJobsGuidePage() {
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Ghost Job Listings on the Rise: How to Spot & Avoid Fake Remote Postings in 2026",
    description:
      "An in-depth analysis of phantom job listings across major career platforms, why employers keep ghost listings active, and actionable methods for job seekers to identify real opportunities.",
    author: {
      "@type": "Organization",
      name: "Remote Work Daily Editorial Team",
      url: "https://remoteworkdaily.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Remote Work Daily",
      url: "https://remoteworkdaily.com",
      logo: {
        "@type": "ImageObject",
        url: "https://remoteworkdaily.com/icon.png",
      },
    },
    datePublished: "2026-10-07T00:00:00Z",
    dateModified: "2026-10-07T00:00:00Z",
    mainEntityOfPage: "https://remoteworkdaily.com/ghost-job-listings-on-the-rise-how-to",
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a ghost job listing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A ghost job listing is an active job advertisement posted by a company that has no immediate intention of hiring or filling the position. These are commonly used for resume banking, signaling false company growth, or placating overworked staff.",
        },
      },
      {
        "@type": "Question",
        name: "How common are ghost job postings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Surveys conducted by Clarify Capital and workforce analysts indicate that between 18% and 22% of active postings across large aggregators are ghost jobs that have been open for months without active recruitment.",
        },
      },
      {
        "@type": "Question",
        name: "How does Remote Work Daily prevent ghost job listings?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Remote Work Daily enforces a strict Zero Ghost Jobs Policy. We only index roles directly validated through employer ATS systems (such as Greenhouse, Lever, and Ashby) or verified paid employer posts, and all listings are automatically archived after 30 days.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        {/* Navigation Breadcrumb Bar */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Remote Jobs</span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <span>Editorial Guide</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Market Insights</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <header className="max-w-4xl mx-auto px-4 pt-10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-[#FF4742] text-xs font-bold uppercase tracking-wider mb-4">
            <AlertTriangle className="w-3.5 h-3.5" />
            Special Report: Hiring Market Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mb-6">
            Ghost Job Listings on the Rise: How to Spot and Avoid Fake Remote Postings
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 font-normal">
            Why up to 1 in 5 job board listings are phantom openings that never lead to an interview, the hidden corporate motives behind them, and how to verify legitimate remote opportunities.
          </p>

          <div className="flex flex-wrap items-center gap-4 py-3 border-y border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
              <Building2 className="w-4 h-4 text-[#FF4742]" />
              Remote Work Daily Editorial
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Updated October 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              6 min read
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold ml-auto">
              <ShieldCheck className="w-4 h-4" />
              Zero Ghost Jobs Standard
            </span>
          </div>
        </header>

        {/* Main Content Article */}
        <article className="max-w-4xl mx-auto px-4 pb-20">
          {/* Key Takeaways Box */}
          <section className="mb-10 p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Key Takeaways for Job Seekers
            </h2>
            <ul className="space-y-2.5 text-sm sm:text-base text-amber-950 dark:text-amber-100 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">•</span>
                <span><strong>20%+ of listings</strong> on mainstream job aggregator boards are &quot;ghost jobs&quot;—roles published with no active budget or urgency to hire.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">•</span>
                <span>Common motives include <strong>talent pooling</strong>, projecting false growth to investors, and pacifying overworked teams.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">•</span>
                <span>The biggest giveaway is a posting older than 30 days or a role absent from the company&apos;s direct ATS (Greenhouse, Lever, Ashby).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-600 dark:text-amber-400">•</span>
                <span>Remote Work Daily enforces a <strong>Zero Ghost Jobs Policy</strong> by verifying direct ATS links and automatically expiring listings after 30 days.</span>
              </li>
            </ul>
          </section>

          {/* Section 1: The Anatomy of a Ghost Job */}
          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">
              1. What Is a &quot;Ghost Job&quot; and Why Are They Exploding?
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              A <strong>ghost job</strong> is a job posting published on career sites, LinkedIn, or aggregators that a company has no current plan or budget to fill.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              For job seekers spending 30 to 45 minutes carefully customizing resumes and writing tailored cover letters, ghost postings are a psychological and professional drain. According to a landmark survey by Clarify Capital, over <strong>43% of hiring managers admitted they keep job listings open for roles they are not actively hiring for</strong>, with over 20% admitting the posting had remained idle for longer than six months.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              In remote work specifically, the problem is magnified. A single remote posting can attract thousands of applicants, incentivizing companies to leave postings live indefinitely as a continuous resume sponge.
            </p>
          </section>

          {/* Section 2: Why Employers Do It */}
          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">
              2. The 4 Motives Behind Phantom Postings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-[#FF4742] text-xs flex items-center justify-center font-bold">1</span>
                  Talent Pipeline Hoarding
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Companies collect resumes to build a &quot;just-in-case&quot; pipeline so they have pre-screened talent available should an unexpected vacancy arise next quarter.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-[#FF4742] text-xs flex items-center justify-center font-bold">2</span>
                  Signaling Growth to Markets
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Dozens of open positions signal expansion and financial health to venture capitalists, board members, and competitors, even when the business is actively cutting costs.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-[#FF4742] text-xs flex items-center justify-center font-bold">3</span>
                  Pacifying Burnt-Out Teams
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  When existing staff are overworked, management posts job requisitions to demonstrate that &quot;help is on the way,&quot; despite no interviews actually taking place.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-[#FF4742] text-xs flex items-center justify-center font-bold">4</span>
                  Automated Platform Reposts
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Subscription recruitment software automatically refreshes postings every 30 days without human oversight, making 6-month-old stale roles look like new postings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: 5 Red Flags */}
          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">
              3. The 5 Red Flags of a Ghost Job Listing
            </h2>
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-[#FF4742] flex items-center justify-center shrink-0 font-black">
                  !
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
                    1. The Posting Is Older Than 30 Days (Or Repeatedly Reposted)
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Most legitimate, prioritized hiring searches fill or advance to final stages within 3 to 4 weeks. If a job has been sitting for 60+ days or says &quot;Reposted 2 days ago&quot; for the fifth time, it is rarely an active priority.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-[#FF4742] flex items-center justify-center shrink-0 font-black">
                  !
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
                    2. Missing from the Company&apos;s Direct Careers Portal
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Third-party job boards often scrape and retain stale links long after a role has closed. Always check whether the job exists directly on the company&apos;s verified ATS URL (e.g., <code>boards.greenhouse.io/company</code> or <code>jobs.lever.co/company</code>).
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-[#FF4742] flex items-center justify-center shrink-0 font-black">
                  !
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
                    3. Ultra-Generic Descriptions with Zero Specific Deliverables
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Real roles describe the exact team, current projects, and quarter-one goals. Ghost posts read like generic templates designed to match any candidate without committing to specific responsibilities.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-[#FF4742] flex items-center justify-center shrink-0 font-black">
                  !
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
                    4. Missing or Absurdly Wide Compensation Ranges
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Postings that hide compensation or list meaningless brackets like &quot;$50,000 – $250,000&quot; often indicate the employer hasn&apos;t allocated a realistic budget for the role.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-[#FF4742] flex items-center justify-center shrink-0 font-black">
                  !
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
                    5. Active Postings Amidst Recent Layoffs or Freezes
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    If tech news reports that a firm laid off 15% of its workforce two weeks ago, but the job board still displays 40 open software engineering vacancies, those listings are dormant.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Remote Work Daily's Zero Ghost Jobs Policy */}
          <section className="mb-12 p-8 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  The Remote Work Daily Standard: Zero Ghost Jobs Policy
                </h2>
                <p className="text-xs text-neutral-400">Enforced daily across our entire index</p>
              </div>
            </div>

            <p className="text-neutral-300 leading-relaxed mb-6 text-sm sm:text-base">
              At Remote Work Daily, we believe candidate time is valuable. We built our platform specifically to eliminate ghost jobs and opaque listings through three strict structural guarantees:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                <div className="text-emerald-400 font-black text-lg mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Direct ATS Only
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Every public listing is synced directly from verified employer ATS APIs (Greenhouse, Lever, Ashby, Workable) or verified employer submissions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                <div className="text-emerald-400 font-black text-lg mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 30-Day Auto-Expiry
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Any listing not re-verified within 30 days is automatically purged and archived to prevent stale, zombie postings from cluttering search results.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                <div className="text-emerald-400 font-black text-lg mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% Upfront Pay
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  We enforce transparent salary bands on all index roles so candidates never waste hours on roles that pay beneath their requirements.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-bold text-sm transition-all shadow-lg hover:shadow-red-500/20"
              >
                <Search className="w-4 h-4" />
                Browse 9,700+ Verified Remote Jobs
              </Link>
              <Link
                href="/hire-remotely"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-sm transition-all border border-neutral-700"
              >
                Post a Verified Role ($249)
              </Link>
            </div>
          </section>

          {/* Section 5: Candidate Action Checklist */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">
              4. How to Protect Your Job Search Today
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    Apply directly on company career portals, never through 3rd-party middlemen
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Third-party &quot;easy apply&quot; buttons frequently deliver applications to unmonitored inboxes. Follow the link to the company&apos;s direct ATS to ensure a human recruiter reviews your submission.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    Focus on listings posted within the last 24 to 72 hours
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    The earliest 10% of applicants receive over 80% of recruiter screening calls. Use freshness filters on Remote Work Daily to prioritize postings from today.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    Cross-reference with recent company hiring news
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    Check LinkedIn headcount growth and recent news announcements. Growing teams actively hiring will regularly spotlight open roles through team members.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="border-t border-neutral-200 dark:border-neutral-800 pt-10">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
              Frequently Asked Questions About Ghost Jobs
            </h2>
            <div className="space-y-4">
              <details className="group p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-neutral-900 dark:text-white text-base">
                  <span>Is posting a ghost job illegal?</span>
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  In most jurisdictions, posting a job without hiring is not illegal unless it violates specific discrimination laws or fraudulent advertising regulations. However, new state pay transparency statutes and consumer protection reviews are placing greater scrutiny on inaccurate job representations.
                </p>
              </details>

              <details className="group p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-neutral-900 dark:text-white text-base">
                  <span>How can I tell if a remote job is verified on Remote Work Daily?</span>
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Every listing on Remote Work Daily includes direct company source attribution, transparent salary ranges, and a verified direct application link. Furthermore, postings older than 30 days are automatically archived.
                </p>
              </details>

              <details className="group p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-bold text-neutral-900 dark:text-white text-base">
                  <span>Can I report a stale or unresponsive job posting?</span>
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Yes. If an employer has filled a position early or closed an ATS requisition, our automated pipeline updates within 2 hours. Candidates can also flag listings directly from the job card for immediate editorial review.
                </p>
              </details>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
