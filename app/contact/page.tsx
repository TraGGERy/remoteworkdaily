import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Clock, Globe, Building2, HelpCircle, ShieldCheck } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact Us | Remote Work Daily",
  description:
    "Get in touch with Remote Work Daily. Submit company career pages, reach employer support, resolve candidate pass inquiries, or report broken ATS application links.",
  openGraph: {
    title: "Contact Us | Remote Work Daily",
    description:
      "Have questions, need employer assistance, or want to index your company's career page? Reach out to the Remote Work Daily team.",
    url: "https://remoteworkdaily.com/contact",
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Remote Work Daily",
    description: "Submit company career pages or get in touch with our remote work team.",
  },
};

export default function ContactPage() {
  const jsonLdContact = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Remote Work Daily",
    description: "Contact information, support channels, and company career page submission for Remote Work Daily.",
    url: "https://remoteworkdaily.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: "Remote Work Daily",
      url: "https://remoteworkdaily.com",
      logo: "https://remoteworkdaily.com/icon.png",
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "support@remoteworkdaily.com",
          contactType: "customer support",
          availableLanguage: ["English"],
        },
        {
          "@type": "ContactPoint",
          email: "employers@remoteworkdaily.com",
          contactType: "sales and employer billing",
          availableLanguage: ["English"],
        },
      ],
    },
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does Remote Work Daily find jobs posted on company websites?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Remote Work Daily continuously ingests and verifies direct employment feeds from top Applicant Tracking Systems including Greenhouse, Lever, Ashby, Workable, and verified company career portals. This direct-to-source indexing eliminates third-party recruiter middleman spam and guarantees active, legitimate positions with transparent salary bands.",
        },
      },
      {
        "@type": "Question",
        name: "Can our hiring team submit our company career page to be indexed for free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Remote-friendly employers with transparent compensation disclosures can submit their public career page or ATS board URL directly through our contact form. Our editorial team reviews and indexes verified company career portals at no cost.",
        },
      },
      {
        "@type": "Question",
        name: "What is the typical response time for support inquiries?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our customer success and technical support team monitors incoming messages 7 days a week and responds to all candidate, employer, and partnership inquiries within 24 business hours.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 px-4 sm:px-6">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContact) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Remote Work Daily</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF4742] px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 inline-block">
            Support & Career Page Submissions
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            Contact <span className="text-[#FF4742]">Remote Work Daily</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Find jobs posted directly on company websites. Need help with an employer listing, candidate account, or want to index your team&apos;s open roles? We&apos;re here to assist.
          </p>
        </div>

        {/* Main Grid: Info Cards + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Ingestion & Contacts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Support Card */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#FF4742]" />
                <span>Direct Inquiries</span>
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                  <div className="font-bold text-neutral-900 dark:text-white">General & Candidate Support</div>
                  <a
                    href="mailto:support@remoteworkdaily.com"
                    className="text-[#FF4742] hover:underline font-mono text-xs mt-0.5 inline-block"
                  >
                    support@remoteworkdaily.com
                  </a>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">
                    Candidate pass activation, login questions, and platform feedback.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800">
                  <div className="font-bold text-neutral-900 dark:text-white">Employers & Invoicing</div>
                  <a
                    href="mailto:employers@remoteworkdaily.com"
                    className="text-[#FF4742] hover:underline font-mono text-xs mt-0.5 inline-block"
                  >
                    employers@remoteworkdaily.com
                  </a>
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">
                    Custom billing, company career page indexing, and hiring campaign assistance.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Typical response time: Under 24 business hours.</span>
              </div>
            </div>

            {/* ATS Ingestion Highlights */}
            <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#FF4742]" />
                <span>Find Jobs Posted on Company Websites</span>
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Remote Work Daily crawls and indexes official company career portals powered by Greenhouse, Lever, Ashby, Workable, and custom applicant tracking systems.
              </p>
              <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% verified employer links (Zero recruiter middlemen)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Mandatory salary transparency on every role</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real remote, hybrid, and flexible global positions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* Semantic FAQ Section for AI Search & Featured Snippets */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#FF4742]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Clear, transparent answers on how Remote Work Daily connects talent with company website career pages.
            </p>
          </div>

          <div className="space-y-4">
            <article className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                How does Remote Work Daily find jobs posted on company websites?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Remote Work Daily continuously indexes public employment feeds directly from verified Applicant Tracking Systems including Greenhouse, Lever, Ashby, and company career pages. Rather than republishing aggregator spam or recruiter-reposted ads, each listing links job seekers directly to the official employer application form with verified pay rates.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                Can our hiring team submit our company career page to be indexed for free?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Yes. If your company hires remote workers and provides transparent salary ranges in job listings, select &ldquo;Submit Company Career Page / ATS Feed&rdquo; in the form above and provide your public jobs board URL. Our editorial team reviews feeds daily and indexes verified company openings at no cost.
              </p>
            </article>

            <article className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                How can I report a closed role or broken application link?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Select &ldquo;Report Broken Link or Ghost Listing&rdquo; in the contact form or email support@remoteworkdaily.com with the job URL. We maintain a strict Zero Ghost Jobs policy and immediately verify or archive expired positions from our live index.
              </p>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
