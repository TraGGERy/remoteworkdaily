import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Remote Work Daily",
  description: "Terms and conditions for employers and candidates on Remote Work Daily.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-neutral-800 dark:text-neutral-200">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Remote Work Daily</span>
      </Link>
      <h1 className="text-3xl font-black mb-6 text-neutral-900 dark:text-white">
        Terms of Service
      </h1>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          Welcome to Remote Work Daily. By using our website and services, you agree to these terms.
        </p>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-6">
          1. Job Postings & Employers
        </h2>
        <p>
          Employers agree that all posted jobs must be legitimate remote opportunities with accurate compensation (#OpenSalaries). Postings remain active for 30 days unless renewed.
        </p>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-6">
          2. Job Seekers
        </h2>
        <p>
          Remote Work Daily is completely free for job seekers to browse, search, and apply directly to verified employers.
        </p>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-6">
          3. Syndication & Machine-Readable Feeds
        </h2>
        <p>
          Our public JSON feed at <code>/remote-jobs.json</code> and <code>/llms.txt</code> are provided for syndication, research, and machine discovery.
        </p>
      </div>
    </div>
  );
}
