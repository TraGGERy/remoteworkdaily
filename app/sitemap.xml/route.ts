import { getAllJobs } from "@/lib/jobs-repository";
import { ROLE_CATEGORIES, REGIONS_AND_COUNTRIES } from "@/lib/constants";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";
  const jobs = getAllJobs();

  const urls: string[] = [
    `<url><loc>${baseUrl}/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${baseUrl}/hire-remotely</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    `<url><loc>${baseUrl}/remote-jobs.json</loc><changefreq>hourly</changefreq><priority>0.85</priority></url>`,
    `<url><loc>${baseUrl}/llms.txt</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  ];

  // Category & Role Pages
  ROLE_CATEGORIES.forEach((cat) => {
    if (cat.tag) {
      urls.push(
        `<url><loc>${baseUrl}/remote-${cat.tag}-jobs</loc><changefreq>daily</changefreq><priority>0.85</priority></url>`
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
