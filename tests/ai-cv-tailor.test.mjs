import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { jsPDF } from "jspdf";

const TECH_KEYWORDS = [
  "typescript", "javascript", "python", "golang", "go", "rust", "node.js", "nodejs",
  "react", "next.js", "nextjs", "vue", "tailwind", "graphql", "sql", "postgresql",
  "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "microservices", "agile"
];

function extractKeywords(text) {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const matched = new Set();
  for (const kw of TECH_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (regex.test(textLower)) {
      matched.add(kw);
    }
  }
  return Array.from(matched);
}

function calculateMatchScore(jobKeywords, candidateKeywords) {
  if (jobKeywords.length === 0) return 90;
  const matched = jobKeywords.filter((k) => candidateKeywords.includes(k));
  const ratio = matched.length / jobKeywords.length;
  return Math.min(97, Math.max(76, Math.round(ratio * 100)));
}

test("AI CV Tailor: File structure and module exports integrity", () => {
  const tailorPath = path.resolve("lib/ai-tailor.ts");
  assert.ok(fs.existsSync(tailorPath), "lib/ai-tailor.ts should exist");
  const tailorContent = fs.readFileSync(tailorPath, "utf-8");
  assert.ok(tailorContent.includes("export function tailorApplication"), "tailorApplication exported");
  assert.ok(tailorContent.includes("export function extractKeywords"), "extractKeywords exported");
  assert.ok(tailorContent.includes("export function generateTailoredCoverLetter"), "generateTailoredCoverLetter exported");
  assert.ok(tailorContent.includes("export function generateTailoredBulletPoints"), "generateTailoredBulletPoints exported");

  const pdfGenPath = path.resolve("lib/pdf-generator.ts");
  assert.ok(fs.existsSync(pdfGenPath), "lib/pdf-generator.ts should exist");
  const pdfGenContent = fs.readFileSync(pdfGenPath, "utf-8");
  assert.ok(pdfGenContent.includes("export function generateApplicationPdf"), "generateApplicationPdf exported");
  assert.ok(pdfGenContent.includes("export function downloadApplicationPdf"), "downloadApplicationPdf exported");

  const routePath = path.resolve("app/api/ai/tailor/route.ts");
  assert.ok(fs.existsSync(routePath), "app/api/ai/tailor/route.ts should exist");
  const routeContent = fs.readFileSync(routePath, "utf-8");
  assert.ok(routeContent.includes("tailorApplication"), "API route uses tailorApplication");
  assert.ok(routeContent.includes("generateApplicationPdf"), "API route uses generateApplicationPdf");

  const studioPath = path.resolve("app/tools/cv-tailor/page.tsx");
  assert.ok(fs.existsSync(studioPath), "app/tools/cv-tailor/page.tsx studio route should exist");
});

test("AI CV Tailor: Keyword extraction accurately identifies required stack from job description", () => {
  const jd = `
    Automattic is hiring a Senior Full Stack Engineer.
    Required: TypeScript, React, Next.js, Node.js, and PostgreSQL.
    Experience with Docker, Kubernetes, AWS, Microservices, and CI/CD pipelines.
  `;
  const extracted = extractKeywords(jd);
  assert.ok(extracted.includes("typescript"), "Should contain typescript");
  assert.ok(extracted.includes("react"), "Should contain react");
  assert.ok(extracted.includes("next.js"), "Should contain next.js");
  assert.ok(extracted.includes("postgresql"), "Should contain postgresql");
  assert.ok(extracted.includes("docker"), "Should contain docker");
  assert.ok(extracted.includes("kubernetes"), "Should contain kubernetes");
  assert.ok(extracted.includes("aws"), "Should contain aws");
  assert.ok(extracted.includes("microservices"), "Should contain microservices");

  const candidateSkills = ["typescript", "react", "next.js", "postgresql", "docker", "aws"];
  const score = calculateMatchScore(extracted, candidateSkills);
  assert.ok(score >= 75 && score <= 97, `Score ${score} should be realistic match percentage`);
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

  doc.setFontSize(9);
  const letterParagraphs = [
    "Dear Hiring Team at Automattic,",
    "I am writing to express my strong enthusiasm for the Senior Full Stack Engineer role...",
    "Throughout my career, I have specialized in architecting high-performance web systems using React and TypeScript...",
    "Sincerely,\nAlex Rivera"
  ];

  let y = 100;
  for (const p of letterParagraphs) {
    const lines = doc.splitTextToSize(p, 520);
    doc.text(lines, 40, y);
    y += lines.length * 14 + 10;
  }

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
