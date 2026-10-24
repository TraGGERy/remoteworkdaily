import assert from "node:assert/strict";
import { generateJobPostingSchema } from "../lib/seo";

const testJobs = [
  { id: "1", title: "Machine Learning Engineer, Growth", company: "Acme", location: "San Francisco", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "2", title: "Manager, Account Manager | Growth", company: "Acme", location: "New York, NY (HQ)", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "3", title: "Performance Creative Manager", company: "Acme", location: "USA", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "4", title: "Senior Category Manager Marketing, Indirect Procurement", company: "Acme", location: "New York, NY, United States", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "5", title: "Senior Growth Manager, UK", company: "Acme", location: "UK", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "6", title: "Senior Machine Learning Engineer, Growth", company: "Acme", location: "Toronto, Ontario, Canada", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "7", title: "Senior Marketing Data Analyst Pricing (all genders)", company: "Acme", location: "Berlin, Berlin, Germany", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "8", title: "Staff Android Engineer, Brand Ad Formats", company: "Acme", location: "Remote - United States", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "9", title: "Staff Data Scientist, Marketing", company: "Acme", location: "Remote - Ontario, Canada", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
  { id: "10", title: "Staff Data Scientist, Marketing", company: "Acme", location: "Remote - United States", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" },
];

for (const job of testJobs) {
  const schema = generateJobPostingSchema(job as any);
  assert.equal(schema.jobLocationType, "TELECOMMUTE", `Job ${job.title} must have TELECOMMUTE`);
  const reqs = Array.isArray(schema.applicantLocationRequirements)
    ? schema.applicantLocationRequirements
    : [schema.applicantLocationRequirements];
  for (const r of reqs as any[]) {
    assert.equal(r["@type"], "Country", `Must be @type: "Country" for ${job.title}`);
    assert.notEqual(r["@type"], "AdministrativeArea", `Must never be AdministrativeArea for ${job.title}`);
    assert.ok(typeof r.name === "string" && r.name.length > 0, `Must have valid country name for ${job.title}`);
  }
}

// Check worldwide
const wwJob = { id: "ww", title: "Global Dev", company: "Acme", location: "Worldwide", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" };
const wwSchema = generateJobPostingSchema(wwJob as any);
assert.ok(Array.isArray(wwSchema.applicantLocationRequirements), "Worldwide must emit array");
for (const c of wwSchema.applicantLocationRequirements as any[]) {
  assert.equal(c["@type"], "Country");
  assert.notEqual(c.name, "Worldwide");
}

// Check multi-country
const multiJob = { id: "multi", title: "NA Lead", company: "Acme", location: "Canada, USA", workplaceType: "remote" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" };
const multiSchema = generateJobPostingSchema(multiJob as any);
assert.ok(Array.isArray(multiSchema.applicantLocationRequirements), "Multi-country must emit array");
const names = (multiSchema.applicantLocationRequirements as any[]).map((c) => c.name);
assert.ok(names.includes("Canada") && names.includes("United States"));

// Check hybrid
const hybJob = { id: "hyb", title: "Hybrid Eng", company: "Acme", location: "Berlin, Germany", workplaceType: "hybrid" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" };
const hybSchema = generateJobPostingSchema(hybJob as any);
assert.equal(hybSchema.jobLocationType, "TELECOMMUTE");
assert.equal((hybSchema.jobLocation as any)["@type"], "Place");
assert.equal((hybSchema.jobLocation as any).address.addressCountry, "Germany");
assert.equal((hybSchema.applicantLocationRequirements as any)["@type"], "Country");
assert.equal((hybSchema.applicantLocationRequirements as any).name, "Germany");

// Check on-site
const onsiteJob = { id: "onsite", title: "Onsite Lead", company: "Acme", location: "London, UK", workplaceType: "on-site" as const, postedAt: "2026-10-14T00:00:00Z", description: "Test" };
const onsiteSchema = generateJobPostingSchema(onsiteJob as any);
assert.equal(onsiteSchema.jobLocationType, undefined);
assert.equal((onsiteSchema.jobLocation as any)["@type"], "Place");
assert.equal((onsiteSchema.jobLocation as any).address.addressCountry, "United Kingdom");
assert.equal(onsiteSchema.applicantLocationRequirements, undefined);

console.log("ALL_PASSED");
