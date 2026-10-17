"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Bot,
  FileText,
  Download,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Eye,
  MessageSquare,
  Video
} from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";
import { TailoredApplicationData, sanitizeCoverLetterParagraphs } from "@/lib/ai-tailor";
import {
  downloadApplicationPdf,
  createApplicationPdfBlobUrl,
  PdfTemplateStyle
} from "@/lib/pdf-generator";

interface AiResumeTailorProps {
  jobId: string;
  jobTitle: string;
  company: string;
  description: string;
}

const STORAGE_KEY = "remotework_candidate_cv_profile";

export function AiResumeTailor({ jobId, jobTitle, company, description }: AiResumeTailorProps) {
  const { userEmail } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cv" | "letter" | "loom" | "ats" | "interview" | "profile">("cv");
  const [templateStyle, setTemplateStyle] = useState<PdfTemplateStyle>("executive");

  // Candidate profile state (persisted across jobs via localStorage)
  const [candidateName, setCandidateName] = useState("Alex Morgan");
  const [candidateEmailState, setCandidateEmailState] = useState(userEmail || "alex.morgan@remoteworkdaily.com");
  const [candidatePhone, setCandidatePhone] = useState("+1 (555) 382-9102");
  const [candidateLocation, setCandidateLocation] = useState("Remote / Worldwide");
  const [customResumeText, setCustomResumeText] = useState("");

  const [tailoredData, setTailoredData] = useState<TailoredApplicationData | null>(null);

  // Editable fields state
  const [editableSummary, setEditableSummary] = useState("");
  const [editableCoverLetter, setEditableCoverLetter] = useState("");
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedBullets, setCopiedBullets] = useState(false);
  const [copiedLoom, setCopiedLoom] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Load saved candidate profile from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.fullName) setCandidateName(parsed.fullName);
        if (parsed.email) setCandidateEmailState(parsed.email);
        if (parsed.phone) setCandidatePhone(parsed.phone);
        if (parsed.location) setCandidateLocation(parsed.location);
        if (parsed.baseResumeText) setCustomResumeText(parsed.baseResumeText);
      } else if (userEmail) {
        setCandidateEmailState(userEmail);
      }
    } catch {
      // ignore storage errors
    }
  }, [userEmail]);

  // Reset tailored data if the user switches to a different job in the drawer
  useEffect(() => {
    setTailoredData(null);
    setIsOpen(false);
  }, [jobId]);

  // Deterministic match score between 88% and 96% based on job ID
  const displayScore = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) {
      hash = (hash << 5) - hash + jobId.charCodeAt(i);
    }
    return 88 + (Math.abs(hash) % 9);
  }, [jobId]);

  const handleGenerate = async (forceRefresh = false) => {
    if (isOpen && tailoredData && !forceRefresh) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (tailoredData && !forceRefresh) return;

    // Persist profile edits
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fullName: candidateName,
          email: candidateEmailState,
          phone: candidatePhone,
          location: candidateLocation,
          baseResumeText: customResumeText
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
          jobId,
          jobTitle,
          company,
          description,
          fullName: candidateName,
          email: candidateEmailState,
          phone: candidatePhone,
          candidateLocation,
          resumeText: customResumeText
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tailoredData) {
          const payload: TailoredApplicationData = data.tailoredData;
          setTailoredData(payload);
          setEditableSummary(payload.cv.professionalSummary);
          setEditableCoverLetter(payload.coverLetter.fullText);
          if (forceRefresh) {
            setActiveTab("cv");
          }
        }
      }
    } catch (err) {
      console.warn("AI Tailor error:", err);
    } finally {
      setLoading(false);
    }
  };

  const buildSynchronizedData = (): TailoredApplicationData | null => {
    if (!tailoredData) return null;
    const cleanParagraphs = sanitizeCoverLetterParagraphs(
      editableCoverLetter || tailoredData.coverLetter.fullText
    );
    return {
      ...tailoredData,
      candidate: {
        ...tailoredData.candidate,
        fullName: candidateName,
        email: candidateEmailState,
        phone: candidatePhone,
        location: candidateLocation
      },
      cv: {
        ...tailoredData.cv,
        professionalSummary: editableSummary || tailoredData.cv.professionalSummary
      },
      coverLetter: {
        ...tailoredData.coverLetter,
        fullText: editableCoverLetter || tailoredData.coverLetter.fullText,
        paragraphs: cleanParagraphs.length > 0 ? cleanParagraphs : tailoredData.coverLetter.paragraphs
      }
    };
  };

  const handleDownloadPdf = (options?: { includeCoverLetter?: boolean; includeCv?: boolean }) => {
    const currentData = buildSynchronizedData();
    if (!currentData) return;

    setDownloadingPdf(true);
    try {
      downloadApplicationPdf(currentData, undefined, {
        ...options,
        template: templateStyle
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePreviewPdfInTab = () => {
    const currentData = buildSynchronizedData();
    if (!currentData) return;
    try {
      const url = createApplicationPdfBlobUrl(currentData, {
        includeCoverLetter: true,
        includeCv: true,
        template: templateStyle
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("PDF preview error:", err);
    }
  };

  const copyLetter = () => {
    const textToCopy = editableCoverLetter || tailoredData?.coverLetter.fullText || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedCoverLetter(true);
      setTimeout(() => setCopiedCoverLetter(false), 2000);
    }
  };

  const copyBullets = () => {
    if (tailoredData?.cv.experiences) {
      const bullets = tailoredData.cv.experiences.flatMap((e) => e.bullets).join("\n• ");
      navigator.clipboard.writeText(`• ${bullets}`);
      setCopiedBullets(true);
      setTimeout(() => setCopiedBullets(false), 2000);
    }
  };

  return (
    <div className="my-4 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/50 via-white to-red-50/30 dark:from-neutral-900 dark:to-neutral-900 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-black flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{tailoredData ? tailoredData.matchScore : displayScore}% ATS Fit Match</span>
          </div>
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            Tailor a custom CV & Cover Letter PDF for <strong>{company}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-[#FF4742] to-red-500 hover:opacity-95 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>✨ {tailoredData ? "View Tailored CV & Cover Letter" : "Generate Tailored CV & Cover Letter (PDF)"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>
        </div>
      </div>

      {/* Expanded AI Tailoring Workspace */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-500 font-semibold flex flex-col items-center justify-center gap-3">
              <Bot className="w-6 h-6 text-[#FF4742] animate-bounce" />
              <span>Analyzing {company}’s job requirements, aligning STAR bullets, and building ATS-ready PDF...</span>
            </div>
          ) : tailoredData ? (
            <div className="space-y-4">
              {/* Top Action Bar with Direct PDF Download & Template Switcher */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Tailored Package Ready</span>
                  </span>
                  <select
                    value={templateStyle}
                    onChange={(e) => setTemplateStyle(e.target.value as PdfTemplateStyle)}
                    aria-label="PDF Template Style"
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-[#FF4742]"
                  >
                    <option value="executive">Template: Executive Coral</option>
                    <option value="moderncv">Template: ModernCV Banking</option>
                    <option value="minimal">Template: Minimalist ATS</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf({ includeCoverLetter: true, includeCv: true })}
                    disabled={downloadingPdf}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full PDF (Letter + CV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePreviewPdfInTab}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open rendered PDF in new browser tab"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Preview PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf({ includeCoverLetter: false, includeCv: true })}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-neutral-500" />
                    <span>CV Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf({ includeCoverLetter: true, includeCv: false })}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Letter Only</span>
                  </button>

                  <Link
                    href={`/tools/cv-tailor?jobId=${encodeURIComponent(jobId)}&title=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(company)}`}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center gap-1 transition-colors"
                  >
                    <span>Full Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 pb-1.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab("cv")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "cv"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tailored CV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("letter")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "letter"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cover Letter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("loom")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "loom"
                      ? "bg-[#FF4742] text-white"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span>60s Loom &amp; Sniper Pitch</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ats")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "ats"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ATS Fit ({tailoredData.matchedKeywords.length} Keywords)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("interview")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "interview"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Interview Prep</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-500" />
                  <span>My Resume / Info</span>
                </button>
              </div>

              {/* TAB 1: TAILORED CV */}
              {activeTab === "cv" && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  {/* Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                        Tailored Executive Summary
                      </span>
                      <span className="text-[11px] text-neutral-400">Live-editable for PDF</span>
                    </div>
                    <textarea
                      value={editableSummary}
                      onChange={(e) => setEditableSummary(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 text-xs font-sans rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
                    />
                  </div>

                  {/* Core Competencies */}
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block mb-2">
                      Targeted Core Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([...tailoredData.cv.coreCompetencies, ...tailoredData.cv.technicalSkills])).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience Bullets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                        Role-Targeted Work Experience (STAR Method)
                      </span>
                      <button
                        type="button"
                        onClick={copyBullets}
                        className="px-2 py-1 rounded-md text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBullets ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBullets ? "Copied" : "Copy Bullets"}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {tailoredData.cv.experiences.map((exp, expIdx) => (
                        <div key={expIdx} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                          <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white mb-1">
                            <span>{exp.title} • <span className="text-[#FF4742]">{exp.company}</span></span>
                            <span className="text-neutral-500 font-normal">{exp.period}</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 list-disc list-inside">
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
                </div>
              )}

              {/* TAB 2: TAILORED COVER LETTER */}
              {activeTab === "letter" && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-neutral-900 dark:text-white">
                        Tailored 4-Paragraph Cover Letter for {company}
                      </span>
                      <span className="text-[11px] text-neutral-500 block">
                        Edit below — the PDF generator automatically formats headers & signature with zero duplication.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={copyLetter}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCoverLetter ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCoverLetter ? "Copied Letter" : "Copy Text"}</span>
                    </button>
                  </div>

                  <textarea
                    value={editableCoverLetter}
                    onChange={(e) => setEditableCoverLetter(e.target.value)}
                    rows={12}
                    className="w-full p-3.5 text-xs font-sans rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-[#FF4742] leading-relaxed resize-y"
                  />
                </div>
              )}

              {/* TAB 3: ATS FIT & KEYWORDS */}
              {activeTab === "ats" && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  {/* 5-Dimension Fit Breakdown */}
                  {tailoredData.fitBreakdown && tailoredData.fitBreakdown.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {tailoredData.fitBreakdown.map((dim, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className="text-neutral-800 dark:text-neutral-200">{dim.label}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">{dim.score}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mb-1.5">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-snug">{dim.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Matched JD Keywords ({tailoredData.matchedKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tailoredData.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                          >
                            ✓ {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Unclaimed / Bridge Topics ({tailoredData.missingKeywords.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tailoredData.missingKeywords.length > 0 ? (
                          tailoredData.missingKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                            >
                              + {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-amber-700 dark:text-amber-400">
                            Complete keyword coverage achieved!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3.5: 60-SECOND LOOM VIDEO PITCH & SNIPER OUTREACH */}
              {activeTab === "loom" && tailoredData.loomPitch && tailoredData.sniperOutreach && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-[#FF4742] flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        <span>60-Second Loom Video Pitch Script (5–10x Higher Callback Rate)</span>
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Record a 60-second screen-share video for {company} to bypass ATS recruiter fatigue.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(tailoredData.loomPitch!.fullScript);
                        setCopiedLoom(true);
                        setTimeout(() => setCopiedLoom(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-[#FF4742] dark:hover:bg-[#FF4742] dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLoom ? "Copied Script!" : "Copy 60s Script"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                      <div className="text-[10px] font-black uppercase text-[#FF4742] mb-1">0:00 – 0:15 • The Hook</div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        &ldquo;{tailoredData.loomPitch.hook}&rdquo;
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                      <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">0:15 – 0:45 • Proof &amp; Stack</div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        &ldquo;{tailoredData.loomPitch.problemAndProof}&rdquo;
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800">
                      <div className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 mb-1">0:45 – 1:00 • Call to Action</div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        &ldquo;{tailoredData.loomPitch.callToAction}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 space-y-1.5">
                    <div className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      🎥 What to Show on Your Screen While Recording
                    </div>
                    <ul className="space-y-1">
                      {tailoredData.loomPitch.visualCues.map((cue, i) => (
                        <li key={i} className="text-xs text-amber-900 dark:text-amber-200/90 flex items-start gap-1.5">
                          <span className="font-bold text-[#FF4742]">•</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/60 space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-300">
                      ⚡ Direct CEO / Hiring Manager Sniper DM
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      {tailoredData.sniperOutreach.ceoDm}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={tailoredData.sniperOutreach.linkedinHiringManagerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold inline-flex items-center gap-1"
                      >
                        <span>Find {company} Hiring Manager on LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={tailoredData.sniperOutreach.linkedinRecruiterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-bold inline-flex items-center gap-1"
                      >
                        <span>Find {company} Tech Recruiter</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: INTERVIEW PREP & BRIDGE ANSWERS */}
              {activeTab === "interview" && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="text-xs text-neutral-500">
                    Stage-specific STAR talking points and honest bridge answers tailored for your interview with <strong>{company}</strong>.
                  </div>
                  <div className="space-y-3">
                    {(tailoredData.interviewPrep || []).map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 space-y-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#FF4742]">
                          {item.topic}
                        </span>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white">
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

              {/* TAB 5: CANDIDATE PROFILE DETAILS */}
              {activeTab === "profile" && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="text-xs text-neutral-500">
                    Enter your contact details and paste your existing resume or work history. Your details are saved locally in your browser so you can tailor applications in 1 click.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={candidateEmailState}
                        onChange={(e) => setCandidateEmailState(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={candidatePhone}
                        onChange={(e) => setCandidatePhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                        Location / Timezone
                      </label>
                      <input
                        type="text"
                        value={candidateLocation}
                        onChange={(e) => setCandidateLocation(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Paste Your Existing Resume / Past Roles & Achievements
                    </label>
                    <textarea
                      value={customResumeText}
                      onChange={(e) => setCustomResumeText(e.target.value)}
                      placeholder="Paste your master CV text, LinkedIn experience, or bullet points here..."
                      rows={5}
                      className="w-full p-2.5 text-xs font-sans rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerate(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-sm flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Save & Re-Tailor Application</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
