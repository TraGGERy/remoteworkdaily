"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ProPricingCards } from "@/components/pricing/pro-pricing-cards";
import {
  Check,
  X,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Lock,
  Mail,
  Flame,
  CreditCard,
  Landmark,
  BadgeCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  Pin,
  Palette,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface EmployerAddOns {
  sticky: boolean;
  blast: boolean;
  highlight: boolean;
}

export function UnifiedPricingHub() {
  const [activeTab, setActiveTab] = useState<"candidates" | "employers" | "both">("candidates");

  // Employer interactive calculator state
  const [employerAddOns, setEmployerAddOns] = useState<EmployerAddOns>({
    sticky: true,
    blast: false,
    highlight: false,
  });

  // Employer quick checkout form state
  const [quickForm, setQuickForm] = useState({
    companyName: "",
    jobTitle: "",
    userEmail: "",
    applyUrl: "",
  });
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [showQuickForm, setShowQuickForm] = useState(false);

  // Sync hash or URL params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");

      if (hash === "#employers" || tabParam === "employer" || tabParam === "employers") {
        setActiveTab("employers");
      } else if (hash === "#candidates" || tabParam === "candidate" || tabParam === "candidates") {
        setActiveTab("candidates");
      } else if (tabParam === "both" || hash === "#all") {
        setActiveTab("both");
      }
    }
  }, []);

  // Calculate live employer total ($249 up to $426)
  const baseEmployerPrice = 249;
  const stickyPrice = 49;
  const blastPrice = 99;
  const highlightPrice = 29;

  const employerTotal =
    baseEmployerPrice +
    (employerAddOns.sticky ? stickyPrice : 0) +
    (employerAddOns.blast ? blastPrice : 0) +
    (employerAddOns.highlight ? highlightPrice : 0);

  // Handle direct employer quick checkout
  const handleEmployerQuickCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError("");

    if (!quickForm.companyName.trim()) {
      setQuickError("Please provide your company name.");
      return;
    }
    if (!quickForm.jobTitle.trim()) {
      setQuickError("Please enter the job title.");
      return;
    }
    if (!quickForm.userEmail.trim() || !quickForm.userEmail.includes("@")) {
      setQuickError("Please provide a valid corporate work email for invoice delivery.");
      return;
    }

    let normalizedUrl = quickForm.applyUrl.trim();
    if (!normalizedUrl) {
      setQuickError("Please enter your ATS application URL.");
      return;
    }
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setIsSubmittingQuick(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: quickForm.jobTitle.trim(),
          companyName: quickForm.companyName.trim(),
          userEmail: quickForm.userEmail.trim(),
          applyUrl: normalizedUrl,
          category: "dev",
          location: "Worldwide",
          workplaceType: "remote",
          tags: ["Remote"],
          benefits: [],
          description: `Direct 30-day posting for ${quickForm.jobTitle.trim()} at ${quickForm.companyName.trim()}. Direct application URL: ${normalizedUrl}`,
          paymentRail: "stripe_card",
          addOns: {
            sticky: employerAddOns.sticky,
            highlight: employerAddOns.highlight,
            newsletter: employerAddOns.blast,
            verifiedBadge: true,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout. Please try again.");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.success) {
        window.location.href = "/?posted=true";
        return;
      }

      throw new Error("Unable to create payment session. Please try again.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected checkout error.";
      setQuickError(message);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  return (
    <div className="w-full">
      {/* 1. Audience Switcher Navigation Tabs */}
      <div className="max-w-xl mx-auto mb-10 px-4">
        <div
          role="tablist"
          aria-label="Select pricing audience"
          className="grid grid-cols-2 sm:grid-cols-3 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 shadow-inner"
        >
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === "candidates"}
            aria-controls="candidate-pricing-panel"
            id="tab-candidates"
            onClick={() => setActiveTab("candidates")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === "candidates"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#FF4742] shrink-0" />
            <span>Job Seekers</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider bg-rose-100 dark:bg-rose-950/60 text-[#FF4742] px-1.5 py-0.5 rounded-md">
              Pro Pass
            </span>
          </button>

          <button
            role="tab"
            type="button"
            aria-selected={activeTab === "employers"}
            aria-controls="employer-pricing-panel"
            id="tab-employers"
            onClick={() => setActiveTab("employers")}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === "employers"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4 text-[#FF4742] shrink-0" />
            <span>Employers</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md">
              Post a Job
            </span>
          </button>

          <button
            role="tab"
            type="button"
            aria-selected={activeTab === "both"}
            aria-controls="all-pricing-panel"
            id="tab-both"
            onClick={() => setActiveTab("both")}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === "both"
                ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Compare All</span>
          </button>
        </div>
      </div>

      {/* 2. Candidate Billing Section */}
      <section
        id="candidate-pricing"
        aria-labelledby="tab-candidates"
        className={`w-full transition-opacity duration-300 ${
          activeTab === "employers" ? "hidden" : "block mb-24"
        }`}
      >
        <div className="text-center max-w-3xl mx-auto mb-8 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[#FF4742] text-xs font-bold mb-3">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Candidate Pro Pass • Beat the 500+ Applicant Surge</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Unlock 6-Hour Early Access & Apply Direct
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Over 85% of remote jobs receive 200+ applications within 12 hours. Apply first with direct ATS links, verified HR hiring emails, and instant AI resume tailoring.
          </p>
        </div>

        {/* Pro Pricing Cards (Reused Component with Stripe Candidate Checkout) */}
        <ProPricingCards />

        {/* Candidate Plan Comparison Matrix */}
        <div className="mt-20 max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
              Candidate Plan Comparison Matrix
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Complete feature breakdown across Free Preview, Weekly Sprint, Monthly Pro, and Lifetime Access.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="py-4 px-4 sm:px-6 font-bold text-neutral-900 dark:text-white w-2/5">
                    Search & Application Capability
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-neutral-600 dark:text-neutral-400 text-center">
                    <div>Free Preview</div>
                    <div className="text-[11px] font-normal text-neutral-400">$0</div>
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-neutral-700 dark:text-neutral-300 text-center">
                    <div>Weekly Sprint</div>
                    <div className="text-[11px] font-normal text-[#FF4742]">$6.99/wk</div>
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-black text-neutral-900 dark:text-white text-center bg-rose-50/70 dark:bg-rose-950/20 border-x border-rose-200 dark:border-rose-900/60">
                    <div className="text-[#FF4742]">Monthly Pro</div>
                    <div className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">$17.99/mo</div>
                    <span className="inline-block mt-0.5 text-[9px] uppercase tracking-wider font-extrabold bg-[#FF4742] text-white px-2 py-0.2 rounded-full">
                      Popular
                    </span>
                  </th>
                  <th className="py-4 px-3 sm:px-4 font-bold text-neutral-700 dark:text-neutral-300 text-center">
                    <div>Lifetime Access</div>
                    <div className="text-[11px] font-normal text-amber-600 dark:text-amber-400">$49.99 once</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-neutral-800 dark:text-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>6-Hour Early Access to Fresh Roles</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">❌ 6h Delayed</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Instant Alerts
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-black bg-rose-50/40 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                    ✅ Instant Alerts
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Permanent Instant
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-neutral-800 dark:text-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>Direct ATS Application Links (Greenhouse/Lever/Ashby)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">⚠️ 3 Daily Limit</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Unlimited
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-black bg-rose-50/40 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                    ✅ Unlimited
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Perpetual
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-neutral-800 dark:text-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>Verified HR & Recruiter Contact Emails</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">❌ Hidden</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-700 dark:text-neutral-300">
                    25 / week
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-black bg-rose-50/40 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                    ✅ Unlimited
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Unlimited
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-neutral-800 dark:text-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>AI CV Tailor & Cover Letter Studio</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">❌ Locked</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-700 dark:text-neutral-300">
                    10 Generations / wk
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-black bg-rose-50/40 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                    ✅ Unlimited
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Unlimited
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-neutral-800 dark:text-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>60s Loom Pitch & Sniper Outreach Templates</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">❌ Locked</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">❌ Not Included</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-black bg-rose-50/40 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                    ✅ 5 Pitches / mo
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Unlimited
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-neutral-800 dark:text-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>Paid Tasks & Micro-Bounties Access</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">⚠️ Read Only</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ Full Access
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-black bg-rose-50/40 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                    ✅ Priority Claims
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ VIP Priority Tier
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-neutral-800 dark:text-neutral-200">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>60-Day 2-Interview Guarantee</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">❌ None</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-neutral-400">❌ 7-Day Only</td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-black bg-rose-50/40 dark:bg-rose-950/10 border-x border-rose-200 dark:border-rose-900/60">
                    ✅ 100% Guaranteed
                  </td>
                  <td className="py-3.5 px-3 sm:px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">
                    ✅ 100% Guaranteed
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Employer Billing & Direct Checkout Section */}
      <section
        id="employer-pricing"
        aria-labelledby="tab-employers"
        className={`w-full transition-opacity duration-300 ${
          activeTab === "candidates" ? "hidden" : "block mb-20"
        }`}
      >
        <div className="text-center max-w-3xl mx-auto mb-10 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Direct ATS Candidate Redirection • Zero Recruiter Markups</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Post a Verified Remote Job — $249 Flat
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Direct high-intent applicant traffic into your Greenhouse, Lever, Ashby, or custom ATS. Live for 30 days, indexed via Google Jobs schema, and alerted to 2,500,000+ remote workers.
          </p>
        </div>

        {/* Employer Pricing Calculator & Instant Checkout Builder */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Base Listing & Add-On Selection */}
            <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                    Core Listing
                  </span>
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white">
                    30-Day Verified Remote Job Post
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Standard broadcast to 2,500,000+ remote engineers, designers, and operators.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-black text-neutral-900 dark:text-white">$249</div>
                  <div className="text-[11px] text-neutral-500 font-medium">flat / 30 days</div>
                </div>
              </div>

              {/* Core Features Included */}
              <div className="py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                  Always Included With Every Post:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                    <span>30 Days Live Visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                    <span>Direct ATS Redirection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                    <span>Google Jobs JSON-LD Schema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                    <span>Real-Time Telegram Broadcast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                    <span>Verified Company Trust Badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 font-bold" />
                    <span>14-Day Traffic Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Optional Promotional Add-Ons */}
              <div className="pt-6">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-4">
                  Boost Your Listing (Optional Add-Ons):
                </div>

                <div className="space-y-3">
                  {/* Add-on 1: Sticky Pin */}
                  <label
                    className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      employerAddOns.sticky
                        ? "border-[#FF4742] bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-500/20"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={employerAddOns.sticky}
                        onChange={(e) =>
                          setEmployerAddOns((prev) => ({ ...prev, sticky: e.target.checked }))
                        }
                        className="mt-1 h-4 w-4 rounded text-[#FF4742] focus:ring-[#FF4742] border-neutral-300 dark:border-neutral-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Pin className="w-3.5 h-3.5 text-[#FF4742]" />
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">
                            📌 Sticky Pin to Top of Feed for 7 Days
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Pins your listing at the top of category feeds for 7 days (delivers up to 5x more clicks).
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white shrink-0">
                      +$49
                    </span>
                  </label>

                  {/* Add-on 2: Email Blast */}
                  <label
                    className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      employerAddOns.blast
                        ? "border-[#FF4742] bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-500/20"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={employerAddOns.blast}
                        onChange={(e) =>
                          setEmployerAddOns((prev) => ({ ...prev, blast: e.target.checked }))
                        }
                        className="mt-1 h-4 w-4 rounded text-[#FF4742] focus:ring-[#FF4742] border-neutral-300 dark:border-neutral-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">
                            📧 Dedicated Email Blast to 8,500+ Subscribed Candidates
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          Sent directly to our weekly curated newsletter list with a 42% average open rate.
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white shrink-0">
                      +$99
                    </span>
                  </label>

                  {/* Add-on 3: Highlighted Brand Row */}
                  <label
                    className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      employerAddOns.highlight
                        ? "border-[#FF4742] bg-rose-50/30 dark:bg-rose-950/20 ring-1 ring-rose-500/20"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={employerAddOns.highlight}
                        onChange={(e) =>
                          setEmployerAddOns((prev) => ({ ...prev, highlight: e.target.checked }))
                        }
                        className="mt-1 h-4 w-4 rounded text-[#FF4742] focus:ring-[#FF4742] border-neutral-300 dark:border-neutral-700"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">
                            🎨 Highlighted Brand Row & Custom Company Badge
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          High-contrast coral border and prominent highlighted background for instant eye capture.
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white shrink-0">
                      +$29
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Live Calculation & Direct Transaction Actions */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Live Calculation Summary Box */}
              <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-neutral-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4742]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="text-xs uppercase tracking-wider font-bold text-neutral-400 mb-2">
                  Order Summary
                </div>
                <h4 className="text-lg font-bold text-white mb-6">
                  Verified Remote Job Slot
                </h4>

                <div className="space-y-3 text-xs sm:text-sm text-neutral-300 pb-6 border-b border-neutral-800">
                  <div className="flex justify-between items-center">
                    <span>Base 30-Day Listing</span>
                    <span className="font-bold text-white">$249.00</span>
                  </div>
                  {employerAddOns.sticky && (
                    <div className="flex justify-between items-center text-rose-300">
                      <span>📌 Sticky Pin (7 Days)</span>
                      <span className="font-bold">+$49.00</span>
                    </div>
                  )}
                  {employerAddOns.blast && (
                    <div className="flex justify-between items-center text-blue-300">
                      <span>📧 Dedicated Email Blast (8.5k)</span>
                      <span className="font-bold">+$99.00</span>
                    </div>
                  )}
                  {employerAddOns.highlight && (
                    <div className="flex justify-between items-center text-amber-300">
                      <span>🎨 Highlighted Brand Row</span>
                      <span className="font-bold">+$29.00</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="py-6 flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-neutral-400 font-medium">Total Investment</div>
                    <div className="text-[11px] text-emerald-400">One-time flat • Zero recurring</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-white">
                      ${employerTotal}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">USD Net</div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/hire-remotely?sticky=${employerAddOns.sticky}&blast=${employerAddOns.blast}&highlight=${employerAddOns.highlight}`}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center gap-2 transition-all active:scale-95 border border-neutral-700 text-center"
                  >
                    <span>Build & Preview Your Job Post →</span>
                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowQuickForm((prev) => !prev)}
                    className="w-full py-4 px-4 rounded-xl font-black text-sm bg-[#FF4742] hover:bg-[#e03a35] text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-500/20 text-center"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Instant 30-Day Job Slot Checkout (${employerTotal})</span>
                  </button>
                </div>

                {/* Employer Guarantee Pill */}
                <div className="mt-6 pt-6 border-t border-neutral-800 flex items-start gap-2.5 text-[11px] text-neutral-400 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>14-Day Traffic Guarantee:</strong> If your post doesn't receive verified candidate clicks within 14 days, we will extend your pin for 30 additional days free.
                  </span>
                </div>
              </div>

              {/* Inline Quick-Post Form (Activated via Instant Checkout Button) */}
              <div
                className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm transition-all ${
                  showQuickForm ? "block" : "hidden"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FF4742]" />
                    <span>Instant Job Slot Information</span>
                  </h4>
                  <span className="text-[11px] text-neutral-400">1-Step Checkout</span>
                </div>

                <form onSubmit={handleEmployerQuickCheckout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stripe, Linear, Vercel"
                      value={quickForm.companyName}
                      onChange={(e) =>
                        setQuickForm((prev) => ({ ...prev, companyName: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Full-Stack Engineer"
                      value={quickForm.jobTitle}
                      onChange={(e) =>
                        setQuickForm((prev) => ({ ...prev, jobTitle: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Work Email (For Tax Invoice & Receipt) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="hiring@company.com"
                      value={quickForm.userEmail}
                      onChange={(e) =>
                        setQuickForm((prev) => ({ ...prev, userEmail: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      ATS Apply URL (Greenhouse, Lever, Ashby, etc.) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://boards.greenhouse.io/company/jobs/..."
                      value={quickForm.applyUrl}
                      onChange={(e) =>
                        setQuickForm((prev) => ({ ...prev, applyUrl: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
                    />
                  </div>

                  {quickError && (
                    <div className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                      {quickError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingQuick}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#FF4742] hover:bg-[#e03a35] text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 shadow-sm"
                  >
                    {isSubmittingQuick ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Stripe Checkout...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Proceed to Stripe Checkout (${employerTotal})</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-neutral-400">
                    256-bit SSL encrypted • Corporate card or ACH wire supported
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CRO Trust & Risk-Reversal Architecture */}
      <section className="max-w-5xl mx-auto mt-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 7-Day Money-Back Guarantee */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 font-bold" />
              </div>
              <h4 className="text-base font-black text-neutral-900 dark:text-white mb-2">
                7-Day 100% Refund Policy
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Test the Candidate Pro Pass with zero financial risk. If you are not completely satisfied for any reason, email us within 7 days for an immediate full refund.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              No Questions Asked • Candidate Guarantee
            </div>
          </div>

          {/* Card 2: 60-Day Interview Promise */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-[#FF4742] flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 font-bold" />
              </div>
              <h4 className="text-base font-black text-neutral-900 dark:text-white mb-2">
                60-Day 2-Interview Guarantee
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Apply to verified roles using your 6-hour early alerts. If you don't secure at least 2 recruiter screening interviews within 60 days, we'll refund every dollar.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-[#FF4742]">
              Real Results Promise • Monthly & Lifetime
            </div>
          </div>

          {/* Card 3: Employer Qualified Traffic Guarantee */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5 font-bold" />
              </div>
              <h4 className="text-base font-black text-neutral-900 dark:text-white mb-2">
                14-Day Traffic Guarantee
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                If your job posting does not receive qualified applicant traffic within 14 days, our team will re-pin your listing for an extra 30 days and re-broadcast it at zero extra charge.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-blue-600 dark:text-blue-400">
              Zero Risk Hiring • Employer Guarantee
            </div>
          </div>
        </div>

        {/* Payment Rails & Trust Badges */}
        <div className="mt-10 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-neutral-500" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Stripe 256-Bit SSL Encrypted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-neutral-500" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Plaid ACH Direct Bank Transfer Supported
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neutral-500" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              1-Click Cancel Anytime in /dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-neutral-500" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Automated PDF Tax Invoices
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
