"use client";

import React, { useState } from "react";
import { Mail, Lock, Copy, Check, Send, ExternalLink, Video, Target, TrendingUp } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

interface HrContactCardProps {
  employerEmail?: string | null;
  companyName: string;
  jobTitle: string;
}

type OutreachAngle = "sniper_dm" | "cold_email" | "loom_pitch";

export function HrContactCard({ employerEmail, companyName, jobTitle }: HrContactCardProps) {
  const { hasActiveSubscription, openUpgradeModal } = useSubscription();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [activeAngle, setActiveAngle] = useState<OutreachAngle>("sniper_dm");

  // If no email exists, generate domain fallback for HR reach
  const cleanEmail = employerEmail || `careers@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  // Obfuscate email for non-paying users: e.g. c*****s@company.com
  const obfuscateEmail = (email: string) => {
    const parts = email.split("@");
    if (parts.length !== 2) return "h*****g@company.com";
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name.charAt(0)}*@${domain}`;
    return `${name.charAt(0)}${"*".repeat(Math.max(3, name.length - 2))}${name.slice(-1)}@${domain}`;
  };

  // Targeted LinkedIn & Funding Search URLs ("The Sniper & Hidden Market Approach")
  const hiringManagerSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${companyName} ("Head of Engineering" OR "Engineering Manager" OR "CTO" OR "VP" OR "Founder")`
  )}`;
  const recruiterSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
    `${companyName} ("Technical Recruiter" OR "Talent Acquisition" OR "Head of People")`
  )}`;
  const fundingSignalsUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `"${companyName}" (raised OR funding OR seed OR "series a" OR "series b" OR hiring)`
  )}`;

  const outreachTemplates: Record<OutreachAngle, { title: string; badge: string; body: string }> = {
    sniper_dm: {
      title: "⚡ Founder / Hiring Manager Sniper DM",
      badge: "Best for LinkedIn / X / Discord",
      body: `Hi [Name] — saw ${companyName} just opened the ${jobTitle} role. I've shipped production systems in this exact stack and put together a tailored breakdown of how I can contribute in my first 30 days. Just submitted via your portal — worth a quick 5-min chat this week?`,
    },
    cold_email: {
      title: "📬 High-Signal Cold Email (A/B Tested)",
      badge: "Subject: ${jobTitle} — Immediate Impact at ${companyName}",
      body: `Subject: ${jobTitle} at ${companyName} — High-Ownership Candidate

Hi ${companyName} Hiring Team,

I noticed your open ${jobTitle} role on Remote Work Daily and wanted to reach out directly before your inbox floods with generic applications.

In my recent remote roles, I've focused on shipping high-reliability systems, reducing cycle times, and collaborating asynchronously across time zones.

I have applied directly through your career portal and attached my tailored CV. Let me know if we can connect for 10 minutes this week.

Best regards,
[Your Name]`,
    },
    loom_pitch: {
      title: "🎥 60-Second Loom Video Pitch Companion",
      badge: "5–10x Higher Callback Rate",
      body: `Subject: Recorded a 60-sec Loom for ${companyName}'s ${jobTitle} role 🎥

Hi [Name],

Instead of just sending another static PDF into your ATS, I recorded a 60-second Loom video walking through how my recent work maps directly to ${companyName}'s ${jobTitle} roadmap:

👉 [Insert Your 60-Sec Loom Link Here]

I also submitted my formal application via your careers portal. Hope the quick video saves you time!

Best,
[Your Name]`,
    },
  };

  const currentTemplate = outreachTemplates[activeAngle].body;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(cleanEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(currentTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 my-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>🎯 Direct Sniper Outreach & Decision-Maker Kit</span>
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Bypass the 500+ applicant ATS black hole — reach {companyName}&apos;s hiring team directly
            </p>
          </div>
        </div>

        {hasActiveSubscription ? (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
            Pro Unlocked
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-black uppercase">
            Sniper Kit Active
          </span>
        )}
      </div>

      {/* 1-Click Decision Maker & Hidden Market Shortcuts (Available to ALL users) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <a
          href={hiringManagerSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-sky-500 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between gap-1.5 transition-all shadow-2xs"
        >
          <span className="truncate">🔍 Find Hiring Manager</span>
          <ExternalLink className="w-3 h-3 text-sky-500 shrink-0" />
        </a>
        <a
          href={recruiterSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-sky-500 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between gap-1.5 transition-all shadow-2xs"
        >
          <span className="truncate">🎯 Find Tech Recruiter</span>
          <ExternalLink className="w-3 h-3 text-sky-500 shrink-0" />
        </a>
        <a
          href={fundingSignalsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-between gap-1.5 transition-all shadow-2xs"
        >
          <span className="truncate flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Funding & Growth News</span>
          </span>
          <ExternalLink className="w-3 h-3 text-emerald-500 shrink-0" />
        </a>
      </div>

      {/* Outreach Angle Selector (Sniper DM vs Cold Email vs Loom Pitch) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveAngle("sniper_dm")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeAngle === "sniper_dm"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
            }`}
          >
            ⚡ CEO / Lead Sniper DM
          </button>
          <button
            type="button"
            onClick={() => setActiveAngle("loom_pitch")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              activeAngle === "loom_pitch"
                ? "bg-[#FF4742] text-white shadow-xs"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
            }`}
          >
            <Video className="w-3 h-3" />
            <span>60s Loom Video Pitch</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveAngle("cold_email")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeAngle === "cold_email"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
            }`}
          >
            📬 Cold Email (A/B Tested)
          </button>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
              {outreachTemplates[activeAngle].title}
            </span>
            <button
              type="button"
              onClick={handleCopyTemplate}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold transition-all flex items-center gap-1"
            >
              {copiedTemplate ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
              <span>{copiedTemplate ? "Copied Pitch!" : "Copy Pitch"}</span>
            </button>
          </div>
          <pre className="text-xs font-sans text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80">
            {currentTemplate}
          </pre>
        </div>
      </div>

      {/* Direct HR Email Inbox Row */}
      {hasActiveSubscription ? (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200 select-all">
              {cleanEmail}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-[#FF4742] dark:hover:bg-[#FF4742] dark:hover:text-white transition-colors flex items-center gap-1"
          >
            {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEmail ? "Copied Email" : "Copy Direct Email"}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-mono text-xs font-extrabold text-neutral-500 blur-[2px] select-none">
              {obfuscateEmail(cleanEmail)}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">
              (Direct HR Inbox)
            </span>
          </div>

          <button
            type="button"
            onClick={openUpgradeModal}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-[#FF4742] hover:opacity-95 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Lock className="w-3 h-3" />
            <span>Unlock Direct HR Email</span>
          </button>
        </div>
      )}
    </div>
  );
}

