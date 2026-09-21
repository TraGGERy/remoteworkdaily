"use client";

import React from "react";
import Link from "next/link";
import { useAppAuth } from "./auth-provider";
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export function AuthButtons() {
  const { isConfigured } = useAppAuth();

  if (isConfigured) {
    return (
      <div className="flex items-center gap-2">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="px-3.5 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Log in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-3.5 py-1.5 text-sm font-medium rounded-md bg-[#FF4742] text-white hover:bg-[#e03a35] transition-colors shadow-sm">
              Sign up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-semibold px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
            >
              My Jobs
            </Link>
            <UserButton />
          </div>
        </Show>
      </div>
    );
  }

  // Preview / development mode buttons
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="px-3.5 py-1.5 text-sm font-medium rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        Log in
      </Link>
      <Link
        href="/sign-up"
        className="px-3.5 py-1.5 text-sm font-medium rounded-md bg-[#FF4742] text-white hover:bg-[#e03a35] transition-colors shadow-sm"
      >
        Join
      </Link>
    </div>
  );
}
