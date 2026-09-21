"use client";

import React from "react";
import { ROLE_CATEGORIES } from "@/lib/constants";

interface SuggestedFiltersProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function SuggestedFilters({ activeCategory, onSelectCategory }: SuggestedFiltersProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      {ROLE_CATEGORIES.map((cat) => {
        const isActive =
          cat.id === "all" ? activeCategory === "" || activeCategory === "all" : activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id === "all" ? "" : cat.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all select-none border ${
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
    </div>
  );
}
