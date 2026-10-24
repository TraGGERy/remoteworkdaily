"use client";

import React from "react";
import { ROLE_CATEGORIES } from "@/lib/constants";
import { ChevronDown, X } from "lucide-react";

interface SuggestedFiltersProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function SuggestedFilters({ activeCategory, onSelectCategory }: SuggestedFiltersProps) {
  // Primary quick pills: All Jobs, Developer, Design
  const PRIMARY_ROLES = ROLE_CATEGORIES.slice(0, 3); // all, dev, design
  // Roles moved to dropdown (Executive, Marketing, Sales, Support, Finance, etc.)
  const DROPDOWN_ROLES = ROLE_CATEGORIES.slice(3);

  const selectedDropdownRole = DROPDOWN_ROLES.find((r) => r.id === activeCategory);
  const isDropdownRoleActive = Boolean(selectedDropdownRole);

  return (
    <div className="w-full max-w-full min-w-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-0.5 scroll-smooth -webkit-overflow-scrolling-touch">
      {/* 1. Quick Access Pills */}
      {PRIMARY_ROLES.map((cat) => {
        const isActive =
          cat.id === "all" ? activeCategory === "" || activeCategory === "all" : activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id === "all" ? "" : cat.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none border shrink-0 ${
              isActive
                ? "bg-[#FF4742] text-white border-[#FF4742] shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}

      {/* 2. Specializations Dropdown (Executive, Marketing, Sales, Finance, etc.) */}
      <div className="relative shrink-0 inline-flex items-center">
        <select
          value={isDropdownRoleActive ? activeCategory : ""}
          onChange={(e) => onSelectCategory(e.target.value)}
          aria-label="Select role specialization such as Executive, Marketing, or Sales"
          className={`inline-flex items-center gap-1.5 pl-3.5 pr-8 py-1.5 min-h-[38px] rounded-full text-xs sm:text-sm font-semibold transition-all select-none border appearance-none cursor-pointer ${
            isDropdownRoleActive
              ? "bg-[#FF4742] text-white border-[#FF4742] shadow-sm font-bold"
              : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
          }`}
        >
          <option value="" disabled={isDropdownRoleActive} className="text-neutral-900 dark:text-white bg-white dark:bg-neutral-900">
            {isDropdownRoleActive
              ? `${selectedDropdownRole?.icon} ${selectedDropdownRole?.label}`
              : "💼 More Roles (Executive, Marketing...)"}
          </option>
          {DROPDOWN_ROLES.map((role) => (
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
            isDropdownRoleActive ? "text-white" : "text-neutral-400"
          }`}
        />
        {isDropdownRoleActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectCategory("");
            }}
            className="ml-1 p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
            title="Reset role filter back to All Jobs"
            aria-label="Clear role filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
