import { Metadata } from "next";
import {
  CandidateHero,
  CandidatePainAgitation,
  CandidateValuePillars,
  CandidateComparisonTable,
  CandidateTestimonials,
  CandidateFaq,
} from "@/components/landing/candidate-landing-sections";
import { ProPricingCards } from "@/components/pricing/pro-pricing-cards";

export const metadata: Metadata = {
  title: "Remote Work Daily Pro — Beat 500+ Applicants with 6-Hour Early Access",
  description:
    "Stop being applicant #600 on LinkedIn. Get 6-hour early access to fresh remote jobs from company career portals, direct hiring manager emails, and AI resume tailoring. From $5.99/wk with 7-day guarantee.",
  keywords: [
    "remote job early access",
    "remote work pro pass",
    "direct ats job alerts",
    "hiring manager emails",
    "bypass linkedin applicant flood",
    "remote career early alerts",
    "remote job search subscription",
  ],
  alternates: {
    canonical: "https://remoteworkdaily.com/pro",
  },
  openGraph: {
    title: "Remote Work Daily Pro — 6-Hour Early Access & Direct ATS Links",
    description:
      "Be among the first 15 applicants. 6-hour early access to company career portals, direct HR contacts, and AI resume tailoring. Backed by a 7-day 100% money-back guarantee.",
    url: "https://remoteworkdaily.com/pro",
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Work Daily Pro — Early Access Remote Job Alerts",
    description: "Beat 500+ applicants with 6-hour early access and direct HR contact emails.",
  },
};

export default function ProPage() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can I cancel my subscription anytime?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can cancel with 1 click directly in your billing settings or by emailing support@remoteworkdaily.com. Your access will remain active through the end of your billing cycle without unexpected renewals.",
        },
      },
      {
        "@type": "Question",
        name: "How does the 7-day 100% money-back guarantee work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If you are not completely satisfied with Remote Work Daily Pro for any reason during your first 7 days, email support@remoteworkdaily.com and our team will issue an immediate, no-questions-asked 100% refund.",
        },
      },
      {
        "@type": "Question",
        name: "What is the 60-Day Interview Guarantee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If you apply to at least 15 verified roles using Pro within 60 days and do not receive at least 2 recruiter screening invitations, we will refund 100% of your subscription fees upon request.",
        },
      },
      {
        "@type": "Question",
        name: "How do you source the verified HR emails?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our team and automated scrapers verify company talent acquisition contacts and hiring managers using public company filings, team directories, and professional networks, validating each email against active SMTP mail exchangers.",
        },
      },
      {
        "@type": "Question",
        name: "Will this work if I am looking for worldwide or international roles?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Over 60% of our listings are open to applicants worldwide or across Europe, the Americas, and APAC.",
        },
      },
    ],
  };

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Remote Work Daily Pro Access Pass",
    description:
      "6-hour early access subscription pass to direct company ATS portals with verified HR emails and AI resume tailor tools.",
    offers: [
      {
        "@type": "Offer",
        name: "Weekly Sprint",
        price: "5.99",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        url: "https://remoteworkdaily.com/pro",
      },
      {
        "@type": "Offer",
        name: "Monthly Pro",
        price: "17.00",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        url: "https://remoteworkdaily.com/pro",
      },
      {
        "@type": "Offer",
        name: "Lifetime Access",
        price: "49.00",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        url: "https://remoteworkdaily.com/pro",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />

      {/* Hero & Hook */}
      <CandidateHero />

      {/* Agitation & Contrast */}
      <CandidatePainAgitation />

      {/* Core Value Pillars */}
      <CandidateValuePillars />

      {/* Free vs Pro Comparison */}
      <CandidateComparisonTable />

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-neutral-100/50 dark:bg-neutral-900/30 border-y border-neutral-200/80 dark:border-neutral-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-xs font-bold text-[#FF4742] mb-3">
              Simple, Transparent Pricing
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
              Choose the Plan That Matches Your Job Search
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
              Every plan includes 6-hour early access, verified HR contact emails, and our unconditional 7-day money-back guarantee.
            </p>
          </div>

          <ProPricingCards />
        </div>
      </section>

      {/* Testimonials */}
      <CandidateTestimonials />

      {/* Candidate FAQ */}
      <CandidateFaq />
    </div>
  );
}
