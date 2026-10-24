import {
  Job,
  PublicSectorCandidateData,
  PublicSectorApplicationPackage,
  DocumentChecklistItem,
} from "./types";
import { evaluateEligibility } from "./eligibility-engine";

/**
 * Generates an official, formal Public Sector Motivation Letter
 * strictly tailored to European Union Appointing Authorities,
 * UN Selection Boards, or National Civil Service Commissions.
 */
export function generatePublicSectorMotivationLetter(
  candidate: PublicSectorCandidateData,
  job: Job
): string {
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const institutionName = job.agency || job.company || "The European Commission";
  const selectionRef = job.selectionRef || "EPSO/AD/CIVIL-SERVICE/2026";
  const grade = job.grade || "Administrator (AD)";
  const isEu = job.jurisdiction === "EU" || job.publicSectorType === "eu_institutions";
  const isUn = job.jurisdiction === "UN" || job.publicSectorType === "un_international";

  const salutation = isEu
    ? "To the Members of the Selection Board,\nTo the Appointing Authority,"
    : isUn
    ? "To the Chairperson and Members of the United Nations Selection Board,"
    : `To the Selection Panel and Appointing Authority,\n${institutionName},`;

  const openingReference = isEu
    ? `I am writing to submit my formal application for the selection procedure **${selectionRef}** for the recruitment of a **${job.title}** (Grade: ${grade}) within **${institutionName}**.`
    : isUn
    ? `I have the honour to present my candidacy for the advertised vacancy announcement **${selectionRef}**, post of **${job.title}** (${grade}) with **${institutionName}**.`
    : `I am pleased to formally submit my application for the position of **${job.title}** (Ref: ${selectionRef}) at **${institutionName}**.`;

  const competenciesParagraph = `Throughout my ${candidate.yearsOfExperience} years of professional experience, I have developed a strong mastery of complex technical systems, high-integrity governance, and cross-border policy execution. In my current capacity as ${candidate.currentTitle || "Senior Specialist"}, I have consistently operated with strict adherence to public accountability, transparent stewardship of resources, and data-driven problem solving.`;

  const multilingualParagraph = (candidate.languages && candidate.languages.length > 1)
    ? `Given the multilingual and diverse environment of ${institutionName}, I bring proven operational fluency in ${candidate.languages.map((l) => `${l.language} (${l.level})`).join(", ")}, enabling me to collaborate seamlessly with international delegations, civil society counterparts, and institutional stakeholders.`
    : `I am committed to clear, impartial communication and inter-agency collaboration across diverse public interest stakeholders.`;

  const closing = isEu
    ? "I stand ready to participate in the required computer-based tests, written exercises, and interviews to demonstrate my competencies.\n\nRespectfully submitted,"
    : "I look forward to discussing how my experience will serve the objectives of the Organization.\n\nYours sincerely,";

  return `${dateStr}

${candidate.fullName}
${candidate.email} | ${candidate.phone || "+32 2 299 11 11"}
Nationality: ${candidate.citizenship}

${salutation}

Subject: Application for ${job.title} — Notice of Competition / Vacancy Ref: ${selectionRef}

${openingReference}

${competenciesParagraph}

My educational background in ${candidate.degreeTitle || candidate.degreeLevel} from ${candidate.institution || "an accredited institution"} has provided me with the rigorous analytical foundation necessary to deliver on the statutory responsibilities described in the vacancy notice. I am particularly drawn to ${institutionName}'s mission to advance public welfare, resilient democratic infrastructure, and strategic digital sovereignty.

${multilingualParagraph}

I pledge complete integrity, discretion, and loyalty to the public interest, in accordance with the statutory standards and codes of conduct governing officials and servants.

${closing}

${candidate.fullName}
Applicant for ${selectionRef}`;
}

/**
 * Builds the required document checklist for the specific jurisdiction and vacancy notice.
 */
