import { RawScrapedJob } from "../apify";

const USER_AGENT = "RemoteWorkDailyScraper/2.0 (+https://remoteworkdaily.com; support@remoteworkdaily.com)";

/**
 * Curated list of prominent remote-first and tech companies
 * using public Greenhouse boards.
 */
const GREENHOUSE_COMPANIES: Array<{ token: string; name: string; logo?: string }> = [
  // Agriculture, Agroforestry & Food Systems
  { token: "oneacrefund", name: "One Acre Fund", logo: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=128&h=128&fit=crop&q=80" },
  { token: "soundagriculture", name: "Sound Agriculture", logo: "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=128&h=128&fit=crop&q=80" },
  { token: "pivotbio", name: "Pivot Bio", logo: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=128&h=128&fit=crop&q=80" },
  { token: "carbonrobotics", name: "Carbon Robotics", logo: "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=128&h=128&fit=crop&q=80" },
  { token: "hellofresh", name: "HelloFresh", logo: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=128&h=128&fit=crop&q=80" },
  { token: "sweetgreen", name: "Sweetgreen", logo: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=128&h=128&fit=crop&q=80" },
  { token: "toast", name: "Toast", logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=128&h=128&fit=crop&q=80" },
  { token: "samsara", name: "Samsara", logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128&h=128&fit=crop&q=80" },
  { token: "instacart", name: "Instacart", logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=128&h=128&fit=crop&q=80" },
  // High-Volume Verified Employers
  { token: "stripe", name: "Stripe", logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop&q=80" },
  { token: "gusto", name: "Gusto", logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128&h=128&fit=crop&q=80" },
  { token: "reddit", name: "Reddit", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80" },
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
  { slug: "rover", name: "Rover", logo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=128&h=128&fit=crop&q=80" },
];

/**
 * Curated list of high-growth companies
 * using public Ashby posting APIs.
 */
const ASHBY_COMPANIES: Array<{ slug: string; name: string; logo?: string }> = [
  { slug: "openai", name: "OpenAI", logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80" },
  { slug: "ramp", name: "Ramp", logo: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=128&h=128&fit=crop&q=80" },
  { slug: "notion", name: "Notion", logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop&q=80" },
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
        const locationLower = locationName.toLowerCase();
        const titleLower = (item.title || "").toLowerCase();

        let workplaceType: "remote" | "hybrid" | "on-site" = "on-site";
        if (locationLower.includes("remote") || titleLower.includes("remote") || locationLower.includes("anywhere") || locationLower.includes("worldwide")) {
          workplaceType = "remote";
        } else if (locationLower.includes("hybrid") || titleLower.includes("hybrid")) {
          workplaceType = "hybrid";
        } else {
          workplaceType = "on-site";
        }
        const isRemote = workplaceType === "remote";

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
          workplace_type: workplaceType,
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
        const locationLower = locationName.toLowerCase();
        const textLower = (item.text || "").toLowerCase();
        const typeLower = (item.categories?.workplaceType || "").toLowerCase();

        let workplaceType: "remote" | "hybrid" | "on-site" = "on-site";
        if (typeLower === "remote" || locationLower.includes("remote") || textLower.includes("remote")) {
          workplaceType = "remote";
        } else if (typeLower === "hybrid" || locationLower.includes("hybrid") || textLower.includes("hybrid")) {
          workplaceType = "hybrid";
        } else {
          workplaceType = "on-site";
        }
        const isRemote = workplaceType === "remote";

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
          workplace_type: workplaceType,
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
        const isRemote = Boolean(item.isRemote);
        const locationName = item.location || (isRemote ? "Worldwide" : "On-site");
        const locationLower = locationName.toLowerCase();
        const titleLower = (item.title || "").toLowerCase();

        let workplaceType: "remote" | "hybrid" | "on-site" = isRemote ? "remote" : "on-site";
        if (locationLower.includes("hybrid") || titleLower.includes("hybrid")) {
          workplaceType = "hybrid";
        }

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
          workplace_type: workplaceType,
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
