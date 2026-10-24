"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  X,
  Check,
  Star,
  Lock,
  Home,
  Shuffle,
  Building2,
  Mail,
  Users,
  Search,
  DollarSign,
} from "lucide-react";
import {
  CareerHoundLogo,
  CoinStackIcon,
  SproutIcon,
  HourglassIcon,
  TurtleIcon,
} from "./career-hound-icons";
import {
  OnboardingState,
  INITIAL_ONBOARDING_STATE,
  EXPERIENCE_LEVELS,
  JOB_TYPE_OPTIONS,
  SALARY_OPTIONS,
  SEARCH_DURATION_OPTIONS,
  FRUSTRATIONS_OPTIONS,
  JOB_TITLE_EXAMPLES,
  PLATFORMS_TRIED_OPTIONS,
  YES_NO_OPTIONS,
  TESTIMONIALS,
  PricingPlanId,
} from "@/lib/onboarding/types";
import { useSubscription } from "@/components/auth/subscription-context";

const LOCAL_STORAGE_KEY = "careerhound_onboarding_draft";

export function CareerHoundOnboardingFlow() {
  const router = useRouter();
  const { markOnboardingCompleted, isOnboardingCompleted, hasActiveSubscription, isLoading } =
    useSubscription();
  const [state, setState] = useState<OnboardingState>(INITIAL_ONBOARDING_STATE);
  const [currentTitleInput, setCurrentTitleInput] = useState("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // If user already completed onboarding or has active subscription, redirect to dashboard unless retaking
  useEffect(() => {
    if (!isLoading && (isOnboardingCompleted || hasActiveSubscription)) {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("retake") !== "true") {
          router.replace("/dashboard");
        }
      }
    }
  }, [isLoading, isOnboardingCompleted, hasActiveSubscription, router]);

  // Restore draft state from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTimeout(() => {
          setState((prev) => ({ ...prev, ...parsed }));
          if (parsed.jobTitles && parsed.jobTitles.length > 0) {
            setCurrentTitleInput((prev) => (!prev ? parsed.jobTitles[0] || "" : prev));
          }
          if (parsed.candidateEmail) {
            setEmailInput(parsed.candidateEmail);
          }
        }, 0);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save changes to localStorage
  const saveState = (updated: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore write errors
      }
      return next;
    });
  };

  // Helper to persist draft profile to backend
  const persistProfileDraft = async (emailOverride?: string) => {
    const activeEmail =
      emailOverride ||
      state.candidateEmail ||
      (typeof window !== "undefined"
        ? localStorage.getItem("remotework_user_email") || ""
        : "");

    const parsedMinSalary = (() => {
      if (state.salaryExpectation.includes("150k+")) return 150000;
      if (state.salaryExpectation.includes("120k")) return 120000;
      if (state.salaryExpectation.includes("90k")) return 90000;
      if (state.salaryExpectation.includes("60k")) return 60000;
      return 30000;
    })();

    try {
      await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: activeEmail.trim().toLowerCase(),
          targetRoles: state.jobTitles,
          seniority: state.experienceLevel || "Mid-level",
          minSalary: parsedMinSalary,
          workType: state.jobTypes.join(", ") || "Remote",
          workArrangement:
            state.jobTypes.includes("Remote") && state.jobTypes.includes("Hybrid")
              ? "both"
              : state.jobTypes.includes("Hybrid")
              ? "hybrid_high_pay"
              : "remote_global",
          platformsTried: state.platformsTried,
          frustrations: state.frustrations,
          hasResume: state.hasResume,
          tailorsResume: state.tailorsResume,
          isPro: false,
          planId: state.selectedPricingPlan,
        }),
      });
    } catch (err) {
      console.warn("[Onboarding] Non-blocking draft save notice:", err);
    }
  };

  const handleNextStep = () => {
    if (state.currentStep === 1) {
      let finalTitles = [...state.jobTitles];
      if (currentTitleInput.trim() && !finalTitles.includes(currentTitleInput.trim())) {
        finalTitles = [...finalTitles, currentTitleInput.trim()];
        saveState({ jobTitles: finalTitles });
      }
      if (finalTitles.length === 0) return;
    }

    if (state.currentStep === 2 && !state.experienceLevel) return;
    if (state.currentStep === 3 && !state.salaryExpectation) return;
    if (state.currentStep === 4 && state.jobTypes.length === 0) return;
    if (state.currentStep === 5 && !state.jobSearchDuration) return;
    if (state.currentStep === 6 && state.frustrations.length === 0) return;
    if (state.currentStep === 7 && state.platformsTried.length === 0) return;
    if (state.currentStep === 9 && !state.hasResume) return;
    if (state.currentStep === 10 && !state.tailorsResume) return;

    if (state.currentStep < 13) {
      const nextStep = state.currentStep + 1;
      saveState({ currentStep: nextStep });
      if (nextStep === 13) {
        // Automatically persist collected candidate profile data upon entering paywall
        persistProfileDraft();
      }
    }
  };

  const handleBackStep = () => {
    if (state.currentStep > 1) {
      saveState({ currentStep: state.currentStep - 1 });
    }
  };

  // --- Step 1 helpers ---
  const handleAddTitle = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (!state.jobTitles.includes(trimmed)) {
      saveState({ jobTitles: [...state.jobTitles, trimmed] });
    }
    setCurrentTitleInput("");
  };

  const handleRemoveTitle = (title: string) => {
    saveState({ jobTitles: state.jobTitles.filter((t) => t !== title) });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTitle(currentTitleInput);
    }
  };

  // --- Step 2 helpers ---
  const handleSelectExperience = (level: string) => {
    saveState({ experienceLevel: level });
  };

  // --- Step 3 helpers (Salary Expectations) ---
  const handleSelectSalary = (salary: string) => {
    saveState({ salaryExpectation: salary });
  };

  // --- Step 4 helpers (Job Types) ---
  const handleToggleJobType = (typeLabel: string) => {
    const exists = state.jobTypes.includes(typeLabel);
    const updated = exists
      ? state.jobTypes.filter((t) => t !== typeLabel)
      : [...state.jobTypes, typeLabel];
    saveState({ jobTypes: updated });
  };

  // --- Step 5 helpers (Search Duration) ---
  const handleSelectDuration = (duration: string) => {
    saveState({ jobSearchDuration: duration });
  };

  // --- Step 6 helpers (Frustrations & Pain Points) ---
  const handleToggleFrustration = (label: string) => {
    const exists = state.frustrations.includes(label);
    const updated = exists
      ? state.frustrations.filter((f) => f !== label)
      : [...state.frustrations, label];
    saveState({ frustrations: updated });
  };

  // --- Step 7 helpers (Platforms Tried) ---
  const handleTogglePlatform = (platform: string) => {
    const exists = state.platformsTried.includes(platform);
    const updated = exists
      ? state.platformsTried.filter((p) => p !== platform)
      : [...state.platformsTried, platform];
    saveState({ platformsTried: updated });
  };

  // --- Step 9 helpers (Has Resume) ---
  const handleSelectHasResume = (val: string) => {
    saveState({ hasResume: val });
  };

  // --- Step 10 helpers (Tailors Resume) ---
  const handleSelectTailorsResume = (val: string) => {
    saveState({ tailorsResume: val });
  };

  // --- Step 13 Paywall Checkout helpers ---
  const handleSelectPlan = (plan: PricingPlanId) => {
    saveState({ selectedPricingPlan: plan });
  };

  const handleContinueClick = () => {
    if (state.candidateEmail && state.candidateEmail.includes("@")) {
      executeCheckout(state.candidateEmail);
    } else {
      setShowEmailModal(true);
    }
  };

  const executeCheckout = async (email: string) => {
    setIsProcessingCheckout(true);
    saveState({ candidateEmail: email });

    // 1. Persist full candidate profile data
    await persistProfileDraft(email);

    // 2. Send real-time notification to Telegram bot
    fetch("/api/notifications/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flow: "candidate_13_step",
        email: email.trim().toLowerCase(),
        targetRoles: state.jobTitles,
        experienceLevel: state.experienceLevel,
        salaryExpectation: state.salaryExpectation,
        jobTypes: state.jobTypes,
        frustrations: state.frustrations,
        platformsTried: state.platformsTried,
        hasResume: state.hasResume,
        tailorsResume: state.tailorsResume,
        selectedPlan: state.selectedPricingPlan,
      }),
    }).catch(() => {});

    // 3. Trigger candidate payment checkout session
    try {
      const res = await fetch("/api/checkout/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          planId: state.selectedPricingPlan,
        }),
      });

      const data = await res.json();
      if (data.url) {
        await markOnboardingCompleted();
        window.location.href = data.url;
      } else if (data.success) {
        await markOnboardingCompleted();
        if (typeof window !== "undefined") {
          localStorage.setItem("remotework_active_subscription", "true");
          localStorage.setItem("remotework_user_email", email.trim().toLowerCase());
        }
        setCheckoutSuccess(true);
        setShowEmailModal(false);
      } else {
        alert(data.error || "Unable to proceed to checkout. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Network error while connecting to payment provider.");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Step progression validation gate
  const canProceed = () => {
    switch (state.currentStep) {
      case 1:
        return state.jobTitles.length > 0 || currentTitleInput.trim().length > 0;
      case 2:
        return Boolean(state.experienceLevel);
      case 3:
        return Boolean(state.salaryExpectation);
      case 4:
        return state.jobTypes.length > 0;
      case 5:
        return Boolean(state.jobSearchDuration);
      case 6:
        return state.frustrations.length > 0;
      case 7:
        return state.platformsTried.length > 0;
      case 8:
        return true; // Interstitial 1
      case 9:
        return Boolean(state.hasResume);
      case 10:
        return Boolean(state.tailorsResume);
      case 11:
        return true; // Interstitial 2
      case 12:
        return true; // Interstitial 3
      case 13:
        return true; // Paywall
      default:
        return false;
    }
  };

  // Progress Bar percentage calculation (13 steps total)
  const progressPercent = Math.min(100, Math.round((state.currentStep / 13) * 100));
  const isPaywallStep = state.currentStep === 13;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header Bar */}
      <header className="w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {state.currentStep > 1 && !checkoutSuccess && (
            <button
              type="button"
              onClick={handleBackStep}
              className="mr-2 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Previous step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <CareerHoundLogo className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Career Hound
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="text-xs font-semibold text-slate-500">
          {isPaywallStep ? "Final Step" : `Step ${state.currentStep} of 12`}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start items-center px-4 pt-4 sm:pt-6 pb-20">
        <div className={`w-full ${isPaywallStep ? "max-w-4xl" : "max-w-xl"}`}>
          {/* Progress Bar (Blue line over light gray background) */}
          {!isPaywallStep && (
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-10">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* STEP 1: Desired Job Title */}
          {state.currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  What&apos;s your desired job title?
                </h1>
                <p className="text-sm text-slate-500 font-normal">
                  Select all that apply
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full min-h-[52px] px-4 py-2.5 bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl transition-all flex flex-wrap items-center gap-2 shadow-xs">
                  {state.jobTitles.map((title) => (
                    <span
                      key={title}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200"
                    >
                      {title}
                      <button
                        type="button"
                        onClick={() => handleRemoveTitle(title)}
                        className="hover:text-blue-900 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={currentTitleInput}
                    onChange={(e) => setCurrentTitleInput(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    placeholder={
                      state.jobTitles.length === 0
                        ? "software developer"
                        : "Add another role..."
                    }
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-slate-900 text-base placeholder:text-slate-400"
                    autoFocus
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Example:{" "}
                  {JOB_TITLE_EXAMPLES.map((ex, idx) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => handleAddTitle(ex)}
                      className="hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {ex}
                      {idx < JOB_TITLE_EXAMPLES.length - 1 ? ", " : "."}
                    </button>
                  ))}
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Target Experience Level */}
          {state.currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  What&apos;s your target experience level in this role?
                </h1>
              </div>

              <div className="space-y-3">
                {EXPERIENCE_LEVELS.map((level) => {
                  const isSelected = state.experienceLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleSelectExperience(level)}
                      className={`w-full text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Salary Expectations */}
          {state.currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  What are your salary expectations?
                </h1>
              </div>

              <div className="space-y-3">
                {SALARY_OPTIONS.map((salary) => {
                  const isSelected = state.salaryExpectation === salary;
                  return (
                    <button
                      key={salary}
                      type="button"
                      onClick={() => handleSelectSalary(salary)}
                      className={`w-full flex items-center text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="mr-3 shrink-0">
                        <CoinStackIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>{salary}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Job Types */}
          {state.currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  Which job types fit you best?
                </h1>
                <p className="text-sm text-slate-500 font-normal">
                  Select all that apply
                </p>
              </div>

              <div className="space-y-3">
                {JOB_TYPE_OPTIONS.map((item) => {
                  const isSelected = state.jobTypes.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleJobType(item.label)}
                      className={`w-full flex items-center text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="mr-3 shrink-0">
                        {item.id === "remote" && <Home className="w-5 h-5 text-blue-600" />}
                        {item.id === "hybrid" && <Shuffle className="w-5 h-5 text-blue-600" />}
                        {item.id === "in_office" && <Building2 className="w-5 h-5 text-blue-600" />}
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: How Long Looking */}
          {state.currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  How long have you been looking for a job?
                </h1>
              </div>

              <div className="space-y-3">
                {SEARCH_DURATION_OPTIONS.map((item) => {
                  const isSelected = state.jobSearchDuration === item.label;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectDuration(item.label)}
                      className={`w-full flex items-center text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="mr-3 shrink-0">
                        {item.id === "just_started" && <SproutIcon className="w-5 h-5 text-blue-600" />}
                        {item.id === "few_weeks" && <Clock className="w-5 h-5 text-blue-600" />}
                        {item.id === "few_months" && <HourglassIcon className="w-5 h-5 text-blue-600" />}
                        {item.id === "too_long" && <TurtleIcon className="w-5 h-5 text-blue-600" />}
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Frustrations & Pain Points */}
          {state.currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  What is most frustrating for you?
                </h1>
                <p className="text-sm text-slate-500 font-normal">
                  Select all that apply
                </p>
              </div>

              <div className="space-y-3">
                {FRUSTRATIONS_OPTIONS.map((item) => {
                  const isSelected = state.frustrations.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleFrustration(item.label)}
                      className={`w-full flex items-center text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="mr-3 shrink-0">
                        {item.id === "not_hearing_back" && <Mail className="w-5 h-5 text-blue-600" />}
                        {item.id === "too_much_competition" && <Users className="w-5 h-5 text-blue-600" />}
                        {item.id === "not_enough_openings" && <Search className="w-5 h-5 text-blue-600" />}
                        {item.id === "low_salaries" && <DollarSign className="w-5 h-5 text-blue-600" />}
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: What have you tried so far? */}
          {state.currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  What have you tried so far?
                </h1>
                <p className="text-sm text-slate-500 font-normal">
                  Select all that apply
                </p>
              </div>

              <div className="space-y-3">
                {PLATFORMS_TRIED_OPTIONS.map((platform) => {
                  const isSelected = state.platformsTried.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handleTogglePlatform(platform)}
                      className={`w-full text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 8: What makes Career Hound different: (Websites vs LinkedIn) */}
          {state.currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EBFDF3] border border-[#B9F5D0] flex items-center justify-center text-[#16A34A]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                What makes Career Hound different:
              </h1>

              <div className="space-y-3 text-left">
                {/* Green Box: Career Hound */}
                <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full border border-emerald-400 bg-white flex items-center justify-center text-emerald-600 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <h3 className="font-bold text-[#15803D] text-lg">Career Hound</h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Career Hound finds job postings on company websites, by scanning their Careers page.
                  </p>

                  <div className="bg-white border border-emerald-100 rounded-xl p-3 shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <span className="ml-1 text-[11px]">Searching company careers...</span>
                    </div>
                    <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 bg-white flex items-center">
                      <span>greenhouse.io/careers</span>
                      <span className="inline-block w-0.5 h-4 bg-slate-900 ml-0.5 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="w-px h-5 border-l-2 border-dotted border-slate-300 mx-auto" />

                {/* Red Box: LinkedIn/Indeed */}
                <div className="rounded-2xl border border-[#FECDD3] bg-[#FEF2F2] p-5 sm:p-6 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full border border-rose-300 bg-white flex items-center justify-center text-rose-500 shrink-0">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <h3 className="font-bold text-[#BE123C] text-lg">LinkedIn/Indeed</h3>
                  </div>
                  <p className="text-sm text-slate-700 italic">
                    &ldquo;Posted 1 hour ago, over 200 applicants.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Do you currently have a resume? */}
          {state.currentStep === 9 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  Do you currently have a resume?
                </h1>
              </div>

              <div className="space-y-3">
                {YES_NO_OPTIONS.map((opt) => {
                  const isSelected = state.hasResume === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectHasResume(opt)}
                      className={`w-full text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 10: Do you tailor your resume for each job? */}
          {state.currentStep === 10 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  Do you tailor your resume for each job?
                </h1>
              </div>

              <div className="space-y-3">
                {YES_NO_OPTIONS.map((opt) => {
                  const isSelected = state.tailorsResume === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectTailorsResume(opt)}
                      className={`w-full text-left py-4 px-5 rounded-xl border text-base transition-all shadow-xs cursor-pointer ${
                        isSelected
                          ? "border-2 border-blue-600 bg-blue-50/20 text-slate-900 ring-1 ring-blue-600/30 font-medium"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 11: Did you know? (ATS Problem Education) */}
          {state.currentStep === 11 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                  Did you know?
                </h1>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs text-left">
                <p className="text-base sm:text-[17px] text-slate-800 leading-relaxed">
                  Companies use Applicant Tracking Systems (ATS) to scan resumes.{" "}
                  <span className="underline decoration-red-500 decoration-wavy decoration-1 underline-offset-4 font-semibold text-slate-900">
                    Missing keywords
                  </span>{" "}
                  and bad layouts (multiple columns, graphics, etc.) can get your resume skipped.
                </p>
              </div>
            </div>
          )}

          {/* STEP 12: What makes Career Hound different: (AI Keyword Match 100%) */}
          {state.currentStep === 12 && (
            <div className="space-y-6 animate-in fade-in duration-200 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#EBFDF3] border border-[#B9F5D0] flex items-center justify-center text-[#16A34A]">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-snug">
                What makes Career Hound different:
              </h1>

              <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-5 sm:p-6 text-left space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full border border-emerald-400 bg-white flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <h3 className="font-bold text-[#15803D] text-lg">Career Hound</h3>
                </div>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  Career Hound uses AI to tailor your resume using the keywords from the job description.
                </p>

                {/* Keyword Match 100% Bar */}
                <div className="bg-white border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      Keyword Match
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#15803D]">
                      100%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-[#16A34A] rounded-full transition-all duration-700" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 13: Paywall & Social Proof Screen */}
          {isPaywallStep && (
            <div className="space-y-6 animate-in fade-in duration-200 text-center">
              {checkoutSuccess ? (
                <div className="bg-white border border-emerald-200 rounded-3xl p-8 max-w-lg mx-auto space-y-4 shadow-xl">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Direct ATS Membership Activated!
                  </h2>
                  <p className="text-sm text-slate-600">
                    Direct hiring portal links and AI keywords are unlocked for{" "}
                    <strong>{state.candidateEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="w-full py-3.5 rounded-xl font-bold bg-slate-950 text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Start Applying Direct
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    From no responses to getting your{" "}
                    <span className="font-black text-black">dream job</span>
                  </h1>

                  {/* 50% Off Fall Banner */}
                  <div className="w-full bg-[#991B1B] text-white rounded-2xl p-4 sm:p-5 text-left shadow-xs">
                    <div className="text-xl sm:text-2xl font-bold tracking-tight">
                      50% off fall
                    </div>
                    <div className="text-xs sm:text-sm text-red-100 font-normal mt-0.5">
                      Limited time offer
                    </div>
                  </div>

                  {/* 3 Pricing Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-left">
                    {/* Plan 1: Lifetime (Default Selected) */}
                    <button
                      type="button"
                      onClick={() => handleSelectPlan("lifetime")}
                      className={`relative rounded-2xl p-5 sm:p-6 transition-all text-left bg-white cursor-pointer ${
                        state.selectedPricingPlan === "lifetime"
                          ? "border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                          : "border border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      {state.selectedPricingPlan === "lifetime" && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            Lifetime
                          </h3>
                          <span className="text-xs text-slate-400 line-through">
                            $99.99
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            $49.99
                          </span>
                          <span className="text-xs text-slate-400 block font-normal">
                            /forever
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-slate-700 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Access to all jobs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Pay only once ❤️</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>FREE 1 year of AI Resume Builder</span>
                        </div>
                      </div>
                    </button>

                    {/* Plan 2: Monthly */}
                    <button
                      type="button"
                      onClick={() => handleSelectPlan("monthly")}
                      className={`relative rounded-2xl p-5 sm:p-6 transition-all text-left bg-white cursor-pointer ${
                        state.selectedPricingPlan === "monthly"
                          ? "border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                          : "border border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      {state.selectedPricingPlan === "monthly" && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            Monthly
                          </h3>
                          <span className="text-xs text-slate-400 line-through">
                            $35.99
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            $17.99
                          </span>
                          <span className="text-xs text-slate-400 block font-normal">
                            /month
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-slate-700 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Access to all jobs</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Save 35% vs weekly</span>
                        </div>
                      </div>
                    </button>

                    {/* Plan 3: Weekly */}
                    <button
                      type="button"
                      onClick={() => handleSelectPlan("weekly")}
                      className={`relative rounded-2xl p-5 sm:p-6 transition-all text-left bg-white cursor-pointer ${
                        state.selectedPricingPlan === "weekly"
                          ? "border-2 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                          : "border border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      {state.selectedPricingPlan === "weekly" && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            Weekly
                          </h3>
                          <span className="text-xs text-slate-400 line-through">
                            $13.99
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                            $6.99
                          </span>
                          <span className="text-xs text-slate-400 block font-normal">
                            /week
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs sm:text-[13px] text-slate-700 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Access to all jobs</span>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Continue Button */}
                  <div className="max-w-xl mx-auto space-y-3 pt-4">
                    <button
                      type="button"
                      onClick={handleContinueClick}
                      disabled={isProcessingCheckout}
                      className="w-full py-4 px-6 rounded-xl text-base font-bold bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessingCheckout ? "Processing..." : "Continue"}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
                      <span>✓ No commitment • Cancel anytime</span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          markOnboardingCompleted();
                          router.push("/");
                        }}
                        className="text-xs text-slate-400 hover:text-slate-700 hover:underline cursor-pointer"
                      >
                        Skip for now and browse free preview jobs &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Social Proof: 8,573 Job Seekers */}
                  <div className="pt-16 mt-16 border-t border-slate-200">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
                      8,573 job seekers are using Career Hound
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                      {TESTIMONIALS.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-full ${item.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                            >
                              {item.avatarInitials}
                            </div>
                            <span className="font-bold text-sm text-slate-900">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(item.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Regular Next Button for Steps 1 through 12 */}
          {!isPaywallStep && (
            <div className="pt-6">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!canProceed()}
                className={`w-full py-3.5 px-4 rounded-xl text-base font-semibold transition-all shadow-sm flex items-center justify-center cursor-pointer ${
                  canProceed()
                    ? "bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.99]"
                    : "bg-[#CAD5E2] text-white cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Email Collection Modal if continuing without saved email */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 text-left border border-slate-200">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">
                Enter your email to continue
              </h3>
              <p className="text-xs text-slate-500">
                Your direct ATS application link activation will be tied to this email.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (emailInput && emailInput.includes("@")) {
                  executeCheckout(emailInput);
                }
              }}
              className="space-y-3"
            >
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                autoFocus
              />

              <button
                type="submit"
                disabled={isProcessingCheckout}
                className="w-full py-3 rounded-xl font-bold bg-slate-950 text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isProcessingCheckout
                    ? "Redirecting..."
                    : `Continue to Checkout (${state.selectedPricingPlan === "lifetime" ? "$49.99" : state.selectedPricingPlan === "monthly" ? "$17.99" : "$6.99"})`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Named alias for backwards compatibility
export const OnboardingFlow = CareerHoundOnboardingFlow;
