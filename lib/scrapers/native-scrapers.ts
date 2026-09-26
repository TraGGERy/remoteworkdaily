import { RawScrapedJob } from "../apify";

const USER_AGENT = "RemoteWorkDailyScraper/2.0 (+https://remoteworkdaily.com; support@remoteworkdaily.com)";

/**
 * 1. Arbeitnow Multi-Page Fetcher
 * Paginates through up to 8 pages (250 items/page) to fetch up to 2,000 listings.
 */
export async function fetchArbeitnowJobs(pagesToFetch: number = 10): Promise<RawScrapedJob[]> {
  const allJobs: RawScrapedJob[] = [];
  const pagePromises = Array.from({ length: pagesToFetch }, (_, i) => i + 1).map(async (page) => {
    try {
      const res = await fetch(`https://arbeitnow.com/api/job-board-api?page=${page}`, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data.data)) return [];

      return data.data.map((item: any): RawScrapedJob => ({
        title: item.title,
        company_name: item.company_name,
        url: item.url,
        apply_url: item.url,
        tags: Array.isArray(item.tags) ? item.tags : [],
        location: item.location || (item.remote ? "Worldwide" : "On-site"),
        candidate_required_location: item.location,
        description: item.description,
        posted_at: item.created_at ? new Date(item.created_at * 1000).toISOString() : undefined,
        remote: Boolean(item.remote),
        workplace_type: item.remote ? "remote" : "on-site",
      }));
    } catch (err) {
      console.warn(`[Native Scraper] Arbeitnow page ${page} error:`, err);
      return [];
    }
  });

  const results = await Promise.all(pagePromises);
  for (const pageJobs of results) {
    allJobs.push(...pageJobs);
  }
  return allJobs;
}

/**
 * 2. We Work Remotely (WWR) Multi-Category RSS Fetcher
 * Pulls and parses verified RSS feeds across 6 core remote disciplines.
 */
export async function fetchWeWorkRemotelyJobs(): Promise<RawScrapedJob[]> {
  const categories = [
    "remote-programming-jobs",
    "remote-design-jobs",
    "remote-sales-and-marketing-jobs",
    "remote-product-jobs",
    "remote-management-and-finance-jobs",
    "remote-customer-support-jobs",
  ];

  const jobs: RawScrapedJob[] = [];

  const promises = categories.map(async (cat) => {
    try {
      const url = `https://weworkremotely.com/categories/${cat}.rss`;
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) return [];
      const text = await res.text();
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];

      return items.map((itemStr): RawScrapedJob | null => {
        const rawTitle = (itemStr.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemStr.match(/<title>(.*?)<\/title>/))?.[1] || "";
        const link = (itemStr.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/) || itemStr.match(/<link>(.*?)<\/link>/))?.[1] || "";
        const pubDate = (itemStr.match(/<pubDate>(.*?)<\/pubDate>/))?.[1];
        const descMatch = (itemStr.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemStr.match(/<description>([\s\S]*?)<\/description>/))?.[1] || "";

        if (!rawTitle || !link) return null;

        let company = "Remote Employer";
        let title = rawTitle;
        if (rawTitle.includes(":")) {
          const parts = rawTitle.split(":");
          company = parts[0].trim();
          title = parts.slice(1).join(":").trim();
        }

        return {
          title,
          company_name: company,
          url: link,
          apply_url: link,
          description: descMatch,
          posted_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          remote: true,
          workplace_type: "remote",
          location: "Worldwide",
        };
      }).filter((j): j is RawScrapedJob => j !== null);
    } catch (err) {
      console.warn(`[Native Scraper] WWR ${cat} error:`, err);
      return [];
    }
  });

  const results = await Promise.all(promises);
  for (const group of results) {
    jobs.push(...group);
  }
  return jobs;
}

/**
 * 3. Jobicy Multi-Industry Remote Fetcher
 */
