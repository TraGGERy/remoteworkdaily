import { jsPDF } from "jspdf";
import { Job, PublicSectorCandidateData, CefrLevel } from "./types";

function xmlEscape(str: string = ""): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generates an official Europass XML document adhering to the European Commission
 * Cedefop Europass CV specification with complete CEFR linguistic profile.
 */
export function generateEuropassXml(
  candidate: PublicSectorCandidateData,
  job: Job
): string {
  const now = new Date().toISOString();
  const dateFormatted = now.split("T")[0];

  const languagesXml = (candidate.languages || [
    { language: "English", level: "C1" as CefrLevel },
    { language: "French", level: "B2" as CefrLevel },
  ])
    .map((lang, idx) => {
      const level = lang.level || "B2";
      if (idx === 0 && (level === "Native" || level === "C2")) {
        return `        <MotherTongue>
          <Description>
            <Code>${xmlEscape(lang.language.substring(0, 2).toLowerCase())}</Code>
            <Label>${xmlEscape(lang.language)}</Label>
          </Description>
        </MotherTongue>`;
      }
      return `        <ForeignLanguage>
          <Description>
            <Code>${xmlEscape(lang.language.substring(0, 2).toLowerCase())}</Code>
            <Label>${xmlEscape(lang.language)}</Label>
          </Description>
          <ProficiencyLevel>
            <Listening>${xmlEscape(level)}</Listening>
            <Reading>${xmlEscape(level)}</Reading>
            <SpokenInteraction>${xmlEscape(level)}</SpokenInteraction>
            <SpokenProduction>${xmlEscape(level)}</SpokenProduction>
            <Writing>${xmlEscape(level)}</Writing>
          </ProficiencyLevel>
        </ForeignLanguage>`;
    })
    .join("\n");

  const experiencesXml = (candidate.experiences || [
    {
      title: candidate.currentTitle || "Senior Officer",
      company: candidate.currentEmployer || "Public Administration / Enterprise",
      period: "2021 - Present",
      duties: "Technical and policy coordination, cross-border digital governance, EU standards compliance.",
    },
  ])
    .map((exp) => {
      return `      <WorkExperience>
        <Period>
          <Description>${xmlEscape(exp.period)}</Description>
        </Period>
        <Position>
          <Label>${xmlEscape(exp.title)}</Label>
        </Position>
        <Employer>
          <OrganisationName>${xmlEscape(exp.company)}</OrganisationName>
          <Address>
            <Country>${xmlEscape(exp.location || "European Union")}</Country>
          </Address>
        </Employer>
        <Activities>${xmlEscape(exp.duties || "Lead engineering and policy implementation according to EU institutional guidelines.")}</Activities>
      </WorkExperience>`;
    })
    .join("\n");

  const nameParts = candidate.fullName.trim().split(" ");
  const firstName = nameParts[0] || "Candidate";
  const surname = nameParts.slice(1).join(" ") || "Applicant";

  return `<?xml version="1.0" encoding="UTF-8"?>
<EuropassCV xmlns="http://europass.cedefop.europa.eu/Europass" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://europass.cedefop.europa.eu/Europass http://europass.cedefop.europa.eu/Europass/EuropassCV.xsd">
  <DocumentInfo>
    <DocumentType>ECV</DocumentType>
    <CreationDate>${dateFormatted}</CreationDate>
    <LastUpdateDate>${dateFormatted}</LastUpdateDate>
    <XSLVersion>V2.0</XSLVersion>
    <TargetApplication>
      <Position>${xmlEscape(job.title)}</Position>
      <Institution>${xmlEscape(job.agency || job.company)}</Institution>
      <SelectionProcedureReference>${xmlEscape(job.selectionRef || "EPSO/AD/CIVIL-SERVICE/2026")}</SelectionProcedureReference>
      <Grade>${xmlEscape(job.grade || "AD")}</Grade>
    </TargetApplication>
  </DocumentInfo>
  <LearnerInfo>
    <Identification>
      <PersonName>
        <FirstName>${xmlEscape(firstName)}</FirstName>
        <Surname>${xmlEscape(surname)}</Surname>
      </PersonName>
      <ContactInfo>
        <Address>
          <Country>${xmlEscape(candidate.currentResidence || candidate.citizenship || "EU")}</Country>
        </Address>
        <Email>
          <Contact>${xmlEscape(candidate.email)}</Contact>
        </Email>
        <Telephone>
          <Contact>${xmlEscape(candidate.phone || "+32 2 299 11 11")}</Contact>
        </Telephone>
      </ContactInfo>
      <Demographics>
        <Nationality>
          <Code>${xmlEscape(candidate.citizenship)}</Code>
        </Nationality>
      </Demographics>
    </Identification>
    <WorkExperienceList>
${experiencesXml}
    </WorkExperienceList>
    <EducationAndTrainingList>
      <EducationAndTraining>
        <Title>${xmlEscape(candidate.degreeTitle || candidate.degreeLevel)}</Title>
        <OrganisationName>${xmlEscape(candidate.institution || "Accredited European University")}</OrganisationName>
        <Level>
          <EuropeanQualificationsFramework>${xmlEscape(candidate.degreeLevel.includes("7") ? "EQF Level 7 (Master)" : "EQF Level 6 (Bachelor)")}</EuropeanQualificationsFramework>
        </Level>
        <Year>${xmlEscape(candidate.graduationYear || "2020")}</Year>
      </EducationAndTraining>
    </EducationAndTrainingList>
    <Skills>
      <Linguistic>
${languagesXml}
      </Linguistic>
      <Competencies>
        <Category name="CivilService">
          <Skill>European Administrative Law &amp; Staff Regulations compliance</Skill>
          <Skill>Multilingual drafting and institutional reporting</Skill>
          <Skill>Public interest stewardship and high ethical standards</Skill>
        </Category>
        <Category name="Technical">
          <Skill>Digital transformation in public administration</Skill>
          <Skill>Secure data architecture &amp; GDPR compliance</Skill>
        </Category>
      </Competencies>
    </Skills>
  </LearnerInfo>
</EuropassCV>`;
}

