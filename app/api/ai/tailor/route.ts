import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserProfile } from "@/lib/user-profiles-repository";
import { getJobById } from "@/lib/jobs-repository";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let resumeText = body.resumeText || "";
    const jobId = body.jobId;
    let jobTitle = body.jobTitle || "Specialist";
    let company = body.company || "Hiring Company";
    let description = body.description || "";

    if (jobId) {
      const job = getJobById(jobId);
      if (job) {
        jobTitle = job.title;
        company = job.company;
        description = job.description || description;
      }
    }

    // Try to get resume text from user profile if not provided in payload
    let isPro = false;
    let candidateName = "Candidate";
    try {
      const { userId } = await auth();
      if (userId) {
        const profile = await getUserProfile(userId);
        if (profile) {
          if (!resumeText && profile.resume_text) {
            resumeText = profile.resume_text;
          }
          isPro = Boolean(profile.is_pro);
        }
      }
    } catch {
      // Allow simulation / guest
    }

    // Extract key technology & skills tokens from job description
    const descLower = description.toLowerCase();
    const commonKeywords = [
      "react", "typescript", "javascript", "python", "node.js", "next.js",
      "aws", "sql", "postgresql", "docker", "kubernetes", "go", "rust",
      "graphql", "tailwind", "figma", "product management", "analytics",
      "seo", "ci/cd", "leadership", "agile", "growth", "salesforce"
    ];

    const presentInJob = commonKeywords.filter((k) => descLower.includes(k));
    const resumeLower = (resumeText || "").toLowerCase();

    const matchedKeywords = presentInJob.filter((k) =>
      resumeLower ? resumeLower.includes(k) : true
    );
    const missingKeywords = presentInJob.filter((k) =>
      resumeLower ? !resumeLower.includes(k) : false
    );

    // Calculate match score
    let matchScore = 88;
    if (presentInJob.length > 0) {
      const ratio = matchedKeywords.length / presentInJob.length;
      matchScore = Math.min(98, Math.max(72, Math.round(ratio * 100)));
    } else {
      matchScore = Math.floor(85 + Math.random() * 10);
    }

    // Tailored Cover Letter
    const tailoredCoverLetter = `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${jobTitle} role. Having followed ${company}'s recent work, I am confident that my background aligns directly with what you are looking for.

Key highlights of my experience relevant to this position:
• Proven track record delivering high-impact projects in distributed and fast-paced environments.
• Hands-on expertise with ${matchedKeywords.slice(0, 3).join(", ") || "core domain technologies"} to accelerate product velocity.
• Deep commitment to cross-functional collaboration, ownership, and measurable business outcomes.

I would welcome the opportunity to discuss how my skill set can support ${company}'s immediate hiring goals.

Sincerely,
${candidateName}`;

    // Tailored Resume Bullet Points
    const tailoredBulletPoints = [
      `Spearheaded core initiatives resulting in improved team execution and scalable delivery using ${matchedKeywords[0] || "modern engineering practices"}.`,
      `Collaborated directly with product and leadership teams to architect resilient solutions for ${jobTitle} objectives.`,
      `Optimized workflow performance and reduced system latency while championing clean code and comprehensive test coverage.`,
      `Drove customer-centric feature development that contributed directly to user engagement and key business metrics.`,
    ];

    return NextResponse.json({
      success: true,
      matchScore,
      matchedKeywords,
      missingKeywords,
      tailoredCoverLetter,
      tailoredBulletPoints,
      isPro,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
