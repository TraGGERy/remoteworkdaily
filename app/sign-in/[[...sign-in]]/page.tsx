"use client";

import { SignIn } from "@clerk/nextjs";
import { useAppAuth } from "@/components/auth/auth-provider";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const { isConfigured } = useAppAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 bg-neutral-50 dark:bg-neutral-950">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Remote Work Daily</span>
      </Link>

      <div className="w-full max-w-md">
        {isConfigured ? (
          <SignIn routing="path" path="/sign-in" />
        ) : (
          <div className="p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FF4742] text-white flex items-center justify-center font-black text-sm tracking-tight mx-auto">
              RWD
            </div>
            <h1 className="text-xl font-black text-neutral-900 dark:text-white">
              Sign in to Remote Work Daily
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Connect your Clerk account by adding your keys to{" "}
              <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-mono">
                .env.local
              </code>
              .
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="w-full inline-block py-2.5 px-4 rounded-xl text-sm font-bold bg-[#FF4742] text-white hover:bg-[#e03a35] transition-colors"
              >
                Continue as Guest
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
