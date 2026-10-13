import crypto from "crypto";

export type WorkArrangement = "remote_global" | "remote_regional" | "hybrid_high_pay" | "on_site";

export interface ClassificationResult {
  workArrangement: WorkArrangement;
  shouldIngest: boolean;
  hybridCity?: string;
  hybridCountry?: string;
  daysInOffice?: string;
  employerEmail?: string;
  externalId: string;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const JUNK_EMAIL_DOMAINS = [
  "example.com", "test.com", "domain.com", "sentry.io", "w3.org", "schema.org", "github.com",
];

const SENIOR_SPECIALIZED_ROLES = /\b(senior|lead|staff|principal|director|head of|vp|vice president|chief|architect|manager|engineer|developer|designer|product|data scientist|quantitative|analyst|finance|cfo|cto|controller|consultant|specialist|strategist)\b/i;

const DAYS_IN_OFFICE_REGEX = /\b(\d(?:\s*-\s*\d)?\s*days?(?:\s*(?:a|\/|per)\s*week)?(?:\s*in(?:\s*the)?\s*office|\s*on-site)?)\b/i;

/**
 * Generates deterministic unique external_id hash from company, title, and location.
 */
export function generateExternalId(company: string, title: string, location: string = ""): string {
  const norm = `${company.toLowerCase().trim()}:${title.toLowerCase().trim()}:${location.toLowerCase().trim()}`;
  return crypto.createHash("sha256").update(norm).digest("hex").slice(0, 32);
}

/**
 * Extracts HR/Employer contact email from text with smart domain fallback.
 */
export function extractEmployerEmail(
  text: string = "",
  companyWebsite: string = "",
  companyName: string = ""
): string | undefined {
  if (text) {
    const matches = text.match(EMAIL_REGEX);
    if (matches && matches.length > 0) {
      for (const m of matches) {
        const lower = m.toLowerCase().trim();
        const domain = lower.split("@")[1];
        if (domain && !JUNK_EMAIL_DOMAINS.includes(domain) && !lower.endsWith(".png") && !lower.endsWith(".jpg")) {
          return lower;
        }
      }
    }
  }

  // Smart domain fallback
  if (companyWebsite) {
    try {
      const url = new URL(companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`);
      const host = url.hostname.replace(/^www\./, "");
      if (host && host.includes(".") && !JUNK_EMAIL_DOMAINS.includes(host)) {
        return `careers@${host}`;
      }
    } catch {
      // Invalid URL, continue
    }
  }

  if (companyName) {
    const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanCompany.length >= 3) {
      return `careers@${cleanCompany}.com`;
    }
  }

  return undefined;
}

/**
 * Extracts hybrid office days and metro city/country from job descriptions & location fields.
 */
export function extractHybridMetadata(description: string = "", location: string = ""): {
  daysInOffice?: string;
  hybridCity?: string;
  hybridCountry?: string;
} {
  let daysInOffice: string | undefined;
  const matchDays = description.match(DAYS_IN_OFFICE_REGEX);
  if (matchDays && matchDays[1]) {
    daysInOffice = matchDays[1].trim();
  }

  let hybridCity: string | undefined;
  let hybridCountry: string | undefined;

  const loc = location.trim();
  if (loc && !loc.toLowerCase().includes("worldwide") && !loc.toLowerCase().includes("anywhere")) {
    const parts = loc.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      hybridCity = parts[0];
      hybridCountry = parts[1];
    } else if (parts.length === 1) {
      hybridCity = parts[0];
    }
  }

  return { daysInOffice, hybridCity, hybridCountry };
}

/**
 * Classifies a job into work_arrangement ('remote_global' | 'remote_regional' | 'hybrid_high_pay')
 * and enforces the High-Paying Hybrid Filter Rule.
 */
export function classifyJobArrangement(params: {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  workplaceType?: string;
  companyWebsite?: string;
}): ClassificationResult {
  const { title, company, salaryMin = 0, salaryMax = 0 } = params;
  const location = params.location || "";
  const description = params.description || "";
  const externalId = generateExternalId(company, title, location);
  const email = extractEmployerEmail(description, params.companyWebsite, company);
  const hybridMeta = extractHybridMetadata(description, location);

  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const locLower = location.toLowerCase();

  const isHybridMentioned =
    params.workplaceType === "hybrid" ||
    titleLower.includes("hybrid") ||
    descLower.includes("hybrid") ||
    locLower.includes("hybrid");

  if (isHybridMentioned) {
    // Hybrid Filter Rule:
    // Only ingest if salary >= $90,000 OR is mid-to-senior tech, product, finance, exec role
    const effectiveSalary = Math.max(salaryMin, salaryMax);
    const hasHighSalary = effectiveSalary >= 90000;
    const isSeniorSpecialized = SENIOR_SPECIALIZED_ROLES.test(title);

    if (hasHighSalary || isSeniorSpecialized) {
      return {
        workArrangement: "hybrid_high_pay",
        shouldIngest: true,
        hybridCity: hybridMeta.hybridCity,
        hybridCountry: hybridMeta.hybridCountry,
        daysInOffice: hybridMeta.daysInOffice || "2-3 days in office",
        employerEmail: email,
        externalId,
      };
    } else {
      // Discard low-skill local on-site / non-qualifying hybrid job
      return {
        workArrangement: "on_site",
        shouldIngest: false,
        externalId,
      };
    }
  }

  // Check if regional remote
  const isRegional =
    locLower.includes("us only") ||
    locLower.includes("usa only") ||
    locLower.includes("united states") ||
    locLower.includes("europe") ||
    locLower.includes("uk only") ||
    locLower.includes("canada only") ||
    locLower.includes("latam") ||
    locLower.includes("apac") ||
    locLower.includes("emea") ||
    descLower.includes("must be based in") ||
    descLower.includes("residents of");

  const arrangement: WorkArrangement = isRegional ? "remote_regional" : "remote_global";

  return {
    workArrangement: arrangement,
    shouldIngest: true,
    employerEmail: email,
    externalId,
  };
}

/**
 * Checks whether a job was posted more than 30 days ago.
 */
export function isJobExpired(postedAt: string | Date): boolean {
  if (!postedAt) return false;
  const time = new Date(postedAt).getTime();
  if (isNaN(time)) return false;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - time > thirtyDaysMs;
}
