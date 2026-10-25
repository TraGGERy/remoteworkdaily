"use client";

import React, { useState, useEffect } from "react";
import { CANDIDATE_PRICING, CandidatePlanId } from "@/lib/constants";
import { Check, ShieldCheck, Zap, Sparkles, ArrowRight, Lock } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

export function ProPricingCards() {
  const { openUpgradeModal, userEmail, hasActiveSubscription, subscriptionPlan } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<CandidatePlanId>("monthly");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        localStorage.getItem("remotework_user_email") ||
        localStorage.getItem("remotework_candidate_email") ||
        "";
      if (userEmail) {
        setEmail(userEmail);
      } else if (stored) {
        setEmail(stored);
      }
    }
  }, [userEmail]);

  const plans = [
    {
      id: "weekly" as CandidatePlanId,
      name: "Weekly Sprint",
      price: "$6.99",
      period: "/ week",
      billing: "$6.99 billed weekly · Auto-renews · Cancel anytime",
      badge: "Sprint Search",
      highlighted: false,
      cta: "Start Weekly Sprint",
      description: "Ideal for active applicants conducting a fast 1-2 week job search sprint.",
      features: [
        "🔥 6-Hour Early Access to new roles",
        "Direct ATS Application Links unlocked",
        "Direct Company Career stream access",
        "📬 Unlocked Verified HR Contact Emails",
        "✨ AI Job Match Score & Tailor Preview",
      ],
    },
    {
      id: "monthly" as CandidatePlanId,
      name: "Monthly Pro",
      price: "$17.99",
      period: "/ month",
      billing: "$17.99 billed monthly · Auto-renews · Cancel anytime",
      badge: "Most Popular",
      highlighted: true,
      cta: "Get Monthly Pro (Save 30%)",
      description: "Our most popular plan for active candidates through multi-stage interview rounds.",
      features: [
        "🔥 6-Hour Early Access (Beat 500+ applicants)",
        "Direct ATS Application Links unlocked immediately",
        "Direct Company Careers & 'Hidden Jobs' stream",
        "📬 Unlocked Verified HR Contact Emails & Templates",
        "✨ Unlimited AI CV Tailoring & STAR Bullet Generator",
        "💰 Remote Salary Negotiation Playbook & Scripts",
      ],
    },
    {
      id: "lifetime" as CandidatePlanId,
      name: "Lifetime Access",
      price: "$49.99",
      period: "one-time",
      billing: "$49.99 pay once · Never renews · Perpetual access",
      badge: "Best Value",
      highlighted: false,
      cta: "Get Lifetime Access",
      description: "Pay once and monitor the remote job market throughout your entire career.",
      features: [
        "Perpetual access to all current and future features",
        "🔥 Permanent 6-Hour Early Access to all fresh roles",
        "Direct ATS Application Links unlocked permanently",
        "📬 Unlimited Verified HR Contact Emails",
        "✨ Unlimited AI Cover Letter & Resume Generations",
        "Never pay another subscription fee or renewal charge",
      ],
    },
  ];

  const handleCheckout = async (planId: CandidatePlanId) => {
    // If user has not input email, open modal for seamless entry
    if (!email || !email.includes("@")) {
      openUpgradeModal();
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();
    if (typeof window !== "undefined") {
      localStorage.setItem("remotework_user_email", cleanEmail);
      localStorage.setItem("remotework_candidate_email", cleanEmail);
    }

    try {
      const res = await fetch("/api/checkout/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          planId,
          ml_visitor_id: typeof window !== "undefined" ? window.minilytics?.attribution?.()?.ml_visitor_id : undefined,
          ml_session_id: typeof window !== "undefined" ? window.minilytics?.attribution?.()?.ml_session_id : undefined,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.success) {
        window.location.href = `/?subscription=success&plan=${planId}`;
        return;
      }

      // Fallback: Open upgrade modal
      openUpgradeModal();
    } catch {
      setErrorMsg("Failed to start checkout. Opening subscription modal...");
      setTimeout(() => openUpgradeModal(), 600);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Quick email entry for 1-click checkout */}
      <div className="max-w-md mx-auto mb-10 text-center">
        <label
          htmlFor="candidate-email"
          className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2"
        >
          Enter your email to activate your 6-hour early alerts:
        </label>
        <div className="flex items-center gap-2">
          <input
            id="candidate-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
          />
        </div>
        {errorMsg && <p className="text-xs text-rose-500 mt-2">{errorMsg}</p>}
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((p) => {
          const isSelected = selectedPlan === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all relative cursor-pointer ${
                p.highlighted
                  ? "border-2 border-[#FF4742] bg-white dark:bg-neutral-900 shadow-2xl ring-4 ring-red-500/10 scale-100 md:scale-105 z-10"
                  : "border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              {p.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF4742] text-white text-xs font-black uppercase tracking-wider shadow-sm">
                  {p.badge}
                </div>
              )}

              <div>
                {!p.highlighted && (
                  <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-4">
                    {p.badge}
                  </div>
                )}
                {p.highlighted && <div className="h-6" />}

                <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
                  {p.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                  {p.description}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl sm:text-5xl font-black text-neutral-900 dark:text-white">
                    {p.price}
                  </span>
                  <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    {p.period}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800 font-medium">
                  {p.billing}
                </div>

                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  {p.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 font-bold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  disabled={isLoading}
                  data-ml-goal="pricing_cta"
                  data-ml-goal-plan={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckout(p.id);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm ${
                    p.highlighted
                      ? "bg-[#FF4742] hover:bg-[#e03a35] text-white"
                      : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100"
                  }`}
                >
                  <span>{isLoading ? "Redirecting..." : p.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guarantees Box */}
      <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-black text-sm mb-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Risk-Free Guarantee: 7-Day Refund + 60-Day Interview Promise</span>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
          If you don't love Remote Work Daily Pro for any reason, email support@remoteworkdaily.com within 7 days for an immediate 100% refund. Plus, if you don't land at least 2 recruiter screening calls within 60 days, we'll refund every dollar.
        </p>
      </div>
    </div>
  );
}
