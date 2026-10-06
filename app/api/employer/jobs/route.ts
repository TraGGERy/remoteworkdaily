import { NextResponse } from "next/server";
import { getAllJobs } from "@/lib/jobs-repository";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { Job } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email || !email.trim()) {
    return NextResponse.json({
      count: 0,
      jobs: [],
      totalViews: 0,
      totalApplies: 0,
      message: "Please provide an employer work email to view your active postings.",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Get all jobs from persistent repository
  const allJobs = getAllJobs(true);

  // 2. Filter jobs posted by this employer
  let employerJobs = allJobs.filter((j) => {
    if (!j.employerEmail) return false;
    return j.employerEmail.toLowerCase().trim() === normalizedEmail;
  });

  // 3. Fallback to Supabase if configured and local returned 0
  if (employerJobs.length === 0 && isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase
          .from("jobs")
          .select("*")
          .ilike("employer_email", normalizedEmail)
          .order("posted_at", { ascending: false });

        if (data && data.length > 0) {
          employerJobs = data.map((d) => ({
            id: d.id,
            slug: d.slug,
            title: d.title,
            company: d.company,
            companySlug: d.company_slug,
            companyLogo: d.company_logo,
            companyWebsite: d.company_website,
            verified: Boolean(d.verified),
            featured: Boolean(d.featured),
            sticky: Boolean(d.sticky),
            location: d.location || "Worldwide",
            locationCode: d.location_code || "WW",
            workplaceType: d.workplace_type || "remote",
            category: d.category || "dev",
            tags: d.tags || [],
            benefits: d.benefits || [],
            salaryMin: d.salary_min ? Number(d.salary_min) : undefined,
            salaryMax: d.salary_max ? Number(d.salary_max) : undefined,
            salaryCurrency: d.salary_currency || "USD",
            description: d.description || "",
            applyUrl: d.apply_url || "",
            postedAt: d.posted_at || new Date().toISOString(),
            viewsCount: Number(d.views_count) || 0,
            appliesCount: Number(d.applies_count) || 0,
            source: d.source || "direct",
            employerEmail: d.employer_email,
            status: d.status || "active",
          })) as Job[];
        }
      } catch (err) {
        console.warn("[Employer Jobs API] Supabase query notice:", err);
      }
    }
  }

  const totalViews = employerJobs.reduce((sum, j) => sum + (j.viewsCount || 0), 0);
  const totalApplies = employerJobs.reduce((sum, j) => sum + (j.appliesCount || 0), 0);

  return NextResponse.json({
    count: employerJobs.length,
    jobs: employerJobs,
    totalViews,
    totalApplies,
    employerEmail: normalizedEmail,
  });
}
