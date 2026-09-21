/**
 * Bounded Context: Data Ingestion & Normalization
 * Invariant enforcement, deduplication hashing, and sanitization for remote jobs.
 */
import crypto from "crypto";

export class JobDeduplicationService {
  /**
   * Generates a deterministic SHA-256 fingerprint for deduplication across scraping runs.
   */
  static generateFingerprint(company: string, title: string, applyUrl: string): string {
    const normCompany = (company || "").trim().toLowerCase();
    const normTitle = (title || "").trim().toLowerCase();
    const normUrl = (applyUrl || "").trim().toLowerCase();

    const payload = `${normCompany}:${normTitle}:${normUrl}`;
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  static isDuplicate(fingerprint: string, existingFingerprints: Set<string>): boolean {
    return existingFingerprints.has(fingerprint);
  }
}
