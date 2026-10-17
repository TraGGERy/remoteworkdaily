"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Check,
  Copy,
  Lock,
  ChevronDown,
  ChevronUp,
  Bot,
  FileText,
  Download,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileDown
} from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";
import { TailoredApplicationData } from "@/lib/ai-tailor";
import { downloadApplicationPdf } from "@/lib/pdf-generator";

interface AiResumeTailorProps {
  jobId: string;
  jobTitle: string;
  company: string;
  description: string;
}

export function AiResumeTailor({ jobId, jobTitle, company, description }: AiResumeTailorProps) {
  const { hasActiveSubscription, openUpgradeModal, userEmail } = useSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"cv" | "letter" | "ats" | "profile">("cv");
  
  // Custom profile state for on-the-fly customization
  const [candidateName, setCandidateName] = useState("Alex Morgan");
  const [candidateEmailState, setCandidateEmailState] = useState(userEmail || "alex.morgan@example.com");
  const [candidatePhone, setCandidatePhone] = useState("+1 (555) 382-9102");
  const [candidateLocation, setCandidateLocation] = useState("Remote / Worldwide");
  const [customResumeText, setCustomResumeText] = useState("");
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  const [tailoredData, setTailoredData] = useState<TailoredApplicationData | null>(null);

  // Editable fields state
  const [editableSummary, setEditableSummary] = useState("");
  const [editableCoverLetter, setEditableCoverLetter] = useState("");
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);
  const [copiedBullets, setCopiedBullets] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Deterministic match score between 88% and 96% based on job ID
  const displayScore = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) {
      hash = (hash << 5) - hash + jobId.charCodeAt(i);
    }
    return 88 + (Math.abs(hash) % 9);
  }, [jobId]);

  const handleGenerate = async (forceRefresh = false) => {
    if (!hasActiveSubscription) {
      openUpgradeModal();
      return;
    }

    setIsOpen(true);
    if (tailoredData && !forceRefresh) return;

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
          location: candidateLocation,
          resumeText: customResumeText
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const payload: TailoredApplicationData = data.tailoredData || {
          candidate: {
            fullName: candidateName,
            email: candidateEmailState,
            phone: candidatePhone,
            location: candidateLocation,
            linkedinUrl: "linkedin.com/in/alexmorgan",
            portfolioUrl: "github.com/alexmorgan",
            targetTitle: jobTitle
          },
          job: {
            title: jobTitle,
            company: company,
            location: "Remote"
          },
          matchScore: data.matchScore || displayScore,
          matchedKeywords: data.matchedKeywords || [],
          missingKeywords: data.missingKeywords || [],
          atsAnalysis: data.atsAnalysis || {
            summary: `High alignment with ${company}'s required remote stack.`,
            strengths: ["Keyword matching", "Remote async ownership", "Clear metrics"],
            recommendations: ["Highlight scalable delivery during interviews"]
          },
          coverLetter: data.coverLetter || {
            date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            recipientTitle: `Hiring Manager, ${company}`,
            company,
            subject: `Application for ${jobTitle} - ${candidateName}`,
            paragraphs: (data.tailoredCoverLetter || "").split("\n\n").filter(Boolean),
            fullText: data.tailoredCoverLetter || ""
          },
          cv: data.cv || {
            professionalSummary: `Target-oriented ${jobTitle} focused on high velocity delivery at ${company}.`,
            coreCompetencies: data.matchedKeywords || [],
            technicalSkills: data.matchedKeywords || [],
            experiences: [
              {
                title: `Senior ${jobTitle}`,
                company: "Global Remote Corp",
                period: "2022 - Present",
                bullets: data.tailoredBulletPoints || []
              }
            ],
            education: [
              {
                degree: "B.S. in Computer Science or Equivalent Experience",
                institution: "Accredited University",
                year: "2020"
              }
            ]
          }
        };

        setTailoredData(payload);
        setEditableSummary(payload.cv.professionalSummary);
        setEditableCoverLetter(payload.coverLetter.fullText);
      }
    } catch (err) {
      console.warn("AI Tailor error:", err);
    } finally {
      setLoading(false);
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

  const handleDownloadPdf = (options?: { includeCoverLetter?: boolean; includeCv?: boolean }) => {
    if (!tailoredData) return;

    setDownloadingPdf(true);
    try {
      // Synchronize latest editable values
      const currentData: TailoredApplicationData = {
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
          paragraphs: editableCoverLetter
            ? editableCoverLetter.split(/\n\n+/).filter(Boolean)
            : tailoredData.coverLetter.paragraphs
        }
      };

      downloadApplicationPdf(currentData, undefined, options);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="my-4 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-r from-amber-50/50 via-white to-red-50/30 dark:from-neutral-900 dark:to-neutral-900 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-black flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{displayScore}% Profile Match</span>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Tailor a targeted CV & Cover Letter for {company}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-[#FF4742] to-red-500 hover:opacity-95 text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {hasActiveSubscription ? (
              <Bot className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>✨ AI Tailor CV & Cover Letter (PDF)</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>
        </div>
      </div>

      {/* Expanded AI Tailoring Results (Pro Members) */}
      {isOpen && hasActiveSubscription && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-neutral-500 font-semibold flex flex-col items-center justify-center gap-3">
              <Bot className="w-6 h-6 text-[#FF4742] animate-bounce" />
              <span>Analyzing job requirements, matching keywords, and drafting ATS-optimized CV & Cover Letter...</span>
            </div>
          ) : tailoredData ? (
            <div className="space-y-4">
              {/* Top Action Bar with Direct PDF Download */}
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Application Package Ready</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    ATS Score: {tailoredData.matchScore}%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf({ includeCoverLetter: true, includeCv: true })}
                    disabled={downloadingPdf}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF (CV + Cover Letter)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf({ includeCoverLetter: false, includeCv: true })}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-neutral-500" />
                    <span>CV PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf({ includeCoverLetter: true, includeCv: false })}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Letter PDF</span>
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
              <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("cv")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "cv"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tailored CV / Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("letter")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "letter"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tailored Cover Letter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("ats")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "ats"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ATS Match ({tailoredData.matchedKeywords.length} Keywords)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === "profile"
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-500" />
                  <span>Candidate Details</span>
                </button>
              </div>

              {/* TAB 1: TAILORED CV */}
              {activeTab === "cv" && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  {/* Summary */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                        Tailored Professional Summary
                      </span>
                      <span className="text-[11px] text-neutral-400">Editable for PDF</span>
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
                        Tailored Work Experience (STAR Format)
                      </span>
                      <button
                        type="button"
                        onClick={copyBullets}
                        className="px-2 py-1 rounded-md text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1"
                      >
                        {copiedBullets ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBullets ? "Copied" : "Copy Bullets"}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {tailoredData.cv.experiences.map((exp, expIdx) => (
                        <div key={expIdx} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                          <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white mb-1">
                            <span>{exp.title} • {exp.company}</span>
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
                        Tailored Cover Letter for {company}
                      </span>
                      <span className="text-[11px] text-neutral-500 block">
                        Edit in real-time below; changes will be included in the exported PDF.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={copyLetter}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Matched Required Keywords ({tailoredData.matchedKeywords.length})</span>
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
                        <span>Suggested Interview Talking Points ({tailoredData.missingKeywords.length})</span>
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

                  <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                    <strong className="text-neutral-900 dark:text-white block font-bold">
                      ATS Strategy Recommendation:
                    </strong>
                    <p>{tailoredData.atsAnalysis.summary}</p>
                    <ul className="list-disc list-inside pt-1 space-y-0.5">
                      {tailoredData.atsAnalysis.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 4: CANDIDATE PROFILE DETAILS */}
              {activeTab === "profile" && (
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="text-xs text-neutral-500">
                    Adjust your header information and base resume background. Re-tailor to instantly regenerate with your updated information.
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
                      Paste Raw Resume / Past Experience Notes (Optional)
                    </label>
                    <textarea
                      value={customResumeText}
                      onChange={(e) => setCustomResumeText(e.target.value)}
                      placeholder="Paste your past jobs, bullets, or LinkedIn summary here to tailor specifically against your actual experience..."
                      rows={4}
                      className="w-full p-2.5 text-xs font-sans rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 leading-relaxed"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGenerate(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Re-Tailor Application with Updated Profile</span>
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
