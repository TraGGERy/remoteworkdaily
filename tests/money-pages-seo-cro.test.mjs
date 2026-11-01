import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("About House Page (/about): Metadata contains full E-E-A-T titles, descriptions, and canonical URL", () => {
  const aboutPath = path.resolve("app/about/page.tsx");
  assert.ok(fs.existsSync(aboutPath), "app/about/page.tsx must exist");
  const content = fs.readFileSync(aboutPath, "utf-8");

  assert.ok(
    content.includes("About Remote Work Daily — Our Mission, Verification Methodology & Zero-Ghost-Job Standard"),
    "must have official About page title"
  );
  assert.ok(
    content.includes("72,000+") && content.includes("60-day"),
    "must mention 72,000+ jobs and 60-day zero-ghost-job deletion in description"
  );
  assert.ok(
    content.includes("https://remoteworkdaily.com/about"),
    "must have canonical URL to https://remoteworkdaily.com/about"
  );
  assert.ok(
    content.includes("openGraph:") && content.includes("twitter:"),
    "must define full openGraph and twitter social metadata"
  );
});

test("About House Page (/about): Emits valid AboutPage and Organization JSON-LD Schema.org", () => {
  const aboutPath = path.resolve("app/about/page.tsx");
  const content = fs.readFileSync(aboutPath, "utf-8");

  assert.ok(content.includes('"@type": "AboutPage"'), "must include AboutPage schema type");
  assert.ok(content.includes('"@type": "Organization"'), "must include Organization schema type");
  assert.ok(content.includes('"Remote Work Daily"'), "must name Remote Work Daily organization");
  assert.ok(content.includes('"https://remoteworkdaily.com/icon.png"'), "must include verified logo URL");
  assert.ok(content.includes('"support@remoteworkdaily.com"'), "must provide support contact point");
  assert.ok(content.includes('"Applicant Tracking Systems"'), "must declare ATS expertise in knowsAbout");
  assert.ok(content.includes('"Salary Transparency"'), "must declare Salary Transparency in knowsAbout");
});

test("About House Page (/about): Enforces 4-stage verification pipeline and 60-day auto-purge", () => {
  const aboutPath = path.resolve("app/about/page.tsx");
  const content = fs.readFileSync(aboutPath, "utf-8");

  // 4 Stages
  assert.ok(
    content.includes("Hourly Direct ATS & Carrier Harvesting") || content.includes("Hourly Multi-Source ATS"),
    "must document Stage 1 direct ATS harvesting"
  );
  assert.ok(
    content.includes("High-Paying Hybrid & Remote Classification") && content.includes("$90,000"),
    "must document Stage 2 high-paying hybrid floor and RTO filtering"
  );
  assert.ok(
    content.includes("SHA-256") && content.includes("Health"),
    "must document Stage 3 SHA-256 cryptographic deduplication & health checks"
  );
  assert.ok(
    content.includes("60-Day") && content.includes("Automatic Database Purge"),
    "must document Stage 4 strict 60-day automatic deletion policy"
  );

  // Guarantees
  assert.ok(content.includes("7-Day 100% Money-Back Guarantee"), "must feature 7-day refund policy");
  assert.ok(content.includes("60-Day Recruiter Screening Guarantee"), "must feature 60-day interview guarantee");
  assert.ok(content.includes("14-Day Candidate Quality Guarantee"), "must feature 14-day employer guarantee");

  // House Links for internal equity
  assert.ok(content.includes('href="/pricing"'), "must link to /pricing");
  assert.ok(content.includes('href="/features"'), "must link to /features");
  assert.ok(content.includes('href="/pro"'), "must link to /pro");
  assert.ok(content.includes('href="/hire-remotely"'), "must link to /hire-remotely");
  assert.ok(content.includes('href="/tools/cv-tailor"'), "must link to /tools/cv-tailor");
  assert.ok(content.includes('href="/contact"'), "must link to /contact");
  assert.ok(content.includes('href="/privacy-policy"'), "must link to /privacy-policy");
  assert.ok(content.includes('href="/terms-and-conditions"'), "must link to /terms-and-conditions");
});

test("Pricing Money Page (/pricing): Validates metadata, canonical, FAQ schema, and transparent tiers", () => {
  const pricingPath = path.resolve("app/pricing/page.tsx");
  assert.ok(fs.existsSync(pricingPath), "app/pricing/page.tsx must exist");
  const content = fs.readFileSync(pricingPath, "utf-8");

  assert.ok(content.includes("/pricing"), "must declare canonical URL for /pricing");
  assert.ok(content.includes("FAQPage"), "must contain Schema.org FAQPage or structured pricing data");
  assert.ok(content.includes("6.99") || content.includes("$6.99"), "must disclose $6.99/wk pricing option");
  assert.ok(content.includes("249") || content.includes("$249"), "must disclose $249 flat employer listing fee");
  assert.ok(content.includes("7-Day") || content.includes("Guarantee"), "must mention money-back guarantee");
});

