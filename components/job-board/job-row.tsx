"use client";

import React from "react";
import Image from "next/image";
import { Job } from "@/lib/types";
import { formatSalary, timeAgo } from "@/lib/utils";
import { CheckCircle, Globe, MapPin, DollarSign, Pin, ExternalLink } from "lucide-react";

interface JobRowProps {
  job: Job;
  isSelected: boolean;
  onToggleSelect: () => void;
  onTagClick?: (tag: string) => void;
}

export function JobRow({ job, isSelected, onToggleSelect, onTagClick }: JobRowProps) {
  const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

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
          : "bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
      }`}
    >
      {/* Left: Company Logo + Title + Metadata */}
      <div className="flex items-center gap-3.5 w-full md:w-auto min-w-0">
        {/* Company Avatar */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700">
          {job.companyLogo ? (
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
            <span className="font-semibold text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {job.company}
            </span>
            {job.verified && (
              <CheckCircle className="w-3.5 h-3.5 text-sky-500 fill-sky-500/20 shrink-0" />
            )}
            {job.workplaceType === "on-site" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                🏢 On-site
              </span>
            ) : job.workplaceType === "hybrid" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                🔀 Hybrid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                🌐 Remote
              </span>
            )}
            {job.sticky && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                <Pin className="w-2.5 h-2.5" />
                <span>Pinned</span>
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-[#FF4742] transition-colors line-clamp-1 leading-snug">
            {job.title}
          </h3>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              {job.workplaceType === "on-site" || job.workplaceType === "hybrid" ? (
                <MapPin className="w-3 h-3 text-neutral-400" />
              ) : (
                <Globe className="w-3 h-3 text-neutral-400" />
              )}
              <span>{job.location}</span>
            </span>
            <span>•</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
              {salaryText}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Tags + Salary + Posted Date + Action CTA */}
      <div className="mt-3 md:mt-0 flex flex-wrap items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
        {/* Tag pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Salary badge for mobile / desktop view */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold tabular-nums">
          <DollarSign className="w-3 h-3" />
          <span>{salaryText}</span>
        </div>

        {/* Posted time & apply button */}
        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-2">
          <span className="text-xs text-neutral-400 font-mono">
            {timeAgo(job.postedAt)}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-[#FF4742] dark:hover:bg-[#FF4742] dark:hover:text-white transition-colors"
          >
            {isSelected ? "Close" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
