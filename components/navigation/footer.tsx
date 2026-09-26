import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 transition-colors mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="font-bold text-neutral-800 dark:text-neutral-200">
            © {new Date().getFullYear()} Remote Work Daily
          </span>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">|</span>
          <span>Verified Remote Work & #OpenSalaries Directory</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
          <Link href="/remote-dev-jobs" className="hover:text-[#FF4742] transition-colors">
            Engineering
          </Link>
          <Link href="/remote-design-jobs" className="hover:text-[#FF4742] transition-colors">
            Design
          </Link>
          <Link href="/remote-marketing-jobs" className="hover:text-[#FF4742] transition-colors">
            Marketing
          </Link>
          <Link href="/tools/remote-savings-calculator" className="hover:text-[#FF4742] transition-colors">
            WFH Savings Calculator
          </Link>
          <Link
            href="https://safetywing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF4742] transition-colors"
          >
            Nomad Health Insurance
          </Link>
          <Link href="/remote-jobs.json" target="_blank" className="hover:text-[#FF4742] transition-colors">
            API Feed
          </Link>
          <Link href="/hire-remotely" className="hover:text-[#FF4742] transition-colors">
            Post a Job ($249)
          </Link>
          <Link href="/privacy" className="hover:text-[#FF4742] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#FF4742] transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
