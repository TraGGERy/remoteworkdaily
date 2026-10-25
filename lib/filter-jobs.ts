import { Job, FilterState } from "./types";
import { isTrueWorldwideJob } from "./utils";

const REGION_KEYWORD_MAP: Record<string, string[]> = {
  region_af: [
    "africa", "south africa", "zimbabwe", "kenya", "nigeria", "ghana", "egypt", "rwanda", "uganda",
    "morocco", "tanzania", "ethiopia", "cape town", "johannesburg", "pretoria", "harare", "nairobi",
    "lagos", "cairo", "accra", "kigali", "dpsa", "nepad", "sadc", "za", "zw", "ke", "ng", "gh", "eg", "rw"
  ],
  region_eu: [
    "europe", "european", "uk", "united kingdom", "germany", "france", "spain", "italy", "netherlands",
    "portugal", "ireland", "sweden", "poland", "switzerland", "brussels", "berlin", "london", "paris",
    "amsterdam", "madrid", "lisbon", "de", "fr", "es", "nl", "pt", "ie", "se", "ch", "pl"
  ],
  region_na: [
    "north america", "united states", "usa", "us", "canada", "mexico", "new york", "san francisco",
    "toronto", "vancouver", "ca", "mx"
  ],
  region_la: [
    "latin america", "brazil", "argentina", "colombia", "chile", "peru", "uruguay", "sao paulo",
    "buenos aires", "bogota", "br", "ar", "co", "cl"
  ],
  region_as: [
    "asia", "singapore", "india", "japan", "tokyo", "bangalore", "delhi", "south korea", "taiwan",
    "vietnam", "thailand", "indonesia", "philippines", "sg", "in", "jp", "kr", "tw", "ph"
  ],
  region_oc: [
    "oceania", "australia", "new zealand", "sydney", "melbourne", "auckland", "au", "nz"
  ],
  region_me: [
    "middle east", "uae", "united arab emirates", "dubai", "saudi arabia", "riyadh", "qatar", "doha", "ae", "sa", "qa"
  ],
};

const COUNTRY_ALIAS_MAP: Record<string, string[]> = {
  za: ["south africa", "cape town", "johannesburg", "pretoria", "durban", "midrand", "dpsa", "sars", "za"],
  "south africa": ["south africa", "cape town", "johannesburg", "pretoria", "durban", "midrand", "dpsa", "sars", "za"],
  zw: ["zimbabwe", "harare", "bulawayo", "sadc", "psc_zw", "zw"],
  zimbabwe: ["zimbabwe", "harare", "bulawayo", "sadc", "psc_zw", "zw"],
  ke: ["kenya", "nairobi", "mombasa", "ke"],
  kenya: ["kenya", "nairobi", "mombasa", "ke"],
  ng: ["nigeria", "lagos", "abuja", "ng"],
  nigeria: ["nigeria", "lagos", "abuja", "ng"],
  gh: ["ghana", "accra", "gh"],
  ghana: ["ghana", "accra", "gh"],
  eg: ["egypt", "cairo", "alexandria", "eg"],
  egypt: ["egypt", "cairo", "alexandria", "eg"],
  us: ["united states", "usa", "us"],
  "united states": ["united states", "usa", "us"],
  uk: ["united kingdom", "uk", "london", "great britain", "england", "scotland", "wales"],
  "united kingdom": ["united kingdom", "uk", "london", "great britain", "england", "scotland", "wales"],
  ca: ["canada", "toronto", "vancouver", "montreal", "ca"],
  canada: ["canada", "toronto", "vancouver", "montreal", "ca"],
  de: ["germany", "berlin", "munich", "frankfurt", "de"],
  germany: ["germany", "berlin", "munich", "frankfurt", "de"],
};

