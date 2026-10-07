"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { NoticeBanner } from "./notice-banner";
import { CatchEmailsBanner } from "./catch-emails-banner";
import { Footer } from "./footer";
import { CandidateUpgradeModal } from "@/components/job-board/candidate-upgrade-modal";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname?.startsWith("/onboarding");

  if (isOnboarding) {
    return <div className="min-h-screen bg-[#F6F8FB]">{children}</div>;
  }

  return (
    <>
      <Header />
      <NoticeBanner />
      <div className="flex-1 pb-16">{children}</div>
      <CatchEmailsBanner />
      <Footer />
      <CandidateUpgradeModal />
    </>
  );
}
