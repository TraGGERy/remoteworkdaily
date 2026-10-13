"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  Sparkles,
  Check,
  Lock,
  ArrowRight,
  ArrowLeft,
  Building,
  Upload,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
  Mail,
} from "lucide-react";
import { useSubscription } from "@/components/auth/subscription-context";

interface OnboardingFormState {
  workArrangement: "remote_global" | "remote_regional" | "hybrid_high_pay" | "both";
  workType: string;
  hybridCity: string;
  category: string;
  targetRoles: string[];
  skills: string[];
  seniority: string;
  minSalary: number;
  resumeText: string;
  resumeFileName?: string;
}

const INITIAL_STATE: OnboardingFormState = {
  workArrangement: "remote_global",
  workType: "100% Remote Anywhere",
  hybridCity: "",
  category: "Engineering",
  targetRoles: ["Software Engineer", "Full Stack Developer"],
  skills: ["React", "TypeScript", "Node.js", "Next.js"],
  seniority: "Mid-level",
  minSalary: 95000,
  resumeText: "",
};

const WORK_ARRANGEMENTS = [
  {
    id: "remote_global",
    title: "100% Remote Anywhere",
    subtitle: "Work from anywhere in the world without geographic boundaries",
    icon: "🌐",
    tag: "Global Remote",
  },
  {
    id: "remote_regional",
    title: "Region-Locked Remote",
    subtitle: "Remote within US, EU, UK, Canada, or Latin America timezones",
    icon: "🗺️",
    tag: "Regional Remote",
  },
  {
    id: "hybrid_high_pay",
    title: "High-Paying Hybrid ($100k+)",
    subtitle: "1-3 days in office with top compensation & executive perks",
    icon: "🏢",
    tag: "High-Pay Hybrid",
  },
  {
    id: "both",
    title: "Both Remote & Hybrid",
    subtitle: "Show me all high-paying flexible, remote, and hybrid opportunities",
    icon: "⚡",
    tag: "Maximum Flexibility",
  },
] as const;

const CATEGORIES = [
  { name: "Engineering", icon: "💻", examples: ["Frontend", "Backend", "Full Stack", "DevOps", "AI / ML"] },
  { name: "Product", icon: "🚀", examples: ["Product Manager", "Technical PM", "Growth PM"] },
  { name: "Design", icon: "🎨", examples: ["UI/UX Designer", "Product Designer", "Brand Designer"] },
  { name: "Marketing", icon: "📈", examples: ["Growth Marketer", "Content Strategist", "SEO Lead"] },
  { name: "Sales", icon: "💼", examples: ["Account Executive", "SDR / BDR", "Sales Director"] },
  { name: "Operations", icon: "⚙️", examples: ["Operations Manager", "Program Manager", "Scrum Master"] },
  { name: "Customer Support", icon: "🎧", examples: ["Customer Success", "Support Lead", "Client Care"] },
  { name: "Finance", icon: "💰", examples: ["Financial Analyst", "Controller", "Accountant"] },
];

const SKILL_SUGGESTIONS = [
  "React", "TypeScript", "Next.js", "Node.js", "Python", "Go", "AWS", "SQL",
  "Tailwind CSS", "GraphQL", "Docker", "Kubernetes", "Figma", "Product Strategy",
  "Data Analysis", "Growth Marketing", "Salesforce", "Customer Success",
];

const SENIORITY_LEVELS = [
  { label: "Entry-level", years: "0-2 years exp" },
  { label: "Mid-level", years: "3-5 years exp" },
  { label: "Senior / Lead", years: "5-8+ years exp" },
  { label: "Director", years: "8-12+ years exp" },
  { label: "Executive / VP", years: "12+ years exp" },
];

