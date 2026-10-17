import { jsPDF } from "jspdf";
import { TailoredApplicationData } from "./ai-tailor";

export interface PdfGeneratorOptions {
  includeCoverLetter?: boolean;
  includeCv?: boolean;
}

/**
 * Generates an executive, ATS-compliant PDF containing tailored Cover Letter and CV
 */
export function generateApplicationPdf(
  data: TailoredApplicationData,
  options: PdfGeneratorOptions = { includeCoverLetter: true, includeCv: true }
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter" // 612 x 792 pt
  });

  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 42;
  const contentWidth = pageWidth - marginX * 2; // 528 pt
  const topMargin = 45;
  const bottomMargin = 45;

  let currentPage = 1;

  // Helper for color palettes
  const colors = {
    primary: [255, 71, 66] as [number, number, number], // #FF4742
    dark: [17, 24, 39] as [number, number, number], // slate-900
    subtext: [75, 85, 99] as [number, number, number], // slate-600
    lightGray: [229, 231, 235] as [number, number, number], // gray-200
    chipBg: [243, 244, 246] as [number, number, number], // gray-100
    textMuted: [107, 114, 128] as [number, number, number] // gray-500
  };

  /**
   * Draw header letterhead for candidate
   */
  const drawCandidateHeader = (y: number, subtitle?: string): number => {
    // Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.setTextColor(...colors.dark);
    doc.text(data.candidate.fullName, marginX, y);
    y += 18;

    // Subtitle / Target Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...colors.primary);
    doc.text(subtitle || data.candidate.targetTitle || "Remote Specialist", marginX, y);
    y += 14;

    // Contact info row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.subtext);

    const contactItems = [
      data.candidate.email,
      data.candidate.phone,
      data.candidate.location,
      data.candidate.linkedinUrl,
      data.candidate.portfolioUrl
    ].filter(Boolean);

    doc.text(contactItems.join("  |  "), marginX, y);
    y += 10;

    // Coral / Gray Separator line
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(1.5);
    doc.line(marginX, y, marginX + contentWidth, y);
    y += 16;

    return y;
  };

  /**
   * Draw a Section Title with modern underline
   */
  const drawSectionHeading = (title: string, y: number): number => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...colors.dark);
    doc.text(title.toUpperCase(), marginX, y);
    y += 4;

    doc.setDrawColor(...colors.lightGray);
    doc.setLineWidth(1);
    doc.line(marginX, y, marginX + contentWidth, y);
    y += 12;

    return y;
  };

  /**
   * PAGE 1: COVER LETTER (if requested)
   */
  if (options.includeCoverLetter) {
    let y = topMargin;

    // Header
    y = drawCandidateHeader(y, `Application for ${data.job.title}`);

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...colors.subtext);
    doc.text(data.coverLetter.date, marginX, y);
    y += 18;

    // Recipient Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...colors.dark);
    doc.text("Hiring Team", marginX, y);
    y += 13;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.subtext);
    doc.text(data.job.company, marginX, y);
    y += 13;
    doc.text(`Role: ${data.job.title}`, marginX, y);
    y += 18;

    // Subject Line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.text(`Subject: ${data.coverLetter.subject}`, marginX, y);
    y += 16;

    // Salutation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`Dear Hiring Team at ${data.job.company},`, marginX, y);
    y += 16;

    // Body Paragraphs
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55); // slate-800 for optimal readability

    for (const paragraph of data.coverLetter.paragraphs) {
      const lines = doc.splitTextToSize(paragraph, contentWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 13.5 + 10;
    }

    // Sign off
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);
    doc.text("Sincerely,", marginX, y);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...colors.dark);
    doc.text(data.candidate.fullName, marginX, y);

    // Cover letter footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    doc.text(`Cover Letter  •  Tailored for ${data.job.company}`, marginX, pageHeight - bottomMargin + 15);
  }

  /**
   * PAGE 2+: TAILORED CV / RESUME (if requested)
   */
  if (options.includeCv) {
    if (options.includeCoverLetter) {
      doc.addPage();
      currentPage++;
    }

    let y = topMargin;

    // Header
    y = drawCandidateHeader(y, data.candidate.targetTitle);

    // Section 1: Professional Summary
    y = drawSectionHeading("Professional Summary", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.2);
    doc.setTextColor(31, 41, 55);

    const summaryLines = doc.splitTextToSize(data.cv.professionalSummary, contentWidth);
    doc.text(summaryLines, marginX, y);
    y += summaryLines.length * 13 + 14;

    // Section 2: Core Competencies & Matched Keywords
    y = drawSectionHeading("Core Competencies & Key Technical Skills", y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);

    const allSkills = Array.from(new Set([...data.cv.coreCompetencies, ...data.cv.technicalSkills]));
    const skillsChunks: string[][] = [];
    const chunkSize = 4;
    for (let i = 0; i < allSkills.length; i += chunkSize) {
      skillsChunks.push(allSkills.slice(i, i + chunkSize));
    }

    for (const chunk of skillsChunks) {
      const lineText = chunk.map((s) => `• ${s}`).join("     ");
      doc.setTextColor(55, 65, 81);
      doc.text(lineText, marginX + 4, y);
      y += 13;
    }
    y += 8;

    // Section 3: Professional Experience
    y = drawSectionHeading("Relevant Professional Experience", y);

    for (const exp of data.cv.experiences) {
      // Check for page overflow
      if (y > pageHeight - bottomMargin - 80) {
        doc.addPage();
        currentPage++;
        y = topMargin;
      }

      // Title & Period Row
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...colors.dark);
      doc.text(exp.title, marginX, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colors.subtext);
      doc.text(exp.period, marginX + contentWidth, y, { align: "right" });
      y += 13;

      // Company & Location Row
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...colors.primary);
      doc.text(exp.company, marginX, y);

      if (exp.location) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.textMuted);
        doc.text(` | ${exp.location}`, marginX + doc.getTextWidth(exp.company) + 2, y);
      }
      y += 13;

      // Bullets
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      doc.setTextColor(31, 41, 55);

      for (const bullet of exp.bullets) {
        if (y > pageHeight - bottomMargin - 30) {
          doc.addPage();
          currentPage++;
          y = topMargin;
        }

        const bulletLines = doc.splitTextToSize(bullet, contentWidth - 14);
        doc.text("•", marginX + 3, y);
        doc.text(bulletLines, marginX + 14, y);
        y += bulletLines.length * 12.5 + 4;
      }
      y += 8;
    }

    // Section 4: Education & Certifications
    if (y > pageHeight - bottomMargin - 60) {
      doc.addPage();
      currentPage++;
      y = topMargin;
    }

    y = drawSectionHeading("Education & Certifications", y);

    for (const edu of data.cv.education) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...colors.dark);
      doc.text(edu.degree, marginX, y);

      if (edu.year) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...colors.textMuted);
        doc.text(edu.year, marginX + contentWidth, y, { align: "right" });
      }
      y += 12;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      doc.setTextColor(...colors.subtext);
      doc.text(edu.institution, marginX, y);
      y += 14;
    }

    // CV Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    doc.text(
      `Tailored CV  •  ${data.candidate.fullName}  •  ${data.job.title} at ${data.job.company}`,
      marginX,
      pageHeight - bottomMargin + 15
    );
  }

  return doc;
}

/**
 * Convenience method to trigger a direct PDF download in the browser
 */
export function downloadApplicationPdf(
  data: TailoredApplicationData,
  filename?: string,
  options?: PdfGeneratorOptions
): void {
  const doc = generateApplicationPdf(data, options);
  const cleanName = (data.candidate.fullName || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanCompany = (data.job.company || "Company").replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanRole = (data.job.title || "Application").replace(/[^a-zA-Z0-9_-]/g, "_");
  const defaultFilename = `${cleanName}_${cleanCompany}_${cleanRole}.pdf`;

  doc.save(filename || defaultFilename);
}
