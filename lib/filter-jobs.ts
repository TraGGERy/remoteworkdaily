import { Job, FilterState } from "./types";

export function filterJobs(jobs: Job[], filters: Partial<FilterState>): Job[] {
  // Only display active jobs
  let result = jobs.filter((job) => job.status !== "pending_payment" && job.status !== "archived");

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

  // 2. Category
  if (filters.category && filters.category !== "all" && filters.category !== "") {
    result = result.filter((job) => job.category === filters.category);
  }

  // 2.5 Workplace Type (remote, on-site, hybrid)
  if (filters.workplaceType && filters.workplaceType !== "all") {
    result = result.filter((job) => {
      const type = job.workplaceType || "remote";
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
        (loc === "worldwide" && job.location.toLowerCase().includes("worldwide"))
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

  // 6.6 Freshness Filter (e.g. 24h or 7d)
  if (filters.freshness && filters.freshness !== "all") {
    const now = Date.now();
    const cutoffHours = filters.freshness === "24h" ? 24 : 168; // 24 hours or 7 days
    const cutoffMs = cutoffHours * 60 * 60 * 1000;
    result = result.filter((job) => {
      const jobTime = new Date(job.postedAt).getTime();
      return !isNaN(jobTime) && now - jobTime <= cutoffMs;
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
      default:
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
  });

  return result;
}
