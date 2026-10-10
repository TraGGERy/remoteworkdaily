"use client";

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BENEFITS_LIST } from "@/lib/constants";
import { Check, X } from "lucide-react";

interface BenefitsPopupProps {
  selectedBenefits: string[];
  onToggleBenefit: (benefitId: string) => void;
  onClearBenefits: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function BenefitsPopup({
  selectedBenefits,
  onToggleBenefit,
  onClearBenefits,
  isOpen,
  onClose,
}: BenefitsPopupProps) {
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
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
        <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
          <span>🎪 Filter by Benefits</span>
          {selectedBenefits.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-[#FF4742]">
              {selectedBenefits.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedBenefits.length > 0 && (
            <button
              onClick={onClearBenefits}
              className="text-xs text-neutral-500 hover:text-[#FF4742] underline"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1"
            aria-label="Close benefits filter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {BENEFITS_LIST.map((benefit) => {
          const isSelected = selectedBenefits.includes(benefit.id);
          return (
            <button
              key={benefit.id}
              onClick={() => onToggleBenefit(benefit.id)}
              className={`flex items-center justify-between p-2.5 sm:p-2 rounded-lg text-xs font-medium text-left border transition-all ${
                isSelected
                  ? "bg-red-50 dark:bg-red-950/40 text-[#FF4742] border-[#FF4742]"
                  : "bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <span>{benefit.icon}</span>
                <span className="truncate">{benefit.label}</span>
              </span>
              {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#FF4742]" />}
            </button>
          );
        })}
      </div>

      <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-bold bg-[#FF4742] hover:bg-[#e03a35] text-white rounded-lg transition-colors"
        >
          Done
        </button>
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
      className="absolute top-full mt-2 left-0 z-50 w-80 sm:w-96 max-h-96 overflow-y-auto p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl"
    >
      {content}
    </div>
  );
}
