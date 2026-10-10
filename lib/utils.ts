import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSalary(min?: number | null, max?: number | null, currency: string = "USD"): string {
  if (!min && !max) return "Competitive";
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  if (min && max) {
    return `${sym}${Math.round(min / 1000)}k - ${sym}${Math.round(max / 1000)}k`;
  }
  if (min) {
    return `From ${sym}${Math.round(min / 1000)}k`;
  }
  return `Up to ${sym}${Math.round(max! / 1000)}k`;
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