export function filterJobs(jobs: Job[], filters: Partial<FilterState>): Job[] {
  // Only display active jobs
  let result = jobs.filter((job) => job.status !== "pending_payment" && job.status !== "archived" && job.isActive !== false);

  // 1. Search Query (title, company, description, tags, location) - Supports multi-word tokens
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    result = result.filter((job) => {
      const fullText = [
        job.title || "",
        job.company || "",
        job.location || "",
        Array.isArray(job.tags) ? job.tags.join(" ") : "",
        job.description || ""
      ].join(" ").toLowerCase();

      return tokens.every((token) => fullText.includes(token));
    });
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

  // 2. Category (supports category slug, tags, and role keywords)
  if (filters.category && filters.category !== "all" && filters.category !== "") {
    const targetCat = filters.category.toLowerCase().trim();
    result = result.filter((job) => {
      if (targetCat === "tasks" || targetCat === "task") {
        if (job.category === "tasks" || (job as any).category === "task" || Boolean(job.isTask)) return true;
        if (job.tags && job.tags.some((t) => /\b(task|tasks|gig|bounty|microtask|micro-task|annotation|rlhf|playtest|usability|transcription|tutoring|screener|ugc)\b/i.test(t))) return true;
        if (/\b(task|tasks|gig|bounty|microtask|micro-task|annotation|rlhf|playtest|usability|transcription|tutoring|screener|ugc)\b/i.test(job.title || "")) return true;
        return false;
      }
      if (Boolean(job.isTask) || job.category === "tasks") {
        return false;
      }
      if (job.category && job.category.toLowerCase() === targetCat) return true;
      if (job.tags && job.tags.some((t) => t.toLowerCase() === targetCat || t.toLowerCase().includes(targetCat))) return true;
      if (targetCat === "dev" && /developer|engineer|software|fullstack|full-stack|frontend|front-end|backend|back-end|devops|architect|programmer|coding|web dev/i.test(job.title || "")) return true;
      if (targetCat === "design" && /designer|design|ui|ux|graphic|creative director|art director|product design/i.test(job.title || "")) return true;
      if (targetCat === "exec" && job.tags && job.tags.some((t) => /executive|director|vp|c-level|lead/i.test(t))) return true;
      if (targetCat === "exec" && /executive|director|chief|vp|vice president|head of/i.test(job.title || "")) return true;
      if (targetCat === "marketing" && /marketing|seo|growth|copywriter|acquisition|content/i.test(job.title || "")) return true;
      if (targetCat === "sales" && /sales|account exec|sdr|bdr|business dev|account manager/i.test(job.title || "")) return true;
      if (targetCat === "support" && /support|customer service|customer success|client success/i.test(job.title || "")) return true;
      if (targetCat === "finance" && /finance|accounting|accountant|payroll|tax|auditor/i.test(job.title || "")) return true;
      if (targetCat === "medical" && /medical|healthcare|nurse|doctor|clinical|therapist|pharmacy/i.test(job.title || "")) return true;
      if (targetCat === "education" && /education|teacher|instructor|coach|professor|curriculum/i.test(job.title || "")) return true;
      return false;
    });
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

  // 3. Location (Smart global country and regional matching)
  if (filters.location && filters.location.trim()) {
    const loc = filters.location.toLowerCase().trim();
    const isWorldwideLoc = loc === "worldwide" || loc === "anywhere";
    const regionKeywords = REGION_KEYWORD_MAP[loc];
    const countryAliases = COUNTRY_ALIAS_MAP[loc];

    result = result.filter((job) => {
      const jobLoc = (job.location || "").toLowerCase();
      const jobCode = (job.locationCode || "").toLowerCase();
      const isWorldwideJob = isTrueWorldwideJob(job.location, job.workArrangement, job.workplaceType) ||
        jobLoc.includes("worldwide") || jobLoc.includes("anywhere");

      if (isWorldwideLoc) {
        return isWorldwideJob;
      }

      if (regionKeywords) {
        const matchesRegion = regionKeywords.some((k) => jobLoc.includes(k) || jobCode === k);
        return matchesRegion || isWorldwideJob;
      }

      if (countryAliases) {
        const matchesCountry = countryAliases.some((alias) => jobLoc.includes(alias) || jobCode === alias);
        return matchesCountry || isWorldwideJob;
      }

      return jobLoc.includes(loc) || jobCode.includes(loc) || isWorldwideJob;
    });
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

  // 6.10 Public Sector / Government Only Toggle
  if (filters.publicSectorOnly) {
    result = result.filter((job) => Boolean(job.isPublicSector || job.isGovernment));
  }

  // 6.11 Public Sector Specific Sector Filter (EU, National, UN/International, Regional)
  if (filters.sector && filters.sector !== "all") {
    result = result.filter((job) => job.publicSectorType === filters.sector);
  }

  // 6.12 Eligibility Restrictions (Open Worldwide, Citizenship Required, Visa Sponsored)
  if (filters.eligibility && filters.eligibility !== "all") {
    result = result.filter((job) => job.eligibilityType === filters.eligibility);
  }

  // 6.13 Language Requirements (English Only vs. Multilingual)
  if (filters.languageReq && filters.languageReq !== "all") {
    result = result.filter((job) => {
      const langs = job.languagesRequired || [];
      if (filters.languageReq === "en_only") {
        return (
          langs.length <= 1 ||
          langs.every((l) => l.toLowerCase().includes("english") || l.toLowerCase().includes("en"))
        );
      }
      if (filters.languageReq === "multilingual") {
        return langs.length >= 2;
      }
      return true;
    });
  }

  // 6.14 Application Deadline Urgency (<48h closing soon, next 7 days)
  if (filters.deadlineUrgency && filters.deadlineUrgency !== "all") {
    const now = Date.now();
    result = result.filter((job) => {
      if (!job.applicationDeadline) return false;
      const deadlineMs = new Date(job.applicationDeadline).getTime();
      if (isNaN(deadlineMs) || deadlineMs <= now) return false;
      const msLeft = deadlineMs - now;
      if (filters.deadlineUrgency === "closing_48h") {
        return msLeft <= 48 * 3600 * 1000;
      }
      if (filters.deadlineUrgency === "next_7d") {
        return msLeft <= 7 * 24 * 3600 * 1000;
      }
      return true;
    });
  }

  // 6.15 Tasks & Micro-Gigs Specific Filters
  if (filters.tasksOnly) {
    result = result.filter((job) => Boolean(job.isTask) || job.category === "tasks");
  }

  if (filters.taskType) {
    result = result.filter((job) => job.taskType === filters.taskType);
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
