"use client";

import React, { useState, useEffect } from "react";
import { CANDIDATE_PRICING } from "@/lib/constants";
import { Zap, ShieldCheck, CheckCircle2, X, Sparkles, ArrowRight, Lock } from "lucide-react";

import { useSubscription } from "@/components/auth/subscription-context";

/**
 * Candidate Hunter Pass component.
 *
 * Implements a strictly one-time payment ($39 USD) conversion entry for job seekers.
 * Adheres to behavioral psychology principles:
 * 1. Anxiety reduction: Explicit zero-subscription terms ("Never renews").
 * 2. Risk reversal: 60-day interview guarantee (100% money back).
 * 3. Urgent value: 2-hour early-bird alerts before public distribution.
 */
export function CandidateHunterPass() {
  const {
    isUpgradeModalOpen,
    setUpgradeModalOpen,
    simulateSubscription,
    userEmail,
    hasActiveSubscription,
  } = useSubscription();

  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ email }),
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

  const pass = CANDIDATE_PRICING.hunterPass;

  return (
    <>
      {/* Non-intrusive Alert Bar above Job Table */}
      {!dismissed && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 mb-3">
          <div className="relative overflow-hidden rounded-2xl border border-amber-300/60 dark:border-amber-900/40 bg-gradient-to-r from-amber-500/10 via-red-500/5 to-amber-500/10 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                      Want remote roles 2 hours before the crowd?
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50">
                      ${pass.price} One-Time
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Early-bird alerts, salary negotiation scripts, and reverse candidate spotlight. Zero monthly subscription.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Explore Hunter Pass</span>
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

      {/* Comprehensive Offer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {purchased ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                  Welcome to the Hunter VIP Circle
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
                  A magic confirmation link and your Salary Negotiation Guide have been dispatched to <strong>{email}</strong>.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FF4742] text-white hover:bg-[#e03a35]"
                >
                  Back to Jobs
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Candidate Fast-Track</span>
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                    The Remote Hunter Lifetime Pass
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {pass.description}
                  </p>
                </div>

                {/* Value Checklist */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  {pass.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 60-Day Guarantee Box */}
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-emerald-200">60-Day Interview Guarantee</span>
                    <span className="text-[11px] leading-relaxed text-emerald-400/90">
                      {pass.guarantee}. No awkward questions asked.
                    </span>
                  </div>
                </div>

                {/* One-Time Payment Form */}
                <form onSubmit={handlePurchase} className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Your Email (for instant early alerts)
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
                    <span>{isProcessing ? "Processing..." : `Get Hunter Pass for $${pass.price} (One-Time)`}</span>
                  </button>

                  <div className="text-center space-y-0.5">
                    <p className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                      Strictly One-Time Payment • No Subscriptions • Never Auto-Renews
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Secure payment processed via Stripe. Active for your entire job hunt.
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