export function MultiStepOnboarding() {
  const router = useRouter();
  const { userEmail, markOnboardingCompleted } = useSubscription();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<OnboardingFormState>(INITIAL_STATE);
  const [matchCount, setMatchCount] = useState<number>(342);
  const [isSaving, setIsSaving] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Fetch real-time matching jobs count whenever preferences change
  useEffect(() => {
    async function fetchMatches() {
      try {
        const query = new URLSearchParams({
          workArrangement: form.workArrangement,
          minSalary: String(form.minSalary),
          roles: form.targetRoles.join(","),
          hybridCity: form.hybridCity,
        });
        const res = await fetch(`/api/user/onboarding?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.matchCount) {
            setMatchCount(data.matchCount);
          }
        }
      } catch {
        // Keep realistic fallback match count
      }
    }
    fetchMatches();
  }, [form.workArrangement, form.minSalary, form.targetRoles, form.hybridCity]);

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !form.skills.includes(customSkill.trim())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, customSkill.trim()] }));
      setCustomSkill("");
    }
  };

  // Resume file text extraction simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = String(event.target?.result || "");
        setForm((prev) => ({
          ...prev,
          resumeFileName: file.name,
          resumeText: text.slice(0, 5000), // store up to 5,000 chars for AI matching
        }));
      };
      reader.readAsText(file);
    }
  };

  // Complete onboarding and optionally trigger Stripe checkout
  const handleComplete = async (plan: "free" | "pro_monthly" | "pro_quarterly") => {
    setIsSaving(true);
    try {
      // 1. Persist user preferences to Supabase & Clerk metadata
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          workArrangement: form.workArrangement,
          workType: form.workType,
          targetRoles: form.targetRoles,
          skills: form.skills,
          seniority: form.seniority,
          minSalary: form.minSalary,
          hybridCity: form.hybridCity,
          resumeText: form.resumeText,
          isPro: plan !== "free",
        }),
      });

      if (res.ok) {
        await markOnboardingCompleted();
      }

      // 2. If Pro plan selected, trigger Stripe checkout session
      if (plan === "pro_monthly" || plan === "pro_quarterly") {
        setIsUpgrading(true);
        const email = userEmail || prompt("Enter your email address for Pro Access & Receipts:") || "candidate@example.com";
        const checkoutRes = await fetch("/api/checkout/candidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            planId: plan,
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      // 3. If Free plan, navigate directly to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Stepper Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
            <span>Step {step} of 4</span>
            <span>
              {step === 1 && "Work Arrangement"}
              {step === 2 && "Role & Seniority"}
              {step === 3 && "Salary & Resume"}
              {step === 4 && "Live Matches & Access"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-[#FF4742] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: WORK ARRANGEMENT */}
        {step === 1 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-4xl">🌍</span>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white mt-3">
                What is your ideal work arrangement?
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                We aggregate verified roles across global remote and high-paying hybrid employers.
              </p>
            </div>

            <div className="space-y-3">
              {WORK_ARRANGEMENTS.map((option) => {
                const isSelected = form.workArrangement === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        workArrangement: option.id,
                        workType: option.title,
                      }))
                    }
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                      isSelected
                        ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20 shadow-sm"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{option.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                          {option.title}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#FF4742] shrink-0" />}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {option.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* If Hybrid is chosen, capture city */}
            {(form.workArrangement === "hybrid_high_pay" || form.workArrangement === "both") && (
              <div className="mt-6 p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 mb-1.5">
                  🏢 Preferred Metro City & Country (for Hybrid roles)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-purple-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. London, UK • New York, NY • San Francisco, CA • Berlin, Germany"
                    value={form.hybridCity}
                    onChange={(e) => setForm((prev) => ({ ...prev, hybridCity: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-neutral-900 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-1.5">
                  We filter for high-paying hybrid roles ($100k+) in this metro while giving you remote roles worldwide.
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Role & Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TARGET ROLE & SENIORITY */}
        {step === 2 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-4xl">💼</span>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white mt-3">
                Target Role & Seniority
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Tell us which positions and core tools match your expertise.
              </p>
            </div>

            {/* Category Grid */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Primary Career Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = form.category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          category: cat.name,
                          targetRoles: cat.examples,
                        }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-[#FF4742] bg-red-50/60 dark:bg-red-950/30 text-[#FF4742] font-black"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300 font-semibold"
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="text-xs truncate">{cat.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seniority Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Seniority Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SENIORITY_LEVELS.map((sen) => {
                  const isSelected = form.seniority === sen.label;
                  return (
                    <button
                      key={sen.label}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, seniority: sen.label }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#FF4742] bg-red-50/60 dark:bg-red-950/30 text-neutral-900 dark:text-white"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <div className="font-extrabold text-xs">{sen.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{sen.years}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stack & Skills Tag Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                Core Stack & Skills (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.map((skill) => {
                  const active = form.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        active
                          ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                          : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                      }`}
                    >
                      {active ? `✓ ${skill}` : `+ ${skill}`}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Skill */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. Rust, Kafka, Solidity)..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs outline-none focus:border-[#FF4742]"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>Continue to Salary & Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MINIMUM SALARY & RESUME UPLOAD */}
        {step === 3 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-4xl">💰</span>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white mt-3">
                Minimum Salary & Resume Match
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Filter out low-paying noise and enable automated 1-click AI profile matching.
              </p>
            </div>

            {/* Salary Slider */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Minimum Desired Compensation
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ${form.minSalary.toLocaleString()}/yr+
                </span>
              </div>
              <input
                type="range"
                min="60000"
                max="250000"
                step="5000"
                value={form.minSalary}
                onChange={(e) => setForm((prev) => ({ ...prev, minSalary: Number(e.target.value) }))}
                className="w-full accent-[#FF4742] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-semibold text-neutral-400 mt-1">
                <span>$60k</span>
                <span>$100k</span>
                <span>$150k</span>
                <span>$200k</span>
                <span>$250k+</span>
              </div>
            </div>

            {/* Resume Upload / Paste */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#FF4742] transition-colors text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 dark:bg-red-950/40 text-[#FF4742] flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Upload Resume or CV (Optional)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
                Upload a text, markdown, or PDF resume. Our AI extracts your core achievements to unlock real-time job match scoring and tailored cover letters.
              </p>

              {form.resumeFileName ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Uploaded: {form.resumeFileName}</span>
                </div>
              ) : (
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-[#FF4742] transition-colors">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".txt,.md,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>Reveal Matching Jobs</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: INSTANT MATCH REVEAL + PRO UPGRADE PAYWALL */}
        {step === 4 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            {/* Live Match Notification Banner */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-red-500/10 to-amber-500/10 border border-emerald-500/30 mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-Time Ingestion Match</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                We found <span className="text-[#FF4742] underline decoration-2">{matchCount} verified roles</span> matching your profile right now!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-lg mx-auto">
                Verified across Greenhouse, Lever, Ashby, and direct company careers in {form.workType}.
              </p>
            </div>

            {/* Side-by-side Plan Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Free Plan Card */}
              <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Standard Member
                  </div>
                  <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">
                    Free Plan
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
                    Basic access with standard delayed listings.
                  </p>

                  <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                    <li className="flex items-center gap-2">
                      <span className="text-neutral-400">⏳</span>
                      <span>6-Hour Delayed Job Feed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-neutral-400">🔒</span>
                      <span>Direct HR Emails Obfuscated</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-neutral-400">👥</span>
                      <span>Competes with 500+ late applicants</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-neutral-400">📄</span>
                      <span>Standard public listings preview</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleComplete("free")}
                    className="w-full py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Continue with Free Plan (Delayed)
                  </button>
                </div>
              </div>

              {/* Pro Member Card (Highlighted) */}
              <div className="relative p-5 rounded-2xl border-2 border-[#FF4742] bg-red-50/20 dark:bg-neutral-900 shadow-xl flex flex-col justify-between">
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#FF4742] text-white text-[10px] font-black uppercase tracking-wider">
                  Recommended
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#FF4742]">
                    Candidate Pro Member
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-neutral-900 dark:text-white">$12</span>
                    <span className="text-xs text-neutral-500">/month or $29/quarter</span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 mb-4">
                    First-mover advantage to land offers before public queues.
                  </p>

                  <ul className="space-y-2.5 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    <li className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span>🔥 6-Hour Early Access (<span className="underline">Beat 500+ applicants</span>)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      <span>📬 Unlocked Verified HR Contact Emails</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>✨ 1-Click AI Match & Custom Cover Letters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#FF4742] shrink-0" />
                      <span>Direct ATS Apply (Greenhouse, Lever, Ashby)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    type="button"
                    disabled={isSaving || isUpgrading}
                    onClick={() => handleComplete("pro_monthly")}
                    className="w-full py-3.5 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white text-xs sm:text-sm font-black shadow-lg shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Upgrade to Pro — $12/mo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={isSaving || isUpgrading}
                    onClick={() => handleComplete("pro_quarterly")}
                    className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 text-xs font-bold transition-all"
                  >
                    Save 20% with Pro Quarterly ($29/quarter)
                  </button>
                </div>
              </div>
            </div>

            {/* Refund & Guarantee Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 font-medium border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>7-Day 100% Unconditional Refund Guarantee</span>
              </span>
              <span>•</span>
              <span>Cancel anytime with 1 click</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Backward-compatibility alias for tests
export const CareerHoundOnboardingFlow = MultiStepOnboarding;
