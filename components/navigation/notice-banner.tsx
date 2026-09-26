"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

export function NoticeBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("remotework_notice_dismissed");
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("remotework_notice_dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <div className="relative border-b border-red-200 dark:border-red-950/60 bg-gradient-to-r from-red-50 via-white to-red-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-3.5 px-4 text-center">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
        <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
          <span className="flex h-2 w-2 rounded-full bg-[#FF4742] animate-pulse" />
          <span>
            Post a job to reach <strong className="text-neutral-900 dark:text-white font-extrabold">2,500,000+</strong> remote workers worldwide.
          </span>
        </div>
        <Link
          href="/hire-remotely"
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md bg-[#FF4742] text-white hover:bg-[#e03a35] transition-colors shadow-sm"
        >
          <span>Post a remote job</span>
          <span>→</span>
        </Link>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
