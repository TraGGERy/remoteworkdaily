import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, Scale, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service & Conditions | Remote Work Daily",
  description:
    "Review the Remote Work Daily Terms and Conditions. Employer job posting rules, candidate direct ATS application policies, and transparent salary standards.",
  openGraph: {
    title: "Terms and Conditions | Remote Work Daily",
    description: "Terms of service, employer policies, and candidate application terms on Remote Work Daily.",
    url: "https://remoteworkdaily.com/terms-and-conditions",
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Remote Work Daily",
    description: "Employer posting standards and candidate terms for Remote Work Daily.",
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "October 10, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service and Conditions",
    description: "Terms and conditions for employers and job seekers on Remote Work Daily.",
    url: "https://remoteworkdaily.com/terms-and-conditions",
    dateModified: "2026-10-10",
    publisher: {
      "@type": "Organization",
      name: "Remote Work Daily",
      url: "https://remoteworkdaily.com",
    },
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 px-4 sm:px-6 text-neutral-800 dark:text-neutral-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Remote Work Daily</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4742]">
            <Scale className="w-4 h-4" />
            <span>Platform Agreement & Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            Terms of Service & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Last Updated: {lastUpdated} • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Core Principles Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
            <div className="font-bold text-xs text-neutral-900 dark:text-white">Direct Company Jobs</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              We connect candidates directly to official company career portals with zero recruiter middleman.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <FileText className="w-5 h-5 text-blue-500 mb-2" />
            <div className="font-bold text-xs text-neutral-900 dark:text-white">Mandatory Salary Transparency</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              All listings require or prominently disclose verified upfront compensation bands.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <AlertCircle className="w-5 h-5 text-amber-500 mb-2" />
            <div className="font-bold text-xs text-neutral-900 dark:text-white">Zero Ghost Listings</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Stale listings are automatically pruned or archived after 30 days to preserve listing freshness.
            </p>
          </div>
        </div>

        {/* Terms Body */}
        <div className="space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using <strong>remoteworkdaily.com</strong> (&ldquo;Remote Work Daily,&rdquo; &ldquo;we,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms of Service and Conditions. If you do not agree to these terms, please do not use our platform or services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              2. Platform Service Scope & Direct Company Website Index
            </h2>
            <p>
              Remote Work Daily is an employment discovery platform designed to help job seekers find remote, hybrid, and flexible jobs posted directly on company websites and official Applicant Tracking Systems (ATS) including Greenhouse, Lever, Ashby, and Workable.
            </p>
            <p>
              Remote Work Daily is not an employer, staffing agency, or recruitment intermediary. We do not participate in employment negotiations, interview decisions, or employment contracts between job seekers and employers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              3. Employer Job Postings & Payment Terms
            </h2>
            <p>
              Employers posting job listings on Remote Work Daily agree to the following commitments:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Legitimacy & Accuracy:</strong> All job postings must represent genuine, active employment opportunities. Multi-level marketing (MLM), commission-only schemes, and fraudulent listings are strictly prohibited and removed immediately without refund.
              </li>
              <li>
                <strong>Salary Transparency:</strong> Employers must provide honest, realistic compensation ranges for all published positions.
              </li>
              <li>
                <strong>Listing Fees & Duration:</strong> Standard single-job posts are billed at $249 USD for a 30-day active listing. Payment is processed securely via Stripe or Plaid. Optional visibility add-ons (sticky placement, email newsletter blast, highlight colors) are billed at the published rates during checkout.
              </li>
              <li>
                <strong>Auto-Archive:</strong> Active postings expire automatically after 30 days unless renewed by the employer.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              4. Candidate Access & Subscription Passes
            </h2>
            <p>
              Job seekers may freely search, filter, and review remote listings on Remote Work Daily. Direct ATS application links, early alert notifications, and unlimited discovery are available through optional candidate passes.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>No Long-Term Lock-In:</strong> Recurring subscriptions (monthly or quarterly) can be cancelled at any time directly through the Dashboard settings or the Stripe Customer Portal.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Self-Service Account Erasure:</strong> Users can permanently delete their candidate account and associated metadata at any time.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              5. Refund Policy
            </h2>
            <p>
              We pride ourselves on hiring success and customer satisfaction:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Employers:</strong> If a job listing fails to receive qualified applicants due to technical error on our platform within the first 7 days, contact employers@remoteworkdaily.com for a free repost or full refund.</li>
              <li><strong>Candidates:</strong> Candidate passes and subscriptions may be refunded within 48 hours of purchase if you are dissatisfied with our indexing service.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              6. Machine-Readable Feeds & AI Access Rights
            </h2>
            <p>
              Remote Work Daily publishes a public JSON feed at <Link href="/remote-jobs.json" className="text-[#FF4742] underline">/remote-jobs.json</Link> and structured AI guidance at <Link href="/llms.txt" className="text-[#FF4742] underline">/llms.txt</Link>. Search engines, AI assistants, and research crawlers are granted permission to index and cite our publicly published compensation benchmarks and job details, provided proper attribution is maintained.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              7. Disclaimers & Limitation of Liability
            </h2>
            <p>
              Remote Work Daily provides all services on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. While we make every reasonable effort to verify job listings and employer domains, we cannot guarantee the hiring outcome, employment conditions, or safety of third-party employer websites. In no event shall Remote Work Daily be liable for indirect, incidental, or consequential damages resulting from your use of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              8. Contact & Legal Notices
            </h2>
            <p>
              For questions regarding these Terms, billing disputes, or legal inquiries, please contact:
            </p>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div><strong>Remote Work Daily Legal Team</strong></div>
              <div>Email: <a href="mailto:support@remoteworkdaily.com" className="text-[#FF4742] hover:underline">support@remoteworkdaily.com</a></div>
              <div>Help & Inquiries: <Link href="/contact" className="text-[#FF4742] hover:underline">remoteworkdaily.com/contact</Link></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
