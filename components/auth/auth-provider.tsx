"use client";

import React, { createContext, useContext } from "react";
import { ClerkProvider } from "@clerk/nextjs";

interface AuthContextType {
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({ isConfigured: false });

export function useAppAuth() {
  return useContext(AuthContext);
}

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyValid =
    publishableKey &&
    !publishableKey.includes("placeholder") &&
    (publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_"));

  if (isKeyValid) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <AuthContext.Provider value={{ isConfigured: true }}>
          {children}
        </AuthContext.Provider>
      </ClerkProvider>
    );
  }

  // Graceful fallback for local development before user adds real Clerk keys
  return (
    <AuthContext.Provider value={{ isConfigured: false }}>
      {children}
    </AuthContext.Provider>
  );
}
