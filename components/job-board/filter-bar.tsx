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

  useEffect(() => {
    setLocalQuery(filters.query);
  }, [filters.query]);

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
    filters.directAtsOnly;

  return (
    <div className="sticky top-16 z-30 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 py-2 sm:py-3 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 min-w-0">
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
      </div>
    </div>
  );
}
