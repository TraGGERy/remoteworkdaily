"use client";

import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="absolute top-full mt-2 left-0 z-50 w-72 sm:w-80 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 font-bold text-sm text-neutral-900 dark:text-white">
          <DollarSign className="w-4 h-4 text-[#FF4742]" />
          <span>Minimum Salary</span>
        </div>
        <div className="font-extrabold text-[#FF4742] text-sm tabular-nums">
          ${minSalary}k / year
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

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onChangeSalary(0)}
            className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
