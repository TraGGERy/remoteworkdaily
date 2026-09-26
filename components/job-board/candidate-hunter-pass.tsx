"use client";

import React, { useState, useEffect } from "react";
import { CANDIDATE_PRICING, CandidatePlanId } from "@/lib/constants";
import { Zap, ShieldCheck, CheckCircle2, X, Sparkles, ArrowRight, Lock, Check, XCircle } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

/**
 * Candidate Subscription & Access Component.
 *
 * Implements CareerHound.io's subscription-based model:
 * 1. Multi-tier plans: Weekly ($6.99/wk), Monthly ($17.99/mo), Lifetime ($49.99).
 * 2. High-converting comparison: LinkedIn/Indeed auto-rejections vs Direct ATS application.
 * 3. Double-layer risk reversal: 7-day unconditional refund policy + 60-day interview guarantee.
 */
export function CandidateHunterPass() {
  const {
    isUpgradeModalOpen,
    setUpgradeModalOpen,
    simulateSubscription,
    userEmail,
  } = useSubscription();

  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<CandidatePlanId>("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  // Sync with global upgrade modal trigger
  useEffect(() => {
    if (isUpgradeModalOpen) {
      setIsOpen(true);
    }
  }, [isUpgradeModalOpen]);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (userEmail && !email) {
      setEmail(userEmail);
    }
  }, [userEmail, email]);

  useEffect(() => {
    const isDismissed = localStorage.getItem("remotework_hunter_banner_dismissed");
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("remotework_hunter_banner_dismissed", "true");
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setUpgradeModalOpen(false);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, planId: selectedPlan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        setPurchased(true);
        simulateSubscription(true);
      } else {
        alert(data.error || "Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error("Candidate checkout error:", err);
      alert("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activePlanDetails = CANDIDATE_PRICING.plans[selectedPlan];

  return (
    <>
      {/* Top Banner above Job Table */}
      {!dismissed && (
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
                    Unlock direct company ATS links (Greenhouse, Lever, Ashby), 24h freshness filter, and early-bird alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF4742] hover:bg-[#e03a35] text-white active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Explore Direct ATS Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label="Dismiss offer"
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive CareerHound-Style Subscription Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl my-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-7 shadow-2xl space-y-5">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {purchased ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                  Direct ATS Membership Activated!
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                  Direct company application links are now completely unlocked for <strong>{email}</strong> on plan: <strong>{activePlanDetails.name}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FF4742] text-white hover:bg-[#e03a35]"
                >
                  Start Applying Directly
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Direct-From-Source Job Discovery</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                    Find Remote Jobs <span className="text-[#FF4742]">Not</span> on LinkedIn or Indeed
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    We scrape company career websites and ATS boards directly. Bypass 200+ automated LinkedIn applicants.
                  </p>
                </div>

                {/* Comparison Card: LinkedIn/Indeed vs Remote Work Daily ATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-xs">
                  <div className="space-y-1.5 p-2 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30">
                    <span className="font-extrabold text-red-600 dark:text-red-400 block mb-1">
                      ❌ LinkedIn & Indeed
                    </span>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>200+ applicants within 1 hour</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>Ghost postings & auto-rejections</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>Recruiter middlemen fees</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">
                      ✅ Remote Work Daily Direct ATS
                    </span>
                    <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Direct link to company hiring portal</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>High interview screening reply rate</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>100% #OpenSalaries benchmarked</span>
                    </div>
                  </div>
                </div>

                {/* 3-Tier Subscription Selector (CareerHound model) */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Choose Your Access Plan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Weekly Tier */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("weekly")}
                      className={`relative p-3 rounded-2xl border text-left transition-all ${
                        selectedPlan === "weekly"
                          ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20 shadow-md ring-2 ring-[#FF4742]/30"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        Sprint Search
                      </span>
                      <div className="mt-2">
                        <span className="text-xl font-black text-neutral-900 dark:text-white">$6.99</span>
                        <span className="text-xs text-neutral-500">/week</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-tight">
                        Auto-renews weekly. Cancel anytime.
                      </p>
                    </button>

                    {/* Monthly Tier (Most Popular) */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("monthly")}
                      className={`relative p-3 rounded-2xl border text-left transition-all ${
                        selectedPlan === "monthly"
                          ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20 shadow-md ring-2 ring-[#FF4742]/30"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-[#FF4742] border border-[#FF4742]/40">
                        Most Popular
                      </span>
                      <div className="mt-2">
                        <span className="text-xl font-black text-neutral-900 dark:text-white">$17.99</span>
                        <span className="text-xs text-neutral-500">/month</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-tight">
                        Standard active search. Cancel anytime.
                      </p>
                    </button>

                    {/* Lifetime Tier */}
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("lifetime")}
                      className={`relative p-3 rounded-2xl border text-left transition-all ${
                        selectedPlan === "lifetime"
                          ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20 shadow-md ring-2 ring-[#FF4742]/30"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Best Value
                      </span>
                      <div className="mt-2">
                        <span className="text-xl font-black text-neutral-900 dark:text-white">$49.99</span>
                        <span className="text-xs text-neutral-500"> one-time</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-tight">
                        Pay once. Never pay again.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Selected Plan Features */}
                <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  {activePlanDetails.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Guarantees Box */}
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-200 block">7-Day Unconditional Money-Back Guarantee</span>
                      <span className="text-[10px] text-emerald-400/90">
                        Full refund if not 100% satisfied. Plus 60-day recruiter interview guarantee.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Form */}
                <form onSubmit={handlePurchase} className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Your Email (for instant ATS link activation)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isProcessing
                        ? "Processing..."
                        : selectedPlan === "lifetime"
                        ? `Get Lifetime Access ($${activePlanDetails.price})`
                        : `Subscribe to ${activePlanDetails.name} ($${activePlanDetails.price}/${activePlanDetails.interval})`}
                    </span>
                  </button>

                  <div className="text-center space-y-0.5">
                    <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                      {activePlanDetails.billingTerms}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Secure checkout encrypted with Stripe. Cancel anytime in 1-click.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

