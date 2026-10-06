"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppAuth } from "./auth-provider";

interface SubscriptionContextType {
  isSignedIn: boolean;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  userEmail: string | null;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  refreshSubscription: () => Promise<void>;
  simulateSubscription: (active: boolean) => void;
  isOnboardingCompleted: boolean;
  markOnboardingCompleted: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSignedIn: false,
  hasActiveSubscription: false,
  isLoading: true,
  userEmail: null,
  isUpgradeModalOpen: false,
  setUpgradeModalOpen: () => {},
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  refreshSubscription: async () => {},
  simulateSubscription: () => {},
  isOnboardingCompleted: false,
  markOnboardingCompleted: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { isConfigured } = useAppAuth();
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [simulatedSub, setSimulatedSub] = useState<boolean | null>(null);
  const [hasServerSub, setHasServerSub] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rwd_onboarding_completed") === "true";
    }
    return false;
  });

  // Safely hook into Clerk if configured
  let clerkUser: ReturnType<typeof useUser>["user"] = null;
  let clerkIsLoaded = true;
  let clerkIsSignedIn = false;

  try {
    // Only call Clerk's useUser when ClerkProvider is active
    if (isConfigured) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const auth = useUser();
      clerkUser = auth.user;
      clerkIsLoaded = auth.isLoaded;
      clerkIsSignedIn = Boolean(auth.isSignedIn);
    }
  } catch {
    // Fallback if Clerk isn't initialized
    clerkUser = null;
    clerkIsLoaded = true;
    clerkIsSignedIn = false;
  }

  const primaryEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    null;

  // Check subscription status from server
  const checkSubscription = useCallback(async (email: string | null) => {
    if (!email) {
      setHasServerSub(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/user/subscription?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setHasServerSub(Boolean(data.active));
      } else {
        setHasServerSub(false);
      }
    } catch (err) {
      console.warn("Could not check subscription status:", err);
      setHasServerSub(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync state on mount and when user changes
  useEffect(() => {
    // Check if user just returned from successful Stripe checkout
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("subscription") === "success") {
        localStorage.setItem("rwd_onboarding_completed", "true");
        localStorage.setItem("remotework_active_subscription", "true");
        setSimulatedSub(true);
        setHasServerSub(true);
      }
    }

    // Check local storage for simulation or cached pass
    const cached = localStorage.getItem("remotework_active_subscription");
    if (cached !== null) {
      setSimulatedSub(cached === "true");
    }

    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("remotework_user_email") : null;
    const emailToCheck = primaryEmail || storedEmail;

    if (emailToCheck) {
      checkSubscription(emailToCheck);
    } else {
      setIsLoading(false);
    }
  }, [primaryEmail, checkSubscription]);

  // Sync Clerk user onboarding metadata with localStorage
  useEffect(() => {
    if (clerkUser) {
      const userCompleted = Boolean(clerkUser.unsafeMetadata?.onboarding_completed);
      const localCompleted = typeof window !== "undefined" && localStorage.getItem("rwd_onboarding_completed") === "true";

      if (userCompleted) {
        if (typeof window !== "undefined") {
          localStorage.setItem("rwd_onboarding_completed", "true");
        }
        setIsOnboardingCompleted(true);
      } else if (localCompleted) {
        // Sync local completion to Clerk metadata so it persists across other devices/browsers
        clerkUser.update({
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            onboarding_completed: true,
          },
        }).catch(() => {});
        setIsOnboardingCompleted(true);
      }
    }
  }, [clerkUser]);

  const markOnboardingCompleted = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rwd_onboarding_completed", "true");
    }
    setIsOnboardingCompleted(true);

    if (clerkUser) {
      try {
        await clerkUser.update({
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            onboarding_completed: true,
          },
        });
      } catch (err) {
        console.warn("Failed to update Clerk user onboarding metadata:", err);
      }
    }
  }, [clerkUser]);

  const openUpgradeModal = () => setUpgradeModalOpen(true);
  const closeUpgradeModal = () => setUpgradeModalOpen(false);

  const simulateSubscription = (active: boolean) => {
    setSimulatedSub(active);
    localStorage.setItem("remotework_active_subscription", active ? "true" : "false");
  };

  const refreshSubscription = async () => {
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("remotework_user_email") : null;
    await checkSubscription(primaryEmail || storedEmail);
  };

  // Determine final subscription state:
  // Simulation takes precedence for dev testing; otherwise server status
  const hasActiveSubscription =
    simulatedSub !== null ? simulatedSub : hasServerSub;

  return (
    <SubscriptionContext.Provider
      value={{
        isSignedIn: isConfigured ? clerkIsSignedIn : Boolean(primaryEmail || simulatedSub),
        hasActiveSubscription,
        isLoading: isConfigured ? !clerkIsLoaded || isLoading : false,
        userEmail: primaryEmail,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        refreshSubscription,
        simulateSubscription,
        isOnboardingCompleted,
        markOnboardingCompleted,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
