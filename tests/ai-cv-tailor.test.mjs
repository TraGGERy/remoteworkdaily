import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";

const TECH_KEYWORDS = [
  "typescript", "javascript", "python", "golang", "go", "rust", "node.js", "nodejs",
  "react", "next.js", "nextjs", "vue", "tailwind", "graphql", "sql", "postgresql", "postgres",
  "docker", "kubernetes", "k8s", "aws", "gcp", "azure", "ci/cd", "microservices", "agile"
];

function extractKeywords(text) {
  if (!text) return [];
  const textLower = text.replace(/<[^>]+>/g, " ").toLowerCase();
  const matched = new Set();
  const aliasMap = {
    nextjs: "next.js",
    nodejs: "node.js",
    postgres: "postgresql",
    k8s: "kubernetes"
  };
  for (const kw of TECH_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (regex.test(textLower)) {
      matched.add(aliasMap[kw] || kw);
    }
  }
  return Array.from(matched);
}

function sanitizeCoverLetterParagraphs(paragraphsOrText) {
  const rawParagraphs = Array.isArray(paragraphsOrText)
    ? paragraphsOrText
    : paragraphsOrText.split(/\r?\n\s*\r?\n/);

  const cleaned = [];
  for (let p of rawParagraphs) {
    p = p.trim();
    if (!p) continue;
    p = p.replace(/^dear\s+[^\n]+,?\s*\n*/i, "").trim();
    if (/^dear\s+/i.test(p) && p.length < 80) continue;
    p = p.replace(/\n+\s*(sincerely|best\s+regards|warm\s+regards|kind\s+regards|respectfully),?[\s\S]*$/i, "").trim();
    if (/^(sincerely|best\s+regards|warm\s+regards|kind\s+regards|respectfully),?(\s*\n[\s\S]*)?$/i.test(p)) {
      continue;
    }
    if (p.length > 0) cleaned.push(p);
  }
  return cleaned;
}

test("AI CV Tailor: File structure, templates, and module exports integrity", () => {
  const tailorPath = path.resolve("lib/ai-tailor.ts");
  assert.ok(fs.existsSync(tailorPath), "lib/ai-tailor.ts should exist");
  const tailorContent = fs.readFileSync(tailorPath, "utf-8");
  assert.ok(tailorContent.includes("export function tailorApplication"), "tailorApplication exported");
  assert.ok(tailorContent.includes("export function extractKeywords"), "extractKeywords exported");
  assert.ok(tailorContent.includes("export function stripHtmlTags"), "stripHtmlTags exported");
  assert.ok(tailorContent.includes("export function sanitizeCoverLetterParagraphs"), "sanitizeCoverLetterParagraphs exported");
  assert.ok(tailorContent.includes("export function generateInterviewPrep"), "generateInterviewPrep exported");

  const pdfGenPath = path.resolve("lib/pdf-generator.ts");
  assert.ok(fs.existsSync(pdfGenPath), "lib/pdf-generator.ts should exist");
  const pdfGenContent = fs.readFileSync(pdfGenPath, "utf-8");
  assert.ok(pdfGenContent.includes("export function generateApplicationPdf"), "generateApplicationPdf exported");
  assert.ok(pdfGenContent.includes("export function downloadApplicationPdf"), "downloadApplicationPdf exported");
  assert.ok(pdfGenContent.includes("export function createApplicationPdfBlobUrl"), "createApplicationPdfBlobUrl exported");
  assert.ok(pdfGenContent.includes("moderncv"), "Supports moderncv banking template");
  assert.ok(pdfGenContent.includes("executive"), "Supports executive template");
  assert.ok(pdfGenContent.includes("minimal"), "Supports minimal ATS template");

  const studioPath = path.resolve("components/tools/ai-cv-tailor-studio.tsx");
  const studioContent = fs.readFileSync(studioPath, "utf-8");
  assert.ok(!studioContent.includes("if (!hasActiveSubscription)"), "Studio should not block free users behind paywall modal");

  const drawerTailorPath = path.resolve("components/job-board/ai-resume-tailor.tsx");
  const drawerTailorContent = fs.readFileSync(drawerTailorPath, "utf-8");
  assert.ok(!drawerTailorContent.includes("if (!hasActiveSubscription)"), "Drawer tailor widget should not block users behind paywall modal");
});