test("Features Page (/features): Validates metadata, canonical, architecture pillars, and schemas", () => {
  const featuresPath = path.resolve("app/features/page.tsx");
  assert.ok(fs.existsSync(featuresPath), "app/features/page.tsx must exist");
  const content = fs.readFileSync(featuresPath, "utf-8");

  assert.ok(content.includes("https://remoteworkdaily.com/features"), "must declare canonical URL for /features");
  assert.ok(content.includes("Greenhouse") && content.includes("Lever") && content.includes("Ashby"), "must cite direct ATS platforms");
  assert.ok(content.includes("6-hour") || content.includes("6-Hour"), "must mention 6-hour early access capability");
  assert.ok(content.includes("AI") || content.includes("Tailor"), "must mention AI CV Tailor capabilities");
  assert.ok(content.includes("SoftwareApplication") || content.includes("FAQPage") || content.includes("WebPage"), "must declare structured data");
});

test("Existing Money Pages (/pro, /hire-remotely, /contact): Have canonicals and structured data", () => {
  const proContent = fs.readFileSync(path.resolve("app/pro/page.tsx"), "utf-8");
  assert.ok(proContent.includes("https://remoteworkdaily.com/pro"), "/pro must have canonical URL");
  assert.ok(proContent.includes('"@type": "FAQPage"'), "/pro must have FAQPage schema");
  assert.ok(proContent.includes('"@type": "Product"'), "/pro must have Product schema");

  const hireContent = fs.readFileSync(path.resolve("app/hire-remotely/page.tsx"), "utf-8");
  assert.ok(hireContent.includes("https://remoteworkdaily.com/hire-remotely"), "/hire-remotely must have canonical URL");
  assert.ok(hireContent.includes('"@type": "FAQPage"'), "/hire-remotely must have FAQPage schema");

  const contactContent = fs.readFileSync(path.resolve("app/contact/page.tsx"), "utf-8");
  assert.ok(contactContent.includes("https://remoteworkdaily.com/contact"), "/contact must have canonical URL");
  assert.ok(contactContent.includes('"@type": "ContactPage"'), "/contact must have ContactPage schema");
  assert.ok(contactContent.includes('"@type": "Organization"'), "/contact must have Organization schema");
});

test("Navigation Header: Includes desktop and mobile links to /features and /pricing", () => {
  const headerPath = path.resolve("components/navigation/header.tsx");
  const content = fs.readFileSync(headerPath, "utf-8");

  // Check occurrences (both desktop and mobile drawer)
  const featuresMatches = (content.match(/href="\/features"/g) || []).length;
  const pricingMatches = (content.match(/href="\/pricing"/g) || []).length;

  assert.ok(featuresMatches >= 2, "Header must link to /features in desktop nav and mobile drawer");
  assert.ok(pricingMatches >= 2, "Header must link to /pricing in desktop nav and mobile drawer");
  assert.ok(content.includes("Features"), "Header must display 'Features' text");
  assert.ok(content.includes("Pricing"), "Header must display 'Pricing' text");
});

test("Navigation Footer: Includes internal links to /about, /features, and /pricing for crawl equity", () => {
  const footerPath = path.resolve("components/navigation/footer.tsx");
  const content = fs.readFileSync(footerPath, "utf-8");

  assert.ok(content.includes('href="/about"'), "Footer must link to /about");
  assert.ok(content.includes('href="/features"'), "Footer must link to /features");
  assert.ok(content.includes('href="/pricing"'), "Footer must link to /pricing");
  assert.ok(content.includes("About Us"), "Footer must render 'About Us' anchor text");
  assert.ok(content.includes("Features"), "Footer must render 'Features' anchor text");
  assert.ok(content.includes("Pricing"), "Footer must render 'Pricing' anchor text");
});

test("XML Sitemap: Indexes money and house pages with correct priorities", () => {
  const sitemapPath = path.resolve("app/sitemap.xml/route.ts");
  const content = fs.readFileSync(sitemapPath, "utf-8");

  assert.ok(content.includes("/pricing</loc><changefreq>weekly</changefreq><priority>0.9</priority>"), "Sitemap must index /pricing at 0.9 priority");
  assert.ok(content.includes("/features</loc><changefreq>weekly</changefreq><priority>0.9</priority>"), "Sitemap must index /features at 0.9 priority");
  assert.ok(content.includes("/about</loc><changefreq>weekly</changefreq><priority>0.85</priority>"), "Sitemap must index /about at 0.85 priority");
  assert.ok(content.includes("/contact</loc><changefreq>monthly</changefreq><priority>0.8</priority>"), "Sitemap must index /contact at 0.8 priority");
});

test("AI Discovery Index: llms.txt endpoints include money and house pages", () => {
  const llmsRoutePath = path.resolve("app/llms.txt/route.ts");
  const llmsRouteContent = fs.readFileSync(llmsRoutePath, "utf-8");

  assert.ok(llmsRouteContent.includes("/about"), "app/llms.txt/route.ts must list /about");
  assert.ok(llmsRouteContent.includes("/features"), "app/llms.txt/route.ts must list /features");
  assert.ok(llmsRouteContent.includes("/pricing"), "app/llms.txt/route.ts must list /pricing");

  const publicLlmsPath = path.resolve("public/llms.txt");
  const publicLlmsContent = fs.readFileSync(publicLlmsPath, "utf-8");

  assert.ok(publicLlmsContent.includes("https://remoteworkdaily.com/about"), "public/llms.txt must list https://remoteworkdaily.com/about");
  assert.ok(publicLlmsContent.includes("https://remoteworkdaily.com/features"), "public/llms.txt must list https://remoteworkdaily.com/features");
  assert.ok(publicLlmsContent.includes("https://remoteworkdaily.com/pricing"), "public/llms.txt must list https://remoteworkdaily.com/pricing");
});
