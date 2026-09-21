import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Remote Work Daily",
  description: "Privacy policy and data protection commitments of Remote Work Daily.",
};

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <div className="space-y-4 text-sm leading-relaxed">
        <p>
          At Remote Work Daily, your privacy is essential to us. We do not sell your personal information.
        </p>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-6">
          1. Information We Collect
        </h2>
        <p>
          When you create an account, post a job, or subscribe to email alerts, we collect your email address and profile information solely to deliver our services.
        </p>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-6">
          2. Cookies & Local Storage
        </h2>
        <p>
          We use local storage only to remember your dark/light theme preference and dismissed alert banners.
        </p>
      </div>
    </div>
  );
}
