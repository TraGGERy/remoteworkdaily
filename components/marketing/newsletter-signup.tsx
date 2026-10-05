"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

interface NewsletterSignupProps {
  variant?: "card" | "banner" | "compact";
  className?: string;
}

export function NewsletterSignup({ variant = "card", className = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), category }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className={`p-6 sm:p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">You&apos;re Subscribed! 🚀</h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1 max-w-md mx-auto">
          We sent a confirmation to <span className="font-semibold text-neutral-900 dark:text-white">{email}</span>. You&apos;ll receive tomorrow morning&apos;s fresh verified remote jobs before they get crowded.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-neutral-900 text-white p-6 sm:p-10 border border-neutral-800 shadow-xl ${className}`}>
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF4742]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4742]/10 text-[#FF4742] border border-[#FF4742]/20 text-xs font-bold mb-3">
          <Sparkles className="w-3 h-3" />
          <span>Daily Verified Job Alerts</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
          Never miss a high-paying <span className="text-[#FF4742]">remote job</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2 mb-6">
          Over 500+ verified remote jobs ingested daily from company ATS systems (GitLab, Supabase, Linear). Transparent salaries, direct links, zero recruiter spam.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto">
          <div className="relative w-full">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work or personal email..."
              required
              disabled={status === "loading"}
              className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm rounded-xl bg-neutral-800/90 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:border-[#FF4742] transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl bg-[#FF4742] hover:bg-[#ff342f] text-white font-bold text-xs sm:text-sm transition-colors shadow-lg shadow-[#FF4742]/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {status === "loading" ? "Subscribing..." : "Get Free Alerts"}
          </button>
        </form>

        {status === "error" && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <p className="text-[11px] text-neutral-500 mt-3">
          Join 120,000+ remote professionals. Unsubscribe anytime in 1 click.
        </p>
      </div>
    </div>
  );
}
