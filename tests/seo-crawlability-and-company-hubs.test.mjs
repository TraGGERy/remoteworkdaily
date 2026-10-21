import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("SEO Crawlability: JobRow renders crawlable Next.js Link for Googlebot & search bots", () => {
  const jobRowPath = path.join(process.cwd(), "components", "job-board", "job-row.tsx");
  assert.ok(fs.existsSync(jobRowPath), "JobRow component must exist");
  const content = fs.readFileSync(jobRowPath, "utf8");

  assert.ok(content.includes('import Link from "next/link"'), "JobRow must import Link from next/link");
  assert.ok(content.includes("href={`/jobs/${job.id}/${job.slug}`}"), "JobRow must render crawlable Link with /jobs/[id]/[slug]");
});

test("SEO Cannibalization: /jobs/[slug] route permanentRedirects to canonical /jobs/[id]/[slug]", () => {
  const slugRoutePath = path.join(process.cwd(), "app", "jobs", "[slug]", "page.tsx");
  assert.ok(fs.existsSync(slugRoutePath), "Slug route must exist");
  const content = fs.readFileSync(slugRoutePath, "utf8");

  assert.ok(content.includes("permanentRedirect"), "Slug route must issue a permanentRedirect to avoid keyword cannibalization");
  assert.ok(content.includes("robots: {"), "Slug route metadata must specify robots directives");
  assert.ok(content.includes("index: false"), "Slug route must tell crawlers not to index the legacy alias");
});

test("Programmatic SEO: Company Hub architecture exists with schema and metadata", () => {
  const companyHubPath = path.join(process.cwd(), "app", "companies", "[slug]", "page.tsx");
  assert.ok(fs.existsSync(companyHubPath), "Company Hub route must exist");
  const content = fs.readFileSync(companyHubPath, "utf8");

  assert.ok(content.includes("generateMetadata"), "Company Hub must export dynamic generateMetadata");
  assert.ok(content.includes("Organization"), "Company Hub must include Organization schema");
  assert.ok(content.includes("BreadcrumbList"), "Company Hub must include BreadcrumbList schema");
  assert.ok(content.includes("FAQPage"), "Company Hub must include FAQPage schema");
  assert.ok(content.includes("getJobsByCompanySlug"), "Company Hub must fetch jobs via getJobsByCompanySlug");
});

test("Programmatic SEO: Companies Directory Hub page exists and links top employers", () => {
  const directoryPath = path.join(process.cwd(), "app", "companies", "page.tsx");
  assert.ok(fs.existsSync(directoryPath), "Companies directory route must exist");
  const content = fs.readFileSync(directoryPath, "utf8");

  assert.ok(content.includes("ItemList"), "Companies directory must emit ItemList schema");
  assert.ok(content.includes("getTopCompanies"), "Companies directory must fetch getTopCompanies");
  assert.ok(content.includes("/companies/"), "Companies directory must link to individual company pages");
});

test("Programmatic SEO: Location pages are enriched with salary analytics, canonical, and FAQ schema", () => {
  const locationPath = path.join(process.cwd(), "app", "location", "[location]", "page.tsx");
  assert.ok(fs.existsSync(locationPath), "Location route must exist");
  const content = fs.readFileSync(locationPath, "utf8");

  assert.ok(content.includes("canonicalUrl"), "Location page must declare explicit canonicalUrl");
  assert.ok(content.includes("BreadcrumbList"), "Location page must include BreadcrumbList schema");
  assert.ok(content.includes("FAQPage"), "Location page must include FAQPage schema");
  assert.ok(content.includes("formatSalary"), "Location page must calculate salary bands");
});

