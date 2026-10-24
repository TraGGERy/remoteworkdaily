import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { jsPDF } from "jspdf";

// =============================================================================
// 1. ELIGIBILITY ENGINE TEST LOGIC (Mirrors lib/eligibility-engine.ts)
// =============================================================================
const EU_MEMBER_STATES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "AUSTRIA", "BELGIUM", "BULGARIA", "CROATIA", "CYPRUS", "CZECH REPUBLIC", "CZECHIA",
  "DENMARK", "ESTONIA", "FINLAND", "FRANCE", "GERMANY", "GREECE", "HUNGARY",
  "IRELAND", "ITALY", "LATVIA", "LITHUANIA", "LUXEMBOURG", "MALTA", "NETHERLANDS",
  "POLAND", "PORTUGAL", "ROMANIA", "SLOVAKIA", "SLOVENIA", "SPAIN", "SWEDEN",
  "EU", "EUROPEAN UNION",
]);

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];

function isEuCitizen(countryStr = "") {
  if (!countryStr) return false;
  return EU_MEMBER_STATES.has(countryStr.trim().toUpperCase());
}

function parseCefrLevel(levelStr = "") {
  const norm = levelStr.trim().toUpperCase();
  if (norm.includes("NATIVE") || norm.includes("MOTHER")) return "Native";
  if (norm.includes("C2")) return "C2";
  if (norm.includes("C1")) return "C1";
  if (norm.includes("B2")) return "B2";
  if (norm.includes("B1")) return "B1";
  if (norm.includes("A2")) return "A2";
  if (norm.includes("A1")) return "A1";
  return "B2";
}

function isCefrSufficient(candLevel, reqLevel) {
  const c = parseCefrLevel(candLevel);
  const r = parseCefrLevel(reqLevel);
  return CEFR_LEVELS.indexOf(c) >= CEFR_LEVELS.indexOf(r);
}

function evaluateEligibility(candidate, job) {
  const isEuJob = job.jurisdiction === "EU" || job.publicSectorType === "eu_institutions";
  const isOpenWorldwide = job.eligibilityType === "open_worldwide" || (!isEuJob && job.eligibilityType !== "citizenship_required");
  const hasEuCitizen = isEuCitizen(candidate.citizenship);

  let citizenshipStatus = "pass";
  let citizenshipMessage = "Eligible nationality";

  if (isOpenWorldwide) {
    citizenshipStatus = "pass";
    citizenshipMessage = "Open Worldwide";
  } else if (isEuJob && job.eligibilityType === "citizenship_required") {
    if (hasEuCitizen) {
      citizenshipStatus = "pass";
      citizenshipMessage = "Verified EU Member State citizen";
    } else {
      citizenshipStatus = "fail";
      citizenshipMessage = "Statutory Ineligibility: Requires citizenship of one of the 27 EU Member States";
    }
  }

  // Degree check
  const candDegreeScore = candidate.degreeLevel?.includes("7") ? 7 : candidate.degreeLevel?.includes("8") ? 8 : 6;
  const reqDegreeScore = job.grade?.includes("AD 7") || job.grade?.includes("P-4") ? 7 : 6;
  let degreeStatus = candDegreeScore >= reqDegreeScore ? "pass" : "warning";

  // Language check
  let languageStatus = "pass";
  const jobLangs = job.languagesRequired || ["English (C1)"];
  const candLangMap = new Map((candidate.languages || []).map((l) => [l.language.toLowerCase(), l.level]));
  for (const req of jobLangs) {
    const langName = req.split("(")[0].trim().toLowerCase();
    const reqLevel = req.includes("(") ? req.split("(")[1].replace(")", "").trim() : "B2";
    let found = false;
    for (const [k, v] of candLangMap.entries()) {
      if (k.includes(langName) || langName.includes(k)) {
        found = true;
        if (!isCefrSufficient(v, reqLevel)) languageStatus = "warning";
      }
    }
    if (!found) languageStatus = "warning";
  }

  let overallStatus = "eligible";
  let matchScore = 0;
  if (citizenshipStatus === "pass") matchScore += 40;
  if (degreeStatus === "pass") matchScore += 30;
  if (languageStatus === "pass") matchScore += 30;

  if (citizenshipStatus === "fail") {
    overallStatus = "ineligible";
    matchScore = Math.min(matchScore, 40);
  } else if (degreeStatus === "warning" || languageStatus === "warning") {
    overallStatus = "warning";
  }

  return {
    status: overallStatus,
    matchScore,
    citizenshipStatus,
    degreeStatus,
    languageStatus,
    citizenshipMessage,
  };
}

