import { Job, FilterState } from "./types";
import { isTrueWorldwideJob } from "./utils";

export function filterJobs(jobs: Job[], filters: Partial<FilterState>): Job[] {
  // Only display active jobs
  let result = jobs.filter((job) => job.status !== "pending_payment" && job.status !== "archived" && job.isActive !== false);

  // 1. Search Query (title, company, description, tags)
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q)
    );
  }

  // 1.5 Company
  if (filters.company && filters.company.trim()) {
    const comp = filters.company.toLowerCase().trim();
    result = result.filter(
      (job) =>
        (job.companySlug && job.companySlug.toLowerCase() === comp) ||
        (job.company && job.company.toLowerCase() === comp) ||
        (job.company && job.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === comp)
    );
  }

  // 2. Category
  if (filters.category && filters.category !== "all" && filters.category !== "") {
    result = result.filter((job) => job.category === filters.category);
  }

  // 2.5 Workplace Type (remote, on-site, hybrid)
  if (filters.workplaceType && filters.workplaceType !== "all") {
    result = result.filter((job) => {
      let type = job.workplaceType;
      if (!type) {
        const loc = (job.location || "").toLowerCase();
        if (loc.includes("hybrid")) type = "hybrid";
        else if (loc.includes("remote") || loc.includes("worldwide") || loc.includes("anywhere")) type = "remote";
        else type = "on-site";
      }
      return type === filters.workplaceType;
    });
  }

  // 3. Location
  if (filters.location && filters.location.trim()) {
    const loc = filters.location.toLowerCase();
    result = result.filter(
      (job) =>
        job.location.toLowerCase().includes(loc) ||
        (job.locationCode && job.locationCode.toLowerCase().includes(loc)) ||
        (loc === "worldwide" && (job.location.toLowerCase().includes("worldwide") || job.workplaceType === "remote"))
    );
  }

  // 4. Minimum Salary
  if (filters.minSalary && filters.minSalary > 0) {
    result = result.filter((job) => {
      const maxSal = job.salaryMax || job.salaryMin || 0;
      return maxSal >= filters.minSalary!;
    });
  }

  // 5. Benefits
  if (filters.benefits && filters.benefits.length > 0) {
    result = result.filter((job) =>
      filters.benefits!.every((b) => job.benefits.includes(b))
    );
  }

  // 6. Tags
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((job) =>
      filters.tags!.every((t) =>
        job.tags.some((jt) => jt.toLowerCase() === t.toLowerCase())
      )
    );
  }

  // 6.5 Direct Company Careers / ATS Filter (CareerHound model)
  if (filters.directAtsOnly) {
    result = result.filter(
      (job) => job.source === "ats" || Boolean(job.atsProvider) || Boolean(job.isDirectCompanyPost)
    );
  }

  // 6.6 Freshness Filter (1h, 6h, 24h, or 7d — Minutes-Old Job Hack)
  if (filters.freshness && filters.freshness !== "all") {
    const now = Date.now();
    const cutoffHours =
      filters.freshness === "1h"
        ? 1
        : filters.freshness === "6h"
        ? 6
        : filters.freshness === "24h"
        ? 24
        : 168; // 7 days
    const cutoffMs = cutoffHours * 60 * 60 * 1000;
    result = result.filter((job) => {
      const jobTime = new Date(job.postedAt).getTime();
      return !isNaN(jobTime) && now - jobTime <= cutoffMs;
    });
  }

  // 6.7 Transparent Pay Only (Eliminate hidden salary range jobs)
  if (filters.transparentPayOnly) {
    result = result.filter((job) => (job.salaryMin && job.salaryMin > 0) || (job.salaryMax && job.salaryMax > 0));
  }

  // 6.8 100% True Worldwide Only (No sneaky US-only or hybrid traps)
  if (filters.worldwideOnly) {
    result = result.filter((job) =>
      isTrueWorldwideJob(job.location, job.workArrangement, job.workplaceType)
    );
  }

  // 6.9 Low Competition Only (<15 applicants or posted in last 24h)
  if (filters.lowCompetitionOnly) {
    const now = Date.now();
    result = result.filter((job) => {
      const jobTime = new Date(job.postedAt).getTime();
      const isUnder24h = !isNaN(jobTime) && now - jobTime <= 24 * 3600 * 1000;
      return (job.appliesCount || 0) <= 15 || isUnder24h;
    });
  }

  // 7. Sorting
  result.sort((a, b) => {
    // Pinned/Sticky jobs always stay at top unless sorting by specific criteria
    if (filters.sortBy !== "salary" && filters.sortBy !== "views") {
      if (a.sticky && !b.sticky) return -1;
      if (!a.sticky && b.sticky) return 1;
    }

    switch (filters.sortBy) {
      case "salary": {
        const salA = a.salaryMax || a.salaryMin || 0;
        const salB = b.salaryMax || b.salaryMin || 0;
        return salB - salA;
      }
      case "views":
        return b.viewsCount - a.viewsCount;
      case "applied":
        return b.appliesCount - a.appliesCount;
      case "hot":
        return (b.viewsCount + b.appliesCount * 3) - (a.viewsCount + a.appliesCount * 3);
      case "benefits":
        return b.benefits.length - a.benefits.length;
      case "date":
      default: {
        const timeA = new Date(a.postedAt).getTime() || 0;
        const timeB = new Date(b.postedAt).getTime() || 0;
        return timeB - timeA;
      }
    }
  });

  return result;
}
