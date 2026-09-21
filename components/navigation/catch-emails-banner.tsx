"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Check, X } from "lucide-react";

export function CatchEmailsBanner() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const isClosed = sessionStorage.getItem("remoteok_catch_emails_closed");
    if (isClosed) setClosed(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubmitted(true);
    setTimeout(() => {
      setClosed(true);
      sessionStorage.setItem("remoteok_catch_emails_closed", "true");
    }, 2500);
  };

  const handleClose = () => {
    setClosed(true);
    sessionStorage.setItem("remoteok_catch_emails_closed", "true");
  };

  if (closed) return null;

  return (
    <aside aria-label="Job alerts subscription" className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 bg-neutral-900/95 dark:bg-neutral-950/95 text-white border-t border-neutral-800 backdrop-blur-md shadow-2xl transition-all">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#FF4742] items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base leading-snug">
              Get notified of high-paying remote jobs with #OpenSalaries
            </h2>
            <p className="text-xs text-neutral-400">
              Join 120,000+ remote workers getting hand-picked jobs delivered daily.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm py-1.5 px-4 bg-emerald-950/60 rounded-lg border border-emerald-800">
            <Check className="w-4 h-4" />
            <span>You&apos;re in! We&apos;ll email you new remote opportunities.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:border-[#FF4742] w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-[#FF4742] hover:bg-[#e03a35] text-white shrink-0 shadow transition-colors"
            >
              Get alerts
            </button>
            <Link
              href="/hire-remotely"
              className="hidden lg:inline-flex px-3.5 py-2 text-xs font-bold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 shrink-0 transition-colors"
            >
              Post a job
            </Link>
          </form>
        )}

        <button
          onClick={handleClose}
          aria-label="Close notification"
          className="absolute top-2 right-2 md:static md:top-auto md:right-auto text-neutral-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
