"use client";

import React, { useState } from "react";
import { Job } from "@/lib/types";
import { JobRow } from "./job-row";
import { JobDetailDrawer } from "./job-detail-drawer";
import { Sparkles, RefreshCw, AlertCircle, Lock, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

interface JobTableProps {
  jobs: Job[];
  onTagClick: (tag: string) => void;
  onResetFilters: () => void;
  onRefreshJobs?: () => void;
  isSyncing?: boolean;
}

export function JobTable({
  jobs,
  onTagClick,
  onResetFilters,
  onRefreshJobs,
  isSyncing,
}: JobTableProps) {
  const { hasActiveSubscription, openUpgradeModal } = useSubscription();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(40);

  // Reset pagination count when the filtered list changes
  React.useEffect(() => {
    setVisibleCount(40);
  }, [jobs.length]);

  const displayedJobs = jobs.slice(0, visibleCount);
  const hasMore = visibleCount < jobs.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 50, jobs.length));
  };

  const handleLoadAll = () => {
    setVisibleCount(jobs.length);
  };

  const selectedIndex = jobs.findIndex((j) => j.id === selectedJobId);

  const handleNextJob = () => {
    if (selectedIndex >= 0 && selectedIndex < jobs.length - 1) {
      setSelectedJobId(jobs[selectedIndex + 1].id);
    } else if (jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  };

  const handleToggleSelect = (jobId: string) => {
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
    } else {
      setSelectedJobId(jobId);
    }
  };

  // Freemium preview threshold: first 5 jobs are fully visible
  const FREE_PREVIEW_LIMIT = 5;
  const isPaywallActive = !hasActiveSubscription && jobs.length > FREE_PREVIEW_LIMIT;
  
  const previewJobs = isPaywallActive ? displayedJobs.slice(0, FREE_PREVIEW_LIMIT) : displayedJobs;
  const blurredPaywalledJobs = isPaywallActive ? displayedJobs.slice(FREE_PREVIEW_LIMIT) : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Table Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 text-xs text-neutral-500 dark:text-neutral-400 font-semibold px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing{" "}
            <strong className="text-neutral-900 dark:text-white font-extrabold">
              {displayedJobs.length}
            </strong>
            {hasMore ? ` of ${jobs.length.toLocaleString()}` : ""}{" "}
            verified remote jobs
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="hidden md:inline-block text-neutral-300 dark:text-neutral-700">•</span>
          <span className="hidden md:inline text-emerald-600 dark:text-emerald-400 font-bold">100% Transparent Pay</span>
          {isPaywallActive && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/40">
              5 Free Preview Jobs
            </span>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Job Scraper Active</span>
          </div>

          {onRefreshJobs && (
            <button
              onClick={onRefreshJobs}
              disabled={isSyncing}
              aria-label="Check for newly scraped remote jobs"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#FF4742]" : ""}`} />
              <span>{isSyncing ? "Scanning remote feeds..." : "Check for New Jobs"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/20">
          <AlertCircle className="w-12 h-12 text-[#FF4742] mb-3 opacity-80" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            No remote jobs match your exact filters
          </h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mt-1 mb-4">
            Try lowering the minimum salary threshold, clearing tag filters, or selecting &quot;Worldwide&quot; to see all open positions.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#FF4742] text-white hover:bg-[#e03a35] transition-colors"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        /* Jobs List */
        <div className="space-y-2 sm:space-y-2.5" id="jobsboard">
          {/* 1. Visible Free Preview Jobs (Top 5) */}
          {previewJobs.map((job) => {
            const isSelected = selectedJobId === job.id;
            return (
              <React.Fragment key={job.id}>
                <JobRow
                  job={job}
                  isSelected={isSelected}
                  onToggleSelect={() => handleToggleSelect(job.id)}
                  onTagClick={onTagClick}
                />
                {isSelected && (
                  <JobDetailDrawer
                    job={job}
                    onClose={() => setSelectedJobId(null)}
                    onNextJob={handleNextJob}
                    onApply={() => {
                      fetch(`/api/jobs/${job.id}/apply`, { method: "POST" }).catch(() => {});
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* 2. CareerHound-Style Paywall Offer Card (Rendered immediately after Job 5) */}
          {isPaywallActive && (
            <div className="my-6 p-6 sm:p-8 rounded-3xl border-2 border-amber-400/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50 via-white to-red-50/40 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 shadow-2xl space-y-5 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                    <Lock className="w-3.5 h-3.5" />
                    <span>You Have Viewed 5 Free Preview Jobs</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                    Unlock 2,000+ Direct ATS Jobs (Greenhouse, Lever, Ashby)
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                    Stop competing against 200+ applicants in 1 hour on LinkedIn and Indeed. Our members apply directly to internal hiring systems at GitLab, Supabase, Linear, Docker, Automattic, and 1,000+ companies.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                  <button
                    type="button"
                    onClick={openUpgradeModal}
                    className="w-full sm:w-auto px-7 py-4 rounded-2xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Unlock Full Feed (From $6.99/wk)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                    7-Day Money-Back Guarantee • Cancel Anytime
                  </span>
                </div>
              </div>

              {/* 3-Tier Value Cards Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div 
                  onClick={openUpgradeModal}
                  className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-800/50 cursor-pointer hover:border-neutral-300 transition-all text-left"
                >
                  <span className="text-[10px] font-black uppercase text-neutral-500 block">Weekly Sprint</span>
                  <div className="mt-1">
                    <span className="text-xl font-black text-neutral-900 dark:text-white">$6.99</span>
                    <span className="text-xs text-neutral-500"> / week</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Direct ATS links unlocked. Cancel anytime.
                  </p>
                </div>

                <div 
                  onClick={openUpgradeModal}
                  className="p-3.5 rounded-2xl border-2 border-[#FF4742] bg-red-50/30 dark:bg-red-950/20 cursor-pointer shadow-md relative text-left"
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#FF4742] text-[9px] font-black uppercase text-white">
                    Most Popular
                  </span>
                  <span className="text-[10px] font-black uppercase text-[#FF4742] block">Monthly Pro</span>
                  <div className="mt-1">
                    <span className="text-xl font-black text-neutral-900 dark:text-white">$17.99</span>
                    <span className="text-xs text-neutral-500"> / month</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Full active search + Salary Negotiation Playbook.
                  </p>
                </div>

                <div 
                  onClick={openUpgradeModal}
                  className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-800/50 cursor-pointer hover:border-neutral-300 transition-all text-left"
                >
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">Lifetime Access</span>
                  <div className="mt-1">
                    <span className="text-xl font-black text-neutral-900 dark:text-white">$49.99</span>
                    <span className="text-xs text-neutral-500"> one-time</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Pay once. Perpetual access for your career.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Blurred Paywalled Jobs (Jobs 6 onwards) - Preserves SEO in DOM while Gating for Humans */}
          {isPaywallActive && blurredPaywalledJobs.length > 0 && (
            <div className="relative mt-2">
              {/* Click Interceptor Overlay */}
              <div 
                onClick={openUpgradeModal}
                className="absolute inset-0 z-20 cursor-pointer flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent via-white/70 dark:via-neutral-950/70 to-white dark:to-neutral-950 transition-opacity hover:opacity-95"
              >
                <div className="p-6 rounded-3xl border border-amber-300/80 dark:border-amber-800/80 bg-white/95 dark:bg-neutral-900/95 shadow-2xl backdrop-blur-md max-w-sm text-center space-y-3 pointer-events-auto">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-black text-neutral-900 dark:text-white">
                    {jobs.length - FREE_PREVIEW_LIMIT}+ Direct Company Roles
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Click anywhere to unlock all unadvertised remote jobs with direct application links.
                  </p>
                  <button
                    type="button"
                    onClick={openUpgradeModal}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-lg shadow-red-500/25 active:scale-95 transition-all"
                  >
                    Unlock Feed (From $6.99/wk)
                  </button>
                </div>
              </div>

              {/* Blurred Job Feed (Crawled by Googlebot for SEO, blurred for visitor) */}
              <div 
                className="paywall-blurred-jobs space-y-2 filter blur-[5px] select-none pointer-events-none opacity-30 max-h-[700px] overflow-hidden"
                aria-hidden="true"
              >
                {blurredPaywalledJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    isSelected={false}
                    onToggleSelect={() => {}}
                    onTagClick={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Progressive Load More Footer (Only for paid subscribers or when viewing all) */}
          {!isPaywallActive && hasMore && (
            <div className="pt-6 pb-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleLoadMore}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors shadow-sm"
              >
                Load more jobs (+50)
              </button>
              <button
                onClick={handleLoadAll}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Show all {jobs.length.toLocaleString()} jobs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