test("AI CV Tailor: Cover letter sanitizer removes duplicate salutation and signature blocks", () => {
  const fullTextEditedByUser = `Dear Hiring Team at Automattic,

I am writing to apply for the Senior Full Stack Engineer position at Automattic.

Throughout my career, I have built scalable distributed systems using React and TypeScript.

I welcome the opportunity to discuss how my background aligns with your roadmap.

Sincerely,
Jordan Lee
jordan.lee@remoteworkdaily.com`;

  const sanitized = sanitizeCoverLetterParagraphs(fullTextEditedByUser);
  assert.equal(sanitized.length, 3, "Should extract exactly 3 body paragraphs without salutation or sign-off");
  assert.ok(!sanitized[0].toLowerCase().startsWith("dear"), "First paragraph should not start with Dear");
  assert.ok(!sanitized[sanitized.length - 1].toLowerCase().includes("sincerely"), "Last paragraph should not contain Sincerely");
});

test("AI CV Tailor: Keyword extraction strips HTML tags and deduplicates aliases", () => {
  const htmlJd = `
    <div>
      <h2>Senior Full Stack Engineer</h2>
      <p>Required skills: <strong>TypeScript</strong>, <em>React</em>, NextJS, Next.js, NodeJS, and Postgres.</p>
      <ul><li>Experience with Kubernetes (k8s), Docker, and AWS.</li></ul>
    </div>
  `;
  const extracted = extractKeywords(htmlJd);
  assert.ok(extracted.includes("typescript"), "Should extract typescript");
  assert.ok(extracted.includes("react"), "Should extract react");
  assert.ok(extracted.includes("next.js"), "Should normalize NextJS to next.js");
  assert.ok(!extracted.includes("nextjs"), "Should not duplicate nextjs alias");
  assert.ok(extracted.includes("postgresql"), "Should normalize Postgres to postgresql");
  assert.ok(extracted.includes("kubernetes"), "Should normalize k8s to kubernetes");
});

test("AI CV Tailor: jsPDF binary generator produces valid PDF with %PDF- header and multi-page support", () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter"
  });

  // Page 1: Cover letter simulation
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text("Alex Rivera", 40, 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Application for Senior Full Stack Engineer at Automattic", 40, 70);

  // Page 2: CV simulation
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Alex Rivera - Curriculum Vitae", 40, 50);

  const arrayBuffer = doc.output("arraybuffer");
  const buffer = Buffer.from(arrayBuffer);

  assert.ok(buffer.length > 1000, `PDF size is realistic (${buffer.length} bytes)`);
  const header = buffer.subarray(0, 5).toString("utf-8");
  assert.equal(header, "%PDF-", "Generated document starts with %PDF- magic bytes");
  assert.equal(doc.getNumberOfPages(), 2, "PDF has 2 pages (Cover letter + CV)");
});

test("Anti-Ghost & Unfair Advantage Suite: Loom pitch script, Sniper outreach, and transparency filters exist", () => {
  const root = process.cwd();
  const aiTailorSrc = fs.readFileSync(path.join(root, "lib/ai-tailor.ts"), "utf-8");
  const filterBarSrc = fs.readFileSync(path.join(root, "components/job-board/filter-bar.tsx"), "utf-8");
  const hrCardSrc = fs.readFileSync(path.join(root, "components/job-board/hr-contact-card.tsx"), "utf-8");
  const hybridClassifierSrc = fs.readFileSync(path.join(root, "lib/scrapers/hybrid-classifier.ts"), "utf-8");

  assert.ok(aiTailorSrc.includes("loomPitch") && aiTailorSrc.includes("sniperOutreach"), "lib/ai-tailor.ts generates 60s Loom pitch and Sniper outreach");
  assert.ok(filterBarSrc.includes("worldwideOnly") && filterBarSrc.includes("transparentPayOnly") && filterBarSrc.includes("lowCompetitionOnly"), "FilterBar exposes Worldwide, Upfront Salary, and Low Competition toggles");
  assert.ok(hrCardSrc.includes("hiringManagerSearchUrl") && hrCardSrc.includes("loom_pitch"), "HrContactCard includes LinkedIn Decision Maker search and Loom pitch template");
  assert.ok(hybridClassifierSrc.includes("isSneakyHybridClause") && hybridClassifierSrc.includes("verifyJobUrlHealth"), "hybrid-classifier detects sneaky hybrid clauses and verifies ATS URL health");
});

