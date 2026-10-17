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
  Sliders,
  Send,
  Zap,
  Lock,
  ChevronRight
} from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";
import { TailoredApplicationData, CandidateExperience, CandidateEducation } from "@/lib/ai-tailor";
import { downloadApplicationPdf } from "@/lib/pdf-generator";

interface PresetJob {
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
    description: "Looking for an experienced Senior Full Stack Engineer proficient with React, TypeScript, Next.js, Node.js, and PostgreSQL. Experience designing scalable microservices, automated CI/CD pipelines, and high availability systems in an async distributed remote environment."
  },
  {
    title: "Lead Frontend Architect",
    company: "GitLab",
    location: "Global Remote",
    description: "Seeking a Lead Frontend Engineer with deep expertise in React, Next.js, TypeScript, Tailwind CSS, and performance optimization. You will architect robust design systems, drive frontend scalability, and mentor engineers across global timezones."
  },
  {
    title: "Senior DevOps & Cloud Engineer",
    company: "Canonical",
    location: "North America / Europe Remote",
    description: "We are seeking a Cloud/DevOps Engineer with strong experience in AWS, Kubernetes, Docker, Terraform, CI/CD, and system observability (Prometheus/Datadog). Focus on infrastructure as code, security compliance (SOC 2), and automated deployment pipelines."
  }
];

