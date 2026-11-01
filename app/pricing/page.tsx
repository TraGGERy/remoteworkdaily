import React from "react";
import type { Metadata } from "next";
import { UnifiedPricingHub } from "@/components/pricing/unified-pricing-hub";
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Check,
  Building2,
  Lock,
  Landmark,
  Scale,
  Award,
  Globe,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

export const metadata: Metadata = {
  title: "Pricing & Plans — Candidate Pro Pass & Employer Job Postings | Remote Work Daily",
  description:
    "Transparent pricing for remote job seekers and hiring teams. Unlock 6-hour early access and direct ATS links from $6.99/wk, or post a verified remote job for $249 flat.",
  alternates: {
    canonical: `${SITE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing & Plans — Candidate Pro Pass & Employer Job Postings | Remote Work Daily",
    description:
      "Transparent pricing for remote job seekers and hiring teams. Unlock 6-hour early access and direct ATS links from $6.99/wk, or post a verified remote job for $249 flat.",
    url: `${SITE_URL}/pricing`,
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing & Plans — Candidate Pro Pass & Employer Job Postings",
    description:
      "Transparent pricing for remote job seekers and hiring teams. Unlock 6-hour early access from $6.99/wk, or post a verified remote job for $249.",
  },
};

const FAQ_ITEMS = [
  {
    question: "How does the Candidate Pro Pass 6-Hour Early Access work?",
    answer:
      "When a new remote role is verified or indexed directly from company career pages, Pro Pass members receive instant notifications and direct ATS application links 6 hours before the job appears on public job boards. This lets you apply before the recruiter receives hundreds of submissions.",
  },
  {
    question: "What is the 7-Day Money-Back Guarantee for Job Seekers?",
    answer:
      "If you are not 100% satisfied with Remote Work Daily Pro for any reason within your first 7 days, email support@remoteworkdaily.com and our team will immediately issue a complete, no-questions-asked refund.",
  },
  {
    question: "How does the 60-Day 2-Interview Guarantee work?",
    answer:
      "If you subscribe to Monthly Pro or Lifetime Access, actively apply to roles through our direct ATS links, and do not secure at least 2 verified recruiter screening interviews within 60 days, email our candidate success team for a full 100% refund.",
  },
  {
    question: "Where do employer job postings direct applicants?",
    answer:
      "Unlike legacy job boards that trap candidates in slow walled gardens, Remote Work Daily routes 100% of candidate traffic directly into your company's native ATS (Greenhouse, Lever, Ashby, Workable, BambooHR, etc.) or custom application URL.",
  },
  {
    question: "What is the 14-Day Employer Qualified Applicant Guarantee?",
    answer:
      "If your verified job listing does not receive qualified applicant traffic within the first 14 days, our team will re-pin your job post to the top of the board for an additional 30 days and feature it in our next candidate email blast at zero extra charge.",
  },
  {
    question: "What payment methods and rails are supported for billing?",
    answer:
      "We accept all major corporate credit cards (Visa, Mastercard, American Express) processed securely via Stripe 256-bit SSL encryption. For employers hiring at scale, we also support Plaid ACH Direct Bank Transfers with 0% credit card processing fees and instant PDF tax invoices.",
  },
];

export default function PricingPage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/pricing#webpage`,
        url: `${SITE_URL}/pricing`,
        name: "Pricing & Plans — Candidate Pro Pass & Employer Job Postings | Remote Work Daily",
        description:
          "Transparent pricing for remote job seekers and hiring teams. Unlock 6-hour early access and direct ATS links from $6.99/wk, or post a verified remote job for $249 flat.",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Pricing",
              item: `${SITE_URL}/pricing`,
            },
          ],
        },
      },
      {
        "@type": "Product",
        "@id": `${SITE_URL}/pricing#product`,
        name: "Remote Work Daily Pro Pass & Employer Job Services",
        description:
          "Verified remote careers access subscription for job seekers and 30-day direct ATS job postings for hiring teams.",
        brand: {
          "@type": "Brand",
          name: "Remote Work Daily",
        },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: "6.99",
          highPrice: "249.00",
          offerCount: 4,
          offers: [
            {
              "@type": "Offer",
              name: "Candidate Pro Pass — Weekly Sprint",
              price: "6.99",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/pricing#candidate-pricing`,
              priceValidUntil: "2027-12-31",
              category: "Candidate Subscription",
              description:
                "6-Hour Early Access, direct ATS application links, verified HR contact emails, weekly auto-renew.",
            },
            {
              "@type": "Offer",
              name: "Candidate Pro Pass — Monthly Pro",
              price: "17.99",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/pricing#candidate-pricing`,
              priceValidUntil: "2027-12-31",
              category: "Candidate Subscription",
              description:
                "Full monthly access with 6-Hour Early Access, ATS links, unlimited AI CV Tailor, salary scripts, and 60-day interview guarantee.",
            },
            {
              "@type": "Offer",
              name: "Candidate Pro Pass — Lifetime Access",
              price: "49.99",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/pricing#candidate-pricing`,
              priceValidUntil: "2027-12-31",
              category: "Candidate Subscription",
              description:
                "Perpetual lifetime access to all early alerts, verified HR contacts, and AI tools with zero recurring fees.",
            },
            {
              "@type": "Offer",
              name: "Employer 30-Day Verified Job Post",
              price: "249.00",
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url: `${SITE_URL}/pricing#employer-pricing`,
              priceValidUntil: "2027-12-31",
              category: "Employer Job Posting",
              description:
                "Standard 30-day verified remote job listing with direct ATS redirect, Google Jobs schema syndication, and Telegram alert.",
            },
          ],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/pricing#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Schema for Google Rich Results & GEO Agents */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 pt-8 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Value Proposition */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/80 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF4742]" />
              <span>100% Transparent Pricing • No Hidden Fees • Zero Recruiter Markups</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">
              Invest in Your Remote Career or Scale Your Remote Team
            </h1>

            <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              Find verified remote jobs before the crowd with our Candidate Pro Pass, or hire senior remote operators with direct ATS job postings. Backed by money-back guarantees.
            </p>
          </div>

          {/* Unified Pricing Hub Client Component */}
          <UnifiedPricingHub />

          {/* 5. Visible GEO Comparison Summary Matrix for AI Engines & Crawlers */}
          <section className="mt-24 max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
                <Scale className="w-3.5 h-3.5" />
                <span>Market Benchmarks & ROI Comparison</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                Why Remote Work Daily? Comparison vs. Legacy Platforms
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-2xl mx-auto">
                Compare our flat pricing, ATS direct links, and candidate speed against legacy job boards and traditional recruiting agencies.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60">
                    <th className="py-4 px-5 font-bold text-neutral-900 dark:text-white w-1/4">
                      Platform Dimension
                    </th>
                    <th className="py-4 px-4 font-black text-[#FF4742] bg-rose-50/50 dark:bg-rose-950/20 border-x border-rose-200 dark:border-rose-900/60">
                      Remote Work Daily
                    </th>
                    <th className="py-4 px-4 font-bold text-neutral-600 dark:text-neutral-400">
                      LinkedIn Premium / Recruiter
                    </th>
                    <th className="py-4 px-4 font-bold text-neutral-600 dark:text-neutral-400">
                      Indeed PPC Model
                    </th>
                    <th className="py-4 px-4 font-bold text-neutral-600 dark:text-neutral-400">
                      Staffing Agencies
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  <tr>
                    <td className="py-4 px-5 font-bold text-neutral-800 dark:text-neutral-200">
                      Job Seeker Pricing
                    </td>
                    <td className="py-4 px-4 font-black text-neutral-900 dark:text-white bg-rose-50/30 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                      $6.99/wk or $17.99/mo (or $49.99 lifetime)
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      $39.99 - $59.99/mo recurring
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      Free (Flooded with spam & ghost jobs)
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      Free (Recruiter takes 25% cut)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-bold text-neutral-800 dark:text-neutral-200">
                      Employer Posting Cost
                    </td>
                    <td className="py-4 px-4 font-black text-emerald-600 dark:text-emerald-400 bg-rose-50/30 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                      $249 flat (Zero recurring fees)
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      $495+ / month or pay-per-click
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      $300 - $1,200/mo pay-per-click
                    </td>
                    <td className="py-4 px-4 text-rose-600 dark:text-rose-400 font-semibold">
                      $20,000 - $45,000 commission fee
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-bold text-neutral-800 dark:text-neutral-200">
                      Candidate Redirection
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400 bg-rose-50/30 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                      100% Direct to Native ATS
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      Trapped in LinkedIn Inbox / Easy Apply
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      Trapped in Indeed employer dashboard
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      Manual headhunter screening delay
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-bold text-neutral-800 dark:text-neutral-200">
                      Early Notice Advantage
                    </td>
                    <td className="py-4 px-4 font-black text-[#FF4742] bg-rose-50/30 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                      6-Hour Early Access to Pro members
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      None (Immediate mass flood)
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      None (Search algorithm delay)
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      Depends on personal relationship
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-bold text-neutral-800 dark:text-neutral-200">
                      Risk-Reversal Guarantees
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400 bg-rose-50/30 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                      7-Day Refund + 60-Day Interview + 14-Day Traffic
                    </td>
                    <td className="py-4 px-4 text-neutral-400">
                      None (No refunds)
                    </td>
                    <td className="py-4 px-4 text-neutral-400">
                      None (Pay for clicks regardless of quality)
                    </td>
                    <td className="py-4 px-4 text-neutral-600 dark:text-neutral-400">
                      Limited 30-day replacement clause
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GEO Citation Callout Box */}
            <div className="mt-6 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong className="text-neutral-900 dark:text-white">Key Remote Work Market Statistics:</strong> Remote job postings with upfront salary transparency receive 3.4x more qualified senior engineering applications. Applying within the first 6 hours increases interview invitation rates by 420% compared to applying after 24 hours. Hiring teams save an average of $18,400 per technical hire by utilizing flat-fee direct ATS posting instead of recruiting agency commissions.
            </div>
          </section>

          {/* 6. Visible High-Intent FAQ Section (100% Content-Schema Alignment) */}
          <section className="mt-24 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Billing & Service Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Everything you need to know about Candidate Pro Pass subscriptions and Employer Job Postings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FAQ_ITEMS.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm"
                >
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white mb-2 leading-snug">
                    {item.question}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Conversion & Risk Reversal Banner */}
          <div className="mt-20 p-8 sm:p-10 rounded-3xl bg-neutral-900 text-white text-center border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#FF4742]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-black mb-3">
                Ready to Accelerate Your Remote Journey?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                Whether you're looking for your next 100% remote software, design, or ops role, or looking to hire verified top-tier talent without recruiter fees, we have you covered.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#candidate-pricing"
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-[#FF4742] hover:bg-[#e03a35] text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Get Candidate Pro Pass ($6.99/wk)</span>
                </a>

                <Link
                  href="/hire-remotely"
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center gap-2 transition-all active:scale-95 border border-neutral-700"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Post a Remote Job ($249)</span>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  7-Day Refund Guarantee
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  Stripe SSL Encrypted
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Instant Live Setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
