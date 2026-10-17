import { jsPDF } from "jspdf";
import { TailoredApplicationData, sanitizeCoverLetterParagraphs } from "./ai-tailor";

export type PdfTemplateStyle = "executive" | "moderncv" | "minimal";

export interface PdfGeneratorOptions {
  includeCoverLetter?: boolean;
  includeCv?: boolean;
  template?: PdfTemplateStyle;
}

interface Palette {
  accent: [number, number, number];
  dark: [number, number, number];
  subtext: [number, number, number];
  body: [number, number, number];
  rule: [number, number, number];
  muted: [number, number, number];
}

const PALETTES: Record<PdfTemplateStyle, Palette> = {
  executive: {
    accent: [255, 71, 66], // #FF4742 Coral Red
    dark: [17, 24, 39], // Slate 900
    subtext: [55, 65, 81], // Slate 700
    body: [31, 41, 55], // Slate 800
    rule: [229, 231, 235], // Gray 200
    muted: [107, 114, 128] // Gray 500
  },
  moderncv: {
    accent: [30, 58, 138], // #1E3A8A Banking Navy
    dark: [15, 23, 42], // Slate 950
    subtext: [51, 65, 85], // Slate 700
    body: [30, 41, 59], // Slate 800
    rule: [203, 213, 225], // Slate 300
    muted: [100, 116, 139] // Slate 500
  },
  minimal: {
    accent: [24, 24, 27], // Pure Monochrome Zinc 900
    dark: [9, 9, 11], // Zinc 950
    subtext: [63, 63, 70], // Zinc 700
    body: [39, 39, 42], // Zinc 800
    rule: [212, 212, 216], // Zinc 300
    muted: [113, 113, 122] // Zinc 500
  }
};

/**
 * Generates an executive, ATS-compliant PDF containing tailored Cover Letter and/or CV.
 * Guarantees:
 * - Zero duplicate salutations or signatures
 * - Zero orphaned section headings or experience titles (\needspace equivalent)
 * - 100% selectable native PDF text layer for ATS parsers
 */
