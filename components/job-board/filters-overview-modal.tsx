"use client";

import React, { useEffect, useRef } from "react";
import { FilterState, TagCategory } from "@/lib/types";
import { ROLE_CATEGORIES, REGIONS_AND_COUNTRIES } from "@/lib/constants";
import {
  X,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Globe,
  DollarSign,
  Briefcase,
  Clock,
  Sparkles,
  Shield,
  Building2,
  Calendar,
  Languages,
  UserCheck,
  ArrowRight,
} from "lucide-react";

interface FiltersOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export function FiltersOverviewModal({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  totalResults,
}: FiltersOverviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute active filters count and summary chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.query) {
    activeChips.push({
      key: "query",
      label: `🔍 "${filters.query}"`,
      onRemove: () => onUpdateFilters({ query: "" }),
    });
  }
  if (filters.freshness && filters.freshness !== "all") {
    const labels: Record<string, string> = {
      "1h": "🔥 <1 Hour",
      "6h": "⚡ <6 Hours",
      "24h": "🆕 Past 24h",
      "7d": "📅 Past 7 Days",
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
      un_international: "🇺🇳 UN / International",
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
      closing_48h: "🚨 Closing < 48h",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/50 text-[#FF4742] flex items-center justify-center border border-red-200 dark:border-red-900/60 shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                  All Filters &amp; Selected Criteria
                </h3>
                {activeChips.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#FF4742] text-white">
                    {activeChips.length} active
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                View, adjust, and toggle all search criteria in one place
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close filters modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Active Selections Summary Chips */}
          {activeChips.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <span className="flex items-center gap-1.5 text-[#FF4742]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Currently Active ({activeChips.length})</span>
                </span>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 shadow-xs"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="p-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                      title={`Remove ${chip.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 1. Role & Specialization Category */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#FF4742]" />
              <span>🎯 Role &amp; Specialization (Marketing, Executive, Dev...)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLE_CATEGORIES.map((role) => {
                const isSelected =
                  role.id === "all"
                    ? !filters.category || filters.category === "all"
                    : filters.category === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => onUpdateFilters({ category: role.id === "all" ? "" : role.id })}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? "bg-red-50 dark:bg-red-950/50 text-[#FF4742] border-[#FF4742] font-black shadow-xs ring-1 ring-[#FF4742]"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{role.icon}</span>
                      <span className="truncate">{role.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4742] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Job Type / Workplace */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>💼 Workplace Type</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "all", label: "All Types", icon: "💼" },
                { id: "remote", label: "Remote", icon: "🌐" },
                { id: "on-site", label: "On-site", icon: "🏢" },
                { id: "hybrid", label: "Hybrid", icon: "🔀" },
              ].map((type) => {
                const isSelected = (filters.workplaceType || "all") === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      onUpdateFilters({ workplaceType: type.id as FilterState["workplaceType"] })
                    }
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-400 font-black shadow-xs ring-1 ring-emerald-400"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Freshness / Posting Window */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>⏱️ Posting Freshness</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "all", label: "Any time", icon: "⏱️" },
                { id: "1h", label: "Under 1 Hour (<5 Applicants)", icon: "🔥" },
                { id: "6h", label: "Last 6 Hours (Early Bird)", icon: "⚡" },
                { id: "24h", label: "Past 24 Hours", icon: "🆕" },
                { id: "7d", label: "Past 7 Days", icon: "📅" },
              ].map((f) => {
                const isSelected = (filters.freshness || "all") === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onUpdateFilters({ freshness: f.id as FilterState["freshness"] })}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                      isSelected
                        ? "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-400 font-black shadow-xs ring-1 ring-orange-400"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{f.icon}</span>
                      <span className="truncate">{f.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Top Location Hubs */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              <span>🌏 Location &amp; Regional Hubs</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "Worldwide (Anywhere)", code: "" },
                { name: "United States", code: "US" },
                { name: "United Kingdom", code: "UK" },
                { name: "South Africa 🇿🇦", code: "ZA" },
                { name: "Zimbabwe 🇿🇼", code: "ZW" },
                { name: "Europe 🇪🇺", code: "region_EU" },
                { name: "Africa 🦁", code: "region_AF" },
                { name: "Canada 🇨🇦", code: "CA" },
                { name: "Germany 🇩🇪", code: "DE" },
              ].map((loc) => {
                const isSelected =
                  loc.code === ""
                    ? !filters.location
                    : filters.location.toLowerCase() === loc.name.toLowerCase() ||
                      filters.location.toLowerCase() === loc.code.toLowerCase();
                return (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => onUpdateFilters({ location: loc.code === "" ? "" : loc.name })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-400 font-bold shadow-xs"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    {loc.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Minimum Salary Threshold */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>💵 Minimum Annual Salary</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[0, 50, 80, 100, 120, 150, 200].map((sal) => {
                const isSelected = filters.minSalary === sal;
                return (
                  <button
                    key={sal}
                    type="button"
                    onClick={() => onUpdateFilters({ minSalary: sal })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-400 font-bold shadow-xs"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    {sal === 0 ? "Any Salary" : `>$${sal}k/yr`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Quick Toggles & Anti-Ghost Protection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#003399]" />
              <span>🛡️ Smart Toggles &amp; Application Rails</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateFilters({ publicSectorOnly: !filters.publicSectorOnly })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  filters.publicSectorOnly
                    ? "bg-blue-50 dark:bg-blue-950/50 text-[#003399] dark:text-blue-300 border-[#003399] font-bold shadow-xs"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <span className="text-base">🏛️</span>
                <div className="text-xs">
                  <div className="font-bold">Public Sector &amp; Gov</div>
                  <div className="text-[11px] opacity-75">EU institutions, UN, Civil Service, AUDA-NEPAD</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters({ worldwideOnly: !filters.worldwideOnly })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  filters.worldwideOnly
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-400 font-bold shadow-xs"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <span className="text-base">🌍</span>
                <div className="text-xs">
                  <div className="font-bold">100% Worldwide</div>
                  <div className="text-[11px] opacity-75">No country residency or state tax traps</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters({ transparentPayOnly: !filters.transparentPayOnly })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  filters.transparentPayOnly
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-400 font-bold shadow-xs"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <span className="text-base">💰</span>
                <div className="text-xs">
                  <div className="font-bold">Upfront Pay</div>
                  <div className="text-[11px] opacity-75">Strictly filter out secret salary bands</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters({ lowCompetitionOnly: !filters.lowCompetitionOnly })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  filters.lowCompetitionOnly
                    ? "bg-red-50 dark:bg-red-950/50 text-[#FF4742] border-[#FF4742] font-bold shadow-xs"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <span className="text-base">🎯</span>
                <div className="text-xs">
                  <div className="font-bold">&lt;15 Applicants</div>
                  <div className="text-[11px] opacity-75">Beat the 500+ applicant black hole</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateFilters({ directAtsOnly: !filters.directAtsOnly })}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  filters.directAtsOnly
                    ? "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-400 font-bold shadow-xs"
                    : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <span className="text-base">🛡️</span>
                <div className="text-xs">
                  <div className="font-bold">Direct ATS</div>
                  <div className="text-[11px] opacity-75">Only direct company career portals</div>
                </div>
              </button>
            </div>
          </div>

          {/* 7. Public Sector Specific Filters */}
          <div className="space-y-3 p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
            <div className="text-xs font-black text-[#003399] dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏛️ Public Sector &amp; Government Criteria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Sector */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">🌐 Sector</label>
                <select
                  value={filters.sector || "all"}
                  onChange={(e) => onUpdateFilters({ sector: e.target.value as FilterState["sector"] })}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
                >
                  <option value="all">All Bodies &amp; Agencies</option>
                  <option value="eu_institutions">🇪🇺 EU Institutions</option>
                  <option value="national_government">🏛️ National Government</option>
                  <option value="un_international">🇺🇳 International NGOs / UN</option>
                  <option value="regional_local">🏙️ Regional / Local</option>
                </select>
              </div>

              {/* Eligibility */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">🛂 Eligibility</label>
                <select
                  value={filters.eligibility || "all"}
                  onChange={(e) => onUpdateFilters({ eligibility: e.target.value as FilterState["eligibility"] })}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="open_worldwide">🌍 Open Worldwide</option>
                  <option value="citizenship_required">🇪🇺 Citizenship Required</option>
                  <option value="visa_sponsored">🪪 Visa Sponsored</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">🗣️ Language</label>
                <select
                  value={filters.languageReq || "all"}
                  onChange={(e) => onUpdateFilters({ languageReq: e.target.value as FilterState["languageReq"] })}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
                >
                  <option value="all">Any Language</option>
                  <option value="en_only">🇬🇧 English Only</option>
                  <option value="multilingual">🌐 Multilingual (EN + FR/DE/ES)</option>
                </select>
              </div>

              {/* Deadline */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-700 dark:text-neutral-300">⏳ Deadline</label>
                <select
                  value={filters.deadlineUrgency || "all"}
                  onChange={(e) => onUpdateFilters({ deadlineUrgency: e.target.value as FilterState["deadlineUrgency"] })}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
                >
                  <option value="all">All Deadlines</option>
                  <option value="closing_48h">🚨 Closing Soon (&lt; 48 hrs)</option>
                  <option value="next_7d">📅 Next 7 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* 8. Sort Order */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span>🦴 Sort By</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "default", label: "Default Sort", icon: "🦴" },
                { id: "date", label: "Latest Jobs", icon: "🆕" },
                { id: "salary", label: "Highest Paid", icon: "💵" },
                { id: "views", label: "Most Viewed", icon: "👀" },
                { id: "applied", label: "Most Applied", icon: "✅" },
                { id: "hot", label: "Hottest", icon: "🔥" },
              ].map((s) => {
                const isSelected = (filters.sortBy || "default") === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onUpdateFilters({ sortBy: s.id as FilterState["sortBy"] })}
                    className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
                      isSelected
                        ? "bg-red-50 dark:bg-red-950/50 text-[#FF4742] border-[#FF4742] font-black shadow-xs ring-1 ring-[#FF4742]"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{s.icon}</span>
                      <span className="truncate">{s.label}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4742] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All ({activeChips.length})</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-lg shadow-red-500/25 active:scale-95 transition-all"
          >
            <span>Show {totalResults.toLocaleString()} Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
