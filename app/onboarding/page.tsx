import { Metadata } from "next";
import { CareerHoundOnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Candidate Onboarding — Career Hound",
  description: "Personalize your verified remote job stream directly from company ATS portals.",
};

export default function OnboardingPage() {
  return <CareerHoundOnboardingFlow />;
}
