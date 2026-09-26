import { RawScrapedJob } from "../apify";

const USER_AGENT = "RemoteWorkDailyScraper/2.0 (+https://remoteworkdaily.com; support@remoteworkdaily.com)";

/**
 * Curated list of prominent remote-first and tech companies
 * using public Greenhouse boards.
 */
const GREENHOUSE_COMPANIES: Array<{ token: string; name: string; logo?: string }> = [
  { token: "gitlab", name: "GitLab", logo: "https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png" },
  { token: "zapier", name: "Zapier", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80" },
  { token: "automattic", name: "Automattic", logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=128&h=128&fit=crop&q=80" },
  { token: "docker", name: "Docker", logo: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=128&h=128&fit=crop&q=80" },
  { token: "elastic", name: "Elastic", logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop&q=80" },
  { token: "wikimedia", name: "Wikimedia Foundation", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Wikimedia-logo_black.png" },
];

/**
 * Curated list of prominent remote-first companies
 * using public Lever postings API.
 */
const LEVER_COMPANIES: Array<{ slug: string; name: string; logo?: string }> = [
  { slug: "buffer", name: "Buffer", logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80" },
  { slug: "kinsta", name: "Kinsta", logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=128&h=128&fit=crop&q=80" },
  { slug: "postman", name: "Postman", logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop&q=80" },
  { slug: "sourcegraph", name: "Sourcegraph", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80" },
];

/**
 * Curated list of high-growth remote tech companies
 * using public Ashby posting APIs.
 */
const ASHBY_COMPANIES: Array<{ slug: string; name: string; logo?: string }> = [
  { slug: "supabase", name: "Supabase", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80" },
  { slug: "linear", name: "Linear", logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop&q=80" },
  { slug: "cursor", name: "Cursor", logo: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=128&h=128&fit=crop&q=80" },
];

function cleanHtml(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);
}

/**
 * 1. Greenhouse Direct ATS Scraper
 * Pulls from official boards-api.greenhouse.io endpoints.
 */
export async function fetchGreenhouseAtsJobs(): Promise<RawScrapedJob[]> {
  const jobs: RawScrapedJob[] = [];

  const promises = GREENHOUSE_COMPANIES.map(async (company) => {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company.token}/jobs?content=true`;
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data.jobs)) return [];

      return data.jobs.map((item: any): RawScrapedJob => {
        const locationName = item.location?.name || "Worldwide";
        const isRemote =
          locationName.toLowerCase().includes("remote") ||
          item.title?.toLowerCase().includes("remote") ||
          true; // Companies in this list are remote-friendly

        return {
          title: item.title,
          company_name: company.name,
          company_logo_url: company.logo,
          url: item.absolute_url,
          apply_url: item.absolute_url,
          location: locationName,
          candidate_required_location: locationName,
          description: cleanHtml(item.content),
          posted_at: item.updated_at ? new Date(item.updated_at).toISOString() : new Date().toISOString(),
          remote: isRemote,
          workplace_type: isRemote ? "remote" : "hybrid",
          tags: ["Direct ATS", "Company Careers", company.name],
          source: "ats",
          ats_provider: "greenhouse",
          is_direct_company_post: true,
        };
      });
    } catch (err) {
      console.warn(`[ATS Scraper] Greenhouse ${company.token} error:`, err);
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
 * 2. Lever Direct ATS Scraper
 * Pulls from official api.lever.co/v0/postings endpoints.
 */
export async function fetchLeverAtsJobs(): Promise<RawScrapedJob[]> {
  const jobs: RawScrapedJob[] = [];

  const promises = LEVER_COMPANIES.map(async (company) => {
    try {
      const url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any): RawScrapedJob => {
        const locationName = item.categories?.location || "Worldwide";
        const isRemote =
          locationName.toLowerCase().includes("remote") ||
          item.text?.toLowerCase().includes("remote") ||
          item.categories?.workplaceType === "remote" ||
          true;

        const team = item.categories?.team ? [item.categories.team] : [];

        return {
          title: item.text,
          company_name: company.name,
          company_logo_url: company.logo,
          url: item.hostedUrl || item.applyUrl,
          apply_url: item.applyUrl || item.hostedUrl,
          location: locationName,
          candidate_required_location: locationName,
          description: cleanHtml(item.descriptionPlain || item.description),
          posted_at: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
          remote: isRemote,
          workplace_type: isRemote ? "remote" : "hybrid",
          tags: ["Direct ATS", "Company Careers", ...team],
          source: "ats",
          ats_provider: "lever",
          is_direct_company_post: true,
        };
      });
    } catch (err) {
      console.warn(`[ATS Scraper] Lever ${company.slug} error:`, err);
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
 * 3. Ashby Direct ATS Scraper
 * Pulls from public Ashby posting endpoints.
 */
export async function fetchAshbyAtsJobs(): Promise<RawScrapedJob[]> {
  const jobs: RawScrapedJob[] = [];

  const promises = ASHBY_COMPANIES.map(async (company) => {
    try {
      const url = `https://api.ashbyhq.com/posting-api/job-board/${company.slug}`;
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 0 },
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data.jobs)) return [];

      return data.jobs.map((item: any): RawScrapedJob => {
        const isRemote = item.isRemote ?? true;
        const locationName = item.location || (isRemote ? "Worldwide" : "On-site");

        return {
          title: item.title,
          company_name: company.name,
          company_logo_url: company.logo,
          url: item.jobUrl || item.applyUrl,
          apply_url: item.applyUrl || item.jobUrl,
          location: locationName,
          candidate_required_location: locationName,
          description: cleanHtml(item.descriptionHtml),
          posted_at: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString(),
          remote: isRemote,
          workplace_type: isRemote ? "remote" : "hybrid",
          tags: ["Direct ATS", "Company Careers", item.department].filter(Boolean),
          source: "ats",
          ats_provider: "ashby",
          is_direct_company_post: true,
        };
      });
    } catch (err) {
      console.warn(`[ATS Scraper] Ashby ${company.slug} error:`, err);
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
 * Orchestrates all direct ATS scrapers in parallel
 * to fetch authentic company career page listings.
 */
export async function fetchDirectAtsJobs(): Promise<RawScrapedJob[]> {
  const [greenhouse, lever, ashby] = await Promise.all([
    fetchGreenhouseAtsJobs(),
    fetchLeverAtsJobs(),
    fetchAshbyAtsJobs(),
  ]);

  return [...greenhouse, ...lever, ...ashby];
}
