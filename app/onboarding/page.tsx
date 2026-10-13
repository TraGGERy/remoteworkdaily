import { Metadata } from "next";
import { MultiStepOnboarding, CareerHoundOnboardingFlow } from "@/components/onboarding/multi-step-onboarding";

export const metadata: Metadata = {
  title: "Candidate Onboarding — Remote & High-Paying Hybrid Match",
  description: "Personalize your verified remote and high-paying hybrid job stream directly from company ATS portals.",
};

// CareerHoundOnboardingFlow reference for backwards compatibility
export default function OnboardingPage() {
  return <MultiStepOnboarding />;
}
