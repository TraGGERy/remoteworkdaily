"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatSalary, timeAgo } from "@/lib/utils";
import { BENEFITS_LIST } from "@/lib/constants";
import {
  ExternalLink,
  Share2,
  Bookmark,
  CheckCircle,
  Globe,
  MapPin,
  DollarSign,
  ArrowRight,
  X,
  Copy,
  Check,
} from "lucide-react";

interface JobDetailDrawerProps {
  job: Job;
  onClose: () => void;
  onNextJob?: () => void;
  onApply?: () => void;
}

export function JobDetailDrawer({
  job,
  onClose,
  onNextJob,
  onApply,
}: JobDetailDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/jobs/${job.id}/${job.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-2 mb-6 p-4 sm:p-7 rounded-2xl border-2 border-[#FF4742]/40 bg-white dark:bg-neutral-900 shadow-xl transition-all">
      {/* Top Banner / Company Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-inner">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-extrabold text-2xl text-neutral-600 dark:text-neutral-300">
                {job.company.charAt(0)}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white">
                {job.company}
              </span>
              {job.verified && (
                <CheckCircle className="w-4 h-4 text-sky-500 fill-sky-500/20" />
              )}
            </div>
            <h2 className="font-black text-lg sm:text-2xl text-neutral-900 dark:text-white tracking-tight">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border text-[11px] ${
                job.workplaceType === "on-site"
                  ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : job.workplaceType === "hybrid"
                  ? "bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                  : "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              }`}>
                {job.workplaceType === "on-site" ? "🏢 On-site" : job.workplaceType === "hybrid" ? "🔀 Hybrid" : "🌐 Remote"}
              </span>
              <span className="flex items-center gap-1">
                {job.workplaceType === "on-site" || job.workplaceType === "hybrid" ? (
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <span>{job.location}</span>
              </span>
              <span>•</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {salaryText}
              </span>
              <span>•</span>
              <span>Posted {timeAgo(job.postedAt)}</span>
            </div>
          </div>
        </div>

        {/* Share & Bookmark Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopyLink}
            aria-label="Copy job link"
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
          </button>
          <button
            onClick={() => setBookmarked(!bookmarked)}
            aria-label="Save job"
            className={`p-2 rounded-lg border transition-colors ${
              bookmarked
                ? "border-red-300 bg-red-50 text-[#FF4742]"
                : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={onClose}
            aria-label="Close job preview"
            className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags & Perks Pills */}
      <div className="py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Benefits section if present */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Perks & Benefits
          </div>
          <div className="flex flex-wrap gap-2">
            {job.benefits.map((bId) => {
              const b = BENEFITS_LIST.find((item) => item.id === bId);
              if (!b) return null;
              return (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Rich Job Description */}
      <div className="py-6 text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed space-y-4 prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-line font-sans">
          {job.description}
        </div>
      </div>

      {/* Floating Action Bar at Bottom of Card */}
      <div className="sticky bottom-4 z-20 mt-6 p-3 sm:p-4 rounded-xl bg-neutral-900/95 dark:bg-neutral-950/95 text-white backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3 border border-neutral-800">
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-neutral-300 truncate max-w-[260px]">
            {job.title}
          </span>
          <span className="text-[11px] text-neutral-400">
            at {job.company} • {salaryText}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onApply}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-extrabold bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/30 transition-transform active:scale-95"
          >
            <span>Apply for this job</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {onNextJob && (
            <button
              onClick={onNextJob}
              className="inline-flex items-center gap-1 px-4 py-3 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
            >
              <span>Next job</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
