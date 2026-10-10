"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Job, FilterState } from "@/lib/types";
import { filterJobs } from "@/lib/filter-jobs";
import { SuggestedFilters } from "./suggested-filters";
import { FilterBar } from "./filter-bar";
import { JobTable } from "./job-table";
import { CandidateHunterPass } from "./candidate-hunter-pass";
import { CandidateOnboardingModal } from "./candidate-onboarding-modal";
import { useSubscription } from "@/components/auth/subscription-context";

interface JobBoardClientProps {
  initialJobs: Job[];
  initialCategory?: string;
  initialTag?: string;
  initialLocation?: string;
}

export function JobBoardClient({
  initialJobs,
  initialCategory = "",
  initialTag = "",
  initialLocation = "",
}: JobBoardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { openUpgradeModal } = useSubscription();

  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync client state whenever server initialJobs changes
  useEffect(() => {
    if (initialJobs && initialJobs.length > 0) {
      setJobs(initialJobs);
    }
  }, [initialJobs]);

  // Seamlessly check for any live newly-harvested jobs on page load
  useEffect(() => {
    let isCancelled = false;
    const checkFreshJobs = async () => {
      try {
        const res = await fetch(`/api/jobs?refresh=true&_t=${Date.now()}`);
        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (Array.isArray(data.jobs) && data.jobs.length > 0) {
            setJobs((prev) => {
              const currentTopDate = prev[0]?.postedAt;
              const newTopDate = data.jobs[0]?.postedAt;
              if (currentTopDate !== newTopDate || prev.length !== data.jobs.length) {
                return data.jobs;
              }
              return prev;
            });
          }
        }
      } catch {
        // silent fallback
      }
    };

    checkFreshJobs();
    return () => {
      isCancelled = true;
    };
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get("search") || "",
    location: initialLocation || searchParams.get("location") || "",
    category: initialCategory || searchParams.get("category") || "",
    workplaceType: (searchParams.get("workplace") as FilterState["workplaceType"]) || "all",
    minSalary: Number(searchParams.get("salary")) || 0,
    benefits: searchParams.get("benefits") ? searchParams.get("benefits")!.split(",") : [],
    tags: initialTag ? [initialTag] : searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [],
    sortBy: (searchParams.get("sort") as FilterState["sortBy"]) || "default",
    freshness: (searchParams.get("freshness") as FilterState["freshness"]) || "all",
    directAtsOnly: searchParams.get("direct") === "true",
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    const nextFilters = { ...filters, ...updates };
    setFilters(nextFilters);

    // Update URL query parameters without reloading
    startTransition(() => {
      const params = new URLSearchParams();
      if (nextFilters.query) params.set("search", nextFilters.query);
      if (nextFilters.location) params.set("location", nextFilters.location);
      if (nextFilters.category && nextFilters.category !== "all") params.set("category", nextFilters.category);
      if (nextFilters.workplaceType && nextFilters.workplaceType !== "all") params.set("workplace", nextFilters.workplaceType);
      if (nextFilters.minSalary > 0) params.set("salary", String(nextFilters.minSalary));
      if (nextFilters.benefits.length > 0) params.set("benefits", nextFilters.benefits.join(","));
      if (nextFilters.tags.length > 0) params.set("tags", nextFilters.tags.join(","));
      if (nextFilters.sortBy && nextFilters.sortBy !== "default") params.set("sort", nextFilters.sortBy);
      if (nextFilters.freshness && nextFilters.freshness !== "all") params.set("freshness", nextFilters.freshness);
      if (nextFilters.directAtsOnly) params.set("direct", "true");

      const qs = params.toString();
      const targetUrl = qs ? `/?${qs}` : "/";
      router.replace(targetUrl, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    updateFilters({
      query: "",
      location: "",
      category: "",
      workplaceType: "all",
      minSalary: 0,
      benefits: [],
      tags: [],
      sortBy: "default",
      freshness: "all",
      directAtsOnly: false,
    });
  };

  const handleTagClick = (tag: string) => {
    const exists = filters.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    const nextTags = exists
      ? filters.tags.filter((t) => t.toLowerCase() !== tag.toLowerCase())
      : [...filters.tags, tag];
    updateFilters({ tags: nextTags });
  };

  const handleRefreshJobs = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/jobs?sync=true&refresh=true&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
      }
    } catch (err) {
      console.error("Job feed refresh failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, filters);
  }, [jobs, filters]);

  return (
    <div className="w-full">
      {/* First-Time Visitor CRO Onboarding Experience */}
      <CandidateOnboardingModal
        onSelectCategory={(cat) => updateFilters({ category: cat })}
        onOpenUpgradeModal={openUpgradeModal}
      />

      {/* Category Pills Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 pb-2">
        <SuggestedFilters
          activeCategory={filters.category}
          onSelectCategory={(cat) => updateFilters({ category: cat })}
        />
      </div>

      {/* Sticky Filter Bar */}
      <FilterBar
        filters={filters}
        onUpdateFilters={updateFilters}
        onResetFilters={handleResetFilters}
        totalResults={filteredJobs.length}
      />

      {/* Candidate Early-Bird Hunter Pass (One-Time Payment Upgrade) */}
      <div className="pt-2">
        <CandidateHunterPass />
      </div>

      {/* Job Table Listings */}
      <JobTable
        jobs={filteredJobs}
        onTagClick={handleTagClick}
        onResetFilters={handleResetFilters}
        onRefreshJobs={handleRefreshJobs}
        isSyncing={isSyncing}
      />
    </div>
  );
}
