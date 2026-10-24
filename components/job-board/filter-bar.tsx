"use client";

import React, { useState, useEffect } from "react";
import { FilterState } from "@/lib/types";
import { ROLE_CATEGORIES } from "@/lib/constants";
import { FiltersOverviewModal } from "./filters-overview-modal";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export function FilterBar({
  filters,
  onUpdateFilters,
  onResetFilters,
  totalResults,
}: FilterBarProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  // Debounced search query
  const [localQuery, setLocalQuery] = useState(filters.query);
  const [prevQuery, setPrevQuery] = useState(filters.query);
  if (filters.query !== prevQuery) {
    setPrevQuery(filters.query);
    setLocalQuery(filters.query);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== filters.query) {
        onUpdateFilters({ query: localQuery });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [localQuery, filters.query, onUpdateFilters]);

  // Count active search criteria
  let activeFilterCount = 0;
  if (filters.query) activeFilterCount++;
  if (filters.freshness && filters.freshness !== "all") activeFilterCount++;
  if (filters.workplaceType && filters.workplaceType !== "all") activeFilterCount++;
  if (filters.category && filters.category !== "all" && filters.category !== "") activeFilterCount++;
  if (filters.location) activeFilterCount++;
  if (filters.minSalary > 0) activeFilterCount++;
  if (filters.worldwideOnly) activeFilterCount++;
  if (filters.transparentPayOnly) activeFilterCount++;
  if (filters.lowCompetitionOnly) activeFilterCount++;
  if (filters.directAtsOnly) activeFilterCount++;
  if (filters.publicSectorOnly) activeFilterCount++;
  if (filters.sector && filters.sector !== "all") activeFilterCount++;
  if (filters.eligibility && filters.eligibility !== "all") activeFilterCount++;
  if (filters.languageReq && filters.languageReq !== "all") activeFilterCount++;
  if (filters.deadlineUrgency && filters.deadlineUrgency !== "all") activeFilterCount++;
  if (filters.sortBy && filters.sortBy !== "default") activeFilterCount++;

  const hasActiveFilters = activeFilterCount > 0;

  // Active Filter Summary Chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.freshness && filters.freshness !== "all") {
    const labels: Record<string, string> = {
      "1h": "🔥 <1h",
      "6h": "⚡ <6h",
      "24h": "🆕 Past 24h",
      "7d": "📅 Past 7d",
    };
    activeChips.push({
      key: "freshness",
      label: labels[filters.freshness] || `⏱️ ${filters.freshness}`,
      onRemove: () => onUpdateFilters({ freshness: "all" }),
    });
  }
  if (filters.workplaceType && filters.workplaceType !== "all") {
    activeChips.push({
      key: "workplaceType",
      label: `💼 ${filters.workplaceType.charAt(0).toUpperCase() + filters.workplaceType.slice(1)}`,
      onRemove: () => onUpdateFilters({ workplaceType: "all" }),
    });
  }
  if (filters.category && filters.category !== "all" && filters.category !== "") {
    const cat = ROLE_CATEGORIES.find((c) => c.id === filters.category);
    activeChips.push({
      key: "category",
      label: cat ? `${cat.icon} ${cat.label}` : `🎯 ${filters.category}`,
      onRemove: () => onUpdateFilters({ category: "" }),
    });
  }
  if (filters.location) {
    activeChips.push({
      key: "location",
      label: `🌏 ${filters.location}`,
      onRemove: () => onUpdateFilters({ location: "" }),
    });
  }
  if (filters.minSalary > 0) {
    activeChips.push({
      key: "salary",
      label: `💵 >$${filters.minSalary}k`,
      onRemove: () => onUpdateFilters({ minSalary: 0 }),
    });
  }
  if (filters.publicSectorOnly) {
    activeChips.push({
      key: "publicSector",
      label: "🏛️ Public Sector & Gov",
      onRemove: () => onUpdateFilters({ publicSectorOnly: false }),
    });
  }
  if (filters.worldwideOnly) {
    activeChips.push({
      key: "worldwide",
      label: "🌍 100% Worldwide",
      onRemove: () => onUpdateFilters({ worldwideOnly: false }),
    });
  }
  if (filters.transparentPayOnly) {
    activeChips.push({
      key: "transparentPay",
      label: "💰 Upfront Pay",
      onRemove: () => onUpdateFilters({ transparentPayOnly: false }),
    });
  }
  if (filters.lowCompetitionOnly) {
    activeChips.push({
      key: "lowComp",
      label: "🎯 <15 Applicants",
      onRemove: () => onUpdateFilters({ lowCompetitionOnly: false }),
    });
  }
  if (filters.directAtsOnly) {
    activeChips.push({
      key: "directAts",
      label: "🛡️ Direct ATS",
      onRemove: () => onUpdateFilters({ directAtsOnly: false }),
    });
  }
  if (filters.sector && filters.sector !== "all") {
    const sectorLabels: Record<string, string> = {
      eu_institutions: "🇪🇺 EU Institutions",
      national_government: "🏛️ National Gov",
      un_international: "🇺🇳 UN / Int'l",
      regional_local: "🏙️ Regional / Local",
    };
    activeChips.push({
      key: "sector",
      label: sectorLabels[filters.sector] || `🌐 ${filters.sector}`,
      onRemove: () => onUpdateFilters({ sector: "all" }),
    });
  }
  if (filters.eligibility && filters.eligibility !== "all") {
    const eligLabels: Record<string, string> = {
      open_worldwide: "🌍 Open Worldwide",
      citizenship_required: "🇪🇺 Citizenship Required",
      visa_sponsored: "🪪 Visa Sponsored",
    };
    activeChips.push({
      key: "eligibility",
      label: eligLabels[filters.eligibility] || `🛂 ${filters.eligibility}`,
      onRemove: () => onUpdateFilters({ eligibility: "all" }),
    });
  }
  if (filters.languageReq && filters.languageReq !== "all") {
    const langLabels: Record<string, string> = {
      en_only: "🇬🇧 English Only",
      multilingual: "🌐 Multilingual",
    };
    activeChips.push({
      key: "languageReq",
      label: langLabels[filters.languageReq] || `🗣️ ${filters.languageReq}`,
      onRemove: () => onUpdateFilters({ languageReq: "all" }),
    });
  }
  if (filters.deadlineUrgency && filters.deadlineUrgency !== "all") {
    const deadlineLabels: Record<string, string> = {
      closing_48h: "🚨 Closing <48h",
      next_7d: "📅 Next 7 Days",
    };
    activeChips.push({
      key: "deadline",
      label: deadlineLabels[filters.deadlineUrgency] || `⏳ ${filters.deadlineUrgency}`,
      onRemove: () => onUpdateFilters({ deadlineUrgency: "all" }),
    });
  }
  if (filters.sortBy && filters.sortBy !== "default") {
    const sortLabels: Record<string, string> = {
      date: "🆕 Latest",
      salary: "💵 Highest Paid",
      views: "👀 Most Viewed",
      applied: "✅ Most Applied",
      hot: "🔥 Hottest",
      benefits: "🎪 Benefits",
    };
    activeChips.push({
      key: "sortBy",
      label: `🦴 Sort: ${sortLabels[filters.sortBy] || filters.sortBy}`,
      onRemove: () => onUpdateFilters({ sortBy: "default" }),
    });
  }

  return (
    <div className="sticky top-16 z-30 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 py-2 sm:py-3 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 min-w-0 space-y-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="🔍 Search title, company, skills, or city..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#FF4742] transition-colors"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("");
                  onUpdateFilters({ query: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5 cursor-pointer"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* All Filters Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOverviewOpen(true)}
            className={`h-10 inline-flex items-center gap-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeFilterCount > 0
                ? "bg-red-50 dark:bg-red-950/50 text-[#FF4742] border-[#FF4742] shadow-xs ring-1 ring-[#FF4742]/40"
                : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50"
            }`}
            title="Open filters modal with all search criteria, roles, locations, salaries, and toggles"
            aria-label="Open filter overview modal"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FF4742]" />
            <span>All Filters</span>
            {activeFilterCount > 0 && (
              <span className="min-w-4 h-4 px-1 rounded-full bg-[#FF4742] text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-10 inline-flex items-center gap-1 px-3 rounded-xl text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
              title="Reset all active filters"
            >
              <X className="w-4 h-4" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* Active Filter Chips with 1-Click Remove */}
        {activeChips.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 animate-in fade-in duration-150">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0 mr-1">
              Active:
            </span>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="h-6 pl-2.5 pr-1.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-800 dark:text-neutral-200 hover:text-red-600 dark:hover:text-red-400 inline-flex items-center gap-1 shrink-0 transition-colors group cursor-pointer border border-neutral-200/80 dark:border-neutral-700/80"
                title={`Remove ${chip.label}`}
              >
                <span>{chip.label}</span>
                <X className="w-3 h-3 text-neutral-400 group-hover:text-red-500" />
              </button>
            ))}
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline shrink-0 ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* All Filters & Selected Criteria Overview Popup Modal */}
      <FiltersOverviewModal
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        filters={filters}
        onUpdateFilters={onUpdateFilters}
        onResetFilters={onResetFilters}
        totalResults={totalResults}
      />
    </div>
  );
}
