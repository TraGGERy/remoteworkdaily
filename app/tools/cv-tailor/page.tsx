import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, FileText, Bot } from "lucide-react";
import { AiCvTailorStudio } from "@/components/tools/ai-cv-tailor-studio";

export const metadata: Metadata = {
  title: "Free AI CV & Cover Letter Generator (PDF) | Tailor Resume to Job Description",
  description:
    "Tailor your CV and cover letter to any specific remote job posting using AI. Extract ATS keywords, craft high-impact STAR achievement bullet points, and download as an executive PDF.",
  keywords: [
    "ai resume tailor",
    "tailor cv to job description",
    "ai cover letter generator",
    "ats resume scanner",
    "download cv pdf",
    "remote job application generator",
    "star method resume generator"
  ],
  openGraph: {
    title: "AI CV & Cover Letter Generator | Remote Work Daily",
    description:
      "Craft a tailored CV and cover letter for any specific remote job posting. Match ATS keywords and export directly to PDF.",
    url: "https://remoteworkdaily.com/tools/cv-tailor",
    siteName: "Remote Work Daily",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI CV & Cover Letter Generator (PDF)",
    description: "Tailor your CV and cover letter for any specific job posting with AI."
  }
};

export default function AiCvTailorPage() {
  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI CV & Cover Letter Tailor",
    url: "https://remoteworkdaily.com/tools/cv-tailor",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    description:
      "AI-powered tool that evaluates a job description, matches relevant skills, crafts tailored achievement bullet points and cover letter, and generates an ATS-ready PDF."
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all remote jobs</span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="py-24 text-center text-sm font-semibold text-neutral-400 flex flex-col items-center justify-center gap-2">
            <Bot className="w-6 h-6 animate-spin text-[#FF4742]" />
            <span>Loading AI CV Studio...</span>
          </div>
        }
      >
        <AiCvTailorStudio />
      </Suspense>
    </div>
  );
}