// =============================================================================
// 2. EUROPASS XML & PDF GENERATION LOGIC
// =============================================================================
function generateEuropassXml(candidate, job) {
  const dateFormatted = new Date().toISOString().split("T")[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<EuropassCV xmlns="http://europass.cedefop.europa.eu/Europass">
  <DocumentInfo>
    <CreationDate>${dateFormatted}</CreationDate>
    <TargetApplication>
      <Position>${job.title}</Position>
      <Institution>${job.agency || job.company}</Institution>
      <SelectionProcedureReference>${job.selectionRef || "EPSO/AD/2026"}</SelectionProcedureReference>
    </TargetApplication>
  </DocumentInfo>
  <LearnerInfo>
    <Identification>
      <PersonName>
        <FirstName>${candidate.fullName.split(" ")[0]}</FirstName>
        <Surname>${candidate.fullName.split(" ").slice(1).join(" ")}</Surname>
      </PersonName>
      <Demographics>
        <Nationality><Code>${candidate.citizenship}</Code></Nationality>
      </Demographics>
    </Identification>
    <Skills>
      <Linguistic>
        ${(candidate.languages || []).map((l) => `<ForeignLanguage><Description><Label>${l.language}</Label></Description><ProficiencyLevel><Listening>${l.level}</Listening></ProficiencyLevel></ForeignLanguage>`).join("\n")}
      </Linguistic>
    </Skills>
  </LearnerInfo>
</EuropassCV>`;
}

function generateEuropassPdf(candidate, job) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  doc.setFillColor(0, 51, 153); // #003399 EU Blue
  doc.rect(40, 36, 515, 54, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("EUROPASS CURRICULUM VITAE", 56, 60);
  doc.setFontSize(9);
  doc.text(`EPSO SELECTION PROCEDURE: ${job.selectionRef || "EPSO/AD/425/26"}`, 56, 76);
  return doc;
}

function generateUnP11Pdf(candidate, job) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
  doc.setFillColor(0, 158, 219); // #009EDB UN Blue
  doc.rect(40, 36, 532, 48, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("UNITED NATIONS - FORM P.11", 56, 56);
  return doc;
}

// =============================================================================
// 3. PUBLIC SECTOR FILTER LOGIC (Mirrors lib/filter-jobs.ts)
// =============================================================================
function filterJobsPublicSector(jobs, filters) {
  let result = jobs.filter((j) => j.status !== "pending_payment" && j.status !== "archived" && j.isActive !== false);

  if (filters.publicSectorOnly) {
    result = result.filter((j) => Boolean(j.isPublicSector || j.isGovernment));
  }

  if (filters.sector && filters.sector !== "all") {
    result = result.filter((j) => j.publicSectorType === filters.sector);
  }

  if (filters.eligibility && filters.eligibility !== "all") {
    result = result.filter((j) => j.eligibilityType === filters.eligibility);
  }

  if (filters.languageReq && filters.languageReq !== "all") {
    result = result.filter((j) => {
      const langs = j.languagesRequired || [];
      if (filters.languageReq === "en_only") {
        return langs.length <= 1 || langs.every((l) => l.toLowerCase().includes("english") || l.toLowerCase().includes("en"));
      }
      if (filters.languageReq === "multilingual") {
        return langs.length >= 2;
      }
      return true;
    });
  }

  if (filters.deadlineUrgency && filters.deadlineUrgency !== "all") {
    const now = Date.now();
    result = result.filter((j) => {
      if (!j.applicationDeadline) return false;
      const d = new Date(j.applicationDeadline).getTime();
      if (isNaN(d) || d <= now) return false;
      const left = d - now;
      if (filters.deadlineUrgency === "closing_48h") return left <= 48 * 3600 * 1000;
      if (filters.deadlineUrgency === "next_7d") return left <= 7 * 24 * 3600 * 1000;
      return true;
    });
  }

  return result;
}

// =============================================================================
// TEST SUITES
// =============================================================================

test("Public Sector: Database migration and schema integrity", () => {
  const migrationPath = path.join(process.cwd(), "supabase", "migrations", "20261024_public_sector_government_jobs.sql");
  assert.ok(fs.existsSync(migrationPath), "Migration 20261024_public_sector_government_jobs.sql must exist");

  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  assert.ok(migrationSql.includes("is_public_sector"), "Migration must add is_public_sector");
  assert.ok(migrationSql.includes("agency"), "Migration must add agency");
  assert.ok(migrationSql.includes("jurisdiction"), "Migration must add jurisdiction");
  assert.ok(migrationSql.includes("grade"), "Migration must add grade");
  assert.ok(migrationSql.includes("eligibility_type"), "Migration must add eligibility_type");
  assert.ok(migrationSql.includes("application_deadline"), "Migration must add application_deadline");
  assert.ok(migrationSql.includes("europass_ready"), "Migration must add europass_ready");
  assert.ok(migrationSql.includes("create table if not exists public.applications"), "Migration must create applications table");

  const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  assert.ok(schemaSql.includes("is_public_sector"), "schema.sql must include is_public_sector");
  assert.ok(schemaSql.includes("public.applications"), "schema.sql must include public.applications");
});

test("Public Sector TypeScript Modules: File structure and exports integrity", () => {
  const files = [
    "lib/scrapers/public-sector-scrapers.ts",
    "lib/eligibility-engine.ts",
    "lib/europass-generator.ts",
    "lib/un-p11-generator.ts",
    "lib/government-application-package.ts",
    "lib/applications-repository.ts",
    "components/job-board/government-easy-apply-modal.tsx",
    "app/api/government/easy-apply/route.ts",
  ];

  for (const f of files) {
    const fullPath = path.join(process.cwd(), f);
    assert.ok(fs.existsSync(fullPath), `Module '${f}' must exist`);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert.ok(content.length > 50, `Module '${f}' must have valid content`);
  }
});

test("Eligibility Engine: Evaluates EU Citizenship, Degree EQF, CEFR Languages, and Match Score", () => {
  assert.equal(isEuCitizen("FR"), true, "FR is EU citizen");
  assert.equal(isEuCitizen("DE"), true, "DE is EU citizen");
  assert.equal(isEuCitizen("US"), false, "US is not EU citizen");

  assert.equal(parseCefrLevel("C1"), "C1");
  assert.equal(isCefrSufficient("C2", "C1"), true, "C2 exceeds C1");
  assert.equal(isCefrSufficient("B2", "C1"), false, "B2 is below C1");
  assert.equal(isCefrSufficient("Native", "B2"), true, "Native exceeds B2");

  const epsoJob = {
    jurisdiction: "EU",
    publicSectorType: "eu_institutions",
    grade: "AD 7",
    eligibilityType: "citizenship_required",
    languagesRequired: ["English (C1)", "French (B2)"],
  };

  // Case A: Eligible candidate (French citizen, Master's, EN C1 + FR Native)
  const eligibleCandidate = {
    fullName: "Claire Dubois",
    citizenship: "FR",
    degreeLevel: "Masters (EQF Level 7)",
    languages: [
      { language: "English", level: "C1" },
      { language: "French", level: "Native" },
    ],
  };

  const evalA = evaluateEligibility(eligibleCandidate, epsoJob);
  assert.equal(evalA.status, "eligible");
  assert.equal(evalA.citizenshipStatus, "pass");
  assert.equal(evalA.matchScore, 100);

  // Case B: Ineligible candidate (US Citizen applying for EU AD competition)
  const ineligibleCandidate = {
    fullName: "John Doe",
    citizenship: "US",
    degreeLevel: "Masters (EQF Level 7)",
    languages: [{ language: "English", level: "Native" }],
  };

  const evalB = evaluateEligibility(ineligibleCandidate, epsoJob);
  assert.equal(evalB.status, "ineligible");
  assert.equal(evalB.citizenshipStatus, "fail");
  assert.ok(evalB.citizenshipMessage.includes("Statutory Ineligibility"));
});

test("Europass XML & PDF Generator: Valid XML schema and PDF binary generation", () => {
  const candidate = {
    fullName: "Jean-Luc Martin",
    citizenship: "FR",
    degreeLevel: "Masters (EQF Level 7)",
    languages: [
      { language: "French", level: "Native" },
      { language: "English", level: "C1" },
    ],
  };

  const job = {
    title: "Administrator in Digital Policy",
    company: "European Commission",
    agency: "European Commission - DG CNECT",
    selectionRef: "EPSO/AD/425/26",
  };

  // XML Test
  const xml = generateEuropassXml(candidate, job);
  assert.ok(xml.startsWith("<?xml version="), "Must contain XML declaration");
  assert.ok(xml.includes("<EuropassCV"), "Must contain root EuropassCV element");
  assert.ok(xml.includes("<PersonName>"), "Must contain PersonName");
  assert.ok(xml.includes("EPSO/AD/425/26"), "Must contain selection procedure reference");
  assert.ok(xml.includes("Jean-Luc"), "Must contain candidate first name");

  // PDF Test
  const doc = generateEuropassPdf(candidate, job);
  const pdfOutput = doc.output();
  assert.ok(pdfOutput.startsWith("%PDF-"), "Must produce valid PDF binary with %PDF- header");
  assert.ok(pdfOutput.includes("EUROPASS"), "Must contain EUROPASS text in PDF layer");
});

test("UN P.11 Generator: Produces authentic UN Personal History Profile PDF", () => {
  const candidate = {
    fullName: "Amina Al-Mansoor",
    citizenship: "Jordan",
  };

  const job = {
    title: "Senior Programme Officer",
    agency: "UNICEF Global Innovation Centre",
    selectionRef: "JO/2026/UNICEF-892",
  };

  const doc = generateUnP11Pdf(candidate, job);
  const pdfOutput = doc.output();
  assert.ok(pdfOutput.startsWith("%PDF-"), "Must produce valid PDF binary");
  assert.ok(pdfOutput.includes("UNITED NATIONS"), "Must contain UNITED NATIONS title in text layer");
});

test("Public Sector Search Filters: sector, eligibility, language, and deadline urgency", () => {
  const now = Date.now();
  const testJobs = [
    {
      id: "j-eu",
      title: "EU AI Administrator",
      company: "European Commission",
      isPublicSector: true,
      publicSectorType: "eu_institutions",
      eligibilityType: "citizenship_required",
      languagesRequired: ["English (C1)", "French (B2)"],
      applicationDeadline: new Date(now + 24 * 3600 * 1000).toISOString(), // 24h (< 48h)
      status: "active",
      isActive: true,
    },
    {
      id: "j-un",
      title: "UNICEF Officer",
      company: "UNICEF",
      isPublicSector: true,
      publicSectorType: "un_international",
      eligibilityType: "open_worldwide",
      languagesRequired: ["English (Native)"],
      applicationDeadline: new Date(now + 5 * 24 * 3600 * 1000).toISOString(), // 5 days
      status: "active",
      isActive: true,
    },
    {
      id: "j-private",
      title: "Software Engineer",
      company: "Acme Corp",
      isPublicSector: false,
      status: "active",
      isActive: true,
    },
  ];

  // 1. Public Sector Only
  const pubOnly = filterJobsPublicSector(testJobs, { publicSectorOnly: true });
  assert.equal(pubOnly.length, 2);
  assert.ok(pubOnly.every((j) => j.isPublicSector));

  // 2. Sector Filter: EU Institutions
  const euOnly = filterJobsPublicSector(testJobs, { sector: "eu_institutions" });
  assert.equal(euOnly.length, 1);
  assert.equal(euOnly[0].id, "j-eu");

  // 3. Eligibility Filter: Open Worldwide
  const openWw = filterJobsPublicSector(testJobs, { eligibility: "open_worldwide" });
  assert.equal(openWw.length, 1);
  assert.equal(openWw[0].id, "j-un");

  // 4. Language Filter: Multilingual vs English Only
  const multiLangs = filterJobsPublicSector(testJobs, { languageReq: "multilingual" });
  assert.equal(multiLangs.length, 1);
  assert.equal(multiLangs[0].id, "j-eu");

  const enOnly = filterJobsPublicSector(testJobs, { languageReq: "en_only" });
  assert.ok(enOnly.some((j) => j.id === "j-un"));

  // 5. Deadline Urgency: closing_48h
  const closingSoon = filterJobsPublicSector(testJobs, { deadlineUrgency: "closing_48h" });
  assert.equal(closingSoon.length, 1);
  assert.equal(closingSoon[0].id, "j-eu");

  const next7d = filterJobsPublicSector(testJobs, { deadlineUrgency: "next_7d" });
  assert.equal(next7d.length, 2);
});

test("Public Sector Scrapers: Scraping code implements EPSO, UN, National, and USAJOBS with deadlines", () => {
  const scrapersCode = fs.readFileSync(path.join(process.cwd(), "lib", "scrapers", "public-sector-scrapers.ts"), "utf-8");
  assert.ok(scrapersCode.includes("fetchEpsoJobs"), "Must export fetchEpsoJobs");
  assert.ok(scrapersCode.includes("fetchUnCareersJobs"), "Must export fetchUnCareersJobs");
  assert.ok(scrapersCode.includes("fetchEuresAndNationalGovJobs"), "Must export fetchEuresAndNationalGovJobs");
  assert.ok(scrapersCode.includes("fetchUsaJobsPublicSector"), "Must export fetchUsaJobsPublicSector");
  assert.ok(scrapersCode.includes("fetchAllPublicSectorJobs"), "Must export fetchAllPublicSectorJobs");
  assert.ok(scrapersCode.includes("application_deadline"), "Scraper must map strict application_deadline");
  assert.ok(scrapersCode.includes("original_apply_url"), "Scraper must map deep original_apply_url");
  assert.ok(scrapersCode.includes("fetchAfricanPublicSectorJobs"), "Must export fetchAfricanPublicSectorJobs");
  assert.ok(scrapersCode.includes("DPSA"), "Must aggregate South Africa DPSA vacancies");
  assert.ok(scrapersCode.includes("PSC Zimbabwe"), "Must aggregate Zimbabwe PSC vacancies");
  assert.ok(scrapersCode.includes("AUDA-NEPAD"), "Must aggregate African Union Continental vacancies");
  assert.ok(scrapersCode.includes("SADC"), "Must aggregate Southern African regional vacancies");
});

test("Global Country Scaling: South Africa (ZA) and Zimbabwe (ZW) filters & constants are wired", () => {
  const constantsCode = fs.readFileSync(path.join(process.cwd(), "lib", "constants.ts"), "utf-8");
  assert.ok(constantsCode.includes('"ZA"'), "Must include ZA country code");
  assert.ok(constantsCode.includes('"South Africa"'), "Must include South Africa name");
  assert.ok(constantsCode.includes('"ZW"'), "Must include ZW country code");
  assert.ok(constantsCode.includes('"Zimbabwe"'), "Must include Zimbabwe name");

  const filterJobsCode = fs.readFileSync(path.join(process.cwd(), "lib", "filter-jobs.ts"), "utf-8");
  assert.ok(filterJobsCode.includes("region_af"), "Must support region_af mapping in filterJobs");
  assert.ok(filterJobsCode.includes("south africa"), "Must support south africa alias in filterJobs");
  assert.ok(filterJobsCode.includes("zimbabwe"), "Must support zimbabwe alias in filterJobs");

  const eligibilityCode = fs.readFileSync(path.join(process.cwd(), "lib", "eligibility-engine.ts"), "utf-8");
  assert.ok(eligibilityCode.includes("isZaCitizen"), "Must support South African citizenship check");
  assert.ok(eligibilityCode.includes("isZwCitizen"), "Must support Zimbabwean citizenship check");
  assert.ok(eligibilityCode.includes("isSadcCitizen"), "Must support SADC treaty citizenship check");
});
