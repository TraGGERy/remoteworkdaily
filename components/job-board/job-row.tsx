"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import {
  formatSalary,
  formatHourlyEquivalent,
  isTrueWorldwideJob,
  getCompetitionSignal,
  timeAgo,
  isRecentPost,
  isEarlyAccessJob,
} from "@/lib/utils";
import { CheckCircle, Globe, MapPin, DollarSign, Pin, Sparkles, Lock, Flame, Users, ShieldCheck, Clock, Award } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";
import { GovernmentEasyApplyModal } from "./government-easy-apply-modal";

interface JobRowProps {
  job: Job;
  isSelected: boolean;
  onToggleSelect: () => void;
  onTagClick?: (tag: string) => void;
}

export function JobRow({ job, isSelected, onToggleSelect, onTagClick }: JobRowProps) {
  const { hasActiveSubscription, openUpgradeModal } = useSubscription();
  const [showGovModal, setShowGovModal] = useState(false);
  const isTask = Boolean(job.isTask || job.category === "tasks");
  const salaryText = isTask && job.payoutReward ? job.payoutReward : formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const hourlyText = isTask && job.payoutReward ? null : formatHourlyEquivalent(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const isWorldwide = isTrueWorldwideJob(job.location, job.workArrangement, job.workplaceType);
  const competition = getCompetitionSignal(job.appliesCount, job.postedAt);
  const isDirectAts = Boolean(job.source === "ats" || job.atsProvider || job.isDirectCompanyPost);
  const isNewToday = isRecentPost(job.postedAt);
  const isGovJob = Boolean(job.isPublicSector || job.isGovernment);

  // Deadline countdown calculation
  let deadlineLabel: string | null = null;
  let isDeadlineUrgent = false;
  if (job.applicationDeadline) {
    const diff = new Date(job.applicationDeadline).getTime() - Date.now();
    if (diff > 0) {
      const days = Math.floor(diff / (24 * 3600 * 1000));
      const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
      if (days > 0) {
        deadlineLabel = `⏳ Closes in ${days}d`;
      } else {
        deadlineLabel = `🚨 Closes in ${hours}h`;
        isDeadlineUrgent = true;
      }
    }
  }

  // Pro Early Access check (< 24h old across all categories: Marketing, Executive, Dev, etc.)
  const isEarlyAccess = isEarlyAccessJob(job.postedAt);
  const isLockedEarlyAccess = isEarlyAccess && !hasActiveSubscription;

  return (
    <div
      onClick={onToggleSelect}
      className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all border ${
        isSelected
          ? "bg-red-50/70 dark:bg-neutral-900 border-[#FF4742] shadow-md ring-1 ring-[#FF4742]"
          : job.sticky
          ? "bg-amber-50/40 dark:bg-neutral-900/90 border-amber-300/80 dark:border-amber-700/60 hover:border-amber-400"
          : job.featured
          ? "bg-red-50/30 dark:bg-neutral-900/60 border-red-200/60 dark:border-red-950/80 hover:border-red-300"
          : isEarlyAccess
          ? "bg-orange-50/20 dark:bg-neutral-900/40 border-orange-200/80 dark:border-orange-950/80 hover:border-orange-400"
          : "bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
      }`}
    >
      {/* Left: Company Logo + Title + Metadata */}
      <div className="flex items-center gap-3.5 w-full md:w-auto min-w-0">
        {/* Company Avatar */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {isLockedEarlyAccess ? (
            <div className="flex flex-col items-center justify-center text-amber-600 dark:text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          ) : job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="font-extrabold text-lg text-neutral-600 dark:text-neutral-300">
              {job.company.charAt(0)}
            </span>
          )}
        </div>

        {/* Position & Company Info */}
        <div className="flex flex-col min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isLockedEarlyAccess ? (
              <span className="font-semibold text-xs text-neutral-400 truncate flex items-center gap-1">
                <span className="blur-[3px] select-none">{job.company}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">(Pro Early Access)</span>
              </span>
            ) : (
              <span className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {job.company}
              </span>
            )}

            {!isLockedEarlyAccess && job.verified && (
              <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
            )}

            {isEarlyAccess && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-[#FF4742] dark:text-red-400 border border-red-300 dark:border-red-800/80">
                <Flame className="w-2.5 h-2.5 fill-current" />
                <span>Early Access (&lt;6h)</span>
              </span>
            )}

            {isTask && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/90 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {job.payoutType === "bounty" ? "💰 Bounty" : "⚡ Task"}
              </span>
            )}

            {isTask && job.estimatedTime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                ⏱️ {job.estimatedTime}
              </span>
            )}

            {isGovJob && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/90 text-[#003399] dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                🏛️ Gov Verified
              </span>
            )}

            {isGovJob && job.europassReady && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-[#003399] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                🇪🇺 Europass Ready
              </span>
            )}

            {isGovJob && job.p11Ready && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/70 text-[#009EDB] dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                🇺🇳 UN P11 Ready
              </span>
            )}

            {isGovJob && job.grade && (
              <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                <Award className="w-2.5 h-2.5" />
                <span>{job.grade}</span>
              </span>
            )}

            {deadlineLabel && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                isDeadlineUrgent
                  ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse"
                  : "bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/70"
              }`}>
                <Clock className="w-2.5 h-2.5" />
                <span>{deadlineLabel}</span>
              </span>
            )}

            {job.workplaceType === "on-site" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                🏢 On-site
              </span>
            ) : job.workplaceType === "hybrid" || job.workArrangement === "hybrid_high_pay" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                🔀 Hybrid {job.daysInOffice ? `(${job.daysInOffice})` : ""}
              </span>
            ) : isWorldwide ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                🌍 100% Worldwide
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                📍 Regional Remote
              </span>
            )}

            {isDirectAts && (
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Direct ATS</span>
              </span>
            )}

            {job.sticky && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                <Pin className="w-2.5 h-2.5" />
                <span>Pinned</span>
              </span>
            )}

            {isNewToday && !isEarlyAccess && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/70">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Today</span>
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-[#FF4742] transition-colors line-clamp-1 leading-snug">
            <Link
              href={`/jobs/${job.id}/${job.slug}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                  e.preventDefault();
                  onToggleSelect();
                }
              }}
              className="hover:underline"
            >
              {job.title}
            </Link>
          </h3>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 min-w-0 flex-wrap">
            <span className="flex items-center gap-1 min-w-0">
              {job.workplaceType === "on-site" || job.workplaceType === "hybrid" ? (
                <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
              ) : (
                <Globe className="w-3 h-3 text-neutral-400 shrink-0" />
              )}
              <span className="truncate max-w-[120px] sm:max-w-none">{job.location}</span>
            </span>
            <span className="shrink-0">•</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
              {salaryText}
              {hourlyText ? <span className="text-[11px] opacity-80 ml-1">({hourlyText})</span> : null}
            </span>
            <span className="shrink-0 hidden sm:inline">•</span>
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold ${
                competition.tier === "ultra_low"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : competition.tier === "low"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-neutral-500"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>{competition.shortLabel}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Tags + Salary + Posted Date + Action CTA */}
      <div className="mt-3 md:mt-0 flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800 min-w-0">
        {/* Tag pills */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {job.tags.slice(0, 4).map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Salary badge for mobile / desktop view */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold tabular-nums shrink-0">
          <DollarSign className="w-3 h-3" />
          <span>{salaryText}</span>
          {hourlyText && <span className="text-[10px] font-semibold opacity-75 ml-0.5">{hourlyText}</span>}
        </div>


        {/* Posted time & apply button */}
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-2">
          <span className={`text-xs font-mono font-medium ${
            isNewToday
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-neutral-400"
          }`}>
            {timeAgo(job.postedAt)}
          </span>

          {isGovJob && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGovModal(true);
              }}
              className="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black bg-[#003399] hover:bg-[#002266] text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              title="Open Public Sector Easy Apply Assistant (Europass & UN P11)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Easy Apply</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isLockedEarlyAccess) {
                openUpgradeModal();
              } else {
                onToggleSelect();
              }
            }}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              isLockedEarlyAccess
                ? "bg-gradient-to-r from-amber-500 to-[#FF4742] text-white shadow-md shadow-red-500/20"
                : isSelected
                ? "bg-[#FF4742] text-white"
                : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-[#FF4742] dark:hover:bg-[#FF4742] dark:hover:text-white"
            }`}
          >
            {isLockedEarlyAccess ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Unlock Early</span>
              </>
            ) : isSelected ? (
              "Close"
            ) : isTask ? (
              job.payoutType === "bounty" ? "Claim Bounty" : "Start Task"
            ) : (
              "Apply"
            )}
          </button>
        </div>
      </div>

      {/* Government Easy Apply Assistant Modal */}
      {isGovJob && (
        <GovernmentEasyApplyModal
          job={job}
          isOpen={showGovModal}
          onClose={() => setShowGovModal(false)}
        />
      )}
    </div>
  );
}
