"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("general");
  const [companyAtsUrl, setCompanyAtsUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Simulate/submit support request
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSubmitted(true);
    } catch {
      setErrorMessage("Something went wrong while submitting. Please email us directly at support@remoteworkdaily.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
          Message Received!
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
          Thank you for contacting Remote Work Daily. Our team has received your note and will get back to you within 24 business hours at <strong>{email}</strong>.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setMessage("");
            setCompanyAtsUrl("");
          }}
          className="text-xs font-semibold text-[#FF4742] hover:underline pt-2 inline-block"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-5">
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
        Send Us a Message
      </h3>
      <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        Fill out the form below and a member of our editorial or support team will respond promptly.
      </p>

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Your Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@company.com"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
          Inquiry Type *
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
        >
          <option value="general">General Inquiry</option>
          <option value="employer">Employer Job Posting & Invoicing</option>
          <option value="ats">Submit Company Career Page / ATS Feed (Free)</option>
          <option value="candidate">Candidate Pass & Subscription Support</option>
          <option value="report">Report Broken Link or Ghost Listing</option>
          <option value="press">Press & Research Partnership</option>
        </select>
      </div>

      {topic === "ats" && (
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
            Company Careers / ATS URL (Greenhouse, Lever, Ashby, etc.) *
          </label>
          <input
            type="url"
            required
            value={companyAtsUrl}
            onChange={(e) => setCompanyAtsUrl(e.target.value)}
            placeholder="https://boards.greenhouse.io/yourcompany"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742]"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
          Message *
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can our team help you?"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4742] resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-[#FF4742] hover:bg-[#e03a35] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
