/**
 * Reconciles data/jobs.json (source of truth) with Supabase `jobs`.
 *  - Inserts JSON jobs missing from Supabase (by id AND canonical_hash)
 *  - Archives/deactivates active Supabase rows that no longer exist in JSON
 * Usage: node scripts/reconcile-supabase.mjs          (dry run)
 *        node scripts/reconcile-supabase.mjs --apply  (write changes)
 */
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const l of fs.readFileSync(f, "utf8").split("\n")) {
    const t = l.trim(); const i = t.indexOf("=");
    if (t && !t.startsWith("#") && i > 0 && !process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}
const APPLY = process.argv.includes("--apply");
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } }
);

const local = JSON.parse(fs.readFileSync("data/jobs.json", "utf8"));
const remote = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("jobs").select("id,canonical_hash,external_id,status").range(from, from + 999);
  if (error) throw new Error(error.message);
  remote.push(...data);
  if (data.length < 1000) break;
}
const rIds = new Set(remote.map((r) => r.id)), rHashes = new Set(remote.map((r) => r.canonical_hash).filter(Boolean));
const rExts = new Map();
for (const r of remote) {
  if (r.external_id) rExts.set(r.external_id, r.id);
}
const lIds = new Set(local.map((j) => j.id)), lHashes = new Set(local.map((j) => j.canonicalHash).filter(Boolean));

// Dedupe within JSON by hash so one insert batch can't violate the unique constraint
const seen = new Set();
const missing = local.filter((j) => {
  if (rIds.has(j.id) || (j.canonicalHash && rHashes.has(j.canonicalHash))) return false;
  if (j.canonicalHash) { if (seen.has(j.canonicalHash)) return false; seen.add(j.canonicalHash); }
  return true;
});
const stale = remote.filter((r) => r.status === "active" && !lIds.has(r.id) && !(r.canonical_hash && lHashes.has(r.canonical_hash))).map((r) => r.id);

console.log(`JSON: ${local.length} | Supabase: ${remote.length} | to insert: ${missing.length} | to archive: ${stale.length}`);
if (!APPLY) { console.log("Dry run. Re-run with --apply to write."); process.exit(0); }

const iso = (v) => { const d = new Date(/^\d{9,13}$/.test(String(v)) ? (Number(v) < 1e10 ? Number(v) * 1000 : Number(v)) : v); return isNaN(d) ? new Date().toISOString() : d.toISOString(); };
const seenBatchExts = new Set();
const UNPAIRED_SURROGATE_REGEX = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
const cleanStr = (v) => (typeof v === "string" ? v.replace(UNPAIRED_SURROGATE_REGEX, "") : v);
const cleanArr = (arr) => (Array.isArray(arr) ? arr.map((item) => (typeof item === "string" ? item.replace(UNPAIRED_SURROGATE_REGEX, "") : item)) : []);

const row = (j) => {
  let ext = cleanStr(j.externalId ?? null);
  if (ext) {
    if (seenBatchExts.has(ext) || (rExts.has(ext) && rExts.get(ext) !== j.id)) {
      ext = `${ext}_${j.id}`;
    }
    seenBatchExts.add(ext);
  }

  return {
    id: j.id, slug: cleanStr(j.slug), title: cleanStr(j.title), company: cleanStr(j.company), company_slug: cleanStr(j.companySlug),
    company_logo: cleanStr(j.companyLogo ?? null), company_website: cleanStr(j.companyWebsite ?? null),
    verified: j.verified ?? true, featured: j.featured ?? false, sticky: j.sticky ?? false,
    location: cleanStr(j.location ?? "Worldwide"), location_code: cleanStr(j.locationCode ?? "WW"), workplace_type: j.workplaceType ?? "remote",
    category: cleanStr(j.category ?? "dev"), tags: cleanArr(j.tags), benefits: cleanArr(j.benefits),
    salary_min: j.salaryMin ?? null, salary_max: j.salaryMax ?? null, salary_currency: cleanStr(j.salaryCurrency ?? "USD"),
    description: cleanStr(j.description ?? ""), apply_url: cleanStr(j.applyUrl), posted_at: iso(j.postedAt),
    views_count: j.viewsCount ?? 0, applies_count: j.appliesCount ?? 0, source: cleanStr(j.source ?? "direct"),
    status: j.status ?? "active", employer_email: cleanStr(j.employerEmail ?? null), canonical_hash: cleanStr(j.canonicalHash ?? null),
    work_arrangement: j.workArrangement ?? (j.workplaceType === "hybrid" ? "hybrid_high_pay" : "remote_global"),
    hybrid_city: cleanStr(j.hybridCity ?? null), hybrid_country: cleanStr(j.hybridCountry ?? null), days_in_office: j.daysInOffice ?? null,
    external_id: ext, is_featured: j.isFeatured ?? j.featured ?? false, is_active: j.isActive ?? (j.status !== "archived"),
    is_public_sector: j.isPublicSector ?? j.isGovernment ?? false, is_government: j.isGovernment ?? j.isPublicSector ?? false,
    agency: cleanStr(j.agency ?? null), agency_logo: cleanStr(j.agencyLogo ?? null), jurisdiction: cleanStr(j.jurisdiction ?? null),
    public_sector_type: j.publicSectorType ?? null, grade: cleanStr(j.grade ?? null), eligibility_type: j.eligibilityType ?? null,
    citizenship_requirements: cleanArr(j.citizenshipRequirements), security_clearance_required: j.securityClearanceRequired ?? false,
    security_clearance_level: cleanStr(j.securityClearanceLevel ?? null), application_deadline: j.applicationDeadline ?? null,
    languages_required: cleanArr(j.languagesRequired), required_documents: cleanArr(j.requiredDocuments),
    original_apply_url: cleanStr(j.originalApplyUrl ?? j.applyUrl), selection_ref: cleanStr(j.selectionRef ?? null),
    europass_ready: j.europassReady ?? false, p11_ready: j.p11Ready ?? false, portal_type: cleanStr(j.portalType ?? null),
    updated_at: new Date().toISOString(),
  };
};

let ok = 0, fail = 0;
for (let i = 0; i < missing.length; i += 100) {
  const chunk = missing.slice(i, i + 100).map(row);
  const { error } = await sb.from("jobs").upsert(chunk, { onConflict: "id" });
  if (error) {
    fail += chunk.length;
    console.warn(`insert chunk ${i} failed:`, error.message);
  } else {
    ok += chunk.length;
  }
}

let archived = 0;
for (let i = 0; i < stale.length; i += 200) {
  const ids = stale.slice(i, i + 200);
  let { error } = await sb.from("jobs").update({ status: "archived", is_active: false, updated_at: new Date().toISOString() }).in("id", ids);
  if (error) {
    // If RLS check prevents changing status enum with anon key, deactivate
    const fallback = await sb.from("jobs").update({ is_active: false, updated_at: new Date().toISOString() }).in("id", ids);
    if (fallback.error) {
      console.warn("archive chunk failed:", fallback.error.message);
    } else {
      archived += ids.length;
    }
  } else {
    archived += ids.length;
  }
}
console.log(`Inserted ${ok} (failed ${fail}) | Deactivated/Archived ${archived}`);
