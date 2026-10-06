"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, CheckCircle2, ShieldCheck, Zap, Search } from "lucide-react";
import { ROLE_CATEGORIES, CANDIDATE_PRICING } from "@/lib/constants";
import { useSubscription } from "@/components/auth/subscription-context";

interface CandidateOnboardingModalProps {
  onSelectCategory: (category: string) => void;
  onOpenUpgradeModal: () => void;
}

export function CandidateOnboardingModal({
  onSelectCategory,
  onOpenUpgradeModal,
}: CandidateOnboardingModalProps) {
  const {
    isSignedIn,
    hasActiveSubscription,
    isOnboardingCompleted,
    markOnboardingCompleted,
  } = useSubscription();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"role" | "scanning" | "offer">("role");
  const [selectedRole, setSelectedRole] = useState<string>("dev");
  const [jobCountFound, setJobCountFound] = useState(142);

  useEffect(() => {
    // If onboarding is already marked completed or user has active subscription, never open
    if (isOnboardingCompleted || hasActiveSubscription) {
      return;
    }

    const seen = typeof window !== "undefined" && localStorage.getItem("rwd_onboarding_completed") === "true";
    const hasSub = typeof window !== "undefined" && localStorage.getItem("remotework_active_subscription") === "true";

    // If user has seen it, has active sub, or is already logged in, do not repeat
    if (seen || hasSub || isSignedIn) {
      if (isSignedIn && !seen) {
        // Authenticated user already signed in: mark completed so it never repeats on future logins
        markOnboardingCompleted();
      }
      return;
    }

    // Only show for first-time unauthenticated visitors 1.2s after arrival
    const timer = setTimeout(() => setIsOpen(true), 1200);
    return () => clearTimeout(timer);
  }, [isOnboardingCompleted, hasActiveSubscription, isSignedIn, markOnboardingCompleted]);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setStep("scanning");
    setJobCountFound(Math.floor(Math.random() * 80) + 120);

    fetch("/api/notifications/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flow: "visitor_modal",
        targetRoles: [roleId],
      }),
    }).catch(() => {});

    setTimeout(() => {
      setStep("offer");
    }, 1400);
  };

  const handleDismiss = () => {
    markOnboardingCompleted();
    setIsOpen(false);
  };

  const handleCompleteAndBrowse = () => {
    markOnboardingCompleted();
    onSelectCategory(selectedRole);
    setIsOpen(false);
  };

  const handleUpgradeFromOnboarding = () => {
    markOnboardingCompleted();
    setIsOpen(false);
    onOpenUpgradeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto my-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 text-left">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1.5 pr-8 sm:pr-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalize Your Direct ATS Feed</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                What role are you targeting?
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                We scrape direct company ATS boards (Greenhouse, Lever, Ashby) across remote, hybrid, and on-site roles so you bypass 200+ applicants on LinkedIn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
              {ROLE_CATEGORIES.filter((c) => c.id !== "all").map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleRoleSelect(category.id)}
                  className="flex items-center gap-2.5 p-3 min-h-[48px] rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4742] dark:hover:border-[#FF4742] hover:bg-red-50/30 dark:hover:bg-red-950/20 text-neutral-900 dark:text-white transition-all text-xs font-bold active:scale-95 text-left group"
                >
                  <span className="text-xl shrink-0">{category.icon}</span>
                  <span className="group-hover:text-[#FF4742] transition-colors truncate">{category.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500">
              <Link
                href="/onboarding"
                onClick={handleDismiss}
                className="font-bold text-blue-600 hover:underline flex items-center gap-1 py-1"
              >
                <span>Full Career Hound Setup &rarr;</span>
              </Link>
              <button
                type="button"
                onClick={handleDismiss}
                className="font-semibold hover:underline text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-left sm:text-right py-1"
              >
                Skip and browse all jobs
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Live Scanning Simulation */}
        {step === "scanning" && (
          <div className="py-10 text-center space-y-4 animate-in fade-in duration-150">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-pulse">
              <Search className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-black text-neutral-900 dark:text-white">
                Scanning 8,500+ Company ATS Career Boards...
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                Extracting unadvertised remote listings from GitLab, Zapier, Automattic, Supabase, Linear, and Cursor...
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Grand Slam Offer / Preview Unlock */}
        {step === "offer" && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1.5 text-center pr-6 sm:pr-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{jobCountFound} Direct ATS Roles Discovered</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                Your Curated Job Stream is Ready
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                You have <strong>25 free preview jobs</strong> unlocked right now. Members unlock the full 2,000+ daily stream with direct application links.
              </p>
            </div>

            {/* CareerHound 3-Tier Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex sm:flex-col justify-between items-center sm:justify-center">
                <span className="text-[10px] font-black uppercase text-neutral-500 block">Weekly Sprint</span>
                <div className="flex items-baseline gap-1 sm:block">
                  <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">$6.99</span>
                  <span className="text-[10px] text-neutral-400">/week</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl border-2 border-[#FF4742] bg-red-50/30 dark:bg-red-950/20 shadow-sm relative flex sm:flex-col justify-between items-center sm:justify-center">
                <span className="sm:absolute sm:-top-2.5 sm:left-1/2 sm:-translate-x-1/2 px-2 py-0.5 rounded-full bg-[#FF4742] text-[9px] font-black uppercase text-white">
                  Popular
                </span>
                <span className="text-[10px] font-black uppercase text-[#FF4742] block">Monthly Pro</span>
                <div className="flex items-baseline gap-1 sm:block">
                  <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">$17.99</span>
                  <span className="text-[10px] text-neutral-400">/month</span>
                </div>
              </div>
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex sm:flex-col justify-between items-center sm:justify-center">
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">Lifetime</span>
                <div className="flex items-baseline gap-1 sm:block">
                  <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">$49.99</span>
                  <span className="text-[10px] text-neutral-400">one-time</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleUpgradeFromOnboarding}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl text-xs sm:text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
              >
                <Zap className="w-4 h-4 fill-current shrink-0" />
                <span>Unlock All Direct ATS Roles (From $6.99/wk)</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteAndBrowse}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center"
              >
                View My 25 Free Preview Jobs First &rarr;
              </button>
            </div>

            <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>7-day unconditional money-back guarantee • Cancel anytime</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