/**
 * Generates an executive, official Europass formatted PDF matching EU Commission
 * Directorate-General for Human Resources (DG HR) standards.
 */
export function generateEuropassPdf(
  candidate: PublicSectorCandidateData,
  job: Job
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4", // 595.28 x 841.89 pt
  });

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 515 pt

  // Colors conforming to EU Commission Branding Guidelines
  const EU_BLUE = [0, 51, 153]; // #003399 European Blue
  const EU_GOLD = [255, 204, 0]; // #FFCC00 EU Stars Gold
  const TEXT_DARK = [17, 24, 39]; // Slate 900
  const TEXT_MUTED = [75, 85, 99]; // Slate 600
  const BORDER_LIGHT = [229, 231, 235]; // Gray 200

  let y = 36;

  // 1. EUROPASS HEADER BANNER
  doc.setFillColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.rect(marginX, y, contentWidth, 54, "F");

  // Gold EU stars accent strip
  doc.setFillColor(EU_GOLD[0], EU_GOLD[1], EU_GOLD[2]);
  doc.rect(marginX, y + 51, contentWidth, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("EUROPASS CURRICULUM VITAE", marginX + 16, y + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(230, 235, 245);
  const subtitle = job.selectionRef
    ? `EPSO SELECTION PROCEDURE: ${job.selectionRef} • ${job.grade || "CIVIL SERVICE"}`
    : `EUROPEAN PUBLIC SECTOR VACANCY: ${job.title.toUpperCase()}`;
  doc.text(subtitle, marginX + 16, y + 40);

  y += 72;

  // 2. CANDIDATE IDENTIFICATION BLOCK (2-Column Grid)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.text("PERSONAL INFORMATION", marginX, y);
  y += 6;
  doc.setDrawColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.setLineWidth(1);
  doc.line(marginX, y, marginX + 160, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(candidate.fullName.toUpperCase(), marginX, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);

  const leftColX = marginX;
  const rightColX = marginX + 260;

  doc.text(`Email: ${candidate.email}`, leftColX, y);
  doc.text(`Nationality: ${candidate.citizenship} (EU / National)`, rightColX, y);
  y += 12;

  doc.text(`Telephone: ${candidate.phone || "+32 (0) 2 299 11 11"}`, leftColX, y);
  doc.text(`Residence: ${candidate.currentResidence || "European Union"}`, rightColX, y);
  y += 12;

  doc.text(`Target Competition: ${job.title}`, leftColX, y);
  doc.text(`Target Institution: ${job.agency || job.company}`, rightColX, y);
  y += 20;

  // 3. WORK EXPERIENCE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.text("WORK EXPERIENCE", marginX, y);
  y += 6;
  doc.setDrawColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.line(marginX, y, marginX + 160, y);
  y += 14;

  const experiences = candidate.experiences && candidate.experiences.length > 0
    ? candidate.experiences
    : [
        {
          title: candidate.currentTitle || "Senior Technology & Systems Specialist",
          company: candidate.currentEmployer || "Public Administration / International Body",
          period: "2021 - Present",
          duties: "Coordinated digital implementation and inter-agency workflows conforming to EU data governance and operational guidelines.",
        },
        {
          title: "Technical Systems Engineer",
          company: "Enterprise Cloud & Infrastructure Services",
          period: "2018 - 2021",
          duties: "Spearheaded resilient system architectures, security compliance auditing, and stakeholder alignment.",
        },
      ];

  for (const exp of experiences) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
    doc.text(exp.title, marginX, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
    doc.text(exp.period, marginX + contentWidth - 80, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
    doc.text(`${exp.company} • ${exp.location || "Brussels / EU"}`, marginX, y);
    y += 12;

    const dutiesLines = doc.splitTextToSize(exp.duties || "Key responsibilities executed in full compliance with public service standards.", contentWidth);
    doc.text(dutiesLines, marginX, y);
    y += dutiesLines.length * 11 + 8;
  }

  // 4. EDUCATION & TRAINING (EQF Framework)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.text("EDUCATION AND TRAINING", marginX, y);
  y += 6;
  doc.setDrawColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.line(marginX, y, marginX + 160, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(candidate.degreeTitle || candidate.degreeLevel, marginX, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.text(candidate.graduationYear || "2020", marginX + contentWidth - 80, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(`${candidate.institution || "European University"} • European Qualifications Framework: ${candidate.degreeLevel}`, marginX, y);
  y += 20;

  // 5. OFFICIAL CEFR LINGUISTIC COMPETENCE GRID
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.text("LANGUAGE PROFICIENCY (CEFR GRID)", marginX, y);
  y += 6;
  doc.setDrawColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.line(marginX, y, marginX + 200, y);
  y += 12;

  // CEFR Table Header
  const colWidths = [115, 80, 80, 80, 80, 80];
  const headers = ["Language", "Listening", "Reading", "Interaction", "Production", "Writing"];

  doc.setFillColor(243, 244, 246);
  doc.rect(marginX, y, contentWidth, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);

  let curX = marginX + 6;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], curX, y + 12);
    curX += colWidths[i];
  }
  y += 20;

  const languages = candidate.languages && candidate.languages.length > 0
    ? candidate.languages
    : [
        { language: "English", level: "C2" as CefrLevel },
        { language: "French", level: "B2" as CefrLevel },
      ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  for (const lang of languages) {
    const lvl = lang.level || "B2";
    curX = marginX + 6;
    doc.text(lang.language, curX, y + 10);
    curX += colWidths[0];
    doc.text(lvl, curX, y + 10);
    curX += colWidths[1];
    doc.text(lvl, curX, y + 10);
    curX += colWidths[2];
    doc.text(lvl, curX, y + 10);
    curX += colWidths[3];
    doc.text(lvl, curX, y + 10);
    curX += colWidths[4];
    doc.text(lvl, curX, y + 10);

    doc.setDrawColor(BORDER_LIGHT[0], BORDER_LIGHT[1], BORDER_LIGHT[2]);
    doc.line(marginX, y + 15, marginX + contentWidth, y + 15);
    y += 18;
  }

  y += 10;

  // 6. CIVIL SERVICE & STATUTORY DECLARATION FOOTER
  doc.setFillColor(248, 250, 252);
  doc.rect(marginX, y, contentWidth, 38, "F");
  doc.setDrawColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.setLineWidth(0.5);
  doc.rect(marginX, y, contentWidth, 38, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(EU_BLUE[0], EU_BLUE[1], EU_BLUE[2]);
  doc.text("STATUTORY CIVIL SERVICE DECLARATION", marginX + 10, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(
    "I hereby certify upon honor that the information provided is accurate and verifiable against certified diplomas, civil status records, and employer certificates as required under the Staff Regulations of Officials of the European Union.",
    marginX + 10,
    y + 22,
    { maxWidth: contentWidth - 20 }
  );

  return doc;
}

/**
 * Browser download helper for Europass XML.
 */
export function downloadEuropassXml(candidate: PublicSectorCandidateData, job: Job): void {
  const xml = generateEuropassXml(candidate, job);
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = (candidate.fullName || "Candidate").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  a.download = `Europass_CV_${slug}_${job.selectionRef || "EPSO"}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Browser download helper for Europass PDF.
 */
export function downloadEuropassPdf(candidate: PublicSectorCandidateData, job: Job): void {
  const doc = generateEuropassPdf(candidate, job);
  const slug = (candidate.fullName || "Candidate").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  doc.save(`Europass_CV_${slug}_${job.selectionRef || "EU"}.pdf`);
}
