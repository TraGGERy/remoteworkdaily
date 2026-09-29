import React from "react";

export function BrandIcon({
  className = "w-10 h-10",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Remote Work Daily Brand Icon"
    >
      <defs>
        <linearGradient id="rwdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5A55" />
          <stop offset="100%" stopColor="#E02E29" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" floodColor="#E02E29" />
        </filter>
      </defs>
      
      {/* Background Rounded Squircle */}
      <rect width="48" height="48" rx="13" fill="url(#rwdGrad)" filter="url(#shadow)" />
      <rect width="48" height="48" rx="13" fill="url(#glowGrad)" />

      {/* Global Connectivity Sphere */}
      <circle cx="24" cy="24" r="13" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.95" />
      <ellipse cx="24" cy="24" rx="6.5" ry="13" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />
      <line x1="11" y1="24" x2="37" y2="24" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.85" />

      {/* Center Beacon Pulse */}
      <circle cx="24" cy="24" r="3.5" fill="#FFFFFF" />
      
      {/* Live Active Status Indicator Dot */}
      <circle cx="35" cy="13" r="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );
}
