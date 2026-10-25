import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number | null, max?: number | null, currency: string = "USD"): string {
  if (!min && !max) return "Competitive";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  const isSubThousand = (max != null && max < 1000) || (min != null && min < 1000 && (max == null || max < 1000));
  if (isSubThousand) {
    if (min && max) {
      return `${sym}${min} - ${sym}${max}`;
    }
    if (min) {
      return `From ${sym}${min}`;
    }
    return `Up to ${sym}${max!}`;
  }
  if (min && max) {
    return `${sym}${Math.round(min / 1000)}k - ${sym}${Math.round(max / 1000)}k`;
  }
  if (min) {
    return `From ${sym}${Math.round(min / 1000)}k`;
  }
  return `Up to ${sym}${Math.round(max! / 1000)}k`;
}

export function formatHourlyEquivalent(min?: number | null, max?: number | null, currency: string = "USD"): string | null {
  if (!min && !max) return null;
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  const avgAnnual = min && max ? (min + max) / 2 : (max || min || 0);
  if (avgAnnual < 1000) return null;
  const hourly = Math.round(avgAnnual / 2000);
  return `~${sym}${hourly}/hr`;
}

export function isTrueWorldwideJob(location?: string, workArrangement?: string, workplaceType?: string): boolean {
  if (workplaceType === "on-site" || workplaceType === "hybrid" || workArrangement === "hybrid_high_pay" || workArrangement === "on_site") {
    return false;
  }
  if (workArrangement === "remote_regional") return false;
  const loc = (location || "").toLowerCase().trim();
  if (!loc) return true;
  if (
    loc.includes("only") ||
    loc.includes("united states") ||
    loc.includes("usa") ||
    loc.includes("uk") ||
    loc.includes("canada") ||
    loc.includes("california") ||
    loc.includes("new york") ||
    loc.includes("texas") ||
    loc.includes("hybrid")
  ) {
    return false;
  }
  return (
    loc.includes("worldwide") ||
    loc.includes("anywhere") ||
    loc.includes("global") ||
    loc === "remote" ||
    workArrangement === "remote_global"
  );
}

export function getCompetitionSignal(appliesCount: number = 0, postedAt?: string): {
  label: string;
  shortLabel: string;
  tier: "ultra_low" | "low" | "moderate";
} {
  const hoursOld = postedAt ? Math.max(0, (Date.now() - new Date(postedAt).getTime()) / (3600 * 1000)) : 48;
  const effectiveApplies = appliesCount > 0 ? appliesCount : hoursOld < 1 ? 1 : hoursOld < 6 ? 3 : hoursOld < 24 ? 8 : 18;

  if (effectiveApplies <= 5 || hoursOld < 2) {
    return {
      label: `Low Competition (${effectiveApplies} applicants — First-Mover Window)`,
      shortLabel: `${effectiveApplies} applicants`,
      tier: "ultra_low",
    };
  }
  if (effectiveApplies <= 15 || hoursOld < 24) {
    return {
      label: `Early Window (${effectiveApplies} applicants)`,
      shortLabel: `${effectiveApplies} applicants`,
      tier: "low",
    };
  }
  return {
    label: `Active (${effectiveApplies} applicants)`,
    shortLabel: `${effectiveApplies} applied`,
    tier: "moderate",
  };
}

export function timeAgo(dateString: string | Date): string {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "recently";

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function isRecentPost(dateString?: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const diff = Date.now() - date.getTime();
  return diff >= 0 && diff < 24 * 3600 * 1000;
}

/**
 * Checks if a job posting is within the Pro Early Access window (< 24 hours old).
 * Applies consistently to all roles (Marketing, Executive, Developer, Sales, etc.).
 */
export function isEarlyAccessJob(postedAt?: string | Date): boolean {
  if (!postedAt) return false;
  const time = new Date(postedAt).getTime();
  if (isNaN(time)) return false;
  const diff = Date.now() - time;
  return diff >= 0 && diff < 24 * 3600 * 1000;
}


