"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Job, FilterState } from "@/lib/types";
import { filterJobs } from "@/lib/filter-jobs";
import { SuggestedFilters } from "./suggested-filters";
import { FilterBar } from "./filter-bar";
import { JobTable } from "./job-table";
import { CandidateHunterPass } from "./candidate-hunter-pass";

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

  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [isSyncing, setIsSyncing] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    query: searchParams.get("search") || "",
    location: initialLocation || searchParams.get("location") || "",
    category: initialCategory || searchParams.get("category") || "",
    workplaceType: (searchParams.get("workplace") as FilterState["workplaceType"]) || "all",
    minSalary: Number(searchParams.get("salary")) || 0,
    benefits: searchParams.get("benefits") ? searchParams.get("benefits")!.split(",") : [],
    tags: initialTag ? [initialTag] : searchParams.get("tags") ? searchParams.get("tags")!.split(",") : [],
    sortBy: (searchParams.get("sort") as FilterState["sortBy"]) || "default",
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
      const res = await fetch("/api/jobs/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.jobs && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      console.error("Job feed refresh failed:", err);
      alert("Failed to refresh remote job feed. Please check your network connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, filters);
  }, [jobs, filters]);

  return (
    <div className="w-full">
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
