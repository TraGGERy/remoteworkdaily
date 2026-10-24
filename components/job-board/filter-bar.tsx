"use client";

import React, { useState, useEffect } from "react";
import { FilterState } from "@/lib/types";
import { SalarySliderPopup } from "./salary-slider-popup";
import { LocationPopup } from "./location-popup";
import { Search, X, ChevronDown } from "lucide-react";

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
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

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

  const hasActiveFilters =
    filters.query ||
    filters.location ||
    filters.minSalary > 0 ||
    filters.benefits.length > 0 ||
    filters.tags.length > 0 ||
    (filters.workplaceType && filters.workplaceType !== "all") ||
    (filters.category && filters.category !== "all") ||
    (filters.freshness && filters.freshness !== "all") ||
    filters.directAtsOnly ||
    filters.transparentPayOnly ||
    filters.worldwideOnly ||
    filters.lowCompetitionOnly ||
    filters.publicSectorOnly ||
    (filters.sector && filters.sector !== "all") ||
    (filters.eligibility && filters.eligibility !== "all") ||
    (filters.languageReq && filters.languageReq !== "all") ||
    (filters.deadlineUrgency && filters.deadlineUrgency !== "all");

  return (
    <div className="sticky top-16 z-30 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 py-2 sm:py-3 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 min-w-0 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px] min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="🔍 Search title, company, skills, or city..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#FF4742] transition-colors"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => {
                  setLocalQuery("");
                  onUpdateFilters({ query: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Chips & Dropdowns */}
          <div className="w-full max-w-full min-w-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth sm:flex-wrap sm:overflow-visible py-0.5 -webkit-overflow-scrolling-touch">
            {/* Freshness / Minutes-Old Hack Dropdown */}
            <div className="relative shrink-0">
              <select
                value={filters.freshness || "all"}
                onChange={(e) =>
                  onUpdateFilters({
                    freshness: e.target.value as FilterState["freshness"],
                  })
                }
                aria-label="Filter by posting freshness"
                className={`h-9 pl-3 pr-7 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer focus:outline-none appearance-none ${
                  filters.freshness && filters.freshness !== "all"
                    ? "bg-orange-50 dark:bg-orange-950/40 text-[#FF4742] dark:text-orange-300 border-[#FF4742] font-bold shadow-sm"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700"
                }`}
              >
                <option value="all">⏱️ Posted: Any time</option>
                <option value="1h">🔥 Under 1 Hour (0-5 Applicants)</option>
                <option value="6h">⚡ Last 6 Hours (Early Bird)</option>
                <option value="24h">🆕 Past 24 Hours</option>
                <option value="7d">📅 Past 7 Days</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Job Type Dropdown */}
            <div className="relative shrink-0">
              <select
                value={filters.workplaceType || "all"}
                onChange={(e) =>
                  onUpdateFilters({
                    workplaceType: e.target.value as FilterState["workplaceType"],
                  })
                }
                aria-label="Filter by job type"
                className={`h-9 pl-3 pr-7 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer focus:outline-none appearance-none ${
                  filters.workplaceType && filters.workplaceType !== "all"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400 font-bold shadow-sm"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700"
                }`}
              >
                <option value="all">💼 Job Type: All</option>
                <option value="remote">🌐 Remote</option>
                <option value="on-site">🏢 On-site</option>
                <option value="hybrid">🔀 Hybrid</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Location Filter Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsLocationOpen(!isLocationOpen);
                  setIsSalaryOpen(false);
                }}
                className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap ${
                  filters.location
                    ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] border-[#FF4742] font-bold shadow-sm"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700"
                }`}
              >
                <span>🌏</span>
                <span className="max-w-[100px] truncate">
                  {filters.location || "Location"}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              <LocationPopup
                isOpen={isLocationOpen}
                onClose={() => setIsLocationOpen(false)}
                selectedLocation={filters.location}
                onSelectLocation={(loc) => onUpdateFilters({ location: loc })}
              />
            </div>

            {/* Salary Filter Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSalaryOpen(!isSalaryOpen);
                  setIsLocationOpen(false);
                }}
                className={`h-9 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap ${
                  filters.minSalary > 0
                    ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] border-[#FF4742] font-bold shadow-sm"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700"
                }`}
              >
                <span>💵</span>
                <span>
                  {filters.minSalary > 0 ? `>${filters.minSalary}k` : "Salary"}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
              <SalarySliderPopup
                isOpen={isSalaryOpen}
                onClose={() => setIsSalaryOpen(false)}
                minSalary={filters.minSalary}
                onChangeSalary={(sal) => onUpdateFilters({ minSalary: sal })}
              />
            </div>

            {/* Sort By Dropdown */}
            <div className="relative shrink-0">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onUpdateFilters({
                    sortBy: e.target.value as FilterState["sortBy"],
                  })
                }
                aria-label="Sort job listings"
                className="h-9 pl-3 pr-7 rounded-xl text-xs sm:text-sm font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700 focus:outline-none focus:border-[#FF4742] cursor-pointer appearance-none"
              >
                <option value="default">🦴 Sort by</option>
                <option value="date">🆕 Latest jobs</option>
                <option value="salary">💵 Highest paid</option>
                <option value="views">👀 Most viewed</option>
                <option value="applied">✅ Most applied</option>
                <option value="hot">🔥 Hottest</option>
                <option value="benefits">🎪 Most benefits</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="h-9 inline-flex items-center gap-1 px-3 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0 whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset ({totalResults})</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Anti-Ghost & Public Sector Quick Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Public Sector & Government Master Toggle */}
          <button
            type="button"
            onClick={() => onUpdateFilters({ publicSectorOnly: !filters.publicSectorOnly })}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-black inline-flex items-center gap-1.5 border transition-all shrink-0 whitespace-nowrap shadow-xs ${
              filters.publicSectorOnly
                ? "bg-[#003399] text-white border-[#003399] shadow-sm"
                : "bg-blue-50/80 dark:bg-blue-950/40 text-[#003399] dark:text-blue-300 border-blue-200 dark:border-blue-900/60 hover:border-[#003399]"
            }`}
            title="Filter for European Union, United Nations, Civil Service & Government roles"
          >
            <span>🏛️ Public Sector &amp; Gov</span>
          </button>

          {/* 100% True Worldwide Toggle */}
          <button
            type="button"
            onClick={() => onUpdateFilters({ worldwideOnly: !filters.worldwideOnly })}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-all shrink-0 whitespace-nowrap ${
              filters.worldwideOnly
                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                : "bg-neutral-50 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-emerald-400"
            }`}
            title="Show only 100% Anywhere in the World roles (no country or state residency traps)"
          >
            <span>🌍 100% Worldwide</span>
          </button>

          {/* Upfront Salary / Transparent Pay Toggle */}
          <button
            type="button"
            onClick={() => onUpdateFilters({ transparentPayOnly: !filters.transparentPayOnly })}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-all shrink-0 whitespace-nowrap ${
              filters.transparentPayOnly
                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                : "bg-neutral-50 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-emerald-400"
            }`}
            title="Hide listings with undisclosed salary ranges"
          >
            <span>💰 Upfront Pay</span>
          </button>

          {/* Low Competition (<15 Applicants) Toggle */}
          <button
            type="button"
            onClick={() => onUpdateFilters({ lowCompetitionOnly: !filters.lowCompetitionOnly })}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-all shrink-0 whitespace-nowrap ${
              filters.lowCompetitionOnly
                ? "bg-[#FF4742] text-white border-[#FF4742] shadow-xs"
                : "bg-neutral-50 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-[#FF4742]"
            }`}
            title="Beat the 500+ applicant black hole: only show fresh roles with <15 applicants"
          >
            <span>🎯 &lt;15 Applicants</span>
          </button>

          {/* Direct ATS Portal Toggle */}
          <button
            type="button"
            onClick={() => onUpdateFilters({ directAtsOnly: !filters.directAtsOnly })}
            className={`h-7 px-2.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-all shrink-0 whitespace-nowrap ${
              filters.directAtsOnly
                ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                : "bg-neutral-50 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-sky-400"
            }`}
            title="Only show direct company career portals"
          >
            <span>🛡️ Direct ATS</span>
          </button>
        </div>

        {/* Row 3: Public Sector Sub-Filters (Visible when Public Sector mode is enabled or when public sector filters are active) */}
        {(filters.publicSectorOnly || filters.sector || filters.eligibility || filters.languageReq || filters.deadlineUrgency) && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-150">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#003399] dark:text-blue-400 shrink-0 mr-1 flex items-center gap-1">
              <span>🏛️ Gov Filters:</span>
            </span>

            {/* 1. Sector Filter */}
            <div className="relative shrink-0">
              <select
                value={filters.sector || "all"}
                onChange={(e) => onUpdateFilters({ sector: e.target.value as FilterState["sector"] })}
                aria-label="Filter by public sector branch"
                className={`h-7 pl-2.5 pr-6 rounded-lg text-[11px] font-bold border transition-all cursor-pointer focus:outline-none appearance-none ${
                  filters.sector && filters.sector !== "all"
                    ? "bg-blue-100 dark:bg-blue-950 text-[#003399] dark:text-blue-300 border-[#003399]"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <option value="all">🌐 Sector: All Bodies</option>
                <option value="eu_institutions">🇪🇺 EU Institutions &amp; Agencies</option>
                <option value="national_government">🏛️ National Government &amp; Ministries</option>
                <option value="un_international">🇺🇳 International NGOs &amp; UN</option>
                <option value="regional_local">🏙️ Regional / Local Administration</option>
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 2. Eligibility Filter */}
            <div className="relative shrink-0">
              <select
                value={filters.eligibility || "all"}
                onChange={(e) => onUpdateFilters({ eligibility: e.target.value as FilterState["eligibility"] })}
                aria-label="Filter by citizenship eligibility"
                className={`h-7 pl-2.5 pr-6 rounded-lg text-[11px] font-bold border transition-all cursor-pointer focus:outline-none appearance-none ${
                  filters.eligibility && filters.eligibility !== "all"
                    ? "bg-blue-100 dark:bg-blue-950 text-[#003399] dark:text-blue-300 border-[#003399]"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <option value="all">🛂 Eligibility: All Statuses</option>
                <option value="open_worldwide">🌍 Open Worldwide (Any Nationality)</option>
                <option value="citizenship_required">🇪🇺 Citizenship Required (EU/National)</option>
                <option value="visa_sponsored">🪪 Visa Sponsored</option>
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 3. Language Required */}
            <div className="relative shrink-0">
              <select
                value={filters.languageReq || "all"}
                onChange={(e) => onUpdateFilters({ languageReq: e.target.value as FilterState["languageReq"] })}
                aria-label="Filter by required language skills"
                className={`h-7 pl-2.5 pr-6 rounded-lg text-[11px] font-bold border transition-all cursor-pointer focus:outline-none appearance-none ${
                  filters.languageReq && filters.languageReq !== "all"
                    ? "bg-blue-100 dark:bg-blue-950 text-[#003399] dark:text-blue-300 border-[#003399]"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <option value="all">🗣️ Languages: Any</option>
                <option value="en_only">🇬🇧 English Only</option>
                <option value="multilingual">🌐 Multilingual (EN + FR/DE/ES)</option>
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 4. Application Deadline */}
            <div className="relative shrink-0">
              <select
                value={filters.deadlineUrgency || "all"}
                onChange={(e) => onUpdateFilters({ deadlineUrgency: e.target.value as FilterState["deadlineUrgency"] })}
                aria-label="Filter by application deadline urgency"
                className={`h-7 pl-2.5 pr-6 rounded-lg text-[11px] font-bold border transition-all cursor-pointer focus:outline-none appearance-none ${
                  filters.deadlineUrgency && filters.deadlineUrgency !== "all"
                    ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-400"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <option value="all">⏳ Deadline: All</option>
                <option value="closing_48h">🚨 Closing Soon (&lt; 48 hrs)</option>
                <option value="next_7d">📅 Next 7 Days</option>
              </select>
              <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

