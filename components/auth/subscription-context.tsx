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
    // Check local storage for simulation or cached pass
    const cached = localStorage.getItem("remotework_active_subscription");
    if (cached !== null) {
      setSimulatedSub(cached === "true");
    }

    if (primaryEmail) {
      checkSubscription(primaryEmail);
    } else {
      setIsLoading(false);
    }
  }, [primaryEmail, checkSubscription]);

  const openUpgradeModal = () => setUpgradeModalOpen(true);
  const closeUpgradeModal = () => setUpgradeModalOpen(false);

  const simulateSubscription = (active: boolean) => {
    setSimulatedSub(active);
    localStorage.setItem("remotework_active_subscription", active ? "true" : "false");
  };

  const refreshSubscription = async () => {
    await checkSubscription(primaryEmail);
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
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
