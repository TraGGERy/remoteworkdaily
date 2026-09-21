"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import { formatSalary, timeAgo } from "@/lib/utils";
import {
  Briefcase,
  Eye,
  Send,
  Plus,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) {
          setJobs(data.jobs.slice(0, 5)); // show recent employer posts
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = jobs.reduce((sum, j) => sum + j.viewsCount, 0);
  const totalApplies = jobs.reduce((sum, j) => sum + j.appliesCount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to remote jobs</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Employer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your active remote listings and view applicant performance.
          </p>
        </div>

        <Link
          href="/hire-remotely"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-md shadow-red-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post another job</span>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Active Listings</span>
            <Briefcase className="w-4 h-4 text-[#FF4742]" />
          </div>
          <div className="text-3xl font-black text-neutral-900 dark:text-white mt-2 tabular-nums">
            {jobs.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            100% Live & Indexed
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
            Across website & API feeds
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
            Avg {totalViews > 0 ? ((totalApplies / totalViews) * 100).toFixed(1) : "0"}% conversion
          </div>
        </div>
      </div>

      {/* Posted Jobs Table */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
            Your Active Postings
          </h2>
          <span className="text-xs text-neutral-400">Auto-renews every 30 days</span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs sm:text-sm">
          {loading ? (
            <div className="p-8 text-center text-neutral-400">Loading listings...</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              You haven&apos;t posted any jobs yet.{" "}
              <Link href="/hire-remotely" className="text-[#FF4742] font-bold underline">
                Post your first job now!
              </Link>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div>
                  <div className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
                    {job.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    <span>{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto text-xs">
                  <div className="text-right">
                    <div className="font-bold text-neutral-900 dark:text-white tabular-nums">
                      {job.viewsCount} views
                    </div>
                    <div className="text-neutral-400 tabular-nums">
                      {job.appliesCount} applies
                    </div>
                  </div>

                  <Link
                    href={`/jobs/${job.id}/${job.slug}`}
                    className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
