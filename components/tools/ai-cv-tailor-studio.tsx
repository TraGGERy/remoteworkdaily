"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Bot,
  FileText,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Briefcase,
  User,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  Upload,
  MessageSquare,
  LayoutTemplate,
  ShieldCheck
} from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";
import {
  TailoredApplicationData,
  CandidateExperience,
  CandidateEducation,
  sanitizeCoverLetterParagraphs,
  stripHtmlTags
} from "@/lib/ai-tailor";
import {
  downloadApplicationPdf,
  createApplicationPdfBlobUrl,
  PdfTemplateStyle
} from "@/lib/pdf-generator";

interface PresetJob {
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

const SAMPLE_PRESETS: PresetJob[] = [
  {
    title: "Senior Full Stack Engineer",
    company: "Automattic",
    location: "Worldwide Remote",
    description:
      "We are looking for an experienced Senior Full Stack Engineer proficient with React, TypeScript, Next.js, Node.js, and PostgreSQL. You will architect scalable microservices, maintain automated CI/CD pipelines, optimize performance across distributed systems, and collaborate asynchronously with product and design teams."
  },
  {
    title: "Staff Frontend Architect",
    company: "GitLab",
    location: "Global Remote",
    description:
      "Seeking a Staff Frontend Engineer with deep expertise in React, Next.js, TypeScript, Tailwind CSS, GraphQL, and Design Systems. You will lead frontend architecture, improve web vitals and accessibility (WCAG), establish automated E2E testing with Playwright, and mentor engineers across global timezones."
  },
  {
    title: "Senior Cloud & DevOps Engineer",
    company: "Canonical",
    location: "Worldwide Remote",
    description:
      "Seeking a Cloud & Reliability Engineer with strong production experience in AWS, Kubernetes, Docker, Terraform, Linux, and CI/CD automation. Focus on high availability infrastructure, observability with Prometheus and Grafana, and SOC 2 security compliance."
  },
  {
    title: "Senior AI Product Manager",
    company: "Linear",
    location: "Remote (US & EU)",
    description:
      "Looking for a technical Product Manager experienced in B2B SaaS, Product Management, Roadmaps, Analytics, A/B Testing, and AI/LLM workflows. Partner cross-functionally with engineering and design to ship high-craft features."
  }
];

const STORAGE_KEY = "remotework_candidate_cv_profile";

export function AiCvTailorStudio() {
  const searchParams = useSearchParams();
  const { userEmail } = useSubscription();

  const initialJobId = searchParams.get("jobId") || "";
  const initialJobTitle = searchParams.get("title") || SAMPLE_PRESETS[0].title;
  const initialCompany = searchParams.get("company") || SAMPLE_PRESETS[0].company;

  // Target Job State
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [company, setCompany] = useState(initialCompany);
  const [jobLocation, setJobLocation] = useState("Worldwide Remote");
  const [description, setDescription] = useState(SAMPLE_PRESETS[0].description);

  // Live Platform Jobs for quick dropdown picking
  const [platformJobs, setPlatformJobs] = useState<PresetJob[]>([]);

  // Candidate Profile State
  const [fullName, setFullName] = useState("Jordan Lee");
  const [email, setEmail] = useState(userEmail || "jordan.lee@remoteworkdaily.com");
  const [phone, setPhone] = useState("+1 (555) 729-1923");
  const [location, setLocation] = useState("Remote / Worldwide");
  const [linkedinUrl, setLinkedinUrl] = useState("linkedin.com/in/jordanlee");
  const [portfolioUrl, setPortfolioUrl] = useState("github.com/jordanlee");
  const [baseResumeText, setBaseResumeText] = useState(
    `Senior Full Stack Engineer | Cloud & Distributed Systems (2022 - Present)
• Spearheaded end-to-end delivery of customer-facing web applications using React, TypeScript, Next.js, and Node.js for 150,000+ active users.
• Architected PostgreSQL data models and Redis caching layers that reduced p95 API latency by 42%.
• Built automated GitHub Actions CI/CD pipelines and Docker deployments with 99.98% uptime.

Software Engineer at Velocity SaaS (2019 - 2022)
• Developed modular UI components and REST APIs using TypeScript, React, and Tailwind CSS.
• Partnered asynchronously with product managers and designers to ship 20+ core product features ahead of schedule.

Education
Bachelor of Science in Computer Science | State University | 2019`
  );

  // Studio Results State
  const [loading, setLoading] = useState(false);
  const [tailoredData, setTailoredData] = useState<TailoredApplicationData | null>(null);
  const [activeTab, setActiveTab] = useState<"cv" | "letter" | "pdf" | "ats" | "interview">("cv");
  const [templateStyle, setTemplateStyle] = useState<PdfTemplateStyle>("executive");

  // Live Editable CV & Cover Letter State
  const [editableSummary, setEditableSummary] = useState("");
  const [editableSkills, setEditableSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [editableExperiences, setEditableExperiences] = useState<CandidateExperience[]>([]);
  const [editableEducation, setEditableEducation] = useState<CandidateEducation[]>([]);
  const [editableCoverLetter, setEditableCoverLetter] = useState("");

  // PDF Preview Blob URL
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedCv, setCopiedCv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Load saved candidate profile from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.linkedinUrl) setLinkedinUrl(parsed.linkedinUrl);
        if (parsed.portfolioUrl) setPortfolioUrl(parsed.portfolioUrl);
        if (parsed.baseResumeText) setBaseResumeText(parsed.baseResumeText);
      } else if (userEmail) {
        setEmail(userEmail);
      }
    } catch {
      // ignore storage errors
    }
  }, [userEmail]);

  // Fetch top active jobs from platform so user can pick any live listing
  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.jobs)) {
          const mapped: PresetJob[] = data.jobs.slice(0, 30).map((j: {
            id: string;
            title: string;
            company: string;
            location?: string;
            description?: string;
            tags?: string[];
          }) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location || "Remote",
            description: stripHtmlTags(
              `${j.description || ""} ${(j.tags || []).join(", ")}`
            )
          }));
          setPlatformJobs(mapped);
        }
      })
      .catch(() => {
        // fallback to presets
      });
  }, []);

  const runTailoring = async (overrideJob?: {
    jobId?: string;
    title?: string;
    company?: string;
    location?: string;
    description?: string;
  }) => {
    const targetJobId = overrideJob?.jobId !== undefined ? overrideJob.jobId : selectedJobId;
    const targetTitle = overrideJob?.title || jobTitle;
    const targetCompany = overrideJob?.company || company;
    const targetLocation = overrideJob?.location || jobLocation;
    const targetDesc = overrideJob?.description !== undefined ? overrideJob.description : description;

    // Persist candidate profile locally
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fullName,
          email,
          phone,
          location,
          linkedinUrl,
          portfolioUrl,
          baseResumeText
        })
      );
    } catch {
      // ignore
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: targetJobId || undefined,
          jobTitle: targetTitle,
          company: targetCompany,
          description: targetDesc,
          jobLocation: targetLocation,
          fullName,
          email,
          phone,
          candidateLocation: location,
          linkedinUrl,
          portfolioUrl,
          resumeText: baseResumeText
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload: TailoredApplicationData = data.tailoredData;
        if (payload) {
          setTailoredData(payload);
          setEditableSummary(payload.cv.professionalSummary);
          setEditableSkills(
            Array.from(new Set([...payload.cv.coreCompetencies, ...payload.cv.technicalSkills]))
          );
          setEditableExperiences(payload.cv.experiences);
          setEditableEducation(payload.cv.education);
          setEditableCoverLetter(payload.coverLetter.fullText);

          // If initialized from jobId, sync the resolved job description into the form
          if (targetJobId && payload.job.cleanDescription) {
            setJobTitle(payload.job.title);
            setCompany(payload.job.company);
            setJobLocation(payload.job.location);
            setDescription(payload.job.cleanDescription);
          }
        }
      }
    } catch (err) {
      console.error("Studio tailoring error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on initial load so the studio is immediately populated and ready
  useEffect(() => {
    runTailoring({
      jobId: initialJobId,
      title: initialJobTitle,
      company: initialCompany,
      description: initialJobId ? "" : SAMPLE_PRESETS[0].description
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Synchronize all live-edited state into a clean TailoredApplicationData object for PDF export
   */
  const buildSynchronizedApplicationData = React.useCallback((): TailoredApplicationData | null => {
    if (!tailoredData) return null;

    const cleanParagraphs = sanitizeCoverLetterParagraphs(
      editableCoverLetter || tailoredData.coverLetter.fullText
    );

    return {
      ...tailoredData,
      candidate: {
        fullName,
        email,
        phone,
        location,
        linkedinUrl,
        portfolioUrl,
        targetTitle: jobTitle
      },
      job: {
        title: jobTitle,
        company,
        location: jobLocation
      },
      cv: {
        professionalSummary: editableSummary || tailoredData.cv.professionalSummary,
        coreCompetencies: editableSkills,
        technicalSkills: editableSkills.slice(0, 8),
        experiences: editableExperiences,
        education: editableEducation
      },
      coverLetter: {
        ...tailoredData.coverLetter,
        company,
        subject: `Application for ${jobTitle} — ${fullName}`,
        fullText: editableCoverLetter || tailoredData.coverLetter.fullText,
        paragraphs: cleanParagraphs.length > 0 ? cleanParagraphs : tailoredData.coverLetter.paragraphs
      }
    };
  }, [
    tailoredData,
    editableCoverLetter,
    fullName,
    email,
    phone,
    location,
    linkedinUrl,
    portfolioUrl,
    jobTitle,
    company,
    jobLocation,
    editableSummary,
    editableSkills,
    editableExperiences,
    editableEducation
  ]);

  // Refresh PDF preview blob URL when user opens the PDF Preview tab or changes template
  useEffect(() => {
    if (activeTab !== "pdf" || !tailoredData) return;
    const synced = buildSynchronizedApplicationData();
    if (!synced) return;

    const url = createApplicationPdfBlobUrl(synced, {
      includeCoverLetter: true,
      includeCv: true,
      template: templateStyle
    });
    setPdfPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [activeTab, templateStyle, tailoredData, buildSynchronizedApplicationData]);

  const handleSelectPreset = (preset: PresetJob) => {
    setSelectedJobId(preset.id || "");
    setJobTitle(preset.title);
    setCompany(preset.company);
    setJobLocation(preset.location);
    setDescription(preset.description);
    runTailoring({
      jobId: preset.id || "",
      title: preset.title,
      company: preset.company,
      location: preset.location,
      description: preset.description
    });
  };

  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBaseResumeText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = (options?: { includeCoverLetter?: boolean; includeCv?: boolean }) => {
    const currentData = buildSynchronizedApplicationData();
    if (!currentData) return;

    setDownloadingPdf(true);
    try {
      downloadApplicationPdf(currentData, undefined, {
        ...options,
        template: templateStyle
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleOpenPdfInNewTab = () => {
    const currentData = buildSynchronizedApplicationData();
    if (!currentData) return;
    const url = createApplicationPdfBlobUrl(currentData, {
      includeCoverLetter: true,
      includeCv: true,
      template: templateStyle
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Experience & Skill Editors
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (!clean) return;
    if (!editableSkills.includes(clean)) {
      setEditableSkills([...editableSkills, clean]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditableSkills(editableSkills.filter((s) => s !== skillToRemove));
  };

  const handleUpdateExperienceField = (
    idx: number,
    field: keyof CandidateExperience,
    value: string
  ) => {
    setEditableExperiences((prev) =>
      prev.map((exp, i) => (i === idx ? { ...exp, [field]: value } : exp))
    );
  };

  const handleUpdateBullet = (expIdx: number, bulletIdx: number, value: string) => {
    setEditableExperiences((prev) =>
      prev.map((exp, i) => {
        if (i !== expIdx) return exp;
        const nextBullets = [...exp.bullets];
        nextBullets[bulletIdx] = value;
        return { ...exp, bullets: nextBullets };
      })
    );
  };

  const handleAddBullet = (expIdx: number) => {
    setEditableExperiences((prev) =>
      prev.map((exp, i) =>
        i === expIdx
          ? {
              ...exp,
              bullets: [
                ...exp.bullets,
                `Delivered high-impact ${jobTitle} solutions driving measurable reliability and velocity gains.`
              ]
            }
          : exp
      )
    );
  };

  const handleDeleteBullet = (expIdx: number, bulletIdx: number) => {
    setEditableExperiences((prev) =>
      prev.map((exp, i) =>
        i === expIdx
          ? { ...exp, bullets: exp.bullets.filter((_, bIdx) => bIdx !== bulletIdx) }
          : exp
      )
    );
  };

  const handleAddExperienceRole = () => {
    setEditableExperiences((prev) => [
      ...prev,
      {
        title: jobTitle,
        company: "Remote Tech Company",
        location: "Remote",
        period: "2020 - 2022",
        bullets: [
          `Engineered scalable systems and collaborated across distributed teams to deliver key product milestones.`
        ]
      }
    ]);
  };

  const handleRemoveExperienceRole = (expIdx: number) => {
    setEditableExperiences((prev) => prev.filter((_, i) => i !== expIdx));
  };

  const copyCoverLetter = () => {
    const text = editableCoverLetter || tailoredData?.coverLetter.fullText || "";
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    }
  };

  const copyCvText = () => {
    if (!tailoredData) return;
    const text = `${fullName}\n${jobTitle}\n${email} | ${phone} | ${location}\n\nEXECUTIVE SUMMARY\n${editableSummary}\n\nCORE COMPETENCIES\n${editableSkills.join(" • ")}\n\nPROFESSIONAL EXPERIENCE\n${editableExperiences.map((e) => `${e.title} — ${e.company} (${e.period})\n• ${e.bullets.join("\n• ")}`).join("\n\n")}\n\nEDUCATION\n${editableEducation.map((ed) => `${ed.degree} — ${ed.institution} (${ed.year || ""})`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedCv(true);
    setTimeout(() => setCopiedCv(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-200 dark:border-red-900 text-xs font-black text-[#FF4742] mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Job Application Studio • Drafter-Reviewer + ATS PDF Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Tailor Your CV & Cover Letter for Any Job
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Evaluate job fit across 5 dimensions, rewrite your experience into role-targeted STAR bullets, craft a 4-paragraph cover letter, and export a 100% ATS-extractable PDF.
          </p>
        </div>

        {/* Global PDF Controls */}
        {tailoredData && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold">
              <LayoutTemplate className="w-3.5 h-3.5 text-[#FF4742]" />
              <select
                value={templateStyle}
                onChange={(e) => setTemplateStyle(e.target.value as PdfTemplateStyle)}
                aria-label="Select PDF Template"
                className="bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="executive">Executive Coral Template</option>
                <option value="moderncv">ModernCV Banking Template</option>
                <option value="minimal">Minimalist ATS Template</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenPdfInNewTab}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-neutral-500" />
              <span>Preview PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload({ includeCoverLetter: true, includeCv: true })}
              disabled={downloadingPdf}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Full PDF (Letter + CV)</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Grid: Left Config (5 cols) / Right Output (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: JOB TARGET & CANDIDATE PROFILE INPUTS                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Job Presets & Live Board Picker */}
          <div className="p-4 sm:p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">
                Quick Role Presets
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                1-Click Auto-Tailor
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-2.5 py-1.5 text-xs rounded-xl font-bold border transition-all cursor-pointer ${
                    company === p.company && jobTitle === p.title
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-[#FF4742]"
                  }`}
                >
                  {p.company} • {p.title.split(" ").slice(0, 2).join(" ")}
                </button>
              ))}
            </div>

            {platformJobs.length > 0 && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-[11px] font-bold text-neutral-500 mb-1">
                  Or select a live job from the Remote Work Daily board:
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    const found = platformJobs.find((j) => j.id === e.target.value);
                    if (found) handleSelectPreset(found);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742]"
                >
                  <option value="">— Choose from {platformJobs.length} live remote jobs —</option>
                  {platformJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.company} — {j.title} ({j.location})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 1. Target Job Form */}
          <div className="p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <Briefcase className="w-4 h-4 text-[#FF4742]" />
              <span>1. Target Job Posting</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Automattic"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Job Description & Key Requirements (Paste Any Posting)
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setSelectedJobId("");
                  setDescription(e.target.value);
                }}
                placeholder="Paste the full job description, responsibilities, and required tech stack here..."
                rows={5}
                className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* 2. Candidate Profile Form */}
          <div className="p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900 dark:text-white">
                <User className="w-4 h-4 text-emerald-500" />
                <span>2. Master Candidate Profile</span>
              </div>

              <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors">
                <Upload className="w-3 h-3" />
                <span>Import .txt/.md</span>
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleResumeFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Location / Timezone
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  GitHub / Portfolio
                </label>
                <input
                  type="text"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Master CV / Past Work Experience & Education
                </label>
                <span className="text-[10px] text-neutral-400">Supports roles, dates & bullets</span>
              </div>
              <textarea
                value={baseResumeText}
                onChange={(e) => setBaseResumeText(e.target.value)}
                placeholder="Paste your master CV, roles (e.g. Senior Engineer at Company (2022 - Present)), bullet points, and education..."
                rows={7}
                className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => runTailoring()}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-amber-500 via-[#FF4742] to-red-600 hover:opacity-95 text-white shadow-lg shadow-red-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Drafter-Reviewer AI Tailoring...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>✨ Tailor CV & Cover Letter for {company || "Target Role"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE TAILORED WORKSPACE, PDF PREVIEW & DOWNLOADS            */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {!tailoredData ? (
            loading ? (
              <div className="p-16 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-4 shadow-sm">
                <Bot className="w-10 h-10 text-[#FF4742] mx-auto animate-bounce" />
                <div>
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                    Evaluating 5-Dimension Fit & Crafting Your Application Package
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Extracting ATS keywords, tailoring STAR achievement bullets, and compiling your cover letter...
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-[#FF4742]">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
                    Ready to Craft Your Tailored Job Application
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Select a job preset or paste any target job description on the left, then click <strong>Tailor CV & Cover Letter</strong>.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Top ATS Score & Download Card */}
              <div className="p-5 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:to-neutral-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <span className="text-lg font-black leading-none tabular-nums">
                      {tailoredData.matchScore}%
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                      ATS Fit
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm sm:text-base font-black text-neutral-900 dark:text-white">
                        Tailored for {company} — {jobTitle}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        ATS Text Layer Verified
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {tailoredData.matchedKeywords.length} required keywords embedded • Page 1: Cover Letter • Page 2: Tailored CV
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload({ includeCoverLetter: true, includeCv: true })}
                    disabled={downloadingPdf}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF (CV + Letter)</span>
                  </button>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab("cv")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "cv"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tailored CV Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("letter")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "letter"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cover Letter Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("pdf")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "pdf"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-[#FF4742]" />
                  <span>Live PDF Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ats")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "ats"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>5-Dimension Fit & ATS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("interview")}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "interview"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Interview Prep</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: INTERACTIVE TAILORED CV EDITOR                                     */}
              {/* ========================================================================= */}
              {activeTab === "cv" && (
                <div className="p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                        Interactive CV Document Editor
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Customize any summary, skill, or STAR bullet below — all edits compile directly into your PDF.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyCvText}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedCv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCv ? "Copied" : "Copy CV Text"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload({ includeCoverLetter: false, includeCv: true })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 flex items-center gap-1.5 transition-opacity cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download CV Only (PDF)</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Executive Paper Sheet */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950 space-y-6">
                    {/* Letterhead Preview */}
                    <div className="border-b-2 border-[#FF4742] pb-3.5">
                      <h2 className="text-2xl font-black text-neutral-900 dark:text-white">
                        {fullName}
                      </h2>
                      <div className="text-sm font-bold text-[#FF4742] mt-0.5">
                        {jobTitle}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 flex flex-wrap gap-2">
                        <span>{email}</span>
                        <span>•</span>
                        <span>{phone}</span>
                        <span>•</span>
                        <span>{location}</span>
                        {linkedinUrl && (
                          <>
                            <span>•</span>
                            <span>{linkedinUrl}</span>
                          </>
                        )}
                        {portfolioUrl && (
                          <>
                            <span>•</span>
                            <span>{portfolioUrl}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Section: Executive Summary */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white block mb-1.5">
                        Executive Summary
                      </span>
                      <textarea
                        value={editableSummary}
                        onChange={(e) => setEditableSummary(e.target.value)}
                        rows={3}
                        className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
                      />
                    </div>

                    {/* Section: Core Competencies (Interactive Tag Manager) */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                          Core Competencies & Matched Keywords ({editableSkills.length})
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {editableSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-neutral-400 hover:text-red-500 font-black cursor-pointer"
                              title="Remove skill"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <form onSubmit={handleAddSkill} className="flex items-center gap-2 max-w-xs">
                        <input
                          type="text"
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          placeholder="Add a skill or keyword..."
                          className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-none focus:border-[#FF4742]"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 cursor-pointer"
                        >
                          + Add
                        </button>
                      </form>
                    </div>

                    {/* Section: Professional Experience (Editable Roles & Bullets) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                          Professional Experience (STAR Format)
                        </span>
                        <button
                          type="button"
                          onClick={handleAddExperienceRole}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Role</span>
                        </button>
                      </div>

                      {editableExperiences.map((exp, expIdx) => (
                        <div
                          key={expIdx}
                          className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => handleUpdateExperienceField(expIdx, "title", e.target.value)}
                              placeholder="Role Title"
                              className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
                            />
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleUpdateExperienceField(expIdx, "company", e.target.value)}
                              placeholder="Company Name"
                              className="px-2.5 py-1.5 text-xs font-bold text-[#FF4742] rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={exp.period}
                                onChange={(e) => handleUpdateExperienceField(expIdx, "period", e.target.value)}
                                placeholder="e.g. 2022 - Present"
                                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400"
                              />
                              {editableExperiences.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExperienceRole(expIdx)}
                                  className="p-1.5 text-neutral-400 hover:text-red-500 cursor-pointer"
                                  title="Remove role"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {exp.bullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="flex items-start gap-2">
                                <span className="text-xs font-bold text-[#FF4742] mt-2">•</span>
                                <textarea
                                  value={bullet}
                                  onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                                  rows={2}
                                  className="flex-1 p-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
                                />
                                {exp.bullets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBullet(expIdx, bIdx)}
                                    className="p-1.5 text-neutral-400 hover:text-red-500 mt-1 cursor-pointer"
                                    title="Remove bullet"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddBullet(expIdx)}
                              className="text-[11px] font-bold text-[#FF4742] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add achievement bullet</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Section: Education */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white block mb-2">
                        Education & Credentials
                      </span>
                      <div className="space-y-2">
                        {editableEducation.map((edu, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                          >
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditableEducation((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, degree: val } : item))
                                );
                              }}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                            />
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditableEducation((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, institution: val } : item))
                                );
                              }}
                              className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                            />
                            <input
                              type="text"
                              value={edu.year || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditableEducation((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, year: val } : item))
                                );
                              }}
                              placeholder="Year"
                              className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: TAILORED COVER LETTER EDITOR                                       */}
              {/* ========================================================================= */}
              {activeTab === "letter" && (
                <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                        Tailored 4-Paragraph Cover Letter
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Structured with Hook, Primary Evidence, Async Culture Fit, and Call to Action for {company}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyCoverLetter}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedCoverLetter ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCoverLetter ? "Copied" : "Copy Letter"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload({ includeCoverLetter: true, includeCv: false })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 flex items-center gap-1.5 transition-opacity cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download Letter Only (PDF)</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={editableCoverLetter}
                    onChange={(e) => setEditableCoverLetter(e.target.value)}
                    rows={16}
                    className="w-full p-4 text-xs sm:text-sm font-sans rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
                  />
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: LIVE EMBEDDED PDF PREVIEW                                          */}
              {/* ========================================================================= */}
              {activeTab === "pdf" && (
                <div className="p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                        Compiled PDF Verification View
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Page 1: Tailored Cover Letter • Page 2+: Tailored CV ({templateStyle.toUpperCase()} template)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenPdfInNewTab}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open Fullscreen Tab</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload({ includeCoverLetter: true, includeCv: true })}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[#FF4742] text-white hover:bg-[#e03a35] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save PDF</span>
                      </button>
                    </div>
                  </div>

                  {pdfPreviewUrl ? (
                    <iframe
                      src={pdfPreviewUrl}
                      title="Live Tailored Application PDF Preview"
                      className="w-full h-[680px] rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100"
                    />
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-xs text-neutral-400">
                      Rendering PDF preview...
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: 5-DIMENSION FIT & ATS VERIFICATION                                 */}
              {/* ========================================================================= */}
              {activeTab === "ats" && (
                <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                      5-Dimension Fit Evaluation & ATS Verification
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Evaluated against {company}’s job description using the Drafter-Reviewer verification rubric.
                    </p>
                  </div>

                  {/* 5-Dimension Progress Bars */}
                  {tailoredData.fitBreakdown && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tailoredData.fitBreakdown.map((dim, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                        >
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-neutral-900 dark:text-white">{dim.label}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">{dim.score}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mb-2">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-relaxed">{dim.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified Keywords in PDF ({tailoredData.matchedKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tailoredData.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Honest Gaps / Bridge in Interview ({tailoredData.missingKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tailoredData.missingKeywords.length > 0 ? (
                          tailoredData.missingKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                            >
                              + {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                            100% of extracted JD keywords are supported by your profile!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Drafter-Reviewer Verification Log */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                    <strong className="text-neutral-900 dark:text-white font-bold block text-sm">
                      Drafter-Reviewer Verification Checklist
                    </strong>
                    <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400">
                      {(tailoredData.atsAnalysis.drafterReviewerNotes || []).map((note, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: STAGE-SPECIFIC INTERVIEW PREP & BRIDGE ANSWERS                     */}
              {/* ========================================================================= */}
              {activeTab === "interview" && (
                <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                      Stage-Specific Interview Prep & Honest Gap Bridges
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Prepared from the exact CV and cover letter claims generated for {company}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(tailoredData.interviewPrep || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2"
                      >
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-[11px] font-black text-[#FF4742]">
                          {item.topic}
                        </div>
                        <div className="text-sm font-bold text-neutral-900 dark:text-white">
                          {item.question}
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {item.suggestedAnswer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
