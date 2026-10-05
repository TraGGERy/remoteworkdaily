import React from "react";

/**
 * Career Hound mascot logo icon.
 * Cute hound/puppy face with floppy ears, button nose, and eyes.
 */
export function CareerHoundLogo({
  className = "w-6 h-6 text-blue-600",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Head shape */}
      <path d="M4.5 9.5C4.5 5.5 7.5 3 12 3C16.5 3 19.5 5.5 19.5 9.5C19.5 14.5 16 19 12 19C8 19 4.5 14.5 4.5 9.5Z" />
      {/* Left floppy ear */}
      <path d="M4.5 7.5C3 8.5 2 11 2 13C2 15 3 16 4.5 15" />
      {/* Right floppy ear */}
      <path d="M19.5 7.5C21 8.5 22 11 22 13C22 15 21 16 19.5 15" />
      {/* Eyes */}
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      {/* Nose */}
      <ellipse cx="12" cy="13.5" rx="1.5" ry="1" fill="currentColor" />
      {/* Mouth */}
      <path d="M12 14.5V16M10.5 16C11 16.8 13 16.8 13.5 16" />
    </svg>
  );
}

/**
 * Double coin stack icon for Salary options (matching Career Hound screenshots)
 */
export function CoinStackIcon({ className = "w-5 h-5 text-blue-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Left coin */}
      <circle cx="9" cy="12" r="5" />
      <path d="M9 10v4M7.5 11h3" />
      {/* Right overlapping coin */}
      <circle cx="15" cy="12" r="5" />
      <path d="M15 10v4M13.5 11h3" />
    </svg>
  );
}

/**
 * Sprout icon for "I just started"
 */
export function SproutIcon({ className = "w-5 h-5 text-blue-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 20h10" />
      <path d="M10 20c0-5.5 2.5-9.5 7-10" />
      <path d="M9.5 9.5C9.5 6.5 12 4 15 4c0 3-2.5 5.5-5.5 5.5z" />
      <path d="M14.5 14c-3.5 0-6-2.5-6-6 3.5 0 6 2.5 6 6z" />
    </svg>
  );
}

/**
 * Hourglass icon for "A few months ago"
 */
export function HourglassIcon({ className = "w-5 h-5 text-blue-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 2h14" />
      <path d="M5 22h14" />
      <path d="M6 2v6a6 6 0 0 0 6 6 6 6 0 0 0 6-6V2" />
      <path d="M6 22v-6a6 6 0 0 1 6-6 6 6 0 0 1 6 6v6" />
    </svg>
  );
}

/**
 * Turtle icon for "Too long" (slow pace)
 */
export function TurtleIcon({ className = "w-5 h-5 text-blue-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Shell */}
      <path d="M6 14a6 6 0 0 1 12 0Z" />
      <path d="M12 8v6" />
      <path d="M8.5 11l3.5 3 3.5-3" />
      {/* Head */}
      <path d="M18 13.5c1.5 0 2.5-.5 3-1.5s-.2-2-1.2-2.3c-1.1-.3-2 .5-2.3 1.3" />
      {/* Front foot */}
      <path d="M16 14.5c.5 1.5 1.5 2 2.5 1.5" />
      {/* Rear foot */}
      <path d="M7 14.5c-.5 1.5-1.5 2-2.5 1.5" />
      {/* Tail */}
      <path d="M5.5 13.5c-1 0-1.5-.5-2-.2" />
      {/* Underbelly line */}
      <path d="M5 14h14" />
    </svg>
  );
}

/**
 * Home icon for Remote
 */
export function RemoteHomeIcon({ className = "w-5 h-5 text-blue-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

/**
 * Shuffle/Switch arrows for Hybrid
 */
export function HybridArrowsIcon({ className = "w-5 h-5 text-blue-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 3h5v5" />
      <path d="M4 20L21 3" />
      <path d="M21 16v5h-5" />
      <path d="M15 15l6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}

/**
 * Building icon for In-office
 */
export function OfficeBuildingIcon({ className = "w-5 h-5 text-blue-600" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M9 7h1" />
      <path d="M14 7h1" />
      <path d="M9 11h1" />
      <path d="M14 11h1" />
      <path d="M9 15h1" />
      <path d="M14 15h1" />
      <path d="M10 21v-3h4v3" />
    </svg>
  );
}