export function AiCvTailorStudio() {
  const searchParams = useSearchParams();
  const { hasActiveSubscription, openUpgradeModal, userEmail } = useSubscription();

  // Initial params
  const initialJobTitle = searchParams.get("title") || "Senior Full Stack Engineer";
  const initialCompany = searchParams.get("company") || "Automattic";
  const initialJobId = searchParams.get("jobId") || "";

  // Target Job State
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [company, setCompany] = useState(initialCompany);
  const [description, setDescription] = useState(
    SAMPLE_PRESETS[0].description
  );
  const [jobLocation, setJobLocation] = useState("Worldwide Remote");

  // Candidate Profile State
  const [fullName, setFullName] = useState("Jordan Lee");
  const [email, setEmail] = useState(userEmail || "jordan.lee@example.com");
  const [phone, setPhone] = useState("+1 (555) 729-1923");
  const [location, setLocation] = useState("San Francisco, CA / Remote");
  const [linkedinUrl, setLinkedinUrl] = useState("linkedin.com/in/jordanlee");
  const [portfolioUrl, setPortfolioUrl] = useState("github.com/jordanlee");
  const [baseResumeText, setBaseResumeText] = useState(
    "Senior software engineer with 6+ years of experience building modern web applications. Proficient with React, TypeScript, Node.js, Next.js, and cloud platforms. Led development of critical user-facing products with 99.9% uptime."
  );

  // Studio Results State
  const [loading, setLoading] = useState(false);
  const [tailoredData, setTailoredData] = useState<TailoredApplicationData | null>(null);
  const [activeTab, setActiveTab] = useState<"cv" | "letter" | "ats">("cv");

  // Editable Live Output State
  const [editableSummary, setEditableSummary] = useState("");
  const [editableCoverLetter, setEditableCoverLetter] = useState("");
  const [editableBullets, setEditableBullets] = useState<string[]>([]);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedCv, setCopiedCv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Sync user email if available
  useEffect(() => {
    if (userEmail && email === "jordan.lee@example.com") {
      setTimeout(() => setEmail(userEmail), 0);
    }
  }, [userEmail, email]);

  // Load preset
  const handleSelectPreset = (preset: PresetJob) => {
    setJobTitle(preset.title);
    setCompany(preset.company);
    setJobLocation(preset.location);
    setDescription(preset.description);
  };

  const handleGenerate = async () => {
    if (!hasActiveSubscription) {
      openUpgradeModal();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          company,
          description,
          location: jobLocation,
          fullName,
          email,
          phone,
          linkedinUrl,
          portfolioUrl,
          resumeText: baseResumeText
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload: TailoredApplicationData = data.tailoredData;
        setTailoredData(payload);
        setEditableSummary(payload.cv.professionalSummary);
        setEditableCoverLetter(payload.coverLetter.fullText);
        setEditableBullets(payload.cv.experiences.flatMap((e) => e.bullets));
      }
    } catch (err) {
      console.error("Studio error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial trigger if query params are present
  useEffect(() => {
    if (initialJobId || (searchParams.get("title") && searchParams.get("company"))) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = (options?: { includeCoverLetter?: boolean; includeCv?: boolean }) => {
    if (!tailoredData) return;
    setDownloadingPdf(true);
    try {
      // Build latest state into PDF
      const currentData: TailoredApplicationData = {
        ...tailoredData,
        candidate: {
          ...tailoredData.candidate,
          fullName,
          email,
          phone,
          location,
          linkedinUrl,
          portfolioUrl
        },
        job: {
          title: jobTitle,
          company: company,
          location: jobLocation
        },
        cv: {
          ...tailoredData.cv,
          professionalSummary: editableSummary || tailoredData.cv.professionalSummary,
          experiences: tailoredData.cv.experiences.map((exp, idx) => ({
            ...exp,
            bullets: idx === 0 && editableBullets.length > 0 ? editableBullets.slice(0, 4) : exp.bullets
          }))
        },
        coverLetter: {
          ...tailoredData.coverLetter,
          fullText: editableCoverLetter || tailoredData.coverLetter.fullText,
          paragraphs: editableCoverLetter
            ? editableCoverLetter.split(/\n\n+/).filter(Boolean)
            : tailoredData.coverLetter.paragraphs
        }
      };

      downloadApplicationPdf(currentData, undefined, options);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
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
    const text = `${fullName}\n${jobTitle}\n${email} | ${phone} | ${location}\n\nPROFESSIONAL SUMMARY\n${editableSummary || tailoredData.cv.professionalSummary}\n\nCORE COMPETENCIES\n${tailoredData.cv.coreCompetencies.join(", ")}\n\nEXPERIENCE\n${tailoredData.cv.experiences.map((e) => `${e.title} at ${e.company} (${e.period})\n• ${e.bullets.join("\n• ")}`).join("\n\n")}\n\nEDUCATION\n${tailoredData.cv.education.map((ed) => `${ed.degree} - ${ed.institution}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedCv(true);
    setTimeout(() => setCopiedCv(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-200 dark:border-red-900 text-xs font-black text-[#FF4742] mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume & Cover Letter Studio • ATS-Optimized</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Tailor Your CV & Cover Letter for Any Job
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Match your real experience against any target job description. Generate high-converting STAR bullet points and a tailored cold cover letter, then download as a clean, ATS-compliant PDF.
          </p>
        </div>

        {/* Action button if data already tailored */}
        {tailoredData && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownload({ includeCoverLetter: true, includeCv: true })}
              disabled={downloadingPdf}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Application PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Grid: Left Config / Right Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: JOB TARGET & CANDIDATE PROFILE INPUTS                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Buttons */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block">
              Quick Test Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all ${
                    company === p.company
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs"
                      : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  {p.company} ({p.title.split(" ")[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Target Job Form */}
          <div className="p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <Briefcase className="w-4 h-4 text-[#FF4742]" />
              <span>1. Target Job Details</span>
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
                Job Description & Key Requirements (Paste Here)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste the full job description or key requirements here to extract ATS tokens..."
                rows={5}
                className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Candidate Profile Form */}
          <div className="p-5 sm:p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <User className="w-4 h-4 text-emerald-500" />
              <span>2. Candidate Background</span>
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
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Base Resume Text or Past Job Experience
              </label>
              <textarea
                value={baseResumeText}
                onChange={(e) => setBaseResumeText(e.target.value)}
                placeholder="Paste your past bullet points, skills, or existing resume here..."
                rows={4}
                className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-amber-500 via-[#FF4742] to-red-600 hover:opacity-95 text-white shadow-lg shadow-red-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Tailoring Application with AI...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  <span>✨ Generate Tailored CV & Cover Letter (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE TAILORED WORKSPACE & DOWNLOADS                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {!tailoredData ? (
            loading ? (
              /* Loading State */
              <div className="p-16 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-4 shadow-sm">
                <Bot className="w-10 h-10 text-[#FF4742] mx-auto animate-bounce" />
                <div>
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                    Analyzing Job Requirements & Crafting Tailored Application
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    Extracting ATS keywords, generating STAR achievement bullets, and drafting a compelling cover letter...
                  </p>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="p-10 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 flex items-center justify-center text-[#FF4742]">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
                    Ready to Craft Your Tailored Job Application
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    Enter or select a target job posting on the left, then click <strong>Generate Tailored CV & Cover Letter</strong>. Our engine will align your skills with the exact JD keywords and produce a publication-ready PDF.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-sm transition-all"
                >
                  <span>Run with Sample Preset</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            /* Full Results Workspace */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* ATS Compatibility Banner */}
              <div className="p-5 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:to-neutral-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {tailoredData.matchScore}%
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                      ATS Keyword Match
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {tailoredData.matchedKeywords.length} core JD keywords verified and woven into your CV bullets and letter.
                  </p>
                </div>

                {/* Primary Download Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleDownload({ includeCoverLetter: true, includeCv: true })}
                    disabled={downloadingPdf}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF (CV + Letter)</span>
                  </button>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("cv")}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === "cv"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Tailored CV / Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("letter")}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === "letter"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Tailored Cover Letter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ats")}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === "ats"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>ATS Insights & Gaps</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: TAILORED CV PREVIEW                                                */}
              {/* ========================================================================= */}
              {activeTab === "cv" && (
                <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
                  {/* Action Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                        Curriculum Vitae (ATS-Formatted)
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Edit summary or bullets directly below; changes will be included in the exported PDF.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyCvText}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
                      >
                        {copiedCv ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCv ? "Copied" : "Copy CV"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload({ includeCoverLetter: false, includeCv: true })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 flex items-center gap-1.5 transition-opacity"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>CV PDF Only</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Simulation Box */}
                  <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 space-y-5">
                    {/* Header Letterhead */}
                    <div className="border-b-2 border-[#FF4742] pb-3">
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
                        <span>•</span>
                        <span>{linkedinUrl}</span>
                      </div>
                    </div>

                    {/* Section: Professional Summary */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white block mb-1">
                        Professional Summary
                      </span>
                      <textarea
                        value={editableSummary}
                        onChange={(e) => setEditableSummary(e.target.value)}
                        rows={3}
                        className="w-full p-3 text-xs font-sans rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
                      />
                    </div>

                    {/* Section: Core Competencies */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white block mb-2">
                        Core Competencies & Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from(new Set([...tailoredData.cv.coreCompetencies, ...tailoredData.cv.technicalSkills])).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md text-xs font-bold bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800"
                          >
                            • {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Section: Professional Experience */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white block mb-2">
                        Professional Experience (Tailored STAR Bullets)
                      </span>
                      <div className="space-y-4">
                        {tailoredData.cv.experiences.map((exp, expIdx) => (
                          <div key={expIdx} className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                              <span>{exp.title}</span>
                              <span className="text-neutral-500 font-normal text-xs">{exp.period}</span>
                            </div>
                            <div className="text-xs font-semibold text-[#FF4742]">
                              {exp.company} <span className="text-neutral-400 font-normal">| {exp.location}</span>
                            </div>
                            <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 list-disc list-inside pt-1">
                              {exp.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="leading-relaxed">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section: Education */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white block mb-2">
                        Education & Credentials
                      </span>
                      {tailoredData.cv.education.map((edu, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white block">{edu.degree}</span>
                            <span className="text-neutral-500">{edu.institution}</span>
                          </div>
                          {edu.year && <span className="text-neutral-400">{edu.year}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: TAILORED COVER LETTER PREVIEW                                      */}
              {/* ========================================================================= */}
              {activeTab === "letter" && (
                <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                        Tailored Cold Cover Letter
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Personalized for {company}’s culture, mission, and technical challenges.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyCoverLetter}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
                      >
                        {copiedCoverLetter ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCoverLetter ? "Copied" : "Copy Letter"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload({ includeCoverLetter: true, includeCv: false })}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 flex items-center gap-1.5 transition-opacity"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Letter PDF Only</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={editableCoverLetter}
                    onChange={(e) => setEditableCoverLetter(e.target.value)}
                    rows={15}
                    className="w-full p-4 text-xs sm:text-sm font-sans rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
                  />
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: ATS FIT & KEYWORD GAPS                                            */}
              {/* ========================================================================= */}
              {activeTab === "ats" && (
                <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                      ATS Keyword Analysis & Interview Prep
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      How an ATS parser (Greenhouse, Lever, Ashby, Workday) and screening recruiter evaluates your submission.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Matched Required Skills ({tailoredData.matchedKeywords.length})</span>
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
                        <span>Keywords to Bridge in Screening ({tailoredData.missingKeywords.length})</span>
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
                            Full keyword coverage! Zero critical keyword gaps detected.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                    <strong className="text-neutral-900 dark:text-white font-bold block text-sm">
                      Drafter-Reviewer Strategic Insights
                    </strong>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {tailoredData.atsAnalysis.summary}
                    </p>
                    <div className="pt-2">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                        Recommended Talking Points:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                        {tailoredData.atsAnalysis.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
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
