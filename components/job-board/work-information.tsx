"use client";

import React from "react";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

interface WorkInformationProps {
  description: string;
  isGated?: boolean;
  onUnlockClick?: () => void;
}

/**
 * Cleans HTML entities and strips third-party aggregator spam/backlinks.
 */
export function cleanJobDescription(rawHtml: string): string {
  if (!rawHtml) return "";

  let cleaned = rawHtml
    // Decode common entities
    .replace(/&#x26;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    // Strip trailing aggregator promotional backlinks (e.g. Arbeitnow)
    .replace(/(?:<p>)?\s*Find more.*?on Arbeitnow.*?(?:<\/p>|<\/a>|$)/gi, "")
    .replace(/<p>.*?Find more <a[^>]*>.*?<\/a>.*?(?:<\/p>|<\/a>|$)/gi, "")
    .replace(/<a\s+href="https?:\/\/(?:www\.)?arbeitnow\.com[^"]*"[^>]*>.*?<\/a>/gi, "")
    .replace(/<\/a>\s*<\/a>/gi, "</a>")
    .trim();

  // If the description is plain text without HTML tags, wrap paragraphs in <p>
  if (!cleaned.includes("<p>") && !cleaned.includes("<br>") && !cleaned.includes("<div>")) {
    cleaned = cleaned
      .split(/\n\s*\n/)
      .map((para) => `<p>${para.trim().replace(/\n/g, "<br />")}</p>`)
      .join("");
  }

  return cleaned;
}

export function WorkInformation({
  description,
  isGated = false,
  onUnlockClick,
}: WorkInformationProps) {
  const { hasActiveSubscription, openUpgradeModal } = useSubscription();
  const cleaned = cleanJobDescription(description);

  // If gating is active and the user is NOT a subscriber
  const shouldGate = isGated && !hasActiveSubscription;

  const handleUnlock = () => {
    if (onUnlockClick) {
      onUnlockClick();
    } else {
      openUpgradeModal();
    }
  };

  return (
    <div className="relative">
      {/* Rich Text Body */}
      <div
        className={`prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed
          prose-headings:font-black prose-headings:text-neutral-900 dark:prose-headings:text-white prose-headings:tracking-tight
          prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-neutral-100 dark:prose-h2:border-neutral-800 prose-h2:pb-2
          prose-h3:text-base sm:prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
          prose-p:my-3 prose-p:leading-relaxed
          prose-ul:my-3 prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1.5
          prose-li:text-neutral-700 dark:prose-li:text-neutral-300
          prose-strong:text-neutral-900 dark:prose-strong:text-white prose-strong:font-extrabold
          prose-a:text-[#FF4742] hover:prose-a:underline
          ${shouldGate ? "max-h-[340px] overflow-hidden select-none" : ""}
        `}
        dangerouslySetInnerHTML={{ __html: cleaned }}
      />

      {/* Subscription Paywall Overlay */}
      {shouldGate && (
        <div className="absolute inset-x-0 bottom-0 pt-32 pb-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-neutral-900 dark:via-neutral-900/95 dark:to-transparent flex flex-col items-center justify-end text-center z-10">
          <div className="max-w-md w-full p-5 sm:p-6 rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-950/30 backdrop-blur-md shadow-xl space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 mb-1 border border-amber-300/40">
                <Sparkles className="w-3 h-3" />
                <span>Subscriber Exclusive</span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white">
                Unlock Complete Job Details & Direct Apply
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Full technical requirements, interview process breakdown, and direct ATS application links are reserved for active subscribers.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUnlock}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock with Remote Hunter Pass ($39 One-Time)</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>60-Day Guarantee</span>
              </span>
              <span>•</span>
              <span>Never Auto-Renews</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
