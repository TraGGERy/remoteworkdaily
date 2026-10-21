"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Shield,
  Zap,
  Lock,
  Clock,
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

const STORAGE_KEY = "rwd_onboarding_progress_v2";

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
  {
    name: "Engineering",
    icon: "💻",
    examples: ["Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer", "AI / ML Engineer"],
  },
  {
    name: "Product",
    icon: "🚀",
    examples: ["Product Manager", "Technical PM", "Growth PM", "Product Owner"],
  },
  {
    name: "Design",
    icon: "🎨",
    examples: ["UI/UX Designer", "Product Designer", "Design Systems Lead", "Brand Designer"],
  },
  {
    name: "Marketing",
    icon: "📈",
    examples: ["Growth Marketer", "Content Strategist", "SEO Lead", "Lifecycle Marketer"],
  },
  {
    name: "Sales",
    icon: "💼",
    examples: ["Account Executive", "SDR / BDR", "Sales Director", "Enterprise AE"],
  },
  {
    name: "Operations",
    icon: "⚙️",
    examples: ["Operations Manager", "Program Manager", "Scrum Master", "Business Ops Lead"],
  },
  {
    name: "Customer Support",
    icon: "🎧",
    examples: ["Customer Success Manager", "Support Lead", "Solutions Specialist"],
  },
  {
    name: "Finance",
    icon: "💰",
    examples: ["Financial Analyst", "Controller", "Senior Accountant", "Finance Director"],
  },
];

const CATEGORY_MAP: Record<string, string> = {
  Engineering: "dev",
  Product: "dev",
  Design: "design",
  Marketing: "marketing",
  Sales: "sales",
  Operations: "ops",
  "Customer Support": "support",
  Finance: "finance",
};

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

export const ONBOARDING_PLANS = [
  {
    id: "weekly" as const,
    name: "Weekly Sprint",
    price: "$5.99",
    period: "/week",
    dailyPrice: "~$0.85 / day",
    billingDesc: "$5.99 billed weekly • Cancel anytime",
    badge: "Sprint Search",
    isPopular: false,
    description: "Ideal for active job seekers conducting a fast, focused 1-2 week application sprint.",
    features: [
      "🔥 6-Hour Early Access (Beat 500+ applicants)",
      "📬 Unlocked Verified HR Contact Emails",
      "✨ 1-Click AI Match & Custom Applications",
      "🚀 Direct ATS Apply (Greenhouse, Lever, Ashby)",
    ],
  },
  {
    id: "monthly" as const,
    name: "Monthly Pro",
    price: "$17",
    period: "/month",
    dailyPrice: "Only ~$0.57 / day",
    billingDesc: "$17 billed monthly • Cancel anytime",
    badge: "Recommended · Most Popular",
    isPopular: true,
    description: "Our #1 plan for candidates navigating multi-stage interview and offer cycles.",
    features: [
      "🔥 6-Hour Early Access (Beat 500+ applicants)",
      "📬 Unlocked Verified HR Contact Emails",
      "✨ 1-Click AI Match & Custom Cover Letters",
      "🚀 Direct ATS Apply (Greenhouse, Lever, Ashby)",
      "📈 Priority Application Tracking & Salary Insights",
    ],
  },
  {
    id: "lifetime" as const,
    name: "Lifetime Access",
    price: "$49",
    period: "once",
    dailyPrice: "Pay once · $0/mo forever",
    billingDesc: "$49 one-time payment • Never renews • Perpetual",
    badge: "Best Value",
    isPopular: false,
    description: "Pay once and monitor the remote job market continuously throughout your entire career.",
    features: [
      "🔥 Permanent 6-Hour Early Access to all fresh roles",
      "📬 Unlimited Verified HR & Recruiter Contact Emails",
      "✨ Unlimited AI Cover Letter & Resume Generations",
      "🚀 Direct ATS Apply links unlocked permanently",
      "🛡️ All future upgrades & features included forever",
    ],
  },
];

