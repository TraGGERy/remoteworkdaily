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
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}
