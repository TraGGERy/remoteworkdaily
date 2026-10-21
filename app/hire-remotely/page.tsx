import { Metadata } from "next";
import { JobPostForm } from "@/components/post-job/job-post-form";
import {
  EmployerHero,
  EmployerTrustLogos,
  EmployerComparisonTable,
  EmployerValuePillars,
  EmployerTestimonials,
  EmployerFaq,
} from "@/components/landing/employer-landing-sections";

export const metadata: Metadata = {
  title: "Post a Remote Job | Reach 2,500,000+ Remote Workers — $249 Flat",
  description:
    "Hire senior remote engineers, designers, and product leaders without $20k recruiter markups. Direct ATS redirection to Greenhouse, Lever, Ashby, with automated Google Jobs schema.",
  keywords: [
    "post remote job",
    "hire remote engineers",
    "remote job board post",
    "post tech job",
    "greenhouse job syndication",
    "remote developer hiring",
    "ats job board",
  ],
  alternates: {
    canonical: "https://remoteworkdaily.com/hire-remotely",
  },
  openGraph: {
    title: "Post a Remote Job | Remote Work Daily",
    description:
      "Direct ATS applications from 2,500,000+ verified remote engineers and operators. Post for $249 flat with 14-day quality guarantee.",
    url: "https://remoteworkdaily.com/hire-remotely",
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire Senior Remote Talent Without Recruiter Markups ($249)",
    description: "Post a verified remote role with direct ATS redirection and Google Jobs schema.",
  },
};

export default function HireRemotelyPage() {
  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How long does my job posting remain live?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every listing stays active on Remote Work Daily for a full 30 days. You can also extend or renew the posting at any time, or add the 'Sticky Pin' upgrade to keep your post at the top.",
        },
      },
      {
        "@type": "Question",
        name: "Where do candidate applications go?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Directly into your company's existing ATS (Greenhouse, Lever, Ashby, Workable, BambooHR, or custom URL). You do not need a separate dashboard.",
        },
      },
      {
        "@type": "Question",
        name: "What is the 14-Day Candidate Quality Guarantee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If your job posting does not receive qualified applicant traffic within the first 14 days, email support@remoteworkdaily.com and our team will extend your listing for an extra 30 days or apply a free promotional boost.",
        },
      },
      {
        "@type": "Question",
        name: "Does posting include Google Jobs Schema indexing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every job listing automatically includes validated JobPosting JSON-LD structured data with transparent salary bands and workplace location metadata.",
        },
      },
      {
        "@type": "Question",
        name: "Can I pay by corporate card or receive a tax invoice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All transactions are securely processed through Stripe with instant itemized receipts and tax invoices sent to your billing email.",
        },
      },
    ],
  };

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Remote Work Daily 30-Day Employer Job Posting",
    description:
      "Direct ATS candidate redirection job posting reaching 2,500,000+ remote workers with Google Jobs schema syndication.",
    offers: {
      "@type": "Offer",
      price: "249.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://remoteworkdaily.com/hire-remotely",
      priceValidUntil: "2027-12-31",
    },
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

      {/* Top Conversion & Value Sections */}
      <EmployerHero />
      <EmployerTrustLogos />
      <EmployerComparisonTable />
      <EmployerValuePillars />
      <EmployerTestimonials />

      {/* Embedded Job Post Creation Engine */}
      <div id="post-job" className="py-12 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-xs font-bold text-[#FF4742] mb-3">
            Simple 2-Minute Setup
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Create Your Remote Job Listing
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Configure your role details, compensation range, and direct ATS application link. Preview updates in real-time.
          </p>
        </div>

        <JobPostForm />
      </div>

      {/* Employer FAQ */}
      <EmployerFaq />
    </div>
  );
}
