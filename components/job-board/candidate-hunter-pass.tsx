"use client";

import React, { useState, useEffect } from "react";
import { Zap, ArrowRight, X, Check, ShieldCheck, Clock, Building2 } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

/**
 * High-Converting Candidate Direct-ATS Visual CTA Banner.
 *
 * Implements high-converting psychological conversion patterns:
 * - Pain vs Relief comparison (LinkedIn 500+ applicants vs Direct ATS top 15)
 * - Social proof & live activity signals (Verified Greenhouse / Lever / Ashby)
 * - Interactive click-through that triggers the global checkout modal
 * - Risk reversal (7-day money-back guarantee, cancel anytime)
 */
export function CandidateHunterPass() {
  const { openUpgradeModal, hasActiveSubscription } = useSubscription();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("remotework_hunter_banner_dismissed");
    if (!isDismissed) {
      setTimeout(() => setDismissed(false), 0);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem("remotework_hunter_banner_dismissed", "true");
  };

  // If already subscribed or user dismissed in this session, don't show
  if (hasActiveSubscription || dismissed) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 mb-4">
      <div
        onClick={openUpgradeModal}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-amber-300/80 dark:border-amber-800/80 bg-gradient-to-br from-amber-500/10 via-red-500/5 to-amber-500/15 p-4 sm:p-5 shadow-lg shadow-amber-500/5 hover:border-amber-400 dark:hover:border-amber-700 transition-all duration-300"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-[#FF4742]/20 to-amber-500/20 blur-3xl rounded-full" />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Column: Hook & Contrast Visual */}
          <div className="flex-1 space-y-2.5">
            {/* Live Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>6-Hour Early Access</span>
              </span>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Direct company ATS feeds updated hourly</span>
              </span>
            </div>

            {/* Headline */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white tracking-tight leading-snug">
                Stop Being Applicant <span className="text-[#FF4742]">#500 on LinkedIn</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl mt-0.5">
                Bypass recruiter black holes. Apply directly to verified openings at GitLab, Supabase, Linear, and Stripe straight from their official ATS career portals.
              </p>
            </div>

            {/* Pain vs Relief Comparison Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-100/80 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                <span className="font-extrabold text-red-600">✕</span>
                <span>LinkedIn / Indeed: 500+ applicants • Recruiter ghosting</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50">
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span>Remote Work Daily: First 15 applicants • Direct ATS link</span>
              </div>
            </div>
          </div>

          {/* Right Column: CTA Action & Pricing Reversal */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-start lg:items-end gap-2 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={openUpgradeModal}
              data-ml-goal="pricing_cta"
              data-ml-goal-location="hunter_pass_banner"
              className="w-full lg:w-auto min-h-[46px] px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/25 group-hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current shrink-0" />
              <span>Unlock Direct ATS Feeds (From $6.99/wk)</span>
              <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center justify-between lg:justify-end gap-3 w-full text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>7-Day Guarantee</span>
              </span>
              <span>•</span>
              <span>Cancel Anytime</span>
              <span>•</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200">Greenhouse, Lever & Ashby</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
