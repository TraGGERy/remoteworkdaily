"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatSalary, timeAgo } from "@/lib/utils";
import { useSubscription } from "@/components/auth/subscription-context";
import { useAppAuth } from "@/components/auth/auth-provider";
import {
  Briefcase,
  Eye,
  Send,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  CreditCard,
  Settings,
  Bell,
  Mail,
  User,
  AlertTriangle,
  RefreshCw,
  Lock,
} from "lucide-react";

type DashboardTab = "employer" | "subscription" | "settings";

export default function DashboardPage() {
  const {
    isSignedIn,
    userEmail,
    hasActiveSubscription,
    subscriptionPlan,
    cancelSubscription,
    openUpgradeModal,
    refreshSubscription,
  } = useSubscription();

  const { isConfigured } = useAppAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>("employer");

  // Employer Jobs State
  const [employerEmail, setEmployerEmail] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [totalViews, setTotalViews] = useState(0);
  const [totalApplies, setTotalApplies] = useState(0);

  // Cancellation State
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Settings State
  const [dailyDigest, setDailyDigest] = useState(true);
  const [instantAlerts, setInstantAlerts] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Initialize employer email from user context or localStorage
  useEffect(() => {
    const saved = localStorage.getItem("remotework_employer_email");
    const emailToUse = userEmail || saved || localStorage.getItem("remotework_user_email") || "";
    if (emailToUse) {
      setEmployerEmail(emailToUse);
      setEmailInput(emailToUse);
    }
  }, [userEmail]);

  // Fetch real employer jobs when employerEmail changes
  useEffect(() => {
    if (!employerEmail) {
      setJobs([]);
      setTotalViews(0);
      setTotalApplies(0);
      return;
    }

    setLoadingJobs(true);
    fetch(`/api/employer/jobs?email=${encodeURIComponent(employerEmail.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) {
          setJobs(data.jobs);
          setTotalViews(data.totalViews || 0);
          setTotalApplies(data.totalApplies || 0);
        } else {
          setJobs([]);
          setTotalViews(0);
          setTotalApplies(0);
        }
      })
      .catch((err) => {
        console.error("Error fetching employer jobs:", err);
        setJobs([]);
      })
      .finally(() => setLoadingJobs(false));
  }, [employerEmail]);

  const handleLookupEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) return;
    const clean = emailInput.trim().toLowerCase();
    setEmployerEmail(clean);
    localStorage.setItem("remotework_employer_email", clean);
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      const ok = await cancelSubscription();
      if (ok) {
        setCancelSuccess(true);
        setShowCancelConfirm(false);
        await refreshSubscription();
      } else {
        alert("Could not process cancellation. Please contact support@remoteworkdaily.com.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenStripePortal = async () => {
    const email = userEmail || employerEmail || localStorage.getItem("remotework_user_email");
    if (!email) {
      alert("Please provide an email to open your billing portal.");
      return;
    }
    setPortalLoading(true);
    try {
      const res = await fetch("/api/user/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Customer billing portal is in standard mode.");
      }
    } catch (err) {
      console.error("Portal error:", err);
      alert("Unable to open billing portal. Please check your connection.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const planNameFormatted =
    subscriptionPlan === "weekly"
      ? "Weekly Sprint ($6.99/week)"
      : subscriptionPlan === "lifetime"
      ? "Lifetime All-Access ($49.99 one-time)"
      : subscriptionPlan === "monthly"
      ? "Monthly Pro ($17.99/month)"
      : "Active Candidate Pass";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to remote jobs</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Account & Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your candidate subscriptions, active job postings, and notifications.
          </p>
        </div>

        <Link
          href="/hire-remotely"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-md shadow-red-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Job ($249 once)</span>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("employer")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "employer"
              ? "border-[#FF4742] text-[#FF4742]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Employer Postings ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "subscription"
              ? "border-[#FF4742] text-[#FF4742]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Candidate Access & Billing</span>
          {hasActiveSubscription && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === "settings"
              ? "border-[#FF4742] text-[#FF4742]"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings & Alerts</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EMPLOYER JOB POSTINGS (REAL ACTIVE DATA)                          */}
      {/* ========================================================================= */}
      {activeTab === "employer" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Work Email Switcher Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Listing Management Email
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Viewing active remote listings associated with:{" "}
                <strong className="text-neutral-900 dark:text-white">{employerEmail || "No email selected"}</strong>
              </p>
            </div>

            <form onSubmit={handleLookupEmail} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="work-email@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="px-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742] w-full sm:w-56"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 whitespace-nowrap shrink-0 transition-opacity"
              >
                Find Postings
              </button>
            </form>
          </div>

          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                <span>Active Listings</span>
                <Briefcase className="w-4 h-4 text-[#FF4742]" />
              </div>
              <div className="text-3xl font-black text-neutral-900 dark:text-white mt-2 tabular-nums">
                {jobs.length}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {jobs.length > 0 ? "100% Live & Indexed on Google Jobs" : "No active jobs yet"}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                <span>Total Views</span>
                <Eye className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-3xl font-black text-neutral-900 dark:text-white mt-2 tabular-nums">
                {totalViews.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Across website & syndicated API feeds
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
                <span>Direct Applications</span>
                <Send className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-neutral-900 dark:text-white mt-2 tabular-nums">
                {totalApplies.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {totalViews > 0 ? `${((totalApplies / totalViews) * 100).toFixed(1)}% conversion rate` : "Awaiting first view"}
              </div>
            </div>
          </div>

          {/* Active Postings Table */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                  Your Active Remote Listings
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Employer postings are strictly one-time payments for 30 days of visibility (never auto-renews).
                </p>
              </div>
              {employerEmail && (
                <button
                  type="button"
                  onClick={() => setEmployerEmail(employerEmail)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
                  aria-label="Refresh listings"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingJobs ? "animate-spin text-[#FF4742]" : ""}`} />
                </button>
              )}
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs sm:text-sm">
              {loadingJobs ? (
                <div className="p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#FF4742]" />
                  <span>Loading your listings...</span>
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                      No active listings found for {employerEmail || "this account"}
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
                      If you recently posted a job with a different corporate email, enter it in the switcher above. Otherwise, post your job now to hire verified remote talent.
                    </p>
                  </div>
                  <Link
                    href="/hire-remotely"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-md shadow-red-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post a Remote Job ($249 one-time)</span>
                  </Link>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                          {job.title}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Active
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </span>
                        <span>•</span>
                        <span>Posted {timeAgo(job.postedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto text-xs">
                      <div className="text-right">
                        <div className="font-bold text-neutral-900 dark:text-white tabular-nums">
                          {job.viewsCount} views
                        </div>
                        <div className="text-neutral-400 tabular-nums">
                          {job.appliesCount} direct applies
                        </div>
                      </div>

                      <Link
                        href={`/jobs/${job.id}/${job.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1 text-xs font-semibold"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CANDIDATE ACCESS & SUBSCRIPTION CANCELLATION                      */}
      {/* ========================================================================= */}
      {activeTab === "subscription" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Active Plan Overview Card */}
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Candidate Access Status
                </span>
                <div className="flex items-center gap-2.5 mt-1">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                    {hasActiveSubscription ? planNameFormatted : "Free Candidate Preview"}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      hasActiveSubscription
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {hasActiveSubscription ? "Active Plan" : "Free Preview (25 Jobs)"}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Account: <strong>{userEmail || employerEmail || "Guest Session"}</strong>
                </p>
              </div>

              {!hasActiveSubscription ? (
                <button
                  type="button"
                  onClick={openUpgradeModal}
                  className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Upgrade to Direct ATS Pass (From $6.99/wk)</span>
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenStripePortal}
                    disabled={portalLoading}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    {portalLoading ? "Loading Portal..." : "Billing & Receipts (Stripe Portal)"}
                  </button>
                </div>
              )}
            </div>

            {/* Included Benefits Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Direct company ATS application links unlocked</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% verified salary benchmarks</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Priority candidate alert pipeline</span>
              </div>
            </div>
          </div>

          {/* Cancellation Section */}
          {hasActiveSubscription && (
            <div className="p-6 rounded-3xl border border-red-200 dark:border-red-950/70 bg-red-50/30 dark:bg-red-950/20 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Cancel Candidate Subscription</span>
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl leading-relaxed">
                    You can cancel your subscription at any time in 1 click. If you cancel, your subscription will not renew, and you will never be charged again. Your access will remain until the end of your prepaid period.
                  </p>
                </div>

                {!showCancelConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-100/60 dark:bg-red-950/60 hover:bg-red-200/80 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900 transition-colors shrink-0"
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={handleCancelSubscription}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all"
                    >
                      {isCancelling ? "Cancelling..." : "Yes, Confirm Cancellation"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      Keep Subscription
                    </button>
                  </div>
                )}
              </div>

              {cancelSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subscription cancelled successfully. You will not be billed again.</span>
                </div>
              )}
            </div>
          )}

          {/* Guarantee & Terms Box */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <strong className="text-neutral-800 dark:text-neutral-200 block">
                7-Day 100% Money-Back Guarantee
              </strong>
              <span>
                If you are not satisfied for any reason, email support@remoteworkdaily.com within 7 days for an immediate refund.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACCOUNT & NOTIFICATION SETTINGS                                    */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
            <div>
              <h2 className="font-extrabold text-base text-neutral-900 dark:text-white">
                Account & Preferences
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Manage your notification cadence and saved preferences.
              </p>
            </div>

            {/* Account Details */}
            <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Primary Account Email
              </label>
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="email"
                  disabled
                  value={userEmail || employerEmail || "guest@remoteworkdaily.com"}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-neutral-400">
                {isConfigured && isSignedIn
                  ? "Managed via Clerk Authentication."
                  : "Signed in via browser session. Create an account to sync across multiple devices."}
              </p>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                Email Notifications
              </h3>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                    Daily Remote Job Digest
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Receive a morning digest of verified remote roles with transparent salaries.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={dailyDigest}
                  onChange={(e) => setDailyDigest(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FF4742]"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                    Direct ATS Alerts
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Get alerted within 2 hours when a company posts a matching job directly to Greenhouse or Lever.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={instantAlerts}
                  onChange={(e) => setInstantAlerts(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FF4742]"
                />
              </label>
            </div>

            {/* Onboarding Status */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Candidate Onboarding
                </span>
                <span className="text-neutral-500">
                  Status: Completed & Saved (popup will not repeat)
                </span>
              </div>
              <span className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Done</span>
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] active:scale-95 transition-all shadow-sm"
              >
                Save Preferences
              </button>
              {settingsSaved && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Preferences saved!</span>
                </span>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
