"use client";

import React, { useState, useMemo } from "react";
import {
  Job,
  PublicSectorCandidateData,
  CefrLevel,
} from "@/lib/types";
import { evaluateEligibility } from "@/lib/eligibility-engine";
import {
  downloadEuropassPdf,
  downloadEuropassXml,
} from "@/lib/europass-generator";
import { downloadUnP11Pdf } from "@/lib/un-p11-generator";
import {
  generatePublicSectorMotivationLetter,
  buildDocumentChecklist,
  generatePortalPrefillCode,
} from "@/lib/government-application-package";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Sparkles,
  Clock,
  Globe2,
  GraduationCap,
  Languages,
  BadgeCheck,
  Building2,
  Code2,
} from "lucide-react";

interface GovernmentEasyApplyModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export function GovernmentEasyApplyModal({
  job,
  isOpen,
  onClose,
}: GovernmentEasyApplyModalProps) {
  const [activeTab, setActiveTab] = useState<"eligibility" | "formats" | "motivation" | "autofill">("eligibility");
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // Candidate Profile State for Interactive Screening
  const [candidate, setCandidate] = useState<PublicSectorCandidateData>({
    fullName: "Alexandre Dupont",
    email: "alexandre.dupont@example.eu",
    phone: "+33 6 12 34 56 78",
    citizenship: "FR",
    degreeLevel: "Masters (EQF Level 7)",
    degreeTitle: "Master of Science in Computer Science & Public Systems",
    institution: "Sorbonne Université / KU Leuven",
    graduationYear: "2019",
    yearsOfExperience: 7,
    securityClearance: "None",
    languages: [
      { language: "English", level: "C1" as CefrLevel },
      { language: "French", level: "Native" as CefrLevel },
      { language: "German", level: "B1" as CefrLevel },
    ],
    currentTitle: "Senior Cloud & Systems Architect",
    currentEmployer: "European Digital Infrastructure Lab",
  });

  const evaluation = useMemo(() => {
    return evaluateEligibility(candidate, job);
  }, [candidate, job]);

  const motivationLetter = useMemo(() => {
    return generatePublicSectorMotivationLetter(candidate, job);
  }, [candidate, job]);

  const documentChecklist = useMemo(() => {
    return buildDocumentChecklist(job);
  }, [job]);

  const prefillCode = useMemo(() => {
    return generatePortalPrefillCode(candidate, job, motivationLetter);
  }, [candidate, job, motivationLetter]);

  if (!isOpen) return null;

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(motivationLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(prefillCode.script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(prefillCode.bookmarklet);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate deadline countdown
  let deadlineText = "Open";
  let isClosingSoon = false;
  if (job.applicationDeadline) {
    const diffMs = new Date(job.applicationDeadline).getTime() - Date.now();
    if (diffMs > 0) {
      const days = Math.floor(diffMs / (24 * 3600 * 1000));
      const hours = Math.floor((diffMs % (24 * 3600 * 1000)) / (3600 * 1000));
      if (days > 0) {
        deadlineText = `Closes in ${days}d ${hours}h`;
      } else {
        deadlineText = `Closing soon: ${hours}h left!`;
        isClosingSoon = true;
      }
    } else {
      deadlineText = "Deadline expired";
    }
  }

  const isEuJob = job.jurisdiction === "EU" || job.publicSectorType === "eu_institutions";
  const isUnJob = job.jurisdiction === "UN" || job.publicSectorType === "un_international";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#003399] via-[#002266] to-neutral-900 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            {job.agencyLogo ? (
              <img
                src={job.agencyLogo}
                alt={job.agency || job.company}
                className="w-12 h-12 rounded-xl bg-white/10 p-1 object-contain shrink-0 border border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 text-xl font-black">
                🏛️
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs font-bold text-amber-300">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{job.agency || job.company}</span>
                </span>
                {job.grade && (
                  <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white">
                    Grade {job.grade}
                  </span>
                )}
                {job.selectionRef && (
                  <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-white">
                    Ref: {job.selectionRef}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold ${
                  isClosingSoon
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-white/15 text-white"
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{deadlineText}</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white mt-1 leading-snug truncate">
                {job.title}
              </h2>

              <p className="text-xs text-white/80 mt-0.5 flex items-center gap-2">
                <span>⚡ Government &amp; Public Sector Easy Apply Assistant</span>
                <span>•</span>
                <span className="text-emerald-300 font-semibold">
                  {evaluation.matchScore}% Pre-Screening Fit
                </span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/15 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("eligibility")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "eligibility"
                  ? "bg-white text-neutral-900 shadow-md font-extrabold"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>1. Eligibility Pre-Check ({evaluation.matchScore}%)</span>
            </button>

            <button
              onClick={() => setActiveTab("formats")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "formats"
                  ? "bg-white text-neutral-900 shadow-md font-extrabold"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>2. Europass &amp; P11 Export</span>
            </button>

            <button
              onClick={() => setActiveTab("motivation")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "motivation"
                  ? "bg-white text-neutral-900 shadow-md font-extrabold"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Motivation &amp; Documents</span>
            </button>

            <button
              onClick={() => setActiveTab("autofill")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "autofill"
                  ? "bg-white text-neutral-900 shadow-md font-extrabold"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>4. Portal 1-Click Autofill</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-neutral-900 dark:text-neutral-100">
          {/* TAB 1: ELIGIBILITY & SCREENING PRE-CHECK */}
          {activeTab === "eligibility" && (
            <div className="space-y-6">
              {/* Match Score Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                evaluation.status === "eligible"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                  : evaluation.status === "warning"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                  : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800"
              }`}>
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                    evaluation.status === "eligible"
                      ? "bg-emerald-500 text-white"
                      : evaluation.status === "warning"
                      ? "bg-amber-500 text-white"
                      : "bg-red-500 text-white"
                  }`}>
                    {evaluation.matchScore}%
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg">
                      {evaluation.status === "eligible"
                        ? "Statutory Match: Eligible to Apply"
                        : evaluation.status === "warning"
                        ? "Potential Restrictions: Review Required"
                        : "Statutory Restriction Detected"}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                      {evaluation.status === "eligible"
                        ? "Your candidate profile satisfies the nationality, education, and language standards of this vacancy."
                        : evaluation.status === "warning"
                        ? "You meet the core requirements but specific language certification or security vetting conditions apply."
                        : "This selection procedure has strict statutory criteria that may preclude application."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    evaluation.status === "eligible"
                      ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                      : evaluation.status === "warning"
                      ? "bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                      : "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }`}>
                    {evaluation.status}
                  </span>
                </div>
              </div>

              {/* 5-Point Civil Service Screening Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Nationality */}
                <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <Globe2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Nationality &amp; Citizenship</span>
                    </span>
                    {evaluation.criteria.citizenship.status === "pass" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                      </span>
                    ) : evaluation.criteria.citizenship.status === "warning" ? (
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Review
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Ineligible
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {evaluation.criteria.citizenship.message}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Required: {evaluation.criteria.citizenship.requirement}
                  </div>
                </div>

                {/* 2. Degree & EQF */}
                <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <GraduationCap className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Education &amp; EQF Level</span>
                    </span>
                    {evaluation.criteria.degree.status === "pass" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Equivalence
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {evaluation.criteria.degree.message}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Required: {evaluation.criteria.degree.requirement}
                  </div>
                </div>

                {/* 3. Multilingual CEFR */}
                <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <Languages className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Official CEFR Languages</span>
                    </span>
                    {evaluation.criteria.languages.status === "pass" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Action
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {evaluation.criteria.languages.message}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Required: {evaluation.criteria.languages.requirement}
                  </div>
                </div>

                {/* 4. Security Clearance */}
                <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Security Vetting Clearance</span>
                    </span>
                    {evaluation.criteria.clearance.status === "pass" ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Vetting
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {evaluation.criteria.clearance.message}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Required: {evaluation.criteria.clearance.requirement}
                  </div>
                </div>
              </div>

              {/* Interactive Candidate Profile Adjuster */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                    🛠️ Adjust Your Profile Credentials for Real-Time Re-Check
                  </h4>
                  <span className="text-[11px] text-neutral-400">Instant updates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Citizenship
                    </label>
                    <select
                      value={candidate.citizenship}
                      onChange={(e) => setCandidate({ ...candidate, citizenship: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                    >
                      <option value="FR">🇫🇷 France (EU)</option>
                      <option value="DE">🇩🇪 Germany (EU)</option>
                      <option value="IT">🇮🇹 Italy (EU)</option>
                      <option value="ES">🇪🇸 Spain (EU)</option>
                      <option value="NL">🇳🇱 Netherlands (EU)</option>
                      <option value="BE">🇧🇪 Belgium (EU)</option>
                      <option value="UK">🇬🇧 United Kingdom</option>
                      <option value="US">🇺🇸 United States</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="OTHER">🌍 Other International</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Education Level (EQF)
                    </label>
                    <select
                      value={candidate.degreeLevel}
                      onChange={(e) => setCandidate({ ...candidate, degreeLevel: e.target.value })}
                      className="w-full h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                    >
                      <option value="Doctorate (EQF Level 8)">Doctorate / PhD (EQF 8)</option>
                      <option value="Masters (EQF Level 7)">Master&apos;s Degree (EQF 7)</option>
                      <option value="Bachelors (EQF Level 6)">Bachelor&apos;s Degree (EQF 6)</option>
                      <option value="Diploma (EQF Level 5)">Associate / Diploma (EQF 5)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 block mb-1">
                      Professional Experience
                    </label>
                    <select
                      value={candidate.yearsOfExperience}
                      onChange={(e) => setCandidate({ ...candidate, yearsOfExperience: Number(e.target.value) })}
                      className="w-full h-8 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold"
                    >
                      <option value={2}>2 Years</option>
                      <option value={4}>4 Years</option>
                      <option value={6}>6 Years</option>
                      <option value={8}>8 Years</option>
                      <option value={10}>10+ Years</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDARDIZED FORMAT EXPORTER (EUROPASS & UN P.11) */}
          {activeTab === "formats" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-sm">
                  🇪🇺 Official European &amp; International Dossier Generator
                </span>
                <p>
                  European Union institutions (EPSO) mandate Europass XML/PDF formatting.
                  United Nations bodies (Inspira) require the standardized Form P.11 personal history profile.
                  Both are generated natively here in one click.
                </p>
              </div>

              {/* Download Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Europass PDF */}
                <div className="p-4 rounded-2xl border-2 border-[#003399]/40 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center gap-2 text-[#003399] dark:text-blue-400 font-extrabold text-sm">
                    <Download className="w-4 h-4" />
                    <span>Europass CV (PDF)</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Official European Blue &amp; Gold header, CEFR linguistic grid, and EQF degree qualifications.
                  </p>
                  <button
                    onClick={() => downloadEuropassPdf(candidate, job)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-[#003399] hover:bg-[#002266] text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Europass PDF</span>
                  </button>
                </div>

                {/* Europass XML */}
                <div className="p-4 rounded-2xl border-2 border-amber-400/40 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                    <Code2 className="w-4 h-4" />
                    <span>Europass XML Format</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Machine-readable XML for automated ingestion into EPSO and European Commission application portals.
                  </p>
                  <button
                    onClick={() => downloadEuropassXml(candidate, job)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Download Europass XML</span>
                  </button>
                </div>

                {/* UN P.11 Profile */}
                <div className="p-4 rounded-2xl border-2 border-[#009EDB]/40 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center gap-2 text-[#009EDB] font-extrabold text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>UN P.11 Profile (PDF)</span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Official United Nations Form P.11 compliant with UN Secretariat, Inspira, and UNICEF standards.
                  </p>
                  <button
                    onClick={() => downloadUnP11Pdf(candidate, job)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-[#009EDB] hover:bg-[#0087be] text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download UN P.11 PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOTIVATION LETTER & DOCUMENT CHECKLIST */}
          {activeTab === "motivation" && (
            <div className="space-y-6">
              {/* Motivation Letter Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    🏛️ Official Civil Service Motivation Letter
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Addressed to the Appointing Authority referencing notice {job.selectionRef || "EPSO/AD"}
                  </p>
                </div>

                <button
                  onClick={handleCopyLetter}
                  className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLetter ? "Copied Letter!" : "Copy Motivation Letter"}</span>
                </button>
              </div>

              {/* Motivation Letter Preview */}
              <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-all">
                {motivationLetter}
              </div>

              {/* Required Documents Checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  📑 Mandatory Document Checklist for {job.jurisdiction || "European"} Selection Board
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {documentChecklist.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        checkedDocs[doc.id]
                          ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-400"
                          : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border ${
                        checkedDocs[doc.id]
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-neutral-300 dark:border-neutral-700"
                      }`}>
                        {checkedDocs[doc.id] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-neutral-900 dark:text-white">
                            {doc.label}
                          </span>
                          {doc.mandatory && (
                            <span className="text-[10px] font-black uppercase text-red-500">
                              *Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 1-CLICK PORTAL AUTOFILL HELPER */}
          {activeTab === "autofill" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-sm">
                  ⚡ 1-Click Form Autofill for Official Government Portals
                </span>
                <p>
                  Most official agencies (EPSO, UN Inspira, EURES, USAJOBS) do not permit external API writes.
                  Use our verified <strong>Browser Bookmarklet</strong> or <strong>Prefill Script</strong> to populate your name, credentials, CEFR languages, and motivation letter with zero repetitive typing!
                </p>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method A: Bookmarklet */}
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-[#003399] dark:text-blue-400">
                    Option A: Drag-and-Drop Bookmarklet
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Drag the button below to your browser bookmarks bar. When on the government portal form, click the bookmark to auto-fill every field!
                  </p>

                  <div className="pt-2">
                    <a
                      href={prefillCode.bookmarklet}
                      onClick={(e) => {
                        e.preventDefault();
                        handleCopyBookmarklet();
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-[#003399] hover:bg-[#002266] text-white shadow-md cursor-grab active:scale-95 transition-all"
                      title="Drag to bookmarks bar or click to copy"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{copiedBookmarklet ? "Bookmarklet URL Copied!" : "⚡ Remotework Easy Apply Bookmarklet"}</span>
                    </a>
                  </div>
                </div>

                {/* Method B: Console Script */}
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Option B: 1-Click Clipboard Script
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Copy this pre-fill snippet, open Developer Tools (F12) on the portal page, paste into the Console, and press Enter.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleCopyScript}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? "Script Copied to Clipboard!" : "Copy 1-Click Prefill Script"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Portal Launch */}
              <div className="p-5 rounded-2xl border-2 border-emerald-400/80 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    Ready to Apply on Official Portal?
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Opens direct deep-link to {job.agency || job.company} vacancy notice page.
                  </p>
                </div>

                <a
                  href={job.originalApplyUrl || job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
                >
                  <span>Open Official Vacancy Notice</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 px-6 bg-neutral-100 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 shrink-0">
          <span>
            Target Portal: <strong>{job.agency || job.company}</strong> ({job.portalType?.toUpperCase() || "GOV"})
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              Close
            </button>

            <a
              href={job.originalApplyUrl || job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#FF4742] hover:bg-[#e03a35] text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Launch Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
