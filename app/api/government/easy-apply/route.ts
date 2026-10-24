import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getJobById } from "@/lib/jobs-repository";
import { getUserProfile } from "@/lib/user-profiles-repository";
import { saveGovernmentApplication } from "@/lib/applications-repository";
import {
  evaluateEligibility,
} from "@/lib/eligibility-engine";
import {
  createPublicSectorApplicationPackage,
  generatePublicSectorMotivationLetter,
} from "@/lib/government-application-package";
import { PublicSectorCandidateData, CefrLevel } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobId, candidate: inputCandidate, action = "package" } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing required jobId parameter" },
        { status: 400 }
      );
    }

    const job = getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: `Job with ID '${jobId}' not found` },
        { status: 404 }
      );
    }

    // Attempt to enrich with authenticated user profile if available
    let clerkUserId: string | undefined;
    let userProfileEmail: string | undefined;

    try {
      const session = await auth();
      clerkUserId = session.userId || undefined;
      if (clerkUserId) {
        const profile = await getUserProfile(clerkUserId);
        if (profile?.email) userProfileEmail = profile.email;
      }
    } catch {
      // Unauthenticated visitor is allowed to test and generate packages
    }

    // Default candidate data if user has not yet entered details
    const candidate: PublicSectorCandidateData = {
      fullName: inputCandidate?.fullName || "Candidate Applicant",
      email: inputCandidate?.email || userProfileEmail || "candidate@remoteworkdaily.com",
      phone: inputCandidate?.phone || "+32 2 299 11 11",
      citizenship: inputCandidate?.citizenship || "FR", // default EU
      secondaryCitizenships: inputCandidate?.secondaryCitizenships || [],
      currentResidence: inputCandidate?.currentResidence || "European Union",
      degreeLevel: inputCandidate?.degreeLevel || "Masters (EQF Level 7)",
      degreeTitle: inputCandidate?.degreeTitle || "Master of Science in Information Systems & Public Policy",
      institution: inputCandidate?.institution || "Sorbonne University / KU Leuven",
      graduationYear: inputCandidate?.graduationYear || "2020",
      yearsOfExperience: typeof inputCandidate?.yearsOfExperience === "number" ? inputCandidate.yearsOfExperience : 6,
      securityClearance: inputCandidate?.securityClearance || "None",
      languages: inputCandidate?.languages || [
        { language: "English", level: "C1" as CefrLevel },
        { language: "French", level: "B2" as CefrLevel },
      ],
      currentTitle: inputCandidate?.currentTitle || "Senior Systems & Cloud Engineer",
      currentEmployer: inputCandidate?.currentEmployer || "Enterprise Cloud & Public Service",
      summary: inputCandidate?.summary || `Experienced specialist with ${inputCandidate?.yearsOfExperience || 6} years in systems architecture, data governance, and public sector delivery.`,
    };

    // 1. Run statutory eligibility pre-check
    const evaluation = evaluateEligibility(candidate, job);

    // 2. Generate customized motivation letter
    const motivationLetter = generatePublicSectorMotivationLetter(candidate, job);

    // 3. Assemble full 1-Click Pre-filled Application Package
    const applicationPackage = createPublicSectorApplicationPackage(candidate, job);

    // 4. If submission/save action requested, persist to applications repository
    let savedApplication = null;
    if (action === "submit" || action === "save") {
      savedApplication = await saveGovernmentApplication({
        clerkUserId,
        candidateEmail: candidate.email,
        candidateName: candidate.fullName,
        jobId: job.id,
        jobTitle: job.title,
        agency: job.agency || job.company,
        formatType: applicationPackage.formatType,
        eligibilityStatus: evaluation.status,
        eligibilityDetails: evaluation,
        prefilledPackage: applicationPackage.prefilledFormData,
        motivationLetter,
        status: "prefilled",
      });
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        agency: job.agency,
        grade: job.grade,
        jurisdiction: job.jurisdiction,
        selectionRef: job.selectionRef,
        applicationDeadline: job.applicationDeadline,
        portalApplyUrl: job.originalApplyUrl || job.applyUrl,
      },
      candidate,
      evaluation,
      motivationLetter,
      applicationPackage,
      savedApplication,
    });
  } catch (err: any) {
    console.error("[Government Easy Apply API error]:", err);
    return NextResponse.json(
      { error: "Failed to generate government application package", details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Please provide a valid ?jobId= query parameter" },
      { status: 400 }
    );
  }

  const job = getJobById(jobId);
  if (!job) {
    return NextResponse.json(
      { error: `Job with ID '${jobId}' not found` },
      { status: 404 }
    );
  }

  const defaultCandidate: PublicSectorCandidateData = {
    fullName: "Elena Rostova",
    email: "elena.rostova@example.eu",
    phone: "+32 2 299 11 11",
    citizenship: "FR",
    degreeLevel: "Masters (EQF Level 7)",
    degreeTitle: "M.Sc. in Computer Science & Digital Governance",
    institution: "KU Leuven",
    graduationYear: "2019",
    yearsOfExperience: 7,
    securityClearance: "None",
    languages: [
      { language: "English", level: "C1" },
      { language: "French", level: "C1" },
    ],
  };

  const evaluation = evaluateEligibility(defaultCandidate, job);
  const pkg = createPublicSectorApplicationPackage(defaultCandidate, job);

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      title: job.title,
      agency: job.agency || job.company,
      grade: job.grade,
      jurisdiction: job.jurisdiction,
      selectionRef: job.selectionRef,
      applicationDeadline: job.applicationDeadline,
    },
    sampleEvaluation: evaluation,
    applicationPackage: pkg,
  });
}
