"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useSubscription } from "@/components/auth/subscription-context";
import { useAppAuth } from "@/components/auth/auth-provider";
import { ExternalLink, Lock, Sparkles, CheckCircle2, UserCheck } from "lucide-react";

interface GatedApplyActionProps {
  jobId: string;
  jobTitle: string;
  company: string;
  applyUrl: string;
  variant?: "header" | "floating" | "inline";
  onApplySuccess?: () => void;
}

export function GatedApplyAction({
  jobId,
  jobTitle,
  company,
  applyUrl,
  variant = "inline",
  onApplySuccess,
}: GatedApplyActionProps) {
  const { isConfigured } = useAppAuth();
  const { isSignedIn, hasActiveSubscription, openUpgradeModal } = useSubscription();
  const [hasApplied, setHasApplied] = useState(false);

  const handleApplyClick = () => {
    setHasApplied(true);
    // Track apply event on server
    fetch(`/api/jobs/${jobId}/apply`, { method: "POST" }).catch(() => {});
    if (onApplySuccess) onApplySuccess();
  };

  // 1. STATE: Active Subscriber (UNLOCKED)
  if (isSignedIn && hasActiveSubscription) {
    if (variant === "header") {
      return (
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleApplyClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/25 active:scale-95 transition-all"
        >
          <span>{hasApplied ? "Open Application Portal" : "Apply for this job"}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    }

    if (variant === "floating") {
      return (
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleApplyClick}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-extrabold bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/30 transition-transform active:scale-95"
        >
          <span>Apply for this job</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    }

    // Inline variant (bottom of description)
    return (
      <div className="w-full p-6 rounded-2xl border border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Active Subscription Verified</span>
        </div>
        <h4 className="text-lg font-black text-neutral-900 dark:text-white">
          Direct ATS Application Link Unlocked
        </h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          As an active subscriber, you have priority access to {company}&apos;s verified application link.
        </p>
        <div className="pt-2 flex justify-center">
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApplyClick}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all"
          >
            <span>Apply now on {company} Careers</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  }

  // 2. STATE: Signed In, but NO Active Subscription (LOCKED - PAYWALL)
  if (isSignedIn && !hasActiveSubscription) {
    if (variant === "header") {
      return (
        <button
          type="button"
          onClick={openUpgradeModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black bg-gradient-to-r from-amber-500 to-[#FF4742] hover:opacity-95 text-white shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
        >
          <Lock className="w-4 h-4" />
          <span>Subscribe to Apply</span>
        </button>
      );
    }

    if (variant === "floating") {
      return (
        <button
          type="button"
          onClick={openUpgradeModal}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-extrabold bg-gradient-to-r from-amber-500 to-[#FF4742] hover:opacity-95 text-white shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
        >
          <Lock className="w-4 h-4" />
          <span>Subscribe to Apply</span>
        </button>
      );
    }

    // Inline variant
    return (
      <div className="w-full p-6 sm:p-8 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-gradient-to-b from-amber-50/80 to-white dark:from-neutral-900 dark:to-neutral-900 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/50 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Subscription Required</span>
          </div>
          <h3 className="text-xl font-black text-neutral-900 dark:text-white">
            Unlock Direct Application to {company}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mt-1">
            This verified remote opening is reserved for members with an active subscription. Unlock direct recruiter links, salary negotiation playbooks, and early-bird alerts.
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={openUpgradeModal}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Get Hunter Pass ($39 One-Time) to Apply</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 font-medium pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero recurring commitments</span>
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>60-Day Interview Guarantee</span>
          </span>
        </div>
      </div>
    );
  }

  // 3. STATE: Signed Out (LOCKED - AUTH REQUIRED)
  if (variant === "header") {
    if (isConfigured) {
      return (
        <SignInButton mode="modal">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-md active:scale-95 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Sign in to Apply</span>
          </button>
        </SignInButton>
      );
    }
    return (
      <Link
        href="/sign-in"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-md active:scale-95 transition-all"
      >
        <Lock className="w-4 h-4" />
        <span>Sign in to Apply</span>
      </Link>
    );
  }

  if (variant === "floating") {
    if (isConfigured) {
      return (
        <SignInButton mode="modal">
          <button
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-extrabold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-transform active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>Sign in to Apply</span>
          </button>
        </SignInButton>
      );
    }
    return (
      <Link
        href="/sign-in"
        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-extrabold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-transform active:scale-95"
      >
        <Lock className="w-4 h-4" />
        <span>Sign in to Apply</span>
      </Link>
    );
  }

  // Inline variant
  return (
    <div className="w-full p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 shadow-lg text-center space-y-4">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center">
        <Lock className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-black text-neutral-900 dark:text-white">
          Subscriber-Only Opportunity
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mt-1">
          Only registered candidates with an active subscription can apply directly to verified remote positions on Remote Work Daily.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        {isConfigured ? (
          <SignInButton mode="modal">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Sign in to Apply</span>
            </button>
          </SignInButton>
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/25 active:scale-95 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Sign in to Apply</span>
          </Link>
        )}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Don&apos;t have an account?{" "}
        {isConfigured ? (
          <SignInButton mode="modal">
            <button className="font-bold text-[#FF4742] hover:underline">
              Create one now
            </button>
          </SignInButton>
        ) : (
          <Link href="/sign-up" className="font-bold text-[#FF4742] hover:underline">
            Create one now
          </Link>
        )}
      </p>
    </div>
  );
}
