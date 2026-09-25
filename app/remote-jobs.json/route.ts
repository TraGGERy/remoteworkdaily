import { NextResponse } from "next/server";
import { getAllJobs } from "@/lib/jobs-repository";

export async function GET() {
  const jobs = getAllJobs();

  // Replicate RemoteOK JSON format
  const formatted = [
    {
      legal: "Remote Work Daily JSON API - Machine-readable syndication feed for remote professionals, AI agents, and search crawlers with #OpenSalaries metadata.",
      updated_at: new Date().toISOString(),
      count: jobs.length,
    },
    ...jobs.map((j) => {
      const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com"}/jobs/${j.id}/${j.slug}`;
      return {
        id: j.id,
        epoch: Math.floor(new Date(j.postedAt).getTime() / 1000),
        date: j.postedAt,
        company: j.company,
        company_logo: j.companyLogo || "",
        position: j.title,
        tags: j.tags,
        description: j.description,
        location: j.location,
        salary_min: j.salaryMin || 0,
        salary_max: j.salaryMax || 0,
        salary_currency: j.salaryCurrency || "USD",
        url: jobUrl,
        apply_url: `${jobUrl}#apply`, // Subscriber gated application portal
        benefits: j.benefits,
        sticky: j.sticky || false,
        featured: j.featured || false,
      };
    }),
  ];

  return NextResponse.json(formatted, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "s-maxage=60, stale-while-revalidate",
    },
  });
}