export async function fetchJobicyJobs(): Promise<RawScrapedJob[]> {
  const industries = ["engineering", "marketing", "design-multimedia", "business", "supporting"];
  const jobs: RawScrapedJob[] = [];

  const promises = industries.map(async (industry) => {
    try {
      const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&industry=${industry}`, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data.jobs)) return [];

      return data.jobs.map((item: any): RawScrapedJob => ({
        title: item.jobTitle,
        company_name: item.companyName,
        company_logo_url: item.companyLogo,
        url: item.url,
        apply_url: item.url,
        candidate_required_location: item.jobGeo || "Worldwide",
        location: item.jobGeo || "Worldwide",
        description: item.jobDescription,
        posted_at: item.pubDate,
        salary: item.annualSalaryMin && item.annualSalaryMax ? `$${item.annualSalaryMin} - $${item.annualSalaryMax}` : undefined,
        salary_min: item.annualSalaryMin ? Number(item.annualSalaryMin) : undefined,
        salary_max: item.annualSalaryMax ? Number(item.annualSalaryMax) : undefined,
        remote: true,
        workplace_type: "remote",
        tags: [item.jobIndustry, item.jobLevel, item.jobType].filter(Boolean),
      }));
    } catch (err) {
      console.warn(`[Native Scraper] Jobicy ${industry} error:`, err);
      return [];
    }
  });

  const results = await Promise.all(promises);
  for (const group of results) {
    jobs.push(...group);
  }
  return jobs;
}

/**
 * 4. RemoteOK Direct Public Feed Fetcher
 */
export async function fetchRemoteOKJobs(): Promise<RawScrapedJob[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const items = data.filter((item: any) => item && (item.position || item.title) && item.company);

    return items.map((item: any): RawScrapedJob => ({
      title: item.position || item.title,
      company_name: item.company,
      company_logo_url: item.company_logo || item.logo,
      url: item.url ? (item.url.startsWith("http") ? item.url : `https://remoteok.com${item.url}`) : item.apply_url,
      apply_url: item.apply_url || (item.url ? (item.url.startsWith("http") ? item.url : `https://remoteok.com${item.url}`) : undefined),
      tags: Array.isArray(item.tags) ? item.tags : [],
      location: item.location || "Worldwide",
      candidate_required_location: item.location || "Worldwide",
      description: item.description,
      posted_at: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
      salary_min: item.salary_min ? Number(item.salary_min) : undefined,
      salary_max: item.salary_max ? Number(item.salary_max) : undefined,
      remote: true,
      workplace_type: "remote",
    }));
  } catch (err) {
    console.warn("[Native Scraper] RemoteOK feed error:", err);
    return [];
  }
}

/**
 * 5. Remotive All-Category Feed Fetcher
 */
export async function fetchRemotiveJobs(): Promise<RawScrapedJob[]> {
  try {
    const res = await fetch("https://remotive.com/api/remote-jobs", {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.jobs)) return [];

    return data.jobs.map((item: any): RawScrapedJob => ({
      title: item.title,
      company_name: item.company_name,
      company_logo_url: item.company_logo_url,
      url: item.url,
      apply_url: item.url,
      tags: Array.isArray(item.tags) ? item.tags : [item.category].filter(Boolean),
      candidate_required_location: item.candidate_required_location || "Worldwide",
      location: item.candidate_required_location || "Worldwide",
      salary: item.salary,
      description: item.description,
      posted_at: item.publication_date,
      remote: true,
      workplace_type: "remote",
    }));
  } catch (err) {
    console.warn("[Native Scraper] Remotive feed error:", err);
    return [];
  }
}

/**
 * 6. Himalayas Public Remote Jobs Fetcher
 */
export async function fetchHimalayasJobs(): Promise<RawScrapedJob[]> {
  try {
    const res = await fetch("https://himalayas.app/jobs/api?limit=50", {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.jobs)) return [];

    return data.jobs.map((item: any): RawScrapedJob => ({
      title: item.title,
      company_name: item.companyName,
      company_logo_url: item.companyLogo,
      url: item.applicationLink || item.url,
      apply_url: item.applicationLink || item.url,
      tags: Array.isArray(item.categories) ? item.categories : [],
      location: item.locationRestrictions?.join(", ") || "Worldwide",
      candidate_required_location: item.locationRestrictions?.join(", ") || "Worldwide",
      salary: item.minSalary && item.maxSalary ? `$${item.minSalary} - $${item.maxSalary}` : undefined,
      salary_min: item.minSalary ? Number(item.minSalary) : undefined,
      salary_max: item.maxSalary ? Number(item.maxSalary) : undefined,
      description: item.description,
      posted_at: item.pubDate,
      remote: true,
      workplace_type: "remote",
    }));
  } catch (err) {
    console.warn("[Native Scraper] Himalayas feed error:", err);
    return [];
  }
}
