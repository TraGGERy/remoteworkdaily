"use client";

import React from "react";
import { ROLE_CATEGORIES } from "@/lib/constants";
import { ChevronDown, X } from "lucide-react";

interface SuggestedFiltersProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function SuggestedFilters({ activeCategory, onSelectCategory }: SuggestedFiltersProps) {
  // Dropdown list contains ALL role categories: Developer, Designer, Marketing, Executive, etc.
  const ALL_ROLES = ROLE_CATEGORIES.filter((c) => c.id !== "all");

  const selectedRole = ALL_ROLES.find((r) => r.id === activeCategory);
  const isRoleActive = Boolean(selectedRole);

  return (
    <div className="w-full max-w-full min-w-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-0.5 scroll-smooth -webkit-overflow-scrolling-touch">
      {/* 1. All Jobs Quick Pill */}
      <button
        type="button"
        onClick={() => onSelectCategory("")}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none border shrink-0 cursor-pointer ${
          !activeCategory || activeCategory === "all"
            ? "bg-[#FF4742] text-white border-[#FF4742] shadow-sm font-bold"
            : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
        }`}
      >
        <span>🌐</span>
        <span>All Jobs</span>
      </button>

      {/* 2. Categories Dropdown (Developer, Designer, Marketing, Executive, etc. ALL inside) */}
      <div className="relative shrink-0 inline-flex items-center">
        <select
          value={isRoleActive ? activeCategory : ""}
          onChange={(e) => onSelectCategory(e.target.value)}
          aria-label="Select role category (Developer, Designer, Marketing, Executive, etc.)"
          className={`inline-flex items-center gap-1.5 pl-3.5 pr-8 py-1.5 min-h-[38px] rounded-full text-xs sm:text-sm font-semibold transition-all select-none border appearance-none cursor-pointer ${
            isRoleActive
              ? "bg-[#FF4742] text-white border-[#FF4742] shadow-sm font-bold"
              : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
          }`}
        >
          <option value="" disabled={isRoleActive} className="text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 font-medium">
            {isRoleActive
              ? `${selectedRole?.icon} ${selectedRole?.label}`
              : "💼 Categories & Roles (Developer, Designer, Marketing...)"}
          </option>
          {ALL_ROLES.map((role) => (
            <option
              key={role.id}
              value={role.id}
              className="text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 font-medium py-1"
            >
              {role.icon} {role.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`w-3.5 h-3.5 absolute right-2.5 pointer-events-none transition-colors ${
            isRoleActive ? "text-white" : "text-neutral-400"
          }`}
        />
        {isRoleActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCategory("");
            }}
            className="ml-1 p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Reset category back to All Jobs"
            aria-label="Clear role category filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
