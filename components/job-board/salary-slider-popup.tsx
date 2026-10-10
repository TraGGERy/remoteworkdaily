"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DollarSign, X } from "lucide-react";

interface SalarySliderPopupProps {
  minSalary: number;
  onChangeSalary: (salary: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SalarySliderPopup({
  minSalary,
  onChangeSalary,
  isOpen,
  onClose,
}: SalarySliderPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setIsMobile(window.innerWidth < 640);
    }, 0);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", checkMobile);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
    };
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
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900 dark:text-white">
          <DollarSign className="w-4 h-4 text-[#FF4742]" />
          <span>Minimum Salary</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="font-extrabold text-[#FF4742] text-sm tabular-nums">
            ${minSalary}k / year
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
            aria-label="Close salary filter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="range"
          min="0"
          max="250"
          step="10"
          value={minSalary}
          onChange={(e) => onChangeSalary(Number(e.target.value))}
          className="w-full accent-[#FF4742] cursor-pointer"
        />

        <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
          <span>$0k</span>
          <span>$100k</span>
          <span>$200k</span>
          <span>$250k+</span>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[50, 80, 100, 150].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChangeSalary(preset)}
              className={`py-1 rounded-lg text-xs font-semibold border transition-all ${
                minSalary === preset
                  ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] border-[#FF4742]"
                  : "bg-neutral-50 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
              }`}
            >
              ${preset}k+
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onChangeSalary(0)}
            className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-[#FF4742] hover:bg-[#e03a35] text-white rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );

  if (isMobile && mounted) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0">
        <div
          ref={popupRef}
          className="w-full max-h-[80vh] overflow-y-auto p-5 pb-8 rounded-t-2xl border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl"
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
      className="absolute top-full mt-2 left-0 z-50 w-72 sm:w-80 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl"
    >
      {content}
    </div>
  );
}
