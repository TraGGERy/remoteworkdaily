"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { REGIONS_AND_COUNTRIES } from "@/lib/constants";
import { Globe, X, Search, Check } from "lucide-react";

interface LocationPopupProps {
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function LocationPopup({
  selectedLocation,
  onSelectLocation,
  isOpen,
  onClose,
}: LocationPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <>
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
        <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#FF4742]" />
          <span>Filter by Location</span>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
          aria-label="Close location picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search country or region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
        />
      </div>

      <div className="space-y-3 text-xs">
        {/* Reset / All Locations option */}
        <button
          onClick={() => {
            onSelectLocation("");
            onClose();
          }}
          className={`w-full flex items-center justify-between p-2.5 sm:p-2 rounded-lg text-left font-medium transition-colors ${
            !selectedLocation
              ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          }`}
        >
          <span>🌏 All Locations (Remote, Hybrid & On-site)</span>
          {!selectedLocation && <Check className="w-3.5 h-3.5 text-[#FF4742]" />}
        </button>

        {REGIONS_AND_COUNTRIES.map((group) => {
          const filteredItems = group.items.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          );
          if (filteredItems.length === 0) return null;

          return (
            <div key={group.group} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">
                {group.group}
              </div>
              {filteredItems.map((item) => {
                const isSelected = selectedLocation.toLowerCase() === item.name.toLowerCase() || selectedLocation === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => {
                      onSelectLocation(item.name);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2.5 sm:p-2 rounded-lg text-left font-medium transition-colors ${
                      isSelected
                        ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] font-bold"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FF4742]" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );

  if (isMobile && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0">
        <div
          ref={popupRef}
          className="w-full max-h-[80vh] overflow-y-auto p-4 pb-8 rounded-t-2xl border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl"
        >
          {content}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div
      ref={popupRef}
      className="absolute top-full mt-2 left-0 z-50 w-72 sm:w-80 max-h-96 overflow-y-auto p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl"
    >
      {content}
    </div>
  );
}
