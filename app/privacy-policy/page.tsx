import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Remote Work Daily",
  description:
    "Read the Remote Work Daily Privacy Policy. Learn how we protect user data, process candidate passes, and index jobs posted directly on company websites.",
  openGraph: {
    title: "Privacy Policy | Remote Work Daily",
    description: "Our commitments to user privacy, data security, and transparent remote job discovery.",
    url: "https://remoteworkdaily.com/privacy-policy",
    siteName: "Remote Work Daily",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Remote Work Daily",
    description: "Learn how Remote Work Daily protects your data and privacy.",
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 10, 2026";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    description: "Privacy policy and data protection commitments of Remote Work Daily.",
    url: "https://remoteworkdaily.com/privacy-policy",
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
            <Shield className="w-4 h-4" />
            <span>Data Protection & Privacy Standards</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Last Updated: {lastUpdated} • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Policy Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <Lock className="w-5 h-5 text-emerald-500 mb-2" />
            <div className="font-bold text-xs text-neutral-900 dark:text-white">Zero Data Selling</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              We never sell, rent, or trade your personal email or profile information to third parties.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <Eye className="w-5 h-5 text-blue-500 mb-2" />
            <div className="font-bold text-xs text-neutral-900 dark:text-white">Direct ATS Applications</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Applications submit directly to company career sites, keeping candidate profiles private.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <FileText className="w-5 h-5 text-purple-500 mb-2" />
            <div className="font-bold text-xs text-neutral-900 dark:text-white">Full Right to Erasure</div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              You can permanently erase your account, passes, and email data with one click in settings.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              1. Overview & Scope
            </h2>
            <p>
              Remote Work Daily (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates <strong>remoteworkdaily.com</strong>, an online career directory that helps job seekers find verified remote jobs posted directly on company websites with transparent salary compensation. This Privacy Policy describes how we collect, use, and safeguard personal information when you use our website, browse listings, purchase candidate passes, or submit employer job postings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              2. Information We Collect
            </h2>
            <p>
              We collect information to deliver our services, verify listings, and process user inquiries:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account & Contact Information:</strong> When you register an account, post a job, or subscribe to alerts, we collect your name, email address, and optional company details.
              </li>
              <li>
                <strong>Job Alert Preferences:</strong> We store your preferred job categories (engineering, design, marketing), search keywords, and notification frequency.
              </li>
              <li>
                <strong>Billing Information:</strong> Payments for candidate passes and employer postings are securely processed via Stripe or Plaid. We store payment identifiers, plan names, and transaction status; we never store raw credit card numbers or banking passwords on our servers.
              </li>
              <li>
                <strong>Technical Information:</strong> Standard server logs, IP addresses (anonymized), device types, and browser user-agents collected automatically for security and anti-abuse purposes.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              3. Jobs Posted on Company Websites & Scraping Standards
            </h2>
            <p>
              Remote Work Daily indexes job openings straight from public company career portals and official Applicant Tracking Systems (including Greenhouse, Lever, Ashby, and Workable).
            </p>
            <p>
              Our indexing spiders only extract publicly published role titles, job descriptions, transparent salary ranges, and direct application URLs. We <strong>never</strong> crawl candidate databases, user resumes, or private internal employment records.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              4. Cookies and Local Storage
            </h2>
            <p>
              We utilize minimal cookies and local browser storage strictly to enhance user experience:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Remembering your dark/light theme preference.</li>
              <li>Maintaining your active sign-in session via Clerk.</li>
              <li>Remembering dismissed notification banners so you aren&apos;t shown repetitive popups.</li>
            </ul>
            <p>
              We do not utilize invasive cross-site advertising trackers or sell browsing profiles to data brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              5. Third-Party Service Providers
            </h2>
            <p>
              We partner with trusted infrastructure providers who adhere to strict data protection standards:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe & Plaid:</strong> Secure payment gateway and ACH authentication.</li>
              <li><strong>Clerk:</strong> User authentication and session security.</li>
              <li><strong>Resend:</strong> Transactional receipt and job alert email distribution.</li>
              <li><strong>Supabase:</strong> Encrypted persistent relational data storage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              6. Direct ATS Links & External Employer Sites
            </h2>
            <p>
              When applying for a role, Remote Work Daily directs you to the employer&apos;s official website or ATS portal (e.g., boards.greenhouse.io or jobs.lever.co). Once you leave our domain, your submission is governed by the hiring company&apos;s privacy policy. We encourage you to review their terms before submitting sensitive application materials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              7. Your Rights & Account Deletion (GDPR & CCPA)
            </h2>
            <p>
              Regardless of your jurisdiction, we respect your fundamental data privacy rights:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Right of Access & Correction:</strong> Review or update your profile details at any time in the Dashboard.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Right to Erasure (Account Deletion):</strong> You can permanently delete your account, email alerts, and payment records directly from the &ldquo;Settings&rdquo; tab in your Dashboard or by emailing our privacy team.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                <span><strong>Opt-Out of Marketing:</strong> Every newsletter digest includes an immediate 1-click unsubscribe link.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              8. Contact Our Privacy Team
            </h2>
            <p>
              If you have any questions, data requests, or concerns regarding our privacy practices, please contact us:
            </p>
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <div><strong>Remote Work Daily Data Protection</strong></div>
              <div>Email: <a href="mailto:support@remoteworkdaily.com" className="text-[#FF4742] hover:underline">support@remoteworkdaily.com</a></div>
              <div>Contact Portal: <Link href="/contact" className="text-[#FF4742] hover:underline">remoteworkdaily.com/contact</Link></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