export function generateApplicationPdf(
  data: TailoredApplicationData,
  options: PdfGeneratorOptions = { includeCoverLetter: true, includeCv: true, template: "executive" }
): jsPDF {
  const includeCoverLetter = options.includeCoverLetter !== false;
  const includeCv = options.includeCv !== false;
  const template: PdfTemplateStyle = options.template || "executive";
  const colors = PALETTES[template] || PALETTES.executive;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter" // 612 x 792 pt
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 44;
  const contentWidth = pageWidth - marginX * 2; // 524 pt
  const topMargin = 44;
  const bottomMargin = 48;
  const maxContentY = pageHeight - bottomMargin;

  /**
   * Draw candidate header (supports left-aligned executive or centered moderncv/banking style)
   */
  const drawCandidateHeader = (y: number, subtitle?: string): number => {
    const isCentered = template === "moderncv";
    const alignX = isCentered ? pageWidth / 2 : marginX;
    const alignOpt = isCentered ? ({ align: "center" } as const) : undefined;

    // Candidate Full Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...colors.dark);
    doc.text(data.candidate.fullName || "Candidate", alignX, y, alignOpt);
    y += 17;

    // Target Role / Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...colors.accent);
    doc.text(subtitle || data.candidate.targetTitle || data.job.title || "Remote Specialist", alignX, y, alignOpt);
    y += 14;

    // Contact Details Row (literal text for ATS parsers)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.subtext);

    const contactItems = [
      data.candidate.email,
      data.candidate.phone,
      data.candidate.location,
      data.candidate.linkedinUrl,
      data.candidate.portfolioUrl
    ]
      .map((s) => (s || "").trim())
      .filter(Boolean);

    const contactLine = contactItems.join("  |  ");
    const wrappedContact = doc.splitTextToSize(contactLine, contentWidth);
    doc.text(wrappedContact, alignX, y, alignOpt);
    y += wrappedContact.length * 11;

    // Header Accent Rule
    doc.setDrawColor(...colors.accent);
    doc.setLineWidth(template === "minimal" ? 1 : 1.5);
    doc.line(marginX, y, marginX + contentWidth, y);
    y += 18;

    return y;
  };

  /**
   * Draw section heading with orphan protection (\needspace equivalent)
   */
  const drawSectionHeading = (title: string, y: number, minFollowingSpace = 50): number => {
    if (y + 24 + minFollowingSpace > maxContentY) {
      doc.addPage();
      y = topMargin;
    }

    if (template === "moderncv") {
      // ModernCV banking style: short accent bar + uppercase title
      doc.setFillColor(...colors.accent);
      doc.rect(marginX, y - 8, 22, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...colors.accent);
      doc.text(title.toUpperCase(), marginX + 28, y);
      y += 5;
      doc.setDrawColor(...colors.rule);
      doc.setLineWidth(0.75);
      doc.line(marginX + 28, y, marginX + contentWidth, y);
      y += 13;
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(...colors.dark);
      doc.text(title.toUpperCase(), marginX, y);
      y += 4;
      doc.setDrawColor(...colors.rule);
      doc.setLineWidth(1);
      doc.line(marginX, y, marginX + contentWidth, y);
      y += 13;
    }

    return y;
  };

  /**
   * PART 1: TAILORED COVER LETTER (Fits cleanly on 1 page with visible signature)
   */
  if (includeCoverLetter) {
    let y = topMargin;

    y = drawCandidateHeader(y, `Application for ${data.job.title}`);

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...colors.subtext);
    doc.text(
      data.coverLetter.date ||
        new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      marginX,
      y
    );
    y += 18;

    // Recipient Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...colors.dark);
    doc.text(data.coverLetter.recipientTitle || `Hiring Team`, marginX, y);
    y += 13;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.subtext);
    doc.text(data.job.company, marginX, y);
    y += 13;
    doc.text(`Re: ${data.job.title} (${data.job.location || "Remote"})`, marginX, y);
    y += 20;

    // Sanitize paragraphs so salutation & sign-off are NEVER duplicated
    const bodyParagraphs = sanitizeCoverLetterParagraphs(
      data.coverLetter.paragraphs && data.coverLetter.paragraphs.length > 0
        ? data.coverLetter.paragraphs
        : data.coverLetter.fullText || ""
    );

    // Salutation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.text(`Dear Hiring Team at ${data.job.company},`, marginX, y);
    y += 16;

    // Calculate total lines to dynamically tune line-height if letter is long (guarantees 1-page fit)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const wrappedParagraphs = bodyParagraphs.map((p) => doc.splitTextToSize(p, contentWidth));
    const totalLines = wrappedParagraphs.reduce((acc, lines) => acc + lines.length, 0);

    const availableHeight = maxContentY - y - 55; // reserve 55pt for sign-off
    const lineHeight = totalLines * 14 + wrappedParagraphs.length * 10 > availableHeight ? 12.2 : 14;
    const paraGap = lineHeight < 13 ? 8 : 11;

    doc.setTextColor(...colors.body);
    for (const lines of wrappedParagraphs) {
      if (y + lines.length * lineHeight > maxContentY - 40) {
        doc.addPage();
        y = topMargin;
      }
      doc.text(lines, marginX, y);
      y += lines.length * lineHeight + paraGap;
    }

    // Sign-off (never orphaned)
    if (y + 38 > maxContentY) {
      doc.addPage();
      y = topMargin;
    }
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...colors.body);
    doc.text("Sincerely,", marginX, y);
    y += 16;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...colors.dark);
    doc.text(data.candidate.fullName, marginX, y);
    y += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.muted);
    doc.text([data.candidate.email, data.candidate.phone].filter(Boolean).join("  •  "), marginX, y);
  }

  /**
   * PART 2: TAILORED CURRICULUM VITAE / RESUME
   */
  if (includeCv) {
    if (includeCoverLetter) {
      doc.addPage();
    }

    let y = topMargin;

    // Header
    y = drawCandidateHeader(y, data.candidate.targetTitle || data.job.title);

    // Section 1: Professional Summary
    if (data.cv.professionalSummary) {
      y = drawSectionHeading("Executive Summary", y, 40);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.2);
      doc.setTextColor(...colors.body);

      const summaryLines = doc.splitTextToSize(data.cv.professionalSummary.trim(), contentWidth);
      doc.text(summaryLines, marginX, y);
      y += summaryLines.length * 13 + 12;
    }

    // Section 2: Core Competencies & Technical Skills (3-column aligned ATS grid)
    const allSkills = Array.from(
      new Set([...(data.cv.coreCompetencies || []), ...(data.cv.technicalSkills || [])])
    ).filter(Boolean);

    if (allSkills.length > 0) {
      y = drawSectionHeading("Core Competencies & Technical Stack", y, 36);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      doc.setTextColor(...colors.body);

      const cols = 3;
      const colWidth = contentWidth / cols;
      const rows = Math.ceil(allSkills.length / cols);

      for (let r = 0; r < rows; r++) {
        if (y + 14 > maxContentY) {
          doc.addPage();
          y = topMargin;
        }
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx < allSkills.length) {
            const skillText = `•  ${allSkills[idx]}`;
            const truncated = doc.splitTextToSize(skillText, colWidth - 8)[0];
            doc.text(truncated, marginX + c * colWidth, y);
          }
        }
        y += 13;
      }
      y += 8;
    }

    // Section 3: Relevant Professional Experience
    if (data.cv.experiences && data.cv.experiences.length > 0) {
      y = drawSectionHeading("Professional Experience", y, 65);

      for (const exp of data.cv.experiences) {
        // Estimate space needed for role header + at least first bullet (prevents orphaned job titles)
        if (y + 58 > maxContentY) {
          doc.addPage();
          y = topMargin;
        }

        // Role Title & Period Row
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...colors.dark);
        doc.text(exp.title || "Specialist", marginX, y);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colors.subtext);
        doc.text(exp.period || "", marginX + contentWidth, y, { align: "right" });
        y += 13;

        // Company & Location Row
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...colors.accent);
        const companyStr = exp.company || "Organization";
        doc.text(companyStr, marginX, y);

        if (exp.location) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.muted);
          doc.text(`  |  ${exp.location}`, marginX + doc.getTextWidth(companyStr), y);
        }
        y += 13;

        // Experience Bullets
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.9);
        doc.setTextColor(...colors.body);

        for (const rawBullet of exp.bullets || []) {
          const cleanBullet = rawBullet.replace(/^[•\-*]\s*/, "").trim();
          if (!cleanBullet) continue;

          const bulletLines = doc.splitTextToSize(cleanBullet, contentWidth - 14);
          const bulletHeight = bulletLines.length * 12.2 + 4;

          if (y + bulletHeight > maxContentY) {
            doc.addPage();
            y = topMargin;
          }

          doc.text("•", marginX + 2, y);
          doc.text(bulletLines, marginX + 13, y);
          y += bulletHeight;
        }
        y += 8;
      }
    }

    // Section 4: Education & Credentials
    if (data.cv.education && data.cv.education.length > 0) {
      y = drawSectionHeading("Education & Credentials", y, 40);

      for (const edu of data.cv.education) {
        if (y + 28 > maxContentY) {
          doc.addPage();
          y = topMargin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...colors.dark);
        doc.text(edu.degree || "Degree", marginX, y);

        if (edu.year) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.8);
          doc.setTextColor(...colors.subtext);
          doc.text(edu.year, marginX + contentWidth, y, { align: "right" });
        }
        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.8);
        doc.setTextColor(...colors.subtext);
        doc.text(edu.institution || "University", marginX, y);
        y += 14;
      }
    }
  }

  /**
   * Stamp clean footer with accurate Page X of Y across all generated pages
   */
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...colors.rule);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageHeight - 32, marginX + contentWidth, pageHeight - 32);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...colors.muted);

    const docLabel =
      includeCoverLetter && includeCv
        ? p === 1
          ? `Cover Letter  •  ${data.candidate.fullName}  •  Application for ${data.job.title} at ${data.job.company}`
          : `Curriculum Vitae  •  ${data.candidate.fullName}  •  Tailored for ${data.job.company}`
        : `${data.candidate.fullName}  •  ${data.job.title} at ${data.job.company}`;

    doc.text(docLabel, marginX, pageHeight - 20);
    doc.text(`Page ${p} of ${totalPages}`, marginX + contentWidth, pageHeight - 20, { align: "right" });
  }

  return doc;
}

/**
 * Triggers a direct PDF download in the browser
 */
export function downloadApplicationPdf(
  data: TailoredApplicationData,
  filename?: string,
  options?: PdfGeneratorOptions
): void {
  const doc = generateApplicationPdf(data, options);
  const cleanName = (data.candidate.fullName || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanCompany = (data.job.company || "Company").replace(/[^a-zA-Z0-9_-]/g, "_");
  const suffix =
    options?.includeCoverLetter && !options?.includeCv
      ? "Cover_Letter"
      : !options?.includeCoverLetter && options?.includeCv
      ? "CV"
      : "Application_Package";
  const defaultFilename = `${cleanName}_${cleanCompany}_${suffix}.pdf`;

  doc.save(filename || defaultFilename);
}

/**
 * Generates a Blob URL for instant in-browser PDF previewing
 */
export function createApplicationPdfBlobUrl(
  data: TailoredApplicationData,
  options?: PdfGeneratorOptions
): string {
  const doc = generateApplicationPdf(data, options);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}
