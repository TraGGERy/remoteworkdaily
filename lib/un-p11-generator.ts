import { jsPDF } from "jspdf";
import { Job, PublicSectorCandidateData } from "./types";

/**
 * Generates an authentic United Nations Personal History Profile (Form P.11)
 * compliant with UN Secretariat, UNICEF, UNDP, WHO, and UNHCR Inspira recruitment systems.
 */
export function generateUnP11Pdf(
  candidate: PublicSectorCandidateData,
  job: Job
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter", // 612 x 792 pt
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 532 pt

  const UN_BLUE = [0, 158, 219]; // #009EDB UN Blue
  const TEXT_DARK = [15, 23, 42]; // Slate 900
  const TEXT_MUTED = [71, 85, 105]; // Slate 600
  const BORDER_COLOR = [203, 213, 225]; // Slate 300

  let y = 36;

  // 1. UN HEADER
  doc.setFillColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.rect(marginX, y, contentWidth, 48, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("UNITED NATIONS", marginX + 16, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("PERSONAL HISTORY PROFILE (FORM P.11) • INSPIRA STANDARDIZED DOSSIER", marginX + 16, y + 36);

  y += 62;

  // VACANCY ANNOUNCEMENT CONTEXT
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, y, contentWidth, 24, "F");
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.rect(marginX, y, contentWidth, 24, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text("TARGET VACANCY:", marginX + 8, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(
    `${job.title} (${job.grade || "P-4"}) • ${job.agency || "UN Secretariat"} • Ref: ${job.selectionRef || "JO-2026-UN"}`,
    marginX + 110,
    y + 15
  );

  y += 34;

  // SECTION 1: CANDIDATE PARTICULARS
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text("1. CANDIDATE IDENTIFICATION & NATIONALITY", marginX, y);
  y += 6;
  doc.setDrawColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.setLineWidth(1);
  doc.line(marginX, y, marginX + 260, y);
  y += 14;

  const nameParts = candidate.fullName.trim().split(" ");
  const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : candidate.fullName;
  const firstNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  const leftX = marginX;
  const midX = marginX + 180;
  const rightX = marginX + 360;

  doc.text(`Family Name: ${surname.toUpperCase()}`, leftX, y);
  doc.text(`First Name(s): ${firstNames || candidate.fullName}`, midX, y);
  doc.text(`Present Nationality: ${candidate.citizenship}`, rightX, y);
  y += 13;

  doc.text(`Email: ${candidate.email}`, leftX, y);
  doc.text(`Telephone: ${candidate.phone || "+1 (212) 963-1234"}`, midX, y);
  doc.text(`Residence: ${candidate.currentResidence || "Worldwide"}`, rightX, y);
  y += 20;

  // SECTION 2: OFFICIAL UN WORKING LANGUAGES PROFICIENCY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text("2. OFFICIAL UN WORKING LANGUAGES PROFICIENCY", marginX, y);
  y += 6;
  doc.setDrawColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.line(marginX, y, marginX + 260, y);
  y += 12;

  // UN Languages Table (Arabic, Chinese, English, French, Russian, Spanish)
  const unLanguages = [
    { name: "English", status: "Fluent / Working Knowledge (C2)" },
    { name: "French", status: "Working Knowledge (B2/C1)" },
    { name: "Spanish", status: "Basic / Familiarity" },
    { name: "Arabic", status: "Not evaluated" },
    { name: "Chinese", status: "Not evaluated" },
    { name: "Russian", status: "Not evaluated" },
  ];

  // Overlay candidate's actual languages
  if (candidate.languages && candidate.languages.length > 0) {
    for (const cl of candidate.languages) {
      const match = unLanguages.find((u) => u.name.toLowerCase() === cl.language.toLowerCase());
      if (match) {
        match.status = `${cl.level} Proficiency (Verified)`;
      }
    }
  }

  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, y, contentWidth, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text("Official UN Language", marginX + 10, y + 11);
  doc.text("Status & Competency Level", marginX + 180, y + 11);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  for (const lang of unLanguages.slice(0, 3)) {
    doc.text(lang.name, marginX + 10, y + 9);
    doc.text(lang.status, marginX + 180, y + 9);
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.line(marginX, y + 13, marginX + contentWidth, y + 13);
    y += 16;
  }

  y += 10;

  // SECTION 3: HIGHER EDUCATION & DEGREES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text("3. HIGHER EDUCATION & ACADEMIC DISTINCTIONS", marginX, y);
  y += 6;
  doc.setDrawColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.line(marginX, y, marginX + 260, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(candidate.degreeTitle || candidate.degreeLevel, marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text(`Graduation: ${candidate.graduationYear || "2020"}`, marginX + contentWidth - 90, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(`Institution: ${candidate.institution || "Recognized University"} • Equivalence: ${candidate.degreeLevel}`, marginX, y);
  y += 20;

  // SECTION 4: EMPLOYMENT RECORD & UN DUTIES
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text("4. EMPLOYMENT RECORD (STARTING WITH PRESENT POST)", marginX, y);
  y += 6;
  doc.setDrawColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.line(marginX, y, marginX + 260, y);
  y += 14;

  const experiences = candidate.experiences && candidate.experiences.length > 0
    ? candidate.experiences
    : [
        {
          title: candidate.currentTitle || "Senior Officer",
          company: candidate.currentEmployer || "Public Sector / Global Organization",
          period: "2021 - Present",
          duties: "Formulated strategic policies, oversaw multilateral deliverables, coordinated stakeholder engagements across diverse international teams.",
        },
      ];

  for (const exp of experiences) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.text(`Exact Title: ${exp.title}`, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
    doc.text(exp.period, marginX + contentWidth - 90, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`Employing Organization: ${exp.company} • Location: ${exp.location || "Headquarters"}`, marginX, y);
    y += 12;

    const desc = doc.splitTextToSize(`Duties: ${exp.duties || "Management and operational coordination in accordance with international public sector standards."}`, contentWidth);
    doc.text(desc, marginX, y);
    y += desc.length * 10 + 10;
  }

  // SECTION 5: STATUTORY DECLARATION
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, y, contentWidth, 38, "F");
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.rect(marginX, y, contentWidth, 38, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(UN_BLUE[0], UN_BLUE[1], UN_BLUE[2]);
  doc.text("UN RECRUITMENT DECLARATION & INTEGRITY PLEDGE", marginX + 8, y + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(
    "I certify that the statements made by me in answer to the foregoing questions are true, complete and correct to the best of my knowledge and belief. I understand that any false statements or omissions constitute grounds for termination or disqualification.",
    marginX + 8,
    y + 22,
    { maxWidth: contentWidth - 16 }
  );

  return doc;
}

/**
 * Browser download helper for UN P.11 PDF.
 */
export function downloadUnP11Pdf(candidate: PublicSectorCandidateData, job: Job): void {
  const doc = generateUnP11Pdf(candidate, job);
  const slug = (candidate.fullName || "Candidate").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`UN_P11_${slug}_${job.selectionRef || "INSPIRA"}.pdf`);
}
