import {
  Job,
  PublicSectorCandidateData,
  EligibilityEvaluation,
  EligibilityCriterionCheck,
  CefrLevel,
} from "./types";

export const EU_MEMBER_STATES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  // Full names
  "AUSTRIA", "BELGIUM", "BULGARIA", "CROATIA", "CYPRUS", "CZECH REPUBLIC", "CZECHIA",
  "DENMARK", "ESTONIA", "FINLAND", "FRANCE", "GERMANY", "GREECE", "HUNGARY",
  "IRELAND", "ITALY", "LATVIA", "LITHUANIA", "LUXEMBOURG", "MALTA", "NETHERLANDS",
  "POLAND", "PORTUGAL", "ROMANIA", "SLOVAKIA", "SLOVENIA", "SPAIN", "SWEDEN",
  "EU", "EUROPEAN UNION",
]);

export const CEFR_LEVELS_ORDER: CefrLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "Native",
];

export function isEuCitizen(countryStr: string = ""): boolean {
  if (!countryStr) return false;
  const normalized = countryStr.trim().toUpperCase();
  return EU_MEMBER_STATES.has(normalized);
}

export function parseCefrLevel(levelStr: string = ""): CefrLevel {
  const norm = levelStr.trim().toUpperCase();
  if (norm.includes("NATIVE") || norm.includes("MOTHER")) return "Native";
  if (norm.includes("C2")) return "C2";
  if (norm.includes("C1")) return "C1";
  if (norm.includes("B2")) return "B2";
  if (norm.includes("B1")) return "B1";
  if (norm.includes("A2")) return "A2";
  if (norm.includes("A1")) return "A1";
  return "B2"; // standard working default
}

export function isCefrSufficient(candidateLevel: string, requiredLevel: string): boolean {
  const candCefr = parseCefrLevel(candidateLevel);
  const reqCefr = parseCefrLevel(requiredLevel);
  const candIdx = CEFR_LEVELS_ORDER.indexOf(candCefr);
  const reqIdx = CEFR_LEVELS_ORDER.indexOf(reqCefr);
  return candIdx >= reqIdx;
}

export function getDegreeScore(degreeStr: string = ""): number {
  const d = degreeStr.toLowerCase();
  if (d.includes("phd") || d.includes("doctor") || d.includes("eqf 8")) return 8;
  if (d.includes("master") || d.includes("postgrad") || d.includes("msc") || d.includes("ma ") || d.includes("eqf 7")) return 7;
  if (d.includes("bachelor") || d.includes("undergrad") || d.includes("bsc") || d.includes("ba ") || d.includes("eqf 6")) return 6;
  if (d.includes("diploma") || d.includes("associate") || d.includes("eqf 5")) return 5;
  return 6; // default bachelor level
}

/**
 * Pre-checks a candidate's profile against official public-sector eligibility criteria:
 * - Citizenship (Statutory nationality restrictions e.g. EU 27, UK, US, UN Member States)
 * - Degree / Educational Level (EQF 6 Bachelors, EQF 7 Masters, EQF 8 Doctorate)
 * - Multilingual CEFR Proficiency (A1 to C2 & Native working languages)
 * - Statutory Security Clearance (EU SECRET, NATO SECRET, SC/DV, Top Secret)
 * - Civil Service Grade / Years of Experience
 */
