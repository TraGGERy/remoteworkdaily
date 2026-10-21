import { getAllJobs, getTopCompanies } from "@/lib/jobs-repository";
import { ROLE_CATEGORIES, REGIONS_AND_COUNTRIES, POPULAR_TAGS } from "@/lib/constants";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";
  const jobs = getAllJobs();

  const urls: string[] = [
    `<url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${baseUrl}/hire-remotely</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `<url><loc>${baseUrl}/pro</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `<url><loc>${baseUrl}/companies</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
    `<url><loc>${baseUrl}/remote-jobs.json</loc><changefreq>hourly</changefreq><priority>0.85</priority></url>`,
    `<url><loc>${baseUrl}/tools/remote-savings-calculator</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
    `<url><loc>${baseUrl}/tools/cv-tailor</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
    `<url><loc>${baseUrl}/ghost-job-listings-on-the-rise-how-to</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
    `<url><loc>${baseUrl}/worldwide-remote-jobs</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
    `<url><loc>${baseUrl}/remote-jobs-for-introverts</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`,
    `<url><loc>${baseUrl}/project-manager-titles</loc><changefreq>daily</changefreq><priority>0.85</priority></url>`,
    `<url><loc>${baseUrl}/vs/careerhound</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
    `<url><loc>${baseUrl}/llms.txt</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  ];

  // Role & Category Hubs
  ROLE_CATEGORIES.forEach((cat) => {
    if (cat.tag) {
      urls.push(
        `<url><loc>${baseUrl}/remote-${cat.tag}-jobs</loc><changefreq>daily</changefreq><priority>0.85</priority></url>`
      );
    }
  });

  // Top Tech Stack & Skill Hubs
  const seenSkillSlugs = new Set<string>();
  POPULAR_TAGS.forEach((tag) => {
    const slug = tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (slug && !seenSkillSlugs.has(slug)) {
      seenSkillSlugs.add(slug);
      urls.push(
        `<url><loc>${baseUrl}/remote-${slug}-jobs</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`
      );
    }
  });

  // Top Employer Company Hubs (Stripe, OpenAI, Elastic, GitLab, etc.)
  const topCompanies = getTopCompanies(100);
  topCompanies.forEach((company) => {
    if (company.count >= 2) {
      urls.push(
        `<url><loc>${baseUrl}/companies/${company.slug}</loc><changefreq>daily</changefreq><priority>0.85</priority></url>`
      );
    }
  });

  // Top Location Pages
  REGIONS_AND_COUNTRIES.forEach((group) => {
    group.items.forEach((item) => {
      const slug = item.name.toLowerCase().replace(/\s+/g, "-");
      urls.push(
        `<url><loc>${baseUrl}/remote-jobs-in-${slug}</loc><changefreq>daily</changefreq><priority>0.75</priority></url>`
      );
    });
  });

  // Individual Job Pages
  jobs.forEach((job) => {
    urls.push(
      `<url><loc>${baseUrl}/jobs/${job.id}/${job.slug}</loc><lastmod>${new Date(job.postedAt).toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`
    );
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
