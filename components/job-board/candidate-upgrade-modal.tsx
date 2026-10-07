"use client";

import React, { useState, useEffect } from "react";
import { CANDIDATE_PRICING, CandidatePlanId } from "@/lib/constants";
import { Zap, ShieldCheck, CheckCircle2, X, Sparkles, Lock, Check, XCircle, ArrowRight } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

export function CandidateUpgradeModal() {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    simulateSubscription,
    refreshSubscription,
    userEmail,
  } = useSubscription();

  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<CandidatePlanId>("weekly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  // Cross-device restore state
  const [restoreMode, setRestoreMode] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "success" | "not_found" | "error">("idle");
  const [isRestoring, setIsRestoring] = useState(false);

  // Sync email from user context or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("remotework_user_email") || localStorage.getItem("remotework_employer_email") || "";
      if (userEmail) {
        setEmail(userEmail);
      } else if (stored && !email) {
        setEmail(stored);
      }
    }
  }, [userEmail, email]);

  if (!isUpgradeModalOpen) return null;

  const activePlanDetails = CANDIDATE_PRICING.plans[selectedPlan] || CANDIDATE_PRICING.plans.weekly;

  const handleClose = () => {
    setPurchased(false);
    setRestoreMode(false);
    setRestoreStatus("idle");
    closeUpgradeModal();
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    const cleanEmail = email.trim().toLowerCase();
    if (typeof window !== "undefined") {
      localStorage.setItem("remotework_user_email", cleanEmail);
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/checkout/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, planId: selectedPlan }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      } else if (data.success) {
        setPurchased(true);
        simulateSubscription(true, selectedPlan);
        await refreshSubscription();
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

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail || !restoreEmail.includes("@")) return;

    setIsRestoring(true);
    setRestoreStatus("idle");
    try {
      const cleanEmail = restoreEmail.trim().toLowerCase();
      const res = await fetch(`/api/user/subscription?email=${encodeURIComponent(cleanEmail)}`);
      const data = await res.json();
      if (data.active) {
        setRestoreStatus("success");
        simulateSubscription(true, data.pass?.plan || "monthly");
        if (typeof window !== "undefined") {
          localStorage.setItem("rwd_onboarding_completed", "true");
          localStorage.setItem("remotework_user_email", cleanEmail);
        }
        await refreshSubscription();
        setTimeout(() => {
          handleClose();
        }, 1200);
      } else {
        setRestoreStatus("not_found");
      }
    } catch {
      setRestoreStatus("error");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto my-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-5">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
              Direct ATS Pass Activated!
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              Direct company application links are now completely unlocked for <strong>{email}</strong> on plan: <strong>{activePlanDetails.name}</strong>.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FF4742] text-white hover:bg-[#e03a35]"
            >
              Continue to Dashboard
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
                Upgrade to Direct ATS Pass
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Bypass 200+ automated LinkedIn applicants. Apply directly to verified employer ATS boards (Greenhouse, Lever, Ashby).
              </p>
            </div>

            {/* Comparison Box */}
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
                  <span>Middlemen recruiter gatekeeping</span>
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
                  <span>100% Upfront transparent salaries</span>
                </div>
              </div>
            </div>

            {/* 3-Tier Plan Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Select Your Plan:
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
                    Auto-renews weekly. Cancel anytime in 1 click.
                  </p>
                </button>

                {/* Monthly Tier */}
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
                    Standard search. Cancel anytime in 1 click.
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
                    Pay once. Lifetime access forever.
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

            {/* Money-Back Guarantee */}
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-200 block">7-Day 100% Money-Back Guarantee</span>
                  <span className="text-[10px] text-emerald-400/90">
                    Full refund in 1-click if not completely satisfied. Plus 60-day interview guarantee.
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePurchase} className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Your Account Email (for instant ATS link activation)
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
                  Encrypted checkout via Stripe. Self-serve cancel anytime from dashboard.
                </p>
              </div>
            </form>

            {/* Restore Access Link */}
            <div className="pt-2 text-center border-t border-neutral-100 dark:border-neutral-800">
              {!restoreMode ? (
                <button
                  type="button"
                  onClick={() => setRestoreMode(true)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline font-semibold transition-colors"
                >
                  Already subscribed on another device? Restore access &rarr;
                </button>
              ) : (
                <form onSubmit={handleRestore} className="space-y-2 text-left bg-neutral-50 dark:bg-neutral-800/70 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      Restore Active Subscription
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRestoreMode(false);
                        setRestoreStatus("idle");
                      }}
                      className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="your-email@example.com"
                      value={restoreEmail}
                      onChange={(e) => setRestoreEmail(e.target.value)}
                      className="min-w-0 flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                    />
                    <button
                      type="submit"
                      disabled={isRestoring}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] active:scale-95 transition-all"
                    >
                      {isRestoring ? "Checking..." : "Restore"}
                    </button>
                  </div>
                  {restoreStatus === "success" && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Subscription verified! Unlocking all jobs...
                    </p>
                  )}
                  {restoreStatus === "not_found" && (
                    <p className="text-[11px] text-red-500 font-medium">
                      No active subscription found for this email. Check for typos or subscribe above.
                    </p>
                  )}
                  {restoreStatus === "error" && (
                    <p className="text-[11px] text-red-500 font-medium">
                      Could not verify status. Please check your connection.
                    </p>
                  )}
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
