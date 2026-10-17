import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserProfile } from "@/lib/user-profiles-repository";
import { getJobById } from "@/lib/jobs-repository";
import {
  tailorApplication,
  CandidateProfileInput,
  JobTargetInput,
  parseResumeText
} from "@/lib/ai-tailor";
import { generateApplicationPdf } from "@/lib/pdf-generator";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let resumeText = body.resumeText || "";
    const jobId = body.jobId;
    let jobTitle = body.jobTitle || "Specialist";
    let company = body.company || "Hiring Company";
    let description = body.description || "";
    const format = body.format || "json"; // "json" | "pdf"
    const options = body.options || { includeCoverLetter: true, includeCv: true };

    if (jobId) {
      const job = getJobById(jobId);
      if (job) {
        jobTitle = job.title;
        company = job.company;
        description = job.description || description;
      }
    }

    // Try to get resume text and profile information from user profile
    let isPro = false;
    let candidateName = body.fullName || "Candidate";
    let candidateEmail = body.email || "candidate@remoteworkdaily.com";
    let candidatePhone = body.phone || "+1 (555) 019-2834";
    let candidateLocation = body.location || "Remote";
    let candidateSkills = body.skills || [];
    let candidateTitle = body.currentTitle || jobTitle;

    try {
      const { userId } = await auth();
      if (userId) {
        const profile = await getUserProfile(userId);
        if (profile) {
          if (!resumeText && profile.resume_text) {
            resumeText = profile.resume_text;
          }
          if (profile.email) {
            candidateEmail = profile.email;
          }
          if (profile.skills && profile.skills.length > 0 && candidateSkills.length === 0) {
            candidateSkills = profile.skills;
          }
          if (profile.preferred_location) {
            candidateLocation = profile.preferred_location;
          }
          if (profile.target_roles && profile.target_roles.length > 0) {
            candidateTitle = profile.target_roles[0];
          }
          isPro = Boolean(profile.is_pro);
        }
      }
    } catch {
      // Allow simulation / guest
    }

    // Parse resume text into structured components if experiences not explicitly passed
    const parsedResume = parseResumeText(resumeText);

    const candidateProfile: CandidateProfileInput = {
      fullName: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      location: candidateLocation,
      linkedinUrl: body.linkedinUrl || "linkedin.com/in/candidate",
      portfolioUrl: body.portfolioUrl || "github.com/candidate",
      currentTitle: candidateTitle,
      summary: body.summary || parsedResume.summary,
      skills: candidateSkills.length > 0 ? candidateSkills : parsedResume.skills,
      experiences: body.experiences || parsedResume.experiences,
      education: body.education || parsedResume.education,
      baseResumeText: resumeText
    };

    const jobTarget: JobTargetInput = {
      jobId,
      jobTitle,
      company,
      description,
      requirements: body.requirements || [],
      location: body.location || "Remote"
    };

    const tailoredData = tailorApplication(candidateProfile, jobTarget);

    // If client requested direct PDF generation
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

    // Default JSON response, preserving backward compatibility
    return NextResponse.json({
      success: true,
      matchScore: tailoredData.matchScore,
      matchedKeywords: tailoredData.matchedKeywords,
      missingKeywords: tailoredData.missingKeywords,
      atsAnalysis: tailoredData.atsAnalysis,
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
