"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, CheckCircle2, ShieldCheck, Zap, Search } from "lucide-react";
import { ROLE_CATEGORIES, CANDIDATE_PRICING } from "@/lib/constants";

interface CandidateOnboardingModalProps {
  onSelectCategory: (category: string) => void;
  onOpenUpgradeModal: () => void;
}

export function CandidateOnboardingModal({
  onSelectCategory,
  onOpenUpgradeModal,
}: CandidateOnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"role" | "scanning" | "offer">("role");
  const [selectedRole, setSelectedRole] = useState<string>("dev");
  const [jobCountFound, setJobCountFound] = useState(142);

  useEffect(() => {
    // Check if candidate already completed or dismissed onboarding, or has active subscription
    const seen = localStorage.getItem("rwd_onboarding_completed");
    const hasSub = localStorage.getItem("remotework_active_subscription") === "true";
    if (!seen && !hasSub) {
      // Show onboarding 1.2s after arrival
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setStep("scanning");
    setJobCountFound(Math.floor(Math.random() * 80) + 120);

    setTimeout(() => {
      setStep("offer");
    }, 1400);
  };

  const handleDismiss = () => {
    localStorage.setItem("rwd_onboarding_completed", "true");
    setIsOpen(false);
  };

  const handleCompleteAndBrowse = () => {
    localStorage.setItem("rwd_onboarding_completed", "true");
    onSelectCategory(selectedRole);
    setIsOpen(false);
  };

  const handleUpgradeFromOnboarding = () => {
    localStorage.setItem("rwd_onboarding_completed", "true");
    setIsOpen(false);
    onOpenUpgradeModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl space-y-6 text-left">
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1.5 rounded-lg"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Role Selection */}
        {step === "role" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalize Your Direct ATS Feed</span>
              </div>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                What role are you targeting?
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                We scrape direct company ATS boards (Greenhouse, Lever, Ashby) across remote, hybrid, and on-site roles so you bypass 200+ applicants on LinkedIn.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {ROLE_CATEGORIES.filter((c) => c.id !== "all").map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleRoleSelect(category.id)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4742] dark:hover:border-[#FF4742] hover:bg-red-50/30 dark:hover:bg-red-950/20 text-neutral-900 dark:text-white transition-all text-xs font-bold active:scale-95 text-left group"
                >
                  <span className="text-xl">{category.icon}</span>
                  <span className="group-hover:text-[#FF4742] transition-colors">{category.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
              <Link
                href="/onboarding"
                onClick={handleDismiss}
                className="font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Full Career Hound Setup &rarr;</span>
              </Link>
              <button
                type="button"
                onClick={handleDismiss}
                className="font-semibold hover:underline text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
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
            <div className="space-y-1.5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{jobCountFound} Direct ATS Roles Discovered</span>
              </div>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                Your Curated Job Stream is Ready
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                You have <strong>25 free preview jobs</strong> unlocked right now. Members unlock the full 2,000+ daily stream with direct application links.
              </p>
            </div>

            {/* CareerHound 3-Tier Value Cards */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
                <span className="text-[9px] font-black uppercase text-neutral-500 block">Weekly</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white">$6.99</span>
                <span className="text-[10px] text-neutral-400 block">/week</span>
              </div>
              <div className="p-3 rounded-2xl border-2 border-[#FF4742] bg-red-50/30 dark:bg-red-950/20 shadow-sm relative">
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[#FF4742] text-[8px] font-black uppercase text-white">
                  Popular
                </span>
                <span className="text-[9px] font-black uppercase text-[#FF4742] block">Monthly</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white">$17.99</span>
                <span className="text-[10px] text-neutral-400 block">/month</span>
              </div>
              <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40">
                <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">Lifetime</span>
                <span className="text-lg font-black text-neutral-900 dark:text-white">$49.99</span>
                <span className="text-[10px] text-neutral-400 block">one-time</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleUpgradeFromOnboarding}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Unlock All Direct ATS Roles (From $6.99/wk)</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteAndBrowse}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
