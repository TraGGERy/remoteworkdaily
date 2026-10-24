import { Metadata } from "next";
import { CareerHoundOnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Candidate Onboarding — Career Hound & Remote Match Funnel",
  description: "Personalize your verified remote and high-paying job stream directly from company ATS portals.",
};

export default function OnboardingPage() {
  return <CareerHoundOnboardingFlow />;
}
