import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env
const envFile = path.join(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase configuration in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const dataPath = path.join(process.cwd(), "data", "jobs.json");
  if (!fs.existsSync(dataPath)) {
    console.error("data/jobs.json not found!");
    process.exit(1);
  }

  const jobs = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`Loaded ${jobs.length} jobs from data/jobs.json`);

  const BATCH_SIZE = 50;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const chunk = jobs.slice(i, i + BATCH_SIZE);
    const records = chunk.map((job) => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      company: job.company,
      company_slug: job.companySlug,
      company_logo: job.companyLogo || null,
      company_website: job.companyWebsite || null,
      verified: job.verified ?? true,
      featured: job.featured ?? false,
      sticky: job.sticky ?? false,
      location: job.location || "Worldwide",
      location_code: job.locationCode || "WW",
      workplace_type: job.workplaceType || "remote",
      category: job.category || "dev",
      tags: Array.isArray(job.tags) ? job.tags : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      salary_min: job.salaryMin || null,
      salary_max: job.salaryMax || null,
      salary_currency: job.salaryCurrency || "USD",
      description: job.description || "",
      apply_url: job.applyUrl,
      posted_at: job.postedAt || new Date().toISOString(),
      views_count: job.viewsCount || 0,
      applies_count: job.appliesCount || 0,
      source: job.source || "direct",
      status: job.status || "active",
      employer_email: job.employerEmail || null,
      canonical_hash: job.canonicalHash || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("jobs").upsert(records, { onConflict: "id" });

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message);
      failCount += chunk.length;
    } else {
      successCount += chunk.length;
      process.stdout.write(`\rSynced ${successCount}/${jobs.length} jobs to Supabase...`);
    }
  }

  console.log(`\n\nFinished syncing jobs to Supabase!`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

main().catch(console.error);
