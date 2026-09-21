"use client";

import React, { useState } from "react";
import { Job } from "@/lib/types";
import { JobRow } from "./job-row";
import { JobDetailDrawer } from "./job-detail-drawer";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";

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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

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

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Table Summary Bar */}
      <div className="flex items-center justify-between pb-3 text-xs text-neutral-500 dark:text-neutral-400 font-semibold px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-neutral-900 dark:text-white font-extrabold">{jobs.length}</strong> verified remote jobs
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        {onRefreshJobs && (
          <button
            onClick={onRefreshJobs}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors disabled:opacity-50 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#FF4742]" : ""}`} />
            <span>{isSyncing ? "Syncing via Apify..." : "Sync Jobs"}</span>
          </button>
        )}
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
          {jobs.map((job) => {
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
        </div>
      )}
    </div>
  );
}
