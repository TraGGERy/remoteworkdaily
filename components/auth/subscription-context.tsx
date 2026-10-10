"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppAuth } from "./auth-provider";

interface SubscriptionContextType {
  isSignedIn: boolean;
  hasActiveSubscription: boolean;
  isLoading: boolean;
  userEmail: string | null;
  subscriptionPlan: string | null;
  isUpgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  refreshSubscription: () => Promise<void>;
  simulateSubscription: (active: boolean, plan?: string) => void;
  cancelSubscription: () => Promise<boolean>;
  deleteAccount: (options?: { cancelPlanFirst?: boolean; email?: string }) => Promise<{
    success: boolean;
    error?: string;
    hasActiveSubscription?: boolean;
  }>;
  isOnboardingCompleted: boolean;
  markOnboardingCompleted: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSignedIn: false,
  hasActiveSubscription: false,
  isLoading: true,
  userEmail: null,
  subscriptionPlan: null,
  isUpgradeModalOpen: false,
  setUpgradeModalOpen: () => {},
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  refreshSubscription: async () => {},
  simulateSubscription: () => {},
  cancelSubscription: async () => false,
  deleteAccount: async () => ({ success: false, error: "Context not initialized" }),
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
  const [subscriptionPlan, setSubscriptionPlan] = useState<string | null>(null);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("rwd_onboarding_completed") === "true";
      const session = sessionStorage.getItem("rwd_onboarding_completed") === "true" || sessionStorage.getItem("rwd_onboarding_shown") === "true";
      const cookie = document.cookie.includes("rwd_onboarding_completed=true");
      return local || session || cookie;
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
        if (data.active && data.pass) {
          setSubscriptionPlan(data.pass.plan || "monthly");
        } else {
          setSubscriptionPlan(null);
        }
        if (data.onboardingCompleted) {
          setIsOnboardingCompleted(true);
          if (typeof window !== "undefined") {
            localStorage.setItem("rwd_onboarding_completed", "true");
            sessionStorage.setItem("rwd_onboarding_completed", "true");
            document.cookie = "rwd_onboarding_completed=true; path=/; max-age=31536000; SameSite=Lax";
          }
        }
      } else {
        setHasServerSub(false);
        setSubscriptionPlan(null);
      }
    } catch (err) {
      console.warn("Could not check subscription status:", err);
      setHasServerSub(false);
      setSubscriptionPlan(null);
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
        const plan = urlParams.get("plan") || "monthly";
        localStorage.setItem("rwd_onboarding_completed", "true");
        sessionStorage.setItem("rwd_onboarding_completed", "true");
        document.cookie = "rwd_onboarding_completed=true; path=/; max-age=31536000; SameSite=Lax";
        localStorage.setItem("remotework_active_subscription", "true");
        localStorage.setItem("remotework_subscription_plan", plan);
        setTimeout(() => {
          setSimulatedSub(true);
          setHasServerSub(true);
          setSubscriptionPlan(plan);
        }, 0);
      }
    }

    // Check local storage for simulation or cached pass
    const cached = localStorage.getItem("remotework_active_subscription");
    if (cached !== null) {
      setTimeout(() => {
        setSimulatedSub(cached === "true");
      }, 0);
    }
    const cachedPlan = localStorage.getItem("remotework_subscription_plan");
    if (cachedPlan) {
      setTimeout(() => {
        setSubscriptionPlan(cachedPlan);
      }, 0);
    }

    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("remotework_user_email") : null;
    const emailToCheck = primaryEmail || storedEmail;

    if (emailToCheck) {
      setTimeout(() => {
        checkSubscription(emailToCheck);
      }, 0);
    } else {
      setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
  }, [primaryEmail, checkSubscription]);

  // Sync Clerk user onboarding metadata with localStorage
  useEffect(() => {
    if (clerkUser) {
      const userCompleted = Boolean(clerkUser.unsafeMetadata?.onboarding_completed);
      const localCompleted = typeof window !== "undefined" && (
        localStorage.getItem("rwd_onboarding_completed") === "true" ||
        document.cookie.includes("rwd_onboarding_completed=true")
      );

      if (userCompleted) {
        if (typeof window !== "undefined") {
          localStorage.setItem("rwd_onboarding_completed", "true");
          sessionStorage.setItem("rwd_onboarding_completed", "true");
          document.cookie = "rwd_onboarding_completed=true; path=/; max-age=31536000; SameSite=Lax";
        }
        setTimeout(() => {
          setIsOnboardingCompleted(true);
        }, 0);
      } else if (localCompleted) {
        // Sync local completion to Clerk metadata so it persists across other devices/browsers
        clerkUser.update({
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            onboarding_completed: true,
          },
        }).catch(() => {});
        setTimeout(() => {
          setIsOnboardingCompleted(true);
        }, 0);
      }
    }
  }, [clerkUser]);

  const markOnboardingCompleted = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rwd_onboarding_completed", "true");
      sessionStorage.setItem("rwd_onboarding_completed", "true");
      sessionStorage.setItem("rwd_onboarding_shown", "true");
      document.cookie = "rwd_onboarding_completed=true; path=/; max-age=31536000; SameSite=Lax";
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

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("remotework_user_email") : null;
    const emailToCancel = primaryEmail || storedEmail;

    // Instantly update client optimistic state
    setSimulatedSub(false);
    setHasServerSub(false);
    setSubscriptionPlan(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("remotework_active_subscription", "false");
      localStorage.removeItem("remotework_subscription_plan");
    }

    if (!emailToCancel) {
      return true;
    }

    try {
      const res = await fetch("/api/user/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCancel }),
      });
      return res.ok;
    } catch (err) {
      console.warn("Failed to cancel subscription via API:", err);
      return true;
    }
  }, [primaryEmail]);

  const deleteAccount = useCallback(
    async (options?: { cancelPlanFirst?: boolean; email?: string }): Promise<{
      success: boolean;
      error?: string;
      hasActiveSubscription?: boolean;
    }> => {
      const storedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("remotework_user_email") ||
            localStorage.getItem("remotework_employer_email")
          : null;
      const emailToDelete = options?.email?.trim().toLowerCase() || primaryEmail || storedEmail;

      if (!emailToDelete) {
        return {
          success: false,
          error: "A valid email or active session is required to delete your account.",
        };
      }

      try {
        const res = await fetch("/api/user/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailToDelete,
            cancelPlan: Boolean(options?.cancelPlanFirst),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          return {
            success: false,
            error: data.error || "Failed to delete account.",
            hasActiveSubscription: Boolean(data.hasActiveSubscription),
          };
        }

        // Reset client subscription state and wipe persisted credentials
        setSimulatedSub(false);
        setHasServerSub(false);
        setSubscriptionPlan(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("remotework_user_email");
          localStorage.removeItem("remotework_employer_email");
          localStorage.removeItem("remotework_active_subscription");
          localStorage.removeItem("remotework_subscription_plan");
          localStorage.removeItem("rwd_onboarding_completed");
          sessionStorage.removeItem("rwd_onboarding_completed");
          sessionStorage.removeItem("rwd_onboarding_shown");
          document.cookie = "rwd_onboarding_completed=; path=/; max-age=0";
        }

        return { success: true };
      } catch (err) {
        console.error("Account deletion network error:", err);
        return {
          success: false,
          error: "A network error occurred while deleting your account. Please try again.",
        };
      }
    },
    [primaryEmail]
  );

  const openUpgradeModal = () => setUpgradeModalOpen(true);
  const closeUpgradeModal = () => setUpgradeModalOpen(false);

  const simulateSubscription = (active: boolean, plan?: string) => {
    setSimulatedSub(active);
    if (typeof window !== "undefined") {
      localStorage.setItem("remotework_active_subscription", active ? "true" : "false");
      if (plan) {
        localStorage.setItem("remotework_subscription_plan", plan);
        setSubscriptionPlan(plan);
      } else if (!active) {
        localStorage.removeItem("remotework_subscription_plan");
        setSubscriptionPlan(null);
      }
    }
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
        subscriptionPlan,
        isUpgradeModalOpen,
        setUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal,
        refreshSubscription,
        simulateSubscription,
        cancelSubscription,
        deleteAccount,
        isOnboardingCompleted,
        markOnboardingCompleted,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