test("SEO Cannibalization: /privacy and /terms issue 308 permanentRedirects to canonical pages", () => {
  const privacyPath = path.join(process.cwd(), "app", "privacy", "page.tsx");
  const termsPath = path.join(process.cwd(), "app", "terms", "page.tsx");
  assert.ok(fs.existsSync(privacyPath), "Privacy alias must exist");
  assert.ok(fs.existsSync(termsPath), "Terms alias must exist");

  const privacyContent = fs.readFileSync(privacyPath, "utf8");
  assert.ok(privacyContent.includes("permanentRedirect"), "Privacy alias must issue permanentRedirect");
  assert.ok(privacyContent.includes("index: false"), "Privacy alias must be noindexed");

  const termsContent = fs.readFileSync(termsPath, "utf8");
  assert.ok(termsContent.includes("permanentRedirect"), "Terms alias must issue permanentRedirect");
  assert.ok(termsContent.includes("index: false"), "Terms alias must be noindexed");
});

test("Programmatic SEO: Tag & Specialization pages are enriched with salary analytics and FAQ schema", () => {
  const tagPath = path.join(process.cwd(), "app", "tag", "[tag]", "page.tsx");
  assert.ok(fs.existsSync(tagPath), "Tag route must exist");
  const content = fs.readFileSync(tagPath, "utf8");

  assert.ok(content.includes("canonicalUrl"), "Tag page must specify explicit canonicalUrl");
  assert.ok(content.includes("FAQPage"), "Tag page must contain FAQPage schema");
  assert.ok(content.includes("BreadcrumbList"), "Tag page must contain BreadcrumbList schema");
  assert.ok(content.includes("formatSalary"), "Tag page must calculate salary bands");
});

test("SEO Hygiene: Canonical consistency is enforced across all utility and policy pages", () => {
  const checkPages = [
    { file: path.join(process.cwd(), "app", "page.tsx"), canonical: "https://remoteworkdaily.com" },
    { file: path.join(process.cwd(), "app", "tools", "remote-savings-calculator", "page.tsx"), canonical: "/tools/remote-savings-calculator" },
    { file: path.join(process.cwd(), "app", "tools", "cv-tailor", "page.tsx"), canonical: "/tools/cv-tailor" },
    { file: path.join(process.cwd(), "app", "hire-remotely", "page.tsx"), canonical: "/hire-remotely" },
    { file: path.join(process.cwd(), "app", "contact", "page.tsx"), canonical: "/contact" },
    { file: path.join(process.cwd(), "app", "privacy-policy", "page.tsx"), canonical: "/privacy-policy" },
    { file: path.join(process.cwd(), "app", "terms-and-conditions", "page.tsx"), canonical: "/terms-and-conditions" },
  ];

  for (const item of checkPages) {
    assert.ok(fs.existsSync(item.file), `${item.file} must exist`);
    const content = fs.readFileSync(item.file, "utf8");
    assert.ok(content.includes(item.canonical), `${item.file} must declare canonical: ${item.canonical}`);
  }
});

test("SEO Hygiene: Test and internal meta pages have noindex robots directives", () => {
  const metaPages = [
    path.join(process.cwd(), "app", "ai-seo", "page.tsx"),
    path.join(process.cwd(), "app", "design-it", "page.tsx"),
    path.join(process.cwd(), "app", "seo-geo", "page.tsx"),
    path.join(process.cwd(), "app", "seo-meta-optimizer", "page.tsx"),
  ];

  for (const pagePath of metaPages) {
    assert.ok(fs.existsSync(pagePath), `${pagePath} must exist`);
    const content = fs.readFileSync(pagePath, "utf8");
    assert.ok(content.includes("index: false"), `${path.basename(path.dirname(pagePath))} must have index: false`);
  }
});

test("SEO Indexing: Sitemap includes AI CV Tailor, Companies directory, top skills, and employer companies", () => {
  const sitemapPath = path.join(process.cwd(), "app", "sitemap.xml", "route.ts");
  const content = fs.readFileSync(sitemapPath, "utf8");

  assert.ok(content.includes("/tools/cv-tailor"), "Sitemap must include /tools/cv-tailor");
  assert.ok(content.includes("/companies"), "Sitemap must include /companies");
  assert.ok(content.includes("POPULAR_TAGS"), "Sitemap must map POPULAR_TAGS");
  assert.ok(content.includes("getTopCompanies"), "Sitemap must map top companies");
  assert.ok(content.includes("/companies/"), "Sitemap must include /companies/ URLs");
});
