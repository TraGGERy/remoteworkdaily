"use client";

import React, { useState } from "react";
import { Mail, Lock, Copy, Check, Sparkles, Send } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

interface HrContactCardProps {
  employerEmail?: string | null;
  companyName: string;
  jobTitle: string;
}

export function HrContactCard({ employerEmail, companyName, jobTitle }: HrContactCardProps) {
  const { hasActiveSubscription, openUpgradeModal } = useSubscription();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

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

  const coldEmailTemplate = `Subject: Application for ${jobTitle} — Experienced Candidate

Hi Hiring Team at ${companyName},

I came across your open ${jobTitle} role on Remote Work Daily and wanted to reach out directly to express my enthusiasm.

With strong hands-on experience in high-impact product execution and distributed teamwork, I am eager to help ${companyName} hit its upcoming milestones.

I have submitted my application through your careers portal and attached my background highlights. Would love to connect briefly if my profile aligns with your team's current focus.

Best regards,
Candidate`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(cleanEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(coldEmailTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/50 dark:bg-sky-950/20 my-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              📬 Direct HR Contact Available
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Verified recruiter & hiring manager inbox for {companyName}
            </p>
          </div>
        </div>

        {hasActiveSubscription ? (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">
            Pro Unlocked
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            <span>Pro Feature</span>
          </span>
        )}
      </div>

      {hasActiveSubscription ? (
        /* PRO UNLOCKED VIEW */
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200 select-all">
              {cleanEmail}
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-[#FF4742] dark:hover:bg-[#FF4742] dark:hover:text-white transition-colors flex items-center gap-1"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? "Copied Email" : "Copy Email"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTemplate}
              className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              {copiedTemplate ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{copiedTemplate ? "Copied Cold Outreach Template!" : "Copy 1-Click Cold Outreach Template"}</span>
            </button>
          </div>
        </div>
      ) : (
        /* FREE OBFUSCATED VIEW */
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-extrabold text-neutral-500 blur-[2px] select-none">
              {obfuscateEmail(cleanEmail)}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">
              (Masked for Free tier)
            </span>
          </div>

          <button
            type="button"
            onClick={openUpgradeModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-[#FF4742] hover:opacity-95 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Unlock Direct HR Email & Template</span>
          </button>
        </div>
      )}
    </div>
  );
}