export function MultiStepOnboarding() {
  const router = useRouter();
  const { userEmail, markOnboardingCompleted } = useSubscription();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<OnboardingFormState>(INITIAL_STATE);
  const [matchCount, setMatchCount] = useState<number>(342);
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customSkill, setCustomSkill] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "lifetime">("monthly");
  const [isRestored, setIsRestored] = useState(false);

  // 1. Restore saved progress from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.step && [1, 2, 3, 4].includes(parsed.step)) {
            setStep(parsed.step as 1 | 2 | 3 | 4);
          }
          if (parsed.form && typeof parsed.form === "object") {
            setForm((prev) => ({ ...prev, ...parsed.form }));
          }
          if (
            parsed.selectedPlan &&
            ["weekly", "monthly", "lifetime"].includes(parsed.selectedPlan)
          ) {
            setSelectedPlan(parsed.selectedPlan as "weekly" | "monthly" | "lifetime");
          }
        }
      } catch {
        // Ignore parse failure and continue with defaults
      } finally {
        setIsRestored(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 2. Persist progress into localStorage whenever state changes
  useEffect(() => {
    if (!isRestored || typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step,
          form,
          selectedPlan,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [step, form, selectedPlan, isRestored]);

  // 3. Debounced live matching jobs count from /api/jobs & /api/user/onboarding
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setIsLoadingJobs(true);

        // Primary: Query /api/jobs for real-time count
        const params = new URLSearchParams({ countOnly: "true" });
        const mappedCat = CATEGORY_MAP[form.category];
        if (mappedCat) {
          params.set("category", mappedCat);
        }
        if (form.targetRoles && form.targetRoles.length > 0) {
          params.set("search", form.targetRoles[0]);
        }
        if (form.workArrangement === "remote_global" || form.workArrangement === "remote_regional") {
          params.set("workplace", "remote");
        }
        if (form.minSalary > 0) {
          params.set("salary", String(form.minSalary));
        }

        const jobsRes = await fetch(`/api/jobs?${params.toString()}`);
        if (!isMounted) return;

        let gotValidCount = false;
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          if (typeof jobsData.count === "number" && jobsData.count > 0) {
            setMatchCount(jobsData.count);
            gotValidCount = true;
          }
        }

        // Secondary / Fallback: Maintain existing /api/user/onboarding preview endpoint
        const userOnboardingQuery = new URLSearchParams({
          workArrangement: form.workArrangement,
          minSalary: String(form.minSalary),
          roles: form.targetRoles.join(","),
          hybridCity: form.hybridCity,
        });

        const userRes = await fetch(`/api/user/onboarding?${userOnboardingQuery.toString()}`);
        if (!isMounted) return;

        if (userRes.ok) {
          const userData = await userRes.json();
          if (!gotValidCount && userData && typeof userData.matchCount === "number" && userData.matchCount > 0) {
            setMatchCount(userData.matchCount);
          }
        }
      } catch {
        // Keep realistic fallback match count; never block onboarding progression
      } finally {
        if (isMounted) {
          setIsLoadingJobs(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [form.category, form.targetRoles, form.workArrangement, form.minSalary, form.hybridCity]);

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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

  const toggleRole = (role: string) => {
    setForm((prev) => {
      const exists = prev.targetRoles.includes(role);
      const updated = exists ? prev.targetRoles.filter((r) => r !== role) : [...prev.targetRoles, role];
      return {
        ...prev,
        targetRoles: updated.length > 0 ? updated : [role],
      };
    });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !form.skills.includes(customSkill.trim())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, customSkill.trim()] }));
      setCustomSkill("");
    }
  };

  // Resume file text extraction
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

  const clearStorageProgress = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  // Complete onboarding and trigger Stripe checkout
  const handleComplete = async (plan: "weekly" | "monthly" | "lifetime" = selectedPlan) => {
    setIsSaving(true);
    setIsUpgrading(true);
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
          isPro: true,
          planId: plan,
        }),
      });

      if (res.ok) {
        await markOnboardingCompleted();
      }

      clearStorageProgress();

      // 2. Trigger Stripe checkout session
      const promptEmail = typeof window !== "undefined"
        ? window.prompt("Enter your email address for Pro Access & Receipts:")
        : null;
      const email = userEmail || promptEmail || "candidate@example.com";

      const checkoutRes = await fetch("/api/checkout/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          planId: plan,
        }),
      });
      const checkoutData = await checkoutRes.json();
      if (checkoutData.url && typeof window !== "undefined") {
        window.location.assign(checkoutData.url);
        return;
      }

      router.push(`/dashboard?subscription=success&plan=${plan}`);
    } catch (err) {
      console.error("Onboarding submission failed:", err);
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
      setIsUpgrading(false);
    }
  };

  // Free / preview continuation path (never blocks or removes free access)
  const handleContinueFree = async () => {
    setIsSaving(true);
    try {
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
          isPro: false,
        }),
      });

      if (res.ok) {
        await markOnboardingCompleted();
      }

      clearStorageProgress();
      router.push("/dashboard?onboarding=complete");
    } catch (err) {
      console.error("Free onboarding continuation failed:", err);
      router.push("/dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  const currentCategory = CATEGORIES.find((c) => c.name === form.category) || CATEGORIES[0];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Stepper Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] rounded-md px-1 py-0.5"
                  aria-label="Go back to previous step"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
              <span>Step {step} of 4</span>
            </div>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {step === 1 && "Work Arrangement"}
              {step === 2 && "Target Role & Stack"}
              {step === 3 && "Salary & Resume"}
              {step === 4 && "Live Matches & Access"}
            </span>
          </div>

          <div
            className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={(step / 4) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Step ${step} of 4`}
          >
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
              <span className="text-4xl" role="img" aria-label="Globe">🌍</span>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white mt-3">
                What is your ideal work arrangement?
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                We aggregate verified roles across global remote and high-paying hybrid employers.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-[#FF4742] text-[11px] font-bold mt-2.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Jobs pulled straight from company career pages — refreshed every hour</span>
              </div>
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
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] ${
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
                <label
                  htmlFor="hybrid-city-input"
                  className="block text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 mb-1.5"
                >
                  🏢 Preferred Metro City & Country (for Hybrid roles)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-purple-400 absolute left-3 top-3.5" />
                  <input
                    id="hybrid-city-input"
                    type="text"
                    placeholder="e.g. London, UK • New York, NY • San Francisco, CA • Berlin, Germany"
                    value={form.hybridCity}
                    onChange={(e) => setForm((prev) => ({ ...prev, hybridCity: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-neutral-900 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-1.5">
                  We filter for high-paying hybrid roles ($100k+) in this metro while giving you remote roles worldwide.
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleNext}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] rounded-md px-2 py-1.5 transition-colors order-2 sm:order-1"
              >
                Skip to role selection &rarr;
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 order-1 sm:order-2"
              >
                <span>Continue to Role & Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>No recruiter spam · Cancel anytime · Direct ATS applications</span>
            </div>
          </div>
        )}

        {/* STEP 2: TARGET ROLE & SENIORITY */}
        {step === 2 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-5">
              <span className="text-4xl" role="img" aria-label="Briefcase">💼</span>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white mt-3">
                Target Role & Seniority
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Tell us which positions and core tools match your expertise.
              </p>
            </div>

            {/* Value-First Live Job Match Notification */}
            <div className="mb-6 p-4 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4742] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF4742]"></span>
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white leading-tight">
                    {isLoadingJobs ? (
                      "Scanning live ATS career boards..."
                    ) : (
                      <>
                        We found <span className="text-[#FF4742]">{matchCount} matching remote jobs</span> right now
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Get alerted within minutes of a job going live · Apply before the crowd does
                  </p>
                </div>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shrink-0">
                <Clock className="w-3 h-3 text-[#FF4742]" />
                <span>Refreshed hourly</span>
              </div>
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
                          targetRoles: cat.examples.slice(0, 2),
                        }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] ${
                        isSelected
                          ? "border-[#FF4742] bg-red-50/60 dark:bg-red-950/30 text-[#FF4742] font-black shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300 font-semibold bg-white dark:bg-neutral-900"
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="text-xs truncate">{cat.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specific Target Roles Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Target Roles in {form.category}
                </label>
                <span className="text-[11px] text-neutral-400">Select one or more</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentCategory.examples.map((role) => {
                  const isSelected = form.targetRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] ${
                        isSelected
                          ? "bg-[#FF4742] text-white border-[#FF4742] shadow-sm"
                          : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      <span>{role}</span>
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
                      className={`p-3 rounded-xl border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] ${
                        isSelected
                          ? "border-[#FF4742] bg-red-50/60 dark:bg-red-950/30 text-neutral-900 dark:text-white font-bold"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900"
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Core Stack & Skills (Click to toggle)
                </label>
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] rounded px-1"
                >
                  Skip skills &rarr;
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SKILL_SUGGESTIONS.map((skill) => {
                  const active = form.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] ${
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
                <label htmlFor="custom-skill-input" className="sr-only">
                  Add custom skill
                </label>
                <input
                  id="custom-skill-input"
                  type="text"
                  placeholder="Add custom skill (e.g. Rust, Kafka, Solidity)..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742]"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 order-1 sm:order-2"
              >
                <span>Show Matching Jobs ({matchCount})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Jobs pulled straight from company career pages — refreshed every hour</span>
            </div>
          </div>
        )}

        {/* STEP 3: MINIMUM SALARY & RESUME UPLOAD */}
        {step === 3 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-6">
              <span className="text-4xl" role="img" aria-label="Money">💰</span>
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
                <label
                  htmlFor="salary-range-input"
                  className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
                >
                  Minimum Desired Compensation
                </label>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ${form.minSalary.toLocaleString()}/yr+
                </span>
              </div>
              <input
                id="salary-range-input"
                type="range"
                min="60000"
                max="250000"
                step="5000"
                value={form.minSalary}
                onChange={(e) => setForm((prev) => ({ ...prev, minSalary: Number(e.target.value) }))}
                aria-label="Minimum desired compensation"
                className="w-full accent-[#FF4742] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] rounded"
              />
              <div className="flex justify-between text-[11px] font-semibold text-neutral-400 mt-1">
                <span>$60k</span>
                <span>$100k</span>
                <span>$150k</span>
                <span>$200k</span>
                <span>$250k+</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                We will highlight {matchCount} roles meeting or exceeding your target salary.
              </p>
            </div>

            {/* Resume Upload / Paste */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#FF4742] transition-colors text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 dark:bg-red-950/40 text-[#FF4742] flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Upload Resume or CV <span className="text-neutral-400 font-normal">(Optional)</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
                Upload a text, markdown, or PDF resume to unlock instant match scoring. You can also skip this and upload later.
              </p>

              {form.resumeFileName ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Uploaded: {form.resumeFileName}</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label
                    htmlFor="resume-file-input"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-[#FF4742] dark:hover:bg-[#FF4742] dark:hover:text-white transition-colors focus-within:ring-2 focus-within:ring-[#FF4742]"
                  >
                    <span>Browse File (.txt, .md, .pdf)</span>
                    <input
                      id="resume-file-input"
                      type="file"
                      accept=".txt,.md,.pdf"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] rounded px-2 py-1"
                  >
                    Skip resume &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 order-1 sm:order-2"
              >
                <span>Reveal {matchCount} Matching Jobs</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Jobs pulled straight from company career pages — refreshed every hour</span>
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
                Verified directly from Greenhouse, Lever, Ashby, and company career pages in {form.workType}.
              </p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800/60">
                <Zap className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Get alerted within minutes of a job going live · Beat 500+ applicants</span>
              </div>
            </div>

            {/* 3-Plan Selection Grid with Daily Price Framing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {ONBOARDING_PLANS.map((planItem) => {
                const isSelected = selectedPlan === planItem.id;
                return (
                  <div
                    key={planItem.id}
                    onClick={() => setSelectedPlan(planItem.id)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-[#FF4742] ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20 shadow-lg scale-[1.02]"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40"
                    }`}
                  >
                    {planItem.badge && (
                      <div
                        className={`absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          planItem.isPopular
                            ? "bg-[#FF4742] text-white shadow-sm"
                            : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                        }`}
                      >
                        {planItem.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                          {planItem.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-[#FF4742] bg-[#FF4742]"
                              : "border-neutral-300 dark:border-neutral-700"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-black text-neutral-900 dark:text-white">
                          {planItem.price}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                          {planItem.period}
                        </span>
                      </div>

                      {/* Per-Day Price Framing */}
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">
                          {planItem.dailyPrice}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 mb-4">
                        {planItem.billingDesc}
                      </p>

                      <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                        {planItem.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#FF4742] shrink-0 mt-0.5" />
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-5">
                      <button
                        type="button"
                        disabled={isSaving || isUpgrading}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(planItem.id);
                          handleComplete(planItem.id);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] ${
                          isSelected
                            ? "bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-md shadow-red-500/20 active:scale-95"
                            : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800"
                        }`}
                      >
                        <span>Select {planItem.name}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Main Submit Action */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                disabled={isSaving || isUpgrading}
                onClick={() => handleComplete(selectedPlan)}
                className="w-full py-4 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white text-sm sm:text-base font-black shadow-xl shadow-red-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 cursor-pointer disabled:opacity-60"
              >
                {isSaving || isUpgrading ? (
                  <span>Preparing Secure Checkout...</span>
                ) : (
                  <>
                    <span>
                      Unlock {matchCount} Matching Roles —{" "}
                      {selectedPlan === "weekly"
                        ? "$5.99/week (~$0.85/day)"
                        : selectedPlan === "monthly"
                        ? "$17/month (~$0.57/day)"
                        : "$49 (One-Time)"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Free Preview Option (Preserved Escape Hatch) */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={isSaving || isUpgrading}
                  onClick={handleContinueFree}
                  className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:underline py-1.5 px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4742] rounded-lg"
                >
                  Or explore with free limited preview (25 direct ATS jobs) first &rarr;
                </button>
              </div>
            </div>

            {/* Refund & Guarantee Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium border-t border-neutral-100 dark:border-neutral-800 pt-4">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>7-Day 100% Unconditional Refund Guarantee</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>256-bit Encrypted SSL Stripe Checkout</span>
              </span>
              <span>•</span>
              <span>Cancel anytime with 1 click</span>
              <span>•</span>
              <span>No recruiter spam</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Backward-compatibility alias for tests
export const CareerHoundOnboardingFlow = MultiStepOnboarding;