export function buildDocumentChecklist(job: Job): DocumentChecklistItem[] {
  const isEu = job.jurisdiction === "EU" || job.publicSectorType === "eu_institutions";
  const isUn = job.jurisdiction === "UN" || job.publicSectorType === "un_international";

  const items: DocumentChecklistItem[] = [
    {
      id: "doc-id",
      label: "Proof of Citizenship / Identity",
      description: isEu
        ? "Valid national passport or European identity card establishing citizenship of an EU Member State."
        : "Valid national passport establishing nationality in an eligible member state.",
      mandatory: true,
      acceptedFormats: [".pdf", ".jpg", ".png"],
    },
    {
      id: "doc-cv",
      label: isEu ? "Standardized Europass CV" : isUn ? "UN Personal History Profile (Form P.11)" : "Standardized Civil Service Resume",
      description: isEu
        ? "Official Europass CV with European Qualifications Framework (EQF) and CEFR language breakdown."
        : isUn
        ? "UN Form P.11 detailing duties, supervisors, and UN official language proficiencies."
        : "Standard civil service structured resume.",
      mandatory: true,
      acceptedFormats: [".pdf", ".xml"],
    },
    {
      id: "doc-motivation",
      label: "Formal Public Sector Motivation Letter",
      description: `Addressed to the Appointing Authority referencing competition ${job.selectionRef || "notice"}.`,
      mandatory: true,
      acceptedFormats: [".pdf", ".docx"],
    },
    {
      id: "doc-diploma",
      label: "Certified University Degree / Diploma Copies",
      description: "Official certificate of degree completion (minimum Bachelor / Master level as required by the grade).",
      mandatory: true,
      acceptedFormats: [".pdf"],
    },
    {
      id: "doc-language",
      label: "CEFR Language Certificates",
      description: `Official certificates substantiating required levels (${(job.languagesRequired || ["English (C1)"]).join(", ")}).`,
      mandatory: (job.languagesRequired || []).length > 1,
      acceptedFormats: [".pdf"],
    },
    {
      id: "doc-clean-record",
      label: "Extract from Judicial Records / Police Certificate",
      description: "Certificate of good conduct issued by national authorities within the last 3 months.",
      mandatory: Boolean(job.securityClearanceRequired),
      acceptedFormats: [".pdf"],
    },
  ];

  return items;
}

/**
 * Generates the executable browser bookmarklet and standalone console script
 * that candidates can drag into their bookmarks bar or copy-paste on official portals
 * (EPSO, UN Inspira, EURES, USAJOBS, UK Civil Service) to auto-fill form fields!
 */