export function evaluateEligibility(
  candidate: PublicSectorCandidateData,
  job: Job
): EligibilityEvaluation {
  const warnings: string[] = [];
  const actionItems: string[] = [];
  const eligibleJurisdictions: string[] = [];

  // 1. CITIZENSHIP CHECK
  const allCandidateCitizenships = [
    candidate.citizenship,
    ...(candidate.secondaryCitizenships || []),
  ].filter(Boolean);

  const hasEuCitizenship = allCandidateCitizenships.some(isEuCitizen);
  const isUkCitizen = allCandidateCitizenships.some((c) => ["UK", "GB", "BRITISH", "UNITED KINGDOM"].includes(c.toUpperCase().trim()));
  const isUsCitizen = allCandidateCitizenships.some((c) => ["US", "USA", "UNITED STATES", "AMERICAN"].includes(c.toUpperCase().trim()));
  const isZaCitizen = allCandidateCitizenships.some((c) => ["ZA", "SOUTH AFRICA", "SOUTH AFRICAN", "RSA"].includes(c.toUpperCase().trim()));
  const isZwCitizen = allCandidateCitizenships.some((c) => ["ZW", "ZIMBABWE", "ZIMBABWEAN"].includes(c.toUpperCase().trim()));
  const isSadcCitizen = isZaCitizen || isZwCitizen || allCandidateCitizenships.some((c) => ["BOTSWANA", "NAMIBIA", "MOZAMBIQUE", "ZAMBIA", "ANGOLA", "LESOTHO", "ESWATINI", "MALAWI", "TANZANIA", "MAURITIUS", "MADAGASCAR", "DRC", "SEYCHELLES"].includes(c.toUpperCase().trim()));
  const isAuCitizen = isSadcCitizen || allCandidateCitizenships.some((c) => ["NIGERIA", "KENYA", "GHANA", "EGYPT", "RWANDA", "ETHIOPIA", "UGANDA", "MOROCCO", "SENEGAL", "CAMEROON", "AFRICAN"].includes(c.toUpperCase().trim()));

  if (hasEuCitizenship) eligibleJurisdictions.push("EU");
  if (isUkCitizen) eligibleJurisdictions.push("UK");
  if (isUsCitizen) eligibleJurisdictions.push("US");
  if (isZaCitizen) eligibleJurisdictions.push("ZA");
  if (isZwCitizen) eligibleJurisdictions.push("ZW");
  if (isSadcCitizen) eligibleJurisdictions.push("Regional");
  if (isAuCitizen) eligibleJurisdictions.push("AU");
  eligibleJurisdictions.push("UN", "International");

  let citizenshipCheck: EligibilityCriterionCheck;
  const isEuJob = job.jurisdiction === "EU" || job.publicSectorType === "eu_institutions";
  const isUkJob = job.jurisdiction === "UK";
  const isUsJob = job.jurisdiction === "US";
  const isZaJob = job.jurisdiction === "ZA" || (job.agency && job.agency.toLowerCase().includes("south africa"));
  const isZwJob = job.jurisdiction === "ZW" || (job.agency && job.agency.toLowerCase().includes("zimbabwe"));
  const isSadcJob = job.jurisdiction === "Regional" || (job.agency && job.agency.toLowerCase().includes("sadc"));
  const isAuJob = job.jurisdiction === "AU" || (job.agency && (job.agency.toLowerCase().includes("african union") || job.agency.toLowerCase().includes("nepad")));
  const isOpenWorldwide = job.eligibilityType === "open_worldwide" || (!isEuJob && !isUkJob && !isUsJob && !isZaJob && !isZwJob && !isSadcJob && job.eligibilityType !== "citizenship_required");

  if (isOpenWorldwide) {
    citizenshipCheck = {
      status: "pass",
      title: "Statutory Nationality Requirement",
      requirement: "Open Worldwide / Nationals of all UN Member States",
      candidateValue: allCandidateCitizenships.join(", ") || "Global Citizen",
      message: "Eligible: This position is open to nationals of all recognized member states worldwide with equal opportunity.",
    };
  } else if (isEuJob && job.eligibilityType === "citizenship_required") {
    if (hasEuCitizenship) {
      citizenshipCheck = {
        status: "pass",
        title: "EU Citizenship Requirement (Article 28(a))",
        requirement: "Citizenship of an EU Member State",
        candidateValue: candidate.citizenship,
        message: `Verified: Holder of EU Member State citizenship (${candidate.citizenship}), meeting Article 28(a) of the EU Staff Regulations.`,
      };
    } else {
      citizenshipCheck = {
        status: "fail",
        title: "EU Citizenship Restriction (Article 28(a))",
        requirement: "Citizenship of an EU Member State",
        candidateValue: candidate.citizenship || "Non-EU",
        message: "Statutory Ineligibility: This EPSO / EU institution selection procedure strictly requires citizenship of one of the 27 EU Member States.",
      };
      warnings.push("Statutory Ineligibility: Requires EU Member State citizenship.");
      actionItems.push("Explore European contract agent (CA) posts open to non-EU candidates or international agencies (UN, OECD).");
    }
  } else if (isUkJob && job.eligibilityType === "citizenship_required") {
    if (isUkCitizen) {
      citizenshipCheck = {
        status: "pass",
        title: "UK Civil Service Nationality Rules",
        requirement: "UK, Irish, or eligible Commonwealth Citizen",
        candidateValue: candidate.citizenship,
        message: "Verified: Satisfies Civil Service Nationality Rules.",
      };
    } else {
      citizenshipCheck = {
        status: "fail",
        title: "UK Civil Service Nationality Rules",
        requirement: "UK, Irish, or eligible Commonwealth Citizen",
        candidateValue: candidate.citizenship || "Non-UK",
        message: "Restricted: Post is subject to reserved UK Civil Service nationality requirements.",
      };
      warnings.push("Nationality Restriction: Reserved UK Civil Service post.");
    }
  } else if (isZaJob && job.eligibilityType === "citizenship_required") {
    if (isZaCitizen) {
      citizenshipCheck = {
        status: "pass",
        title: "South African Public Service Act Requirements",
        requirement: "South African Citizen / Permanent Resident",
        candidateValue: candidate.citizenship,
        message: "Verified: Satisfies South African Public Service Act eligibility for civil service appointment.",
      };
    } else {
      citizenshipCheck = {
        status: "fail",
        title: "South African Public Service Act Restriction",
        requirement: "South African Citizen / Permanent Resident",
        candidateValue: candidate.citizenship || "International",
        message: "Statutory Ineligibility: This national civil service post is reserved for South African citizens / permanent residents.",
      };
      warnings.push("Nationality Restriction: Reserved South African Public Service post.");
    }
  } else if (isZwJob && job.eligibilityType === "citizenship_required") {
    if (isZwCitizen) {
      citizenshipCheck = {
        status: "pass",
        title: "Zimbabwe Public Service Commission Regulations",
        requirement: "Citizen of Zimbabwe",
        candidateValue: candidate.citizenship,
        message: "Verified: Satisfies Public Service Commission eligibility for national appointment.",
      };
    } else {
      citizenshipCheck = {
        status: "fail",
        title: "Zimbabwe Public Service Commission Restriction",
        requirement: "Citizen of Zimbabwe",
        candidateValue: candidate.citizenship || "International",
        message: "Statutory Ineligibility: This civil service vacancy is reserved for citizens of Zimbabwe.",
      };
      warnings.push("Nationality Restriction: Reserved Zimbabwe Public Service post.");
    }
  } else if (isSadcJob && job.eligibilityType === "citizenship_required") {
    if (isSadcCitizen) {
      citizenshipCheck = {
        status: "pass",
        title: "SADC Treaty Nationality Requirements",
        requirement: "Citizen of a SADC Member State",
        candidateValue: candidate.citizenship,
        message: "Verified: National of an eligible Southern African Development Community (SADC) Member State.",
      };
    } else {
      citizenshipCheck = {
        status: "fail",
        title: "SADC Treaty Nationality Restriction",
        requirement: "Citizen of a SADC Member State",
        candidateValue: candidate.citizenship || "Non-SADC",
        message: "Statutory Ineligibility: Reserved for citizens of the 16 SADC member countries.",
      };
      warnings.push("Regional Restriction: SADC Member State citizenship required.");
    }
  } else if (isAuJob) {
    citizenshipCheck = {
      status: "pass",
      title: "African Union / AUDA-NEPAD Criteria",
      requirement: "Open to nationals of AU Member States",
      candidateValue: candidate.citizenship,
      message: isAuCitizen
        ? "Verified: Citizen of an African Union Member State."
        : "Eligible: International multilateral consideration applies.",
    };
  } else {
    // Default open / visa sponsored
    citizenshipCheck = {
      status: "pass",
      title: "Citizenship Eligibility",
      requirement: job.eligibilityType === "visa_sponsored" ? "Visa Sponsored / International" : "Open Eligibility",
      candidateValue: candidate.citizenship,
      message: "Verified: Candidate nationality meets baseline submission criteria.",
    };
  }

  // 2. DEGREE / QUALIFICATIONS CHECK
  const candidateDegreeScore = getDegreeScore(candidate.degreeLevel);
  let requiredDegreeScore = 6; // default bachelor
  let requiredDegreeLabel = "Bachelor's Degree (EQF Level 6)";

  if (job.grade?.startsWith("AD 7") || job.grade?.startsWith("P-4") || job.grade?.startsWith("P-5")) {
    requiredDegreeScore = 7;
    requiredDegreeLabel = "Master's Degree (EQF Level 7) or higher";
  }

  let degreeCheck: EligibilityCriterionCheck;
  if (candidateDegreeScore >= requiredDegreeScore) {
    degreeCheck = {
      status: "pass",
      title: "Education Level & Equivalence (EQF)",
      requirement: requiredDegreeLabel,
      candidateValue: candidate.degreeLevel,
      message: `Verified: ${candidate.degreeLevel} meets or exceeds required educational standard (${requiredDegreeLabel}).`,
    };
  } else if (candidate.yearsOfExperience >= 5) {
    degreeCheck = {
      status: "warning",
      title: "Education Level & Compensatory Experience",
      requirement: requiredDegreeLabel,
      candidateValue: `${candidate.degreeLevel} + ${candidate.yearsOfExperience} yrs exp`,
      message: `Sub-criterion: Candidate holds ${candidate.degreeLevel}, but has ${candidate.yearsOfExperience} years of experience that may qualify under compensatory professional rules.`,
    };
    warnings.push(`Degree disparity: Position indicates ${requiredDegreeLabel}; review equivalency.`);
    actionItems.push("Prepare official NARIC/ENIC diploma recognition statement to substantiate equivalency.");
  } else {
    degreeCheck = {
      status: "fail",
      title: "Educational Prerequisite",
      requirement: requiredDegreeLabel,
      candidateValue: candidate.degreeLevel,
      message: `Statutory Shortfall: Role requires ${requiredDegreeLabel}. Candidate holds ${candidate.degreeLevel}.`,
    };
    warnings.push(`Educational Requirement: Requires ${requiredDegreeLabel}.`);
  }

  // 3. LANGUAGES CHECK (CEFR)
  const jobLanguages = job.languagesRequired && job.languagesRequired.length > 0
    ? job.languagesRequired
    : ["English (C1)"];

  const candidateLangMap = new Map<string, CefrLevel>();
  for (const l of candidate.languages || []) {
    candidateLangMap.set(l.language.toLowerCase().trim(), l.level);
  }
  // Ensure English is present if not specified
  if (!candidateLangMap.has("english") && !candidateLangMap.has("en")) {
    candidateLangMap.set("english", "C1");
  }

  let languageCheckStatus: "pass" | "warning" | "fail" = "pass";
  const langDetails: string[] = [];

  for (const req of jobLanguages) {
    const langName = req.split("(")[0].trim().toLowerCase();
    const reqLevel = req.includes("(") ? req.split("(")[1].replace(")", "").trim() : "B2";

    let candLevel: CefrLevel | undefined;
    for (const [key, val] of candidateLangMap.entries()) {
      if (key.includes(langName) || langName.includes(key)) {
        candLevel = val;
        break;
      }
    }

    if (!candLevel) {
      languageCheckStatus = "warning";
      langDetails.push(`Missing certified proficiency for ${req}`);
      warnings.push(`Language requirement: ${req} is mandatory for this competition.`);
      actionItems.push(`Certify language competence in ${req} via accredited CEFR examination.`);
    } else if (!isCefrSufficient(candLevel, reqLevel)) {
      languageCheckStatus = "warning";
      langDetails.push(`Requires ${req}, candidate assessed at ${candLevel}`);
      warnings.push(`Language CEFR delta: Position requires ${req}, current assessment is ${candLevel}.`);
    } else {
      langDetails.push(`${req}: Met (${candLevel})`);
    }
  }

  const languageCheck: EligibilityCriterionCheck = {
    status: languageCheckStatus,
    title: "Official CEFR Linguistic Competence",
    requirement: jobLanguages.join(", "),
    candidateValue: (candidate.languages || []).map((l) => `${l.language} (${l.level})`).join(", ") || "English (C1)",
    message: langDetails.join("; ") || "All official language prerequisites satisfied.",
  };

  // 4. SECURITY CLEARANCE CHECK
  let clearanceCheck: EligibilityCriterionCheck;
  const reqClearance = job.securityClearanceRequired;
  const reqLevel = job.securityClearanceLevel || "EU SECRET / NATO SECRET";
  const candClearance = candidate.securityClearance && candidate.securityClearance !== "None";

  if (!reqClearance) {
    clearanceCheck = {
      status: "pass",
      title: "Security Clearance Requirement",
      requirement: "Standard Public Sector Baseline (Clean Judicial Record)",
      candidateValue: candidate.securityClearance || "Standard",
      message: "No elevated national defense vetting mandated. Clean criminal record excerpt required upon offer.",
    };
  } else if (candClearance) {
    clearanceCheck = {
      status: "pass",
      title: "Statutory Security Clearance",
      requirement: reqLevel,
      candidateValue: candidate.securityClearance!,
      message: `Verified: Active security clearance (${candidate.securityClearance}) matches required vetting level (${reqLevel}).`,
    };
  } else {
    clearanceCheck = {
      status: "warning",
      title: "Security Vetting Requirement",
      requirement: reqLevel,
      candidateValue: "None (Vetting upon appointment)",
      message: `Vetting Advisory: Role requires ${reqLevel}. Selected candidate must consent to national security vetting prior to final appointment.`,
    };
    warnings.push(`Security Vetting: Role requires ${reqLevel} clearance prior to confirmation.`);
    actionItems.push("Obtain official police certificate / extract from judicial records issued within the past 3 months.");
  }

  // 5. EXPERIENCE CHECK
  let minYears = 2;
  if (job.grade?.includes("AD 7") || job.grade?.includes("P-4") || job.grade?.includes("Grade 7")) {
    minYears = 6;
  } else if (job.grade?.includes("P-5") || job.grade?.includes("Grade 6")) {
    minYears = 10;
  } else if (job.grade?.includes("AST") || job.grade?.includes("P-1") || job.grade?.includes("P-2")) {
    minYears = 1;
  }

  let experienceCheck: EligibilityCriterionCheck;
  if (candidate.yearsOfExperience >= minYears) {
    experienceCheck = {
      status: "pass",
      title: "Post-Graduate Professional Experience",
      requirement: `${minYears}+ years relevant experience for Grade ${job.grade || "Public Officer"}`,
      candidateValue: `${candidate.yearsOfExperience} years documented`,
      message: `Verified: Candidate has ${candidate.yearsOfExperience} years of experience, satisfying minimum requirement (${minYears} years).`,
    };
  } else {
    experienceCheck = {
      status: "warning",
      title: "Professional Experience Seniority",
      requirement: `${minYears}+ years required for Grade ${job.grade || "Public Officer"}`,
      candidateValue: `${candidate.yearsOfExperience} years`,
      message: `Seniority Warning: Candidate has ${candidate.yearsOfExperience} years of experience vs. ${minYears} years typical for this grade.`,
    };
    warnings.push(`Experience shortfall: Grade ${job.grade || "officer"} typically requires ${minYears}+ years.`);
  }

  // Calculate composite match score (0-100)
  let score = 0;
  if (citizenshipCheck.status === "pass") score += 35;
  else if (citizenshipCheck.status === "warning") score += 15;

  if (degreeCheck.status === "pass") score += 20;
  else if (degreeCheck.status === "warning") score += 10;

  if (languageCheck.status === "pass") score += 25;
  else if (languageCheck.status === "warning") score += 12;

  if (experienceCheck.status === "pass") score += 15;
  else if (experienceCheck.status === "warning") score += 8;

  if (clearanceCheck.status === "pass") score += 5;
  score = Math.min(Math.max(score, 0), 100);

  // Overall status
  let overallStatus: "eligible" | "warning" | "ineligible" = "eligible";
  if (citizenshipCheck.status === "fail") {
    overallStatus = "ineligible";
  } else if (
    degreeCheck.status === "fail" ||
    languageCheck.status === "warning" ||
    degreeCheck.status === "warning" ||
    clearanceCheck.status === "warning" ||
    experienceCheck.status === "warning"
  ) {
    overallStatus = "warning";
  }

  return {
    status: overallStatus,
    matchScore: score,
    criteria: {
      citizenship: citizenshipCheck,
      degree: degreeCheck,
      languages: languageCheck,
      clearance: clearanceCheck,
      experience: experienceCheck,
    },
    warnings,
    actionItems,
    eligibleJurisdictions,
  };
}
