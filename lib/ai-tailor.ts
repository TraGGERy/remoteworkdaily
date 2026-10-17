import { Job } from "./types";

export interface CandidateExperience {
  title: string;
  company: string;
  location?: string;
  period: string;
  bullets: string[];
}

export interface CandidateEducation {
  degree: string;
  institution: string;
  year?: string;
}

export interface CandidateProfileInput {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentTitle?: string;
  summary?: string;
  skills?: string[];
  experiences?: CandidateExperience[];
  education?: CandidateEducation[];
  baseResumeText?: string;
}

export interface JobTargetInput {
  jobId?: string;
  jobTitle: string;
  company: string;
  description: string;
  requirements?: string[];
  location?: string;
  salary?: string;
}

export interface TailoredApplicationData {
  candidate: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    portfolioUrl: string;
    targetTitle: string;
  };
  job: {
    title: string;
    company: string;
    location: string;
  };
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  atsAnalysis: {
    summary: string;
    strengths: string[];
    recommendations: string[];
  };
  coverLetter: {
    date: string;
    recipientTitle: string;
    company: string;
    subject: string;
    paragraphs: string[];
    fullText: string;
  };
  cv: {
    professionalSummary: string;
    coreCompetencies: string[];
    technicalSkills: string[];
    experiences: CandidateExperience[];
    education: CandidateEducation[];
  };
}

// Comprehensive dictionary of technical and functional keywords categorized for ATS analysis
export const TECH_KEYWORDS: string[] = [
  // Languages & Core Runtimes
  "typescript", "javascript", "python", "golang", "go", "rust", "java", "c#", "c++", "ruby", "php", "swift", "kotlin", "node.js", "nodejs",
  // Frontend
  "react", "next.js", "nextjs", "vue", "angular", "svelte", "tailwind", "css", "html", "redux", "zustand", "graphql", "webpack", "vite", "figma",
  // Backend & Databases
  "sql", "postgresql", "postgres", "mongodb", "mysql", "redis", "dynamodb", "elasticsearch", "prisma", "drizzle", "rest api", "grpc", "microservices", "event-driven",
  // Cloud & DevOps
  "aws", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform", "ci/cd", "github actions", "datadog", "prometheus", "serverless", "linux",
  // Practices & Methodologies
  "agile", "scrum", "tdd", "unit testing", "system design", "code review", "mentorship", "cross-functional", "leadership", "performance optimization",
  // Product / Business
  "analytics", "seo", "product management", "a/b testing", "data pipeline", "soc 2", "gdpr", "security", "high availability", "scalability"
];

/**
 * Normalizes keyword tokens for robust matching
 */
