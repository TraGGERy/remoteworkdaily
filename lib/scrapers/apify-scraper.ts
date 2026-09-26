import { getApifyClient, RawScrapedJob } from "../apify";

/**
 * Apify Actor Scraper Runner
 * Executes targeted Apify Actors to scrape hundreds of fresh remote jobs.
 */
export async function fetchApifyJobs(
  actorId: string = "apify/web-scraper",
  inputConfig?: Record<string, unknown>
): Promise<RawScrapedJob[]> {
  const client = getApifyClient();
  if (!client) {
    return [];
  }

  try {
    console.log(`[Apify Scraper] Launching actor: ${actorId}`);
    const defaultInput = {
      startUrls: [
        { url: "https://remoteok.com/api" },
        { url: "https://weworkremotely.com/categories/remote-programming-jobs.rss" }
      ],
      maxRequestsPerCrawl: 50,
    };

    const run = await client.actor(actorId).call(inputConfig || defaultInput);
    if (!run || !run.defaultDatasetId) {
      console.warn(`[Apify Scraper] Actor ${actorId} completed without dataset ID.`);
      return [];
    }

    const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 500 });
    console.log(`[Apify Scraper] Retrieved ${items.length} raw items from dataset ${run.defaultDatasetId}`);

    return (items as any[]).map((raw: any): RawScrapedJob => ({
      title: raw.title || raw.position || raw.jobTitle || raw.role,
      company: raw.company || raw.company_name || raw.companyName,
      company_name: raw.company_name || raw.company || raw.companyName,
      company_logo_url: raw.company_logo || raw.company_logo_url || raw.logo || raw.companyLogo,
      url: raw.url || raw.apply_url || raw.jobUrl || raw.link,
      apply_url: raw.apply_url || raw.url || raw.jobUrl || raw.link,
      location: raw.location || raw.candidate_required_location || (raw.remote ? "Worldwide" : "On-site"),
      candidate_required_location: raw.candidate_required_location || raw.location,
      description: raw.description || raw.jobDescription || raw.summary,
      tags: Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === "string" ? raw.tags.split(",") : [],
      salary: raw.salary || (raw.salary_min && raw.salary_max ? `$${raw.salary_min} - $${raw.salary_max}` : undefined),
      salary_min: raw.salary_min ? Number(raw.salary_min) : undefined,
      salary_max: raw.salary_max ? Number(raw.salary_max) : undefined,
      posted_at: raw.posted_at || raw.publication_date || raw.date || raw.postedAt,
      remote: raw.remote !== false,
      workplace_type: raw.workplace_type || (raw.remote === false ? "on-site" : "remote"),
    })).filter((j) => Boolean(j.title && (j.company || j.company_name)));
  } catch (err) {
    console.warn(`[Apify Scraper] Error executing actor ${actorId}:`, err);
    return [];
  }
}
