import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("SEO Long-Tail & Competitor Intercept Pages: Page files exist and contain Schema.org metadata", () => {
  const vsCareerhoundPath = path.join(process.cwd(), "app", "vs", "careerhound", "page.tsx");
  const worldwidePath = path.join(process.cwd(), "app", "worldwide-remote-jobs", "page.tsx");
  const introvertsPath = path.join(process.cwd(), "app", "remote-jobs-for-introverts", "page.tsx");
  const pmTitlesPath = path.join(process.cwd(), "app", "project-manager-titles", "page.tsx");

  assert.ok(fs.existsSync(vsCareerhoundPath), "CareerHound VS page must exist");
  assert.ok(fs.existsSync(worldwidePath), "Worldwide Remote Jobs page must exist");
  assert.ok(fs.existsSync(introvertsPath), "Remote Jobs for Introverts page must exist");
  assert.ok(fs.existsSync(pmTitlesPath), "Project Manager Titles page must exist");

  const vsContent = fs.readFileSync(vsCareerhoundPath, "utf8");
  assert.ok(vsContent.includes("CareerHound Review"), "VS page must have CareerHound review heading");
  assert.ok(vsContent.includes("is careerhound legit"), "VS page must target 'is careerhound legit' keyword");
  assert.ok(vsContent.includes("Product"), "VS page must have Product schema");
  assert.ok(vsContent.includes("FAQPage"), "VS page must have FAQPage schema");

  const worldwideContent = fs.readFileSync(worldwidePath, "utf8");
  assert.ok(worldwideContent.includes("Worldwide Remote Jobs"), "Worldwide page must have Worldwide heading");
  assert.ok(worldwideContent.includes("initialWorldwideOnly"), "Worldwide page must filter for true worldwide jobs");
  assert.ok(worldwideContent.includes("FAQPage"), "Worldwide page must have FAQPage schema");

  const introvertsContent = fs.readFileSync(introvertsPath, "utf8");
  assert.ok(introvertsContent.includes("Introverts"), "Introverts page must have Introverts heading");
  assert.ok(introvertsContent.includes("FAQPage"), "Introverts page must have FAQPage schema");

  const pmContent = fs.readFileSync(pmTitlesPath, "utf8");
  assert.ok(pmContent.includes("Another Word for Project Manager"), "PM titles page must target synonym keyword");
  assert.ok(pmContent.includes("FAQPage"), "PM titles page must have FAQPage schema");
});

test("SEO Rewrites: next.config.ts contains competitor intercept and tail aliases", () => {
  const nextConfigPath = path.join(process.cwd(), "next.config.ts");
  assert.ok(fs.existsSync(nextConfigPath), "next.config.ts must exist");
  const configContent = fs.readFileSync(nextConfigPath, "utf8");

  assert.ok(configContent.includes("/careerhound-review"), "Must rewrite /careerhound-review");
  assert.ok(configContent.includes("/is-careerhound-legit"), "Must rewrite /is-careerhound-legit");
  assert.ok(configContent.includes("/careerhound-alternatives"), "Must rewrite /careerhound-alternatives");
  assert.ok(configContent.includes("/worldwide"), "Must rewrite /worldwide");
  assert.ok(configContent.includes("/remote/jobs-for-introverts"), "Must rewrite /remote/jobs-for-introverts");
  assert.ok(configContent.includes("/remote/project-manager/titles"), "Must rewrite /remote/project-manager/titles");
});

test("SEO Crawlability: Sitemap and Footer link to strategic long-tail hubs", () => {
  const sitemapRoutePath = path.join(process.cwd(), "app", "sitemap.xml", "route.ts");
  const sitemapContent = fs.readFileSync(sitemapRoutePath, "utf8");

  assert.ok(sitemapContent.includes("/vs/careerhound"), "Sitemap must include /vs/careerhound");
  assert.ok(sitemapContent.includes("/worldwide-remote-jobs"), "Sitemap must include /worldwide-remote-jobs");
  assert.ok(sitemapContent.includes("/remote-jobs-for-introverts"), "Sitemap must include /remote-jobs-for-introverts");
  assert.ok(sitemapContent.includes("/project-manager-titles"), "Sitemap must include /project-manager-titles");

  const footerPath = path.join(process.cwd(), "components", "navigation", "footer.tsx");
  const footerContent = fs.readFileSync(footerPath, "utf8");

  assert.ok(footerContent.includes("/worldwide-remote-jobs"), "Footer must link to worldwide remote jobs");
  assert.ok(footerContent.includes("/remote-jobs-for-introverts"), "Footer must link to jobs for introverts");
  assert.ok(footerContent.includes("/project-manager-titles"), "Footer must link to PM titles");
  assert.ok(footerContent.includes("/vs/careerhound"), "Footer must link to CareerHound comparison");
});