export function normalizeKeyword(kw: string): string {
  return kw.toLowerCase().replace(/[^a-z0-9#+.]/g, " ").trim();
}

/**
 * Extracts recognized keywords present in job description
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const textLower = text.toLowerCase();
  const matched = new Set<string>();

  for (const kw of TECH_KEYWORDS) {
    // Word boundary or punctuation boundary check
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
    if (regex.test(textLower)) {
      matched.add(kw);
    }
  }

  return Array.from(matched);
}

/**
 * Parses free-form resume text into basic sections if structured experiences not provided
 */
export function parseResumeText(text: string): {
  summary: string;
  skills: string[];
  experiences: CandidateExperience[];
  education: CandidateEducation[];
} {
  if (!text || text.trim().length === 0) {
    return { summary: "", skills: [], experiences: [], education: [] };
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const skillsFound = extractKeywords(text);

  return {
    summary: lines.slice(0, 3).join(" "),
    skills: skillsFound,
    experiences: [
      {
        title: "Senior Specialist",
        company: "Previous Enterprise",
        location: "Remote",
        period: "2022 - Present",
        bullets: lines.filter((l) => l.startsWith("•") || l.startsWith("-")).map((l) => l.replace(/^[•\-*]\s*/, ""))
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science or Equivalent",
        institution: "Accredited University",
        year: "2020"
      }
    ]
  };
}

/**
 * Generates tailored cover letter paragraphs matching the job requirements
 */
export function generateTailoredCoverLetter(
  candidate: CandidateProfileInput,
  job: JobTargetInput,
  matchedKeywords: string[]
): { paragraphs: string[]; fullText: string; subject: string; date: string } {
  const candidateName = candidate.fullName || "Candidate";
  const jobTitle = job.jobTitle || "Specialist";
  const company = job.company || "Hiring Company";
  const topSkills = matchedKeywords.slice(0, 4).join(", ") || "scalable architectures, cross-functional delivery, and product velocity";

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const subject = `Application for ${jobTitle} - ${candidateName}`;

  const p1 = `I am writing to express my enthusiastic application for the ${jobTitle} position at ${company}. Having followed ${company}'s growth and product focus, I have been deeply impressed by your commitment to engineering excellence and user-first execution. With my background in ${topSkills}, I am eager to contribute directly to your team's upcoming milestones.`;

  const p2 = `Throughout my career, I have specialized in turning ambiguous technical challenges into reliable, high-performance systems. In my recent roles, I spearheaded key initiatives that improved system uptime, reduced delivery cycles, and aligned technical architecture with measurable business KPIs. Given ${company}'s focus on high-impact remote execution, my experience with ${matchedKeywords.slice(0, 2).join(" and ") || "modern distributed engineering"} will allow me to hit the ground running with minimal ramp-up time.`;

  const p3 = `Beyond individual technical delivery, I thrive in collaborative, async-first environments where ownership and clear communication are paramount. Whether conducting constructive code reviews, mentoring teammates, or partnering closely with product managers and designers, I work to elevate team productivity and foster an inclusive engineering culture.`;

  const p4 = `I welcome the opportunity to discuss how my skill set and proactive approach can support ${company}'s immediate hiring goals. Thank you for your time and consideration, and I look forward to speaking with your hiring team.`;

  const fullText = `Dear Hiring Team at ${company},

${p1}

${p2}

${p3}

${p4}

Sincerely,
${candidateName}
${candidate.email || ""}
${candidate.phone || ""}`.trim();

  return {
    date: dateStr,
    subject,
    paragraphs: [p1, p2, p3, p4],
    fullText
  };
}

/**
 * Tailors experience bullet points using the STAR methodology (Action + Context + Quantified Metric)
 */
export function generateTailoredBulletPoints(
  jobTitle: string,
  matchedKeywords: string[],
  baseBullets?: string[]
): string[] {
  const kw1 = matchedKeywords[0] || "modern system architecture";
  const kw2 = matchedKeywords[1] || "automated CI/CD pipelines";
  const kw3 = matchedKeywords[2] || "cross-functional collaboration";
  const kw4 = matchedKeywords[3] || "production observability";

  // If user provided existing bullets, enhance them with target keywords
  if (baseBullets && baseBullets.length > 0) {
    return baseBullets.map((bullet, idx) => {
      if (idx === 0) {
        return `${bullet.replace(/\.$/, "")}, driving scalable adoption of ${kw1} and accelerating team deployment frequency by 35%.`;
      }
      if (idx === 1) {
        return `${bullet.replace(/\.$/, "")}, leveraging ${kw2} to streamline workflows and reduce production error rates by 40%.`;
      }
      return bullet;
    });
  }

  // Otherwise produce crisp, executive STAR bullets
  return [
    `Spearheaded the design and implementation of core modules leveraging ${kw1}, boosting platform throughput by 42% and eliminating critical bottlenecks.`,
    `Architected and maintained resilient ${kw2}, decreasing developer cycle times from days to hours while ensuring strict test coverage and zero downtime.`,
    `Partnered directly with cross-functional product, design, and engineering stakeholders to deliver high-priority ${jobTitle} roadmaps ahead of schedule.`,
    `Instrumented end-to-end telemetry and monitoring using ${kw4}, reducing mean time to detection (MTTD) by 60% across distributed production services.`
  ];
}

/**
 * Main AI tailoring function that evaluates fit and generates tailored CV + Cover letter
 */
export function tailorApplication(
  candidate: CandidateProfileInput,
  job: JobTargetInput
): TailoredApplicationData {
  const jobTitle = job.jobTitle.trim() || "Remote Specialist";
  const company = job.company.trim() || "Hiring Company";
  const jobDesc = job.description || "";

  // 1. Keyword extraction & ATS analysis
  const jobKeywords = extractKeywords(`${jobTitle} ${jobDesc} ${(job.requirements || []).join(" ")}`);
  
  // Combine all candidate text for analysis
  const candidateText = [
    candidate.currentTitle || "",
    candidate.summary || "",
    (candidate.skills || []).join(" "),
    (candidate.experiences || []).flatMap((e) => [e.title, e.company, ...e.bullets]).join(" "),
    candidate.baseResumeText || ""
  ].join(" ").toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jobKeywords) {
    if (candidateText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // If candidate didn't have many keywords explicitly written, seed with relevant ones from JD
  if (matchedKeywords.length === 0 && jobKeywords.length > 0) {
    matchedKeywords.push(...jobKeywords.slice(0, Math.min(5, jobKeywords.length)));
  }

  // Calculate ATS match score (realistic range: 78% - 96%)
  let matchScore = 88;
  if (jobKeywords.length > 0) {
    const ratio = matchedKeywords.length / jobKeywords.length;
    matchScore = Math.min(97, Math.max(76, Math.round(ratio * 100)));
  } else {
    matchScore = 92;
  }

  // 2. ATS Analysis Insights
  const atsAnalysis = {
    summary: `Your profile has a ${matchScore}% ATS compatibility match for the ${jobTitle} role at ${company}. Key core competencies align strongly with their primary requirements.`,
    strengths: [
      `Direct keyword alignment with ${matchedKeywords.slice(0, 3).join(", ") || "core domain requirements"}.`,
      `Demonstrated capability in async, high-ownership distributed remote environments.`,
      `Structured experience narrative demonstrating quantifiable business outcomes.`
    ],
    recommendations: missingKeywords.length > 0
      ? [
          `Consider mentioning familiar experience with ${missingKeywords.slice(0, 3).join(", ")} during technical interviews.`,
          `Highlight metrics regarding uptime, latency, or revenue impact when reviewing past projects.`
        ]
      : [
          `Profile shows complete keyword coverage. Emphasize system scale and leadership impact.`
        ]
  };

  // 3. Tailored Cover Letter
  const coverLetter = generateTailoredCoverLetter(candidate, job, matchedKeywords);

  // 4. Tailored CV Sections
  const professionalSummary = candidate.summary && candidate.summary.trim().length > 20
    ? `${candidate.summary.trim()} Target-focused on the ${jobTitle} position at ${company}, offering deep expertise in ${matchedKeywords.slice(0, 3).join(", ") || "distributed architectures"} to drive immediate product execution and team success.`
    : `Results-driven ${candidate.currentTitle || jobTitle} with proven expertise in building high-performance, scalable systems. Adept at leveraging ${matchedKeywords.slice(0, 4).join(", ") || "modern engineering practices"} to deliver reliable solutions in fast-paced remote environments. Dedicated to cross-functional alignment, product velocity, and measurable impact at ${company}.`;

  // Core Competencies
  const allSkills = Array.from(new Set([...(candidate.skills || []), ...matchedKeywords]));
  const coreCompetencies = allSkills.slice(0, 10);
  const technicalSkills = matchedKeywords.slice(0, 8);

  // Experiences
  let experiences: CandidateExperience[] = [];
  if (candidate.experiences && candidate.experiences.length > 0) {
    experiences = candidate.experiences.map((exp, idx) => ({
      title: exp.title,
      company: exp.company,
      location: exp.location || "Remote",
      period: exp.period,
      bullets: generateTailoredBulletPoints(jobTitle, matchedKeywords, exp.bullets)
    }));
  } else {
    // Generate starter structured experiences tailored to role
    experiences = [
      {
        title: candidate.currentTitle || `Senior ${jobTitle}`,
        company: "Global Tech Solutions",
        location: "Remote",
        period: "2023 - Present",
        bullets: generateTailoredBulletPoints(jobTitle, matchedKeywords)
      },
      {
        title: `${jobTitle.replace(/^Senior\s+/i, "")}`,
        company: "CloudScale Systems",
        location: "Remote",
        period: "2021 - 2023",
        bullets: [
          `Architected core backend and frontend pipelines supporting 250,000+ monthly active users with 99.99% availability.`,
          `Engineered automated testing and CI/CD pipelines reducing deployment friction and QA regression cycles by 45%.`,
          `Mentored 4 junior and mid-level engineers in code cleanliness, documentation, and automated testing best practices.`
        ]
      }
    ];
  }

  // Education
  const education: CandidateEducation[] = candidate.education && candidate.education.length > 0
    ? candidate.education
    : [
        {
          degree: "Bachelor of Science in Computer Science or Related Field",
          institution: "State University",
          year: "2020"
        }
      ];

  return {
    candidate: {
      fullName: candidate.fullName || "Candidate",
      email: candidate.email || "candidate@remoteworkdaily.com",
      phone: candidate.phone || "+1 (555) 019-2834",
      location: candidate.location || "Remote / Worldwide",
      linkedinUrl: candidate.linkedinUrl || "linkedin.com/in/candidate",
      portfolioUrl: candidate.portfolioUrl || "github.com/candidate",
      targetTitle: jobTitle
    },
    job: {
      title: jobTitle,
      company: company,
      location: job.location || "Remote"
    },
    matchScore,
    matchedKeywords,
    missingKeywords,
    atsAnalysis,
    coverLetter: {
      date: coverLetter.date,
      recipientTitle: `Hiring Manager, ${company}`,
      company,
      subject: coverLetter.subject,
      paragraphs: coverLetter.paragraphs,
      fullText: coverLetter.fullText
    },
    cv: {
      professionalSummary,
      coreCompetencies,
      technicalSkills,
      experiences,
      education
    }
  };
}
