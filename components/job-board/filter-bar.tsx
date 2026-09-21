"use client";

import React, { useState, useEffect } from "react";
import { FilterState } from "@/lib/types";
import { SalarySliderPopup } from "./salary-slider-popup";
import { BenefitsPopup } from "./benefits-popup";
import { LocationPopup } from "./location-popup";
import { Search, Globe, DollarSign, Sparkles, X, ChevronDown } from "lucide-react";

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
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);
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
    (filters.category && filters.category !== "all");

  return (
    <div className="sticky top-16 z-30 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 py-3 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] sm:min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="🔍 Search title, company, skills, or city..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#FF4742] transition-colors"
            />
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery("");
                  onUpdateFilters({ query: "" });
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Workplace Type Toggle: Remote vs On-site vs Hybrid */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onUpdateFilters({ workplaceType: "all" })}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                !filters.workplaceType || filters.workplaceType === "all"
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm font-bold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onUpdateFilters({ workplaceType: "remote" })}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filters.workplaceType === "remote"
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-sm font-bold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              🌐 Remote
            </button>
            <button
              type="button"
              onClick={() => onUpdateFilters({ workplaceType: "on-site" })}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filters.workplaceType === "on-site"
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-sm font-bold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              🏢 On-site
            </button>
            <button
              type="button"
              onClick={() => onUpdateFilters({ workplaceType: "hybrid" })}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                filters.workplaceType === "hybrid"
                  ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 shadow-sm font-bold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              🔀 Hybrid
            </button>
          </div>

          {/* Location Filter Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLocationOpen(!isLocationOpen);
                setIsSalaryOpen(false);
                setIsBenefitsOpen(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                filters.location
                  ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] border-[#FF4742]"
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
          <div className="relative">
            <button
              onClick={() => {
                setIsSalaryOpen(!isSalaryOpen);
                setIsLocationOpen(false);
                setIsBenefitsOpen(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                filters.minSalary > 0
                  ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] border-[#FF4742]"
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

          {/* Benefits Filter Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsBenefitsOpen(!isBenefitsOpen);
                setIsSalaryOpen(false);
                setIsLocationOpen(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                filters.benefits.length > 0
                  ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] border-[#FF4742]"
                  : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700"
              }`}
            >
              <span>🎪</span>
              <span>
                Benefits
                {filters.benefits.length > 0 && ` (${filters.benefits.length})`}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            <BenefitsPopup
              isOpen={isBenefitsOpen}
              onClose={() => setIsBenefitsOpen(false)}
              selectedBenefits={filters.benefits}
              onToggleBenefit={(bId) => {
                const next = filters.benefits.includes(bId)
                  ? filters.benefits.filter((b) => b !== bId)
                  : [...filters.benefits, bId];
                onUpdateFilters({ benefits: next });
              }}
              onClearBenefits={() => onUpdateFilters({ benefits: [] })}
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onUpdateFilters({
                  sortBy: e.target.value as FilterState["sortBy"],
                })
              }
              aria-label="Sort job listings"
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-700 focus:outline-none focus:border-[#FF4742] cursor-pointer"
            >
              <option value="default">🦴 Sort by</option>
              <option value="date">🆕 Latest jobs</option>
              <option value="salary">💵 Highest paid</option>
              <option value="views">👀 Most viewed</option>
              <option value="applied">✅ Most applied</option>
              <option value="hot">🔥 Hottest</option>
              <option value="benefits">🎪 Most benefits</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters ({totalResults} results)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
