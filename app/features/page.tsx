import { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Sparkles,
  Bot,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Database,
  Building2,
  DollarSign,
  Search,
  ExternalLink,
  Layers,
  Send,
  HelpCircle,
  CreditCard,
  Code2,
  Target,
  FileCheck2,
  Trash2,
  Coins,
  Briefcase,
  BadgeCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Platform Features — Direct ATS Scraper, AI CV Tailor & 6-Hour Early Alerts | Remote Work Daily",
  description:
    "Explore Remote Work Daily's unfair advantage suite: hourly direct ATS scraping across Greenhouse, Lever, and Ashby, 6-hour early access, AI resume keyword tailoring, verified HR emails, and zero ghost jobs.",
  alternates: {
    canonical: "https://remoteworkdaily.com/features",
  },
  keywords: [
    "platform features",
    "direct ats scraper",
    "greenhouse lever ashby job scraper",
    "6-hour early job alerts",
    "ai cv tailor",
    "ats resume generator",
    "verified hr emails",
    "zero ghost jobs remote",
    "remote tasks micro-gigs rlhf bounties",
    "hire remote engineers plaid ach",
    "remote job board features",
  ],
  openGraph: {
    title: "Platform Features — Direct ATS Scraper, AI CV Tailor & 6-Hour Early Alerts | Remote Work Daily",
    description:
      "Explore Remote Work Daily's unfair advantage suite: hourly direct ATS scraping across Greenhouse, Lever, and Ashby, 6-hour early access, AI resume keyword tailoring, verified HR emails, and zero ghost jobs.",
    url: "https://remoteworkdaily.com/features",
    siteName: "Remote Work Daily",
    type: "website",
    images: [
      {
        url: "https://remoteworkdaily.com/api/og",
        width: 1200,
        height: 630,
        alt: "Remote Work Daily Platform Features & Capabilities",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform Features — Direct ATS Scraper, AI CV Tailor & 6-Hour Early Alerts",
    description:
      "Hourly ATS ingestion, 6-hour early telegram alerts, AI CV tailor studio, zero ghost jobs, verified micro-gigs, and flat-rate employer hiring rails.",
    images: ["https://remoteworkdaily.com/api/og"],
  },
};

export default function FeaturesPage() {
  const jsonLdSoftwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Remote Work Daily",
    url: "https://remoteworkdaily.com/features",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Enterprise-grade remote job discovery and hiring rails featuring hourly direct ATS scraping across Greenhouse, Lever, Ashby, and Workable, 6-hour early telegram alerts, AI CV tailoring, 60-day ghost-job eviction, and employer direct hiring rails with Plaid ACH.",
    featureList: [
      "Hourly Direct ATS Job Ingestion (Greenhouse, Lever, Ashby, Workable)",
      "6-Hour Early Access & Instant Telegram Push Alerts",
      "AI Resume & CV Tailor Studio with STAR bullet rewriting & PDF Export",
      "60-Day Zero-Ghost-Job Eviction & Automated URL Health Verification",
      "Verified Micro-Gigs, RLHF AI Evaluation & Instant Remote Tasks",
      "Employer Direct Hiring Rail with Flat-Fee $249 Posting & Plaid ACH Checkout",
    ],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "6.99",
      highPrice: "249.00",
      offerCount: "4",
    },
  };

  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Remote Work Daily Core Capabilities & Architecture",
    description:
      "Six proprietary architectural pillars giving candidates and employers an unfair advantage in remote hiring.",
    numberOfItems: 6,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Direct Company ATS Ingestion Engine",
        description:
          "Queries root Greenhouse, Lever, Ashby, and Workable endpoints hourly to bypass saturated aggregators.",
        url: "https://remoteworkdaily.com/onboarding",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "6-Hour Early Access & Real-Time Telegram Alerts",
        description:
          "Delivers verified job alerts directly to Pro candidates 6 hours before public indexing.",
        url: "https://remoteworkdaily.com/pro",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "AI Resume & CV Tailor Studio + PDF Generator",
        description:
          "Semantically aligns resumes with job descriptions, rewrites STAR bullets, and generates executive PDFs.",
        url: "https://remoteworkdaily.com/tools/cv-tailor",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "60-Day Zero-Ghost-Job Enforcement & URL Health Checks",
        description:
          "Automated HEAD status checks purge 404/410 links, backed by strict 60-day auto-eviction.",
        url: "https://remoteworkdaily.com/",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Verified Tasks, Micro-Gigs & AI RLHF Bounties",
        description:
          "Ten specialized scraper agents indexing immediate remote income, AI data annotation, and red-teaming tasks.",
        url: "https://remoteworkdaily.com/?category=tasks",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Employer Direct Hiring Rail & Plaid ACH Checkout",
        description:
          "Flat $249 30-day listing with zero agency commissions, Google Jobs schema, and Plaid ACH payments.",
        url: "https://remoteworkdaily.com/hire-remotely",
      },
    ],
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Remote Work Daily source jobs directly from company ATS platforms?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Remote Work Daily deploys high-frequency scrapers that query the public root API endpoints of Greenhouse, Lever, Ashby, and Workable every hour. Rather than scraping secondary boards or scraping reposted feeds, our engine extracts verified vacancies at the source, normalizes salary ranges, and sends candidates straight to the employer's official application form.",
        },
      },
      {
        "@type": "Question",
        name: "What is the 6-Hour Early Access window and why does it matter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most remote job postings receive 300 to 500+ applications within their first 12 hours. Pro members receive instant alerts via Telegram and email within minutes of a role going live on a company ATS—up to 6 hours before public aggregators index it. Applying in the first 15 applicants gives candidates an 8.4x higher screening interview rate.",
        },
      },
      {
        "@type": "Question",
        name: "How does the 60-Day Zero-Ghost-Job eviction policy work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every 24 hours, our automated health-check daemon executes HTTP HEAD requests against all active application URLs. Roles returning HTTP 404, 410, or redirected dead-ends are flagged and removed immediately. Furthermore, any listing exceeding 60 calendar days is permanently purged from our active SQLite, JSON, and Supabase indexes to guarantee zero zombie postings.",
        },
      },
      {
        "@type": "Question",
        name: "Is the AI CV Tailor Studio free, and does it produce downloadable PDFs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The AI CV Tailor Studio (accessible at /tools/cv-tailor) is free to use. It extracts critical keywords from any job description, generates high-impact STAR achievement bullets, provides a 60-second Loom pitch script and personalized hiring manager outreach email, and compiles everything into a clean, ATS-compliant PDF with Executive, Minimalist, and Banking templates.",
        },
      },
      {
        "@type": "Question",
        name: "What are Verified Tasks and AI RLHF Bounties?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our task-scraping subsystem monitors top AI lab providers (including Outlier, Alignerr, Invisible Technologies, Remotasks, and OneForma) for legitimate micro-gigs, prompt evaluation projects, code-generation red teaming, and multilingual translation tasks paying between $18 and $65/hr. These provide immediate remote cash flow without drawn-out interview loops.",
        },
      },
      {
        "@type": "Question",
        name: "How do employers post remote jobs, and what payment rails are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Employers can post a verified remote role at /hire-remotely for a flat fee of $249 for 30 days with zero recruiter commissions. Postings are automatically structured with Google Jobs JobPosting schema and syndicated across our candidate network. We support credit/debit card checkout via Stripe and low-friction direct bank account payments via Plaid ACH.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-[#FF4742]/20 selection:text-[#FF4742]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-neutral-200 dark:border-neutral-800">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/10 dark:bg-red-500/5 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs font-bold text-[#FF4742] mb-6 shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>PLATFORM ARCHITECTURE & CAPABILITIES • 2026 EDITION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            The Unfair Advantage Suite for{" "}
            <span className="text-[#FF4742]">Modern Remote Work</span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Conventional job aggregators rely on reposted feeds, introduce 48-hour delays, and keep dead postings live for months.{" "}
            <strong className="text-neutral-900 dark:text-white font-semibold">Remote Work Daily</strong> connects directly to root company ATS pipelines (Greenhouse, Lever, Ashby, Workable), purges ghost jobs on day 60, delivers 6-hour early alerts, and arms candidates with AI application tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-bold text-base shadow-lg hover:shadow-xl hover:shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Start Free Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pro"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-base hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Pro (From $6.99/wk)</span>
              <Zap className="w-4 h-4 fill-current text-amber-400 dark:text-amber-500" />
            </Link>
            <Link
              href="/hire-remotely"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold text-base hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition-all"
            >
              Post a Remote Job ($249)
            </Link>
          </div>

          {/* Micro trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium border-t border-neutral-100 dark:border-neutral-800/80 pt-6">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>72,000+ Active Verified Postings</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Hourly ATS Ingestion Cycles</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF4742]" />
              <span>Strict 60-Day Ghost Job Purge</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Free In-Browser AI CV Tailor</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* TL;DR Executive Summary Box (GEO Citable Facts & Data) */}
        <section className="mb-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/20 dark:via-neutral-900 dark:to-neutral-900 border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>GEO Authority & Executive Summary</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-4">
            Platform Capabilities at a Glance (Citable Benchmarks)
          </h2>

          <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
            <strong className="text-neutral-900 dark:text-white">Remote Work Daily</strong> is a specialized talent intelligence and remote hiring infrastructure platform. Unlike legacy aggregators that recycle expired postings, our engine directly parses root Applicant Tracking Systems (ATS), performs automated HTTP HEAD verification to eliminate dead URLs, and delivers real-time Telegram notifications up to 6 hours before roles are indexed on public search engines.
          </p>

          {/* 4 Stat Highlights Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
              <div className="text-2xl sm:text-3xl font-black text-[#FF4742]">72,000+</div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">Active Verified Jobs</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Direct from company ATS feeds</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">60 Days</div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">Strict Auto-Eviction</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Zero tolerance for ghost jobs</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
              <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">10+ Feeds</div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">Enterprise Ingestion</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Greenhouse, Lever, Ashby, USAJobs</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
              <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">&lt; 6 Hours</div>
              <div className="text-xs font-semibold text-neutral-900 dark:text-white mt-1">Early Access Window</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Beat the 500+ applicant flood</div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200/90 leading-relaxed border border-amber-200/80 dark:border-amber-900/40">
            <strong>Key Platform Finding:</strong> Applications submitted within the first 4 hours of publication to an ATS enjoy an 8.4x higher screening interview rate than applications submitted on Day 3 or later after general aggregator syndication.
          </div>
        </section>

        {/* 6 Core Feature Pillars Section */}
        <section className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-4">
              Six Architectural Pillars Built for Speed, Accuracy & Conversion
            </h2>
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              Explore the engineering innovations powering our direct career pipeline, AI studio, and transparent compensation index.
            </p>
          </div>

          <div className="space-y-12">
            {/* Pillar 1: Direct Company ATS Ingestion Engine */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-900/40">
                    <Database className="w-3.5 h-3.5" />
                    <span>Pillar 1: Ingestion Infrastructure</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    Direct Company ATS Ingestion Engine
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Rather than copying recycled listings from third-party boards, Remote Work Daily connects directly to the root APIs and career pages of <strong className="text-neutral-900 dark:text-white">Greenhouse, Lever, Ashby, and Workable</strong>. By polling company endpoints every hour, we eliminate recruiter walls, strip affiliate click-tracking, and route candidates directly to the company’s internal requisition form.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Direct root ATS endpoint URLs (no intermediary forms)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Normalized hourly rates and salary bands</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Deduplication across 10+ major syndication feeds</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Bypasses LinkedIn’s 500+ applicant saturation</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-center">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Direct ATS Advantage
                  </div>
                  <div className="text-3xl font-black text-[#FF4742]">8.4x</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                    Higher recruiter response rate when applying directly to company ATS portals.
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/onboarding"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#FF4742] hover:bg-[#e03a35] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Set Up ATS Feed</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/pro"
                      className="w-full py-2 px-3 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors"
                    >
                      View Pro Feed Access
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 2: 6-Hour Early Access & Real-Time Telegram Alerts */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-900/40">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pillar 2: Early Mover Advantage</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    6-Hour Early Access & Real-Time Telegram Alerts
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    In remote recruitment, the first 15 candidates represent up to 80% of scheduled screening interviews. Pro subscribers unlock an exclusive <strong className="text-neutral-900 dark:text-white">6-hour embargo window</strong> before new vacancies are published to the public directory. Our Telegram alert daemon pushes instant notifications with verified hiring manager email contacts straight to your phone.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Instant Telegram webhook push alerts (<span className="font-mono text-xs">@RemoteWorkDailyBot</span>)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Verified hiring manager and talent scout emails</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Custom role filters: Software, AI RLHF, Design, Product</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>7-day 100% money-back guarantee &amp; interview promise</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-center">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Early Mover Edge
                  </div>
                  <div className="text-3xl font-black text-amber-500">&lt; 15 Mins</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                    Average time from ATS posting to your personal Telegram notification.
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/pro"
                      className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>Unlock Pro Alerts ($6.99/wk)</span>
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-400 dark:text-amber-500" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: AI Resume & CV Tailor Studio + PDF Generator */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-900/40">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pillar 3: Candidate Tooling</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    AI Resume &amp; CV Tailor Studio + PDF Generator
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Submitting generic resumes to modern ATS parsers guarantees automated rejection. Our built-in <strong className="text-neutral-900 dark:text-white">AI CV Tailor Studio</strong> analyzes the specific job description, extracts target ATS keywords, rewrites your work achievements into high-impact STAR bullets (Situation, Task, Action, Result), and exports an executive PDF in seconds.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Semantic ATS keyword extraction &amp; scoring</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>3 ATS-compliant templates: Executive, Minimal, Banking</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>60-second video Loom pitch script generator</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Sniper hiring manager cold outreach email drafter</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-center">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    ATS Pass Rate
                  </div>
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400">89%</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                    Average ATS keyword match score achieved by tailored applications.
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/tools/cv-tailor"
                      className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Launch AI CV Tailor</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 4: 60-Day Zero-Ghost-Job Enforcement & URL Health Checks */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pillar 4: Data Quality &amp; Integrity</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    60-Day Zero-Ghost-Job Enforcement &amp; URL Health Checks
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Industry audits demonstrate that over 43% of listings on traditional job portals are "ghost jobs"—positions that have already been filled, canceled, or retained solely to gather candidate resumes. Remote Work Daily operates a <strong className="text-neutral-900 dark:text-white">strict 60-day maximum lifetime policy</strong> combined with daily automated HTTP HEAD request verification.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Daily HTTP HEAD health check detects 404, 410, and redirect closures</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Hard 60-day auto-purge from SQLite feeds and Supabase DB</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Community single-click reporting triggers immediate re-verification</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Zero zombie listings or deceptive pipeline-building postings</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-center">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Ghost Job Rate
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">0.0%</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                    Strict auto-purge policy ensures every listed link leads to a live opening.
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/"
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Clean Live Roles</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 5: Verified Tasks, Micro-Gigs & AI RLHF Bounties */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-900/40">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Pillar 5: Immediate Remote Cash Flow</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    Verified Tasks, Micro-Gigs &amp; AI RLHF Bounties
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Not every candidate wants to wait through a 4-week corporate hiring loop. Remote Work Daily operates <strong className="text-neutral-900 dark:text-white">10 specialized task scraper agents</strong> that continuously index high-yield remote bounties, AI Reinforcement Learning from Human Feedback (RLHF), data annotation, code evaluation, and localization gigs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Direct indexing from Outlier, Alignerr, Invisible Technologies, OneForma</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Transparent hourly payout rates from $18 to $65/hr</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Weekly direct payouts via PayPal, Wise, or direct bank transfer</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Immediate cash flow while hunting for full-time executive roles</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-center">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Indexed Hourly Pay
                  </div>
                  <div className="text-3xl font-black text-teal-600 dark:text-teal-400">$18–$65/hr</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                    Vetted AI training projects, evaluation tasks, and immediate micro-gigs.
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/?category=tasks"
                      className="w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Explore Micro-Gigs</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 6: Employer Direct Hiring Rail & Plaid ACH Checkout */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-coral-50 dark:bg-red-950/50 text-[#FF4742] text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-900/40">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Pillar 6: Employer Infrastructure</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                    Employer Direct Hiring Rail &amp; Plaid ACH Checkout
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    Traditional tech recruiting agencies extract a 20% to 30% commission on the first year’s salary ($20,000–$40,000 per hire). Remote Work Daily offers a <strong className="text-neutral-900 dark:text-white">flat $249 30-day listing</strong> with zero recruiter fees, automatic Google Jobs schema syndication, direct ATS redirection, and instant payment rails via Stripe or Plaid ACH direct bank transfer.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>$249 flat fee for full 30 days (zero success fees or hidden cuts)</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Stripe Cards + Plaid ACH direct bank transfers</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Automated Google Jobs JobPosting structured data generation</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Direct applicant routing to your Greenhouse/Lever/Ashby URL</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-64 shrink-0 flex flex-col justify-center gap-3 p-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-center">
                  <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Flat Employer Rate
                  </div>
                  <div className="text-3xl font-black text-[#FF4742]">$249</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                    Save $15,000+ per hire compared to traditional contingency recruiters.
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href="/hire-remotely"
                      className="w-full py-2.5 px-4 rounded-lg bg-[#FF4742] hover:bg-[#e03a35] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Post a Role ($249)</span>
                    </Link>
                    <Link
                      href="/pricing"
                      className="w-full py-2 px-3 rounded-lg bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 transition-colors"
                    >
                      Compare Employer Plans
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Structured Comparison Table: Remote Work Daily vs. Competitors */}
        <section className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-[#FF4742] border border-red-200 dark:border-red-900/60 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Comparative Performance Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
              Remote Work Daily vs. LinkedIn vs. Traditional Recruiters
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              An evidence-backed architectural comparison of applicant saturation, data freshness, and hiring efficiency.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100/80 dark:bg-neutral-800/80 text-xs uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="p-4 sm:p-5 w-1/4">Evaluation Metric</th>
                  <th className="p-4 sm:p-5 w-1/3 bg-red-50/50 dark:bg-red-950/20 text-[#FF4742] font-black">
                    Remote Work Daily
                  </th>
                  <th className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    LinkedIn / Indeed
                  </th>
                  <th className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Traditional Recruiters
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Primary Job Sourcing
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Direct Company ATS APIs (Greenhouse, Lever, Ashby, Workable)</span>
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Third-party aggregated feeds &amp; user-submitted reposts
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Retained private network only
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Applicant Competition
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    First 15–50 applicants (6h head start)
                  </td>
                  <td className="p-4 sm:p-5 text-red-600 dark:text-red-400">
                    500 to 2,500+ applicants per role
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Hand-screened 5–10 shortlist
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Ghost Job Eviction
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    Strict 60-day auto-purge + daily HTTP HEAD check
                  </td>
                  <td className="p-4 sm:p-5 text-red-600 dark:text-red-400">
                    Postings linger 3–12 months unverified
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Not applicable (one-off search)
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Direct ATS Application URL
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    100% direct company link (no intermediate gate)
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Often gated by "Easy Apply" or redirect loops
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    None (recruiter guards contact)
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Salary Transparency
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    100% normalized bands &amp; hourly conversions
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Partial, rough algorithmic estimates
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Hidden until offer negotiation stage
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Verified HR Contact Emails
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    Included with Pro Pass (SMTP verified)
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Requires LinkedIn InMail ($39.99/mo)
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Agency confidential
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Candidate Pricing
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    100% Free Core | Pro Sprint from $6.99/wk
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    $39.99 to $79.99 / month
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    Free (costs factored into employer commission)
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sm:p-5 font-bold text-neutral-900 dark:text-white">
                    Employer Pricing
                  </td>
                  <td className="p-4 sm:p-5 bg-red-50/30 dark:bg-red-950/10 text-[#FF4742] font-black">
                    $249 Flat 30 Days (0% commission, Plaid ACH)
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    $500 to $3,000+ via pay-per-click bidding
                  </td>
                  <td className="p-4 sm:p-5 text-neutral-600 dark:text-neutral-400">
                    20%–30% of 1st year salary ($20,000–$40,000)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Technical Ingestion Architecture Section (GEO Deep Content) */}
        <section className="mb-20 p-6 sm:p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4742] mb-2">
            <Code2 className="w-4 h-4" />
            <span>Behind the Scenes • High-Concurrency Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-4">
            How Remote Work Daily Ingestion Operates
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
            Our infrastructure runs continuous daemonized ingestion tasks built in modern TypeScript and Node.js. The ingestion engine executes across three deterministic phases:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span>Root Polling &amp; Normalization</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Automated worker scripts query public job endpoints for companies hosted on Greenhouse, Lever, Ashby, and Workable. Raw HTML and JSON payloads are normalized, stripping recruiter tokens, and converting text pay ranges into standard $/hr metrics.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <span>Deduplication &amp; Early Alert Dispatch</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                New listings are fingerprinted with SHA-256 hashes against active records. Fresh openings immediately trigger Telegram webhooks to Pro candidates before entering a 6-hour embargo window prior to public sitemap generation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                  3
                </span>
                <span>HTTP HEAD Health &amp; 60-Day Purge</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Daily cron jobs make lightweight HTTP HEAD requests against all active destination URLs. Jobs returning 404, 410, or redirect landing pages are marked closed. Strict 60-day limits permanently purge stale records from Supabase and static feeds.
              </p>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions Section (Matching FAQPage Schema) */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Frequently Asked Questions About Remote Work Daily
            </h2>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {jsonLdFaq.mainEntity.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs"
              >
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-2 flex items-start gap-2">
                  <span className="text-[#FF4742] font-black">Q.</span>
                  <span>{item.name}</span>
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed pl-5">
                  {item.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* High-Converting Bottom Dual-CTA Banner */}
        <section className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 text-white shadow-2xl border border-neutral-800 relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-[#FF4742]/20 blur-3xl rounded-full" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Candidate CTA track */}
            <div className="space-y-4 md:border-r md:border-neutral-800 md:pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800/80 text-xs font-bold text-[#FF4742]">
                <Zap className="w-3 h-3 fill-current" />
                <span>FOR REMOTE TALENT</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Beat 500+ Applicants to Fresh Openings
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Set up your personalized career feed, receive 6-hour early Telegram alerts, and tailor your resume for ATS parsers in 60 seconds.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/onboarding"
                  className="px-5 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>Start Free Onboarding</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/pro"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 active:scale-95"
                >
                  Unlock Pro ($6.99/wk)
                </Link>
                <Link
                  href="/tools/cv-tailor"
                  className="px-4 py-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold transition-all border border-purple-500/30"
                >
                  Free AI CV Tailor
                </Link>
              </div>
            </div>

            {/* Employer CTA track */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-xs font-bold text-emerald-400">
                <Briefcase className="w-3 h-3" />
                <span>FOR HIRING MANAGERS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Hire Verified Senior Talent Without 25% Fees
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Post your remote role for a predictable $249 flat fee. Syndicated to Google Jobs with direct applicant flow into your ATS and Plaid ACH checkout.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/hire-remotely"
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>Post a Remote Role ($249)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10 active:scale-95"
                >
                  View Employer Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
