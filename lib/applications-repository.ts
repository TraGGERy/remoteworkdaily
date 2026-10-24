import fs from "fs";
import path from "path";
import { GovernmentApplication } from "./types";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";

const DATA_FILE = path.join(process.cwd(), "data", "applications.json");
let memoryCache: Map<string, GovernmentApplication> | null = null;

function ensureCache(): Map<string, GovernmentApplication> {
  if (memoryCache) return memoryCache;

  memoryCache = new Map();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const records = JSON.parse(content) as GovernmentApplication[];
      if (Array.isArray(records)) {
        for (const r of records) {
          if (r.id) {
            memoryCache.set(r.id, r);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Applications Repo] Could not read local applications file:", err);
  }
  return memoryCache;
}

function persistToDisk() {
  if (!memoryCache) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const array = Array.from(memoryCache.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(array, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Applications Repo] Could not persist applications to disk:", err);
  }
}

/**
 * Creates or updates an Easy Apply government application.
 */
export async function saveGovernmentApplication(
  app: Omit<GovernmentApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<GovernmentApplication> {
  const cache = ensureCache();
  const now = new Date().toISOString();
  const id = app.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const record: GovernmentApplication = {
    ...app,
    id,
    createdAt: (app as GovernmentApplication).createdAt || now,
    updatedAt: now,
  };

  cache.set(id, record);
  persistToDisk();

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseClient();
      if (sb) {
        await sb.from("applications").upsert({
          id: record.id,
          clerk_user_id: record.clerkUserId || null,
          candidate_email: record.candidateEmail,
          candidate_name: record.candidateName,
          job_id: record.jobId,
          job_title: record.jobTitle,
          agency: record.agency,
          format_type: record.formatType,
          eligibility_status: record.eligibilityStatus,
          eligibility_details: record.eligibilityDetails,
          prefilled_package: record.prefilledPackage,
          motivation_letter: record.motivationLetter || null,
          status: record.status,
          submitted_at: record.submittedAt || null,
          updated_at: record.updatedAt,
        });
      }
    } catch (err) {
      console.warn("[Applications Repo] Supabase upsert notice:", err);
    }
  }

  return record;
}

/**
 * Retrieves applications submitted by candidate email.
 */
export async function getApplicationsByEmail(email: string): Promise<GovernmentApplication[]> {
  const cache = ensureCache();
  const local = Array.from(cache.values()).filter(
    (a) => a.candidateEmail.toLowerCase() === email.toLowerCase()
  );

  if (local.length > 0) return local;

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseClient();
      if (sb) {
        const { data } = await sb
          .from("applications")
          .select("*")
          .ilike("candidate_email", email);

        if (data && data.length > 0) {
          return data.map(mapDbToApplication);
        }
      }
    } catch (err) {
      console.warn("[Applications Repo] Supabase query notice:", err);
    }
  }

  return [];
}

/**
 * Retrieves application by ID.
 */
export async function getApplicationById(id: string): Promise<GovernmentApplication | null> {
  const cache = ensureCache();
  const local = cache.get(id);
  if (local) return local;

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabaseClient();
      if (sb) {
        const { data } = await sb.from("applications").select("*").eq("id", id).maybeSingle();
        if (data) return mapDbToApplication(data);
      }
    } catch (err) {
      console.warn("[Applications Repo] Supabase query notice:", err);
    }
  }

  return null;
}

function mapDbToApplication(row: any): GovernmentApplication {
  return {
    id: row.id,
    clerkUserId: row.clerk_user_id || undefined,
    candidateEmail: row.candidate_email,
    candidateName: row.candidate_name,
    jobId: row.job_id,
    jobTitle: row.job_title,
    agency: row.agency,
    formatType: row.format_type || "europass",
    eligibilityStatus: row.eligibility_status || "eligible",
    eligibilityDetails: row.eligibility_details || {},
    prefilledPackage: row.prefilled_package || {},
    motivationLetter: row.motivation_letter || undefined,
    status: row.status || "draft",
    submittedAt: row.submitted_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
