import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Landing Page Buyers: /hire-remotely has full-funnel AIDA sections, schemas, and clean branding", () => {
  const hirePath = path.resolve("app/hire-remotely/page.tsx");
  assert.ok(fs.existsSync(hirePath), "app/hire-remotely/page.tsx must exist");
  const content = fs.readFileSync(hirePath, "utf-8");

  // AIDA/PAS Section inclusions
  assert.ok(content.includes("EmployerHero"), "must render EmployerHero");
  assert.ok(content.includes("EmployerComparisonTable"), "must render EmployerComparisonTable");
  assert.ok(content.includes("EmployerValuePillars"), "must render EmployerValuePillars");
  assert.ok(content.includes("EmployerTestimonials"), "must render EmployerTestimonials");
  assert.ok(content.includes("EmployerFaq"), "must render EmployerFaq");
  assert.ok(content.includes("JobPostForm"), "must render JobPostForm");

  // Canonical and Structured Data
  assert.ok(
    content.includes("https://remoteworkdaily.com/hire-remotely"),
    "must have canonical url"
  );
  assert.ok(content.includes('"@type": "FAQPage"'), "must include FAQPage schema");
  assert.ok(content.includes('"@type": "Product"'), "must include Product schema");
  assert.ok(content.includes('price: "249.00"') || content.includes('"price": "249.00"'), "must specify $249 flat price in schema");
});

test("Landing Page Buyers: Employer form and Stripe checkout contain zero RemoteOK brand errors", () => {
  const formPath = path.resolve("components/post-job/job-post-form.tsx");
  const formContent = fs.readFileSync(formPath, "utf-8");
  assert.ok(
    !formContent.includes("Why post on RemoteOK?"),
    "job-post-form must NOT mention RemoteOK"
  );
  assert.ok(
    formContent.includes("Why post on Remote Work Daily?"),
    "job-post-form must mention Remote Work Daily"
  );

  const stripePath = path.resolve("lib/stripe.ts");
  const stripeContent = fs.readFileSync(stripePath, "utf-8");
  assert.ok(
    !stripeContent.includes("RemoteOK"),
    "lib/stripe.ts must NOT mention RemoteOK in checkout line items"
  );
  assert.ok(
    stripeContent.includes("Remote Work Daily"),
    "lib/stripe.ts must reference Remote Work Daily"
  );
});

test("Landing Page Buyers: /pro candidate landing page has complete value pillars, pricing, and schemas", () => {
  const proPath = path.resolve("app/pro/page.tsx");
  assert.ok(fs.existsSync(proPath), "app/pro/page.tsx must exist");
  const content = fs.readFileSync(proPath, "utf-8");

  // Sections
  assert.ok(content.includes("CandidateHero"), "must render CandidateHero");
  assert.ok(content.includes("CandidatePainAgitation"), "must render CandidatePainAgitation");
  assert.ok(content.includes("CandidateValuePillars"), "must render CandidateValuePillars");
  assert.ok(content.includes("CandidateComparisonTable"), "must render CandidateComparisonTable");
  assert.ok(content.includes("ProPricingCards"), "must render ProPricingCards");
  assert.ok(content.includes("CandidateTestimonials"), "must render CandidateTestimonials");
  assert.ok(content.includes("CandidateFaq"), "must render CandidateFaq");

  // Canonical and Structured Data
  assert.ok(
    content.includes("https://remoteworkdaily.com/pro"),
    "must have canonical url"
  );
  assert.ok(content.includes('"@type": "FAQPage"'), "must include FAQPage schema");
  assert.ok(content.includes('"@type": "Product"'), "must include Product schema");
  assert.ok(content.includes('"5.99"'), "schema must include weekly tier $5.99");
  assert.ok(content.includes('"17.00"'), "schema must include monthly tier $17.00");
  assert.ok(content.includes('"49.00"'), "schema must include lifetime tier $49.00");
});

test("Landing Page Buyers: Navigation and sitemap funnel both B2B and B2C buyers", () => {
  const headerPath = path.resolve("components/navigation/header.tsx");
  const headerContent = fs.readFileSync(headerPath, "utf-8");
  assert.ok(headerContent.includes('href="/pro"'), "Header must link to /pro");
  assert.ok(headerContent.includes('href="/hire-remotely"'), "Header must link to /hire-remotely");

  const footerPath = path.resolve("components/navigation/footer.tsx");
  const footerContent = fs.readFileSync(footerPath, "utf-8");
  assert.ok(footerContent.includes('href="/pro"'), "Footer must link to /pro");
  assert.ok(footerContent.includes('href="/hire-remotely"'), "Footer must link to /hire-remotely");

  const sitemapPath = path.resolve("app/sitemap.xml/route.ts");
  const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
  assert.ok(sitemapContent.includes("${baseUrl}/pro"), "Sitemap must include /pro");
  assert.ok(sitemapContent.includes("${baseUrl}/hire-remotely"), "Sitemap must include /hire-remotely");

  const homePath = path.resolve("app/page.tsx");
  const homeContent = fs.readFileSync(homePath, "utf-8");
  assert.ok(homeContent.includes('href="/pro"'), "Homepage hero must link to /pro");
  assert.ok(homeContent.includes('href="/hire-remotely"'), "Homepage hero must link to /hire-remotely");
});