export function generatePortalPrefillCode(
  candidate: PublicSectorCandidateData,
  job: Job,
  motivationLetter: string
): { bookmarklet: string; script: string; prefillPayload: Record<string, unknown> } {
  const nameParts = candidate.fullName.trim().split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const payload = {
    firstName,
    lastName,
    fullName: candidate.fullName,
    email: candidate.email,
    phone: candidate.phone || "",
    nationality: candidate.citizenship,
    residence: candidate.currentResidence || candidate.citizenship,
    degree: candidate.degreeTitle || candidate.degreeLevel,
    institution: candidate.institution || "",
    yearsOfExperience: candidate.yearsOfExperience,
    targetTitle: job.title,
    agency: job.agency || job.company,
    selectionRef: job.selectionRef || "",
    motivationLetter,
    summary: candidate.summary || `Candidate for ${job.title} with ${candidate.yearsOfExperience} years of public sector & engineering experience.`,
  };

  const rawScript = `(function() {
  const data = ${JSON.stringify(payload)};
  console.log("🚀 Remotework Easy Apply Helper: Autofilling portal fields for " + data.targetTitle + "...");

  const fieldMappings = [
    { keys: ["first_name", "firstname", "first", "prenom", "given_name", "applicant_firstname"], val: data.firstName },
    { keys: ["last_name", "lastname", "last", "nom", "family_name", "surname", "applicant_lastname"], val: data.lastName },
    { keys: ["email", "courriel", "e_mail", "applicant_email"], val: data.email },
    { keys: ["phone", "telephone", "tel", "mobile"], val: data.phone },
    { keys: ["nationality", "citizenship", "nationalite", "country_of_citizenship"], val: data.nationality },
    { keys: ["address", "residence", "country", "pays"], val: data.residence },
    { keys: ["degree", "diploma", "highest_degree", "education_level"], val: data.degree },
    { keys: ["university", "institution", "school", "ecole"], val: data.institution },
    { keys: ["cover_letter", "motivation", "lettre_motivation", "statement_of_suitability", "statement", "personal_statement"], val: data.motivationLetter },
    { keys: ["summary", "profile", "bio", "executive_summary"], val: data.summary }
  ];

  let filledCount = 0;
  const allInputs = Array.from(document.querySelectorAll("input, textarea, select"));

  fieldMappings.forEach(mapping => {
    allInputs.forEach(el => {
      const name = (el.name || "").toLowerCase();
      const id = (el.id || "").toLowerCase();
      const placeholder = (el.placeholder || "").toLowerCase();
      const aria = (el.getAttribute("aria-label") || "").toLowerCase();

      const isMatch = mapping.keys.some(k => name.includes(k) || id.includes(k) || placeholder.includes(k) || aria.includes(k));
      if (isMatch && !el.value && mapping.val) {
        el.value = mapping.val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.style.border = "2px solid #00A86B";
        el.style.backgroundColor = "#E6F4EA";
        filledCount++;
      }
    });
  });

  // Inject floating notification banner
  const banner = document.createElement("div");
  banner.id = "remotework-easy-apply-toast";
  banner.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 999999; background: #003399; color: white; padding: 16px 20px; border-radius: 12px; font-family: -apple-system, sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.3); max-width: 380px; border-left: 6px solid #FFCC00;";
  banner.innerHTML = '<div style="font-weight: 800; font-size: 14px; margin-bottom: 4px;">⚡ Easy Apply Helper Active</div><div style="font-size: 12px; opacity: 0.9;">Pre-filled ' + filledCount + ' official fields with verified Europass / Civil Service credentials!</div>';
  document.body.appendChild(banner);
  setTimeout(() => { banner.remove(); }, 6000);
})();`;

  const bookmarklet = `javascript:${encodeURIComponent(rawScript)}`;

  return {
    bookmarklet,
    script: rawScript,
    prefillPayload: payload,
  };
}

/**
 * Builds the complete 1-Click Pre-filled Application Package.
 */
export function createPublicSectorApplicationPackage(
  candidate: PublicSectorCandidateData,
  job: Job
): PublicSectorApplicationPackage {
  const evaluation = evaluateEligibility(candidate, job);
  const motivationLetter = generatePublicSectorMotivationLetter(candidate, job);
  const requiredDocuments = buildDocumentChecklist(job);
  const { bookmarklet, script, prefillPayload } = generatePortalPrefillCode(
    candidate,
    job,
    motivationLetter
  );

  const formatType: "europass" | "un_p11" | "standard_ats" =
    job.jurisdiction === "EU" || job.europassReady
      ? "europass"
      : job.jurisdiction === "UN" || job.p11Ready
      ? "un_p11"
      : "standard_ats";

  return {
    jobId: job.id,
    jobTitle: job.title,
    agency: job.agency || job.company,
    jurisdiction: job.jurisdiction || "EU",
    formatType,
    selectionRef: job.selectionRef,
    evaluation,
    motivationLetter,
    requiredDocuments,
    prefilledFormData: prefillPayload,
    bookmarkletCode: bookmarklet,
    autofillScript: script,
    portalApplyUrl: job.originalApplyUrl || job.applyUrl,
  };
}
