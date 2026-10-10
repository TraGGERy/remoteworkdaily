import Link from "next/link";
import { ArrowLeft, Briefcase, Calculator, Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/50 text-[#FF4742] font-black text-2xl mb-6 shadow-sm border border-red-200 dark:border-red-900/40">
          404
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-3">
          Page Not Found
        </h1>

        <p className="text-base text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
          The page or job listing you are looking for may have been filled, archived under our 30-day zero-stale policy, or moved.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-bold text-sm transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Verified Remote Jobs
          </Link>
          <Link
            href="/hire-remotely"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-sm transition-all border border-neutral-300 dark:border-neutral-800 shadow-sm"
          >
            <Building2 className="w-4 h-4" />
            Post a Job ($249)
          </Link>
        </div>

        {/* Popular Navigation Shortcuts */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 text-left">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 text-center">
            Popular Remote Categories
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/remote-software-dev-jobs"
              className="p-3 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-2 font-medium"
            >
              <Briefcase className="w-4 h-4 text-[#FF4742]" />
              Engineering Jobs
            </Link>
            <Link
              href="/remote-marketing-jobs"
              className="p-3 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-2 font-medium"
            >
              <Briefcase className="w-4 h-4 text-[#FF4742]" />
              Marketing Jobs
            </Link>
            <Link
              href="/remote-design-jobs"
              className="p-3 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-2 font-medium"
            >
              <Briefcase className="w-4 h-4 text-[#FF4742]" />
              Design & Creative
            </Link>
            <Link
              href="/tools/remote-savings-calculator"
              className="p-3 rounded-lg bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors flex items-center gap-2 font-medium"
            >
              <Calculator className="w-4 h-4 text-[#FF4742]" />
              WFH Savings Tool
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
