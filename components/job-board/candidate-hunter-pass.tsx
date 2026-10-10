"use client";

import React, { useState, useEffect } from "react";
import { Zap, ArrowRight, X } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

/**
 * Candidate Subscription & Access Top Banner Component.
 *
 * Implements CareerHound.io's subscription-based model:
 * - High-converting comparison banner above the job listings table
 * - Opens global CandidateUpgradeModal via useSubscription().openUpgradeModal()
 */
export function CandidateHunterPass() {
  const { openUpgradeModal } = useSubscription();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem("remotework_hunter_banner_dismissed");
    if (!isDismissed) {
      setTimeout(() => setDismissed(false), 0);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("remotework_hunter_banner_dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 mb-3">
      <div className="relative overflow-hidden rounded-2xl border border-amber-300/60 dark:border-amber-900/40 bg-gradient-to-r from-amber-500/10 via-red-500/5 to-amber-500/10 p-3 sm:p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Tired of 200+ applicants in 1 hour on LinkedIn?
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50">
                  Plans from $6.99/wk • $17.99/mo
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Unlock direct company ATS links (Greenhouse, Lever, Ashby), verified salary benchmarks, and early-bird alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={openUpgradeModal}
              className="flex-1 sm:flex-initial min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold bg-[#FF4742] hover:bg-[#e03a35] text-white active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Explore Direct ATS Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss offer"
              className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
