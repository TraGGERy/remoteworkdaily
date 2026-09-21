"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "../theme/theme-toggle";
import { AuthButtons } from "../auth/auth-buttons";
import { Briefcase, Menu, X, Sparkles, ShieldCheck } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-[#FF4742] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-md group-hover:scale-105 transition-transform">
              RWD
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
                Remote Work <span className="text-[#FF4742]">Daily</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-[#FF4742] px-1.5 py-0.5 rounded-full border border-red-200 dark:border-red-900/40">
                  #OpenSalaries
                </span>
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium hidden sm:inline">
                Verified Remote Jobs Updated Daily
              </span>
            </div>
          </Link>
        </div>

        {/* Center/Desktop navigation shortcuts */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          <Link
            href="/remote-dev-jobs"
            className="hover:text-[#FF4742] transition-colors"
          >
            🤓 Developers
          </Link>
          <Link
            href="/remote-design-jobs"
            className="hover:text-[#FF4742] transition-colors"
          >
            🎨 Designers
          </Link>
          <Link
            href="/remote-marketing-jobs"
            className="hover:text-[#FF4742] transition-colors"
          >
            🚥 Marketing
          </Link>
          <Link
            href="/tools/remote-savings-calculator"
            className="inline-flex items-center gap-1 font-bold text-[#FF4742] hover:text-[#e03a35] transition-colors"
          >
            <span>🧮</span>
            <span>WFH Calculator</span>
          </Link>
          <Link
            href="/remote-jobs.json"
            target="_blank"
            className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-mono transition-colors"
          >
            API
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Health Insurance nomad link */}
          <Link
            href="https://safetywing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nomad Health</span>
          </Link>

          {/* Post a Job CTA */}
          <Link
            href="/hire-remotely"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-sm hover:shadow transition-all active:scale-95"
          >
            <span>Post a job</span>
            <span className="hidden sm:inline">→</span>
          </Link>

          {/* Auth & Theme buttons */}
          <AuthButtons />
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/remote-dev-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 font-medium"
            >
              🤓 Dev Jobs
            </Link>
            <Link
              href="/remote-design-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 font-medium"
            >
              🎨 Design Jobs
            </Link>
            <Link
              href="/remote-marketing-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 font-medium"
            >
              🚥 Marketing Jobs
            </Link>
            <Link
              href="/remote-exec-jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 font-medium"
            >
              💼 Executive Jobs
            </Link>
            <Link
              href="/tools/remote-savings-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded bg-red-50 dark:bg-red-950/40 text-[#FF4742] font-bold flex items-center gap-1.5"
            >
              <span>🧮</span>
              <span>Free WFH Commute Calculator</span>
            </Link>
          </div>
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
            <Link href="/remote-jobs.json" target="_blank" className="font-mono underline">
              JSON Feed
            </Link>
            <Link href="/hire-remotely" className="font-bold text-[#FF4742]">
              Post a remote job for $249
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
