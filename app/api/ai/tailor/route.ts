import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserProfile } from "@/lib/user-profiles-repository";
import { getJobById } from "@/lib/jobs-repository";
import {
  tailorApplication,
  CandidateProfileInput,
  JobTargetInput,
  parseResumeText,
  stripHtmlTags
} from "@/lib/ai-tailor";
import { generateApplicationPdf, PdfGeneratorOptions } from "@/lib/pdf-generator";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let resumeText = body.resumeText || "";
    const jobId = body.jobId;
    let jobTitle = body.jobTitle || "Specialist";
    let company = body.company || "Hiring Company";
    let description = body.description || "";
    let jobLocation = body.jobLocation || body.location || "Remote";
    let requirements: string[] = Array.isArray(body.requirements) ? body.requirements : [];
    let tags: string[] = Array.isArray(body.tags) ? body.tags : [];

    const format = body.format || "json"; // "json" | "pdf"
    const options: PdfGeneratorOptions = body.options || {
      includeCoverLetter: true,
      includeCv: true,
      template: body.template || "executive"
    };

    if (jobId) {
      const job = getJobById(jobId);
      if (job) {
        jobTitle = job.title || jobTitle;
        company = job.company || company;
        jobLocation = job.location || jobLocation;
        description = job.description ? stripHtmlTags(job.description) : description;
        if (job.requirements && job.requirements.length > 0) {
          requirements = job.requirements;
        }
        if (job.tags && job.tags.length > 0) {
          tags = job.tags;
        }
      }
    }

    // Try to load saved candidate profile from Clerk/Supabase if available
    let isPro = false;
    let candidateName = body.fullName || "Alex Morgan";
    let candidateEmail = body.email || "alex.morgan@remoteworkdaily.com";
    let candidatePhone = body.phone || "+1 (555) 234-8910";
    let candidateLocation = body.candidateLocation || body.location || "Remote / Worldwide";
    let candidateSkills: string[] = Array.isArray(body.skills) ? body.skills : [];
    let candidateTitle = body.currentTitle || jobTitle;

    try {
      const { userId } = await auth();
      if (userId) {
        const profile = await getUserProfile(userId);
        if (profile) {
          if (!resumeText && profile.resume_text) {
            resumeText = profile.resume_text;
          }
          if (profile.email && (!body.email || body.email.includes("example.com"))) {
            candidateEmail = profile.email;
          }
          if (profile.skills && profile.skills.length > 0 && candidateSkills.length === 0) {
            candidateSkills = profile.skills;
          }
          if (profile.preferred_location && !body.candidateLocation) {
            candidateLocation = profile.preferred_location;
          }
          if (profile.target_roles && profile.target_roles.length > 0 && !body.currentTitle) {
            candidateTitle = profile.target_roles[0];
          }
          isPro = Boolean(profile.is_pro);
        }
      }
    } catch {
      // Guest / local session supported seamlessly
    }

    // Parse resume text into structured components if provided
    const parsedResume = parseResumeText(resumeText, candidateTitle);

    const candidateProfile: CandidateProfileInput = {
      fullName: candidateName,
      email: parsedResume.extractedEmail && candidateEmail.includes("example.com") ? parsedResume.extractedEmail : candidateEmail,
      phone: parsedResume.extractedPhone && candidatePhone === "+1 (555) 234-8910" ? parsedResume.extractedPhone : candidatePhone,
      location: candidateLocation,
      linkedinUrl: body.linkedinUrl || parsedResume.extractedLinkedin || "linkedin.com/in/alexmorgan",
      portfolioUrl: body.portfolioUrl || parsedResume.extractedPortfolio || "github.com/alexmorgan",
      currentTitle: candidateTitle,
      summary: body.summary || parsedResume.summary,
      skills: candidateSkills.length > 0 ? candidateSkills : parsedResume.skills,
      experiences:
        Array.isArray(body.experiences) && body.experiences.length > 0
          ? body.experiences
          : parsedResume.experiences.length > 0
          ? parsedResume.experiences
          : undefined,
      education:
        Array.isArray(body.education) && body.education.length > 0
          ? body.education
          : parsedResume.education.length > 0
          ? parsedResume.education
          : undefined,
      baseResumeText: resumeText
    };

    const jobTarget: JobTargetInput = {
      jobId,
      jobTitle,
      company,
      description,
      requirements,
      tags,
      location: jobLocation
    };

    const tailoredData = tailorApplication(candidateProfile, jobTarget);

    // If client requested direct binary PDF stream
    if (format === "pdf") {
      const doc = generateApplicationPdf(tailoredData, options);
      const pdfBuffer = doc.output("arraybuffer");
      const cleanName = candidateName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanCompany = company.replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `${cleanName}_${cleanCompany}_Application.pdf`;

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      matchScore: tailoredData.matchScore,
      matchedKeywords: tailoredData.matchedKeywords,
      missingKeywords: tailoredData.missingKeywords,
      fitBreakdown: tailoredData.fitBreakdown,
      atsAnalysis: tailoredData.atsAnalysis,
      interviewPrep: tailoredData.interviewPrep,
      coverLetter: tailoredData.coverLetter,
      cv: tailoredData.cv,
      tailoredCoverLetter: tailoredData.coverLetter.fullText,
      tailoredBulletPoints: tailoredData.cv.experiences.flatMap((e) => e.bullets).slice(0, 4),
      tailoredData,
      isPro
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
