/**
 * Bounded Context: Job Catalog
 * Domain models and invariants for remote jobs, salary standards, and search indexing.
 */

export interface ISalaryRange {
  min?: number;
  max?: number;
  currency: string;
}

export class SalaryRange {
  readonly min?: number;
  readonly max?: number;
  readonly currency: string;

  constructor(data: ISalaryRange) {
    if (data.min !== undefined && data.min < 0) {
      throw new Error("Salary minimum cannot be negative");
    }
    if (data.max !== undefined && data.max < 0) {
      throw new Error("Salary maximum cannot be negative");
    }
    if (data.min !== undefined && data.max !== undefined && data.min > data.max) {
      throw new Error("Salary minimum cannot exceed maximum");
    }
    this.min = data.min;
    this.max = data.max;
    this.currency = (data.currency || "USD").toUpperCase();
  }

  get isOpenSalary(): boolean {
    return Boolean(this.min || this.max);
  }

  format(): string {
    if (!this.min && !this.max) return "Competitive (Unspecified)";
    const curr = this.currency;
    if (this.min && this.max) {
      return `$${Math.round(this.min / 1000)}k - $${Math.round(this.max / 1000)}k ${curr}`;
    }
    if (this.min) {
      return `From $${Math.round(this.min / 1000)}k ${curr}`;
    }
    return `Up to $${Math.round((this.max as number) / 1000)}k ${curr}`;
  }
}

export class LocationEligibility {
  readonly rawLocation: string;
  readonly isWorldwide: boolean;
  readonly workplaceType: "remote" | "hybrid" | "on-site";

  constructor(rawLocation: string, workplaceType: "remote" | "hybrid" | "on-site" = "remote") {
    this.rawLocation = rawLocation?.trim() || "Worldwide";
    this.workplaceType = workplaceType;
    const normalized = this.rawLocation.toLowerCase();
    this.isWorldwide =
      normalized.includes("worldwide") ||
      normalized.includes("anywhere") ||
      normalized === "ww" ||
      normalized === "global";
  }

  get isTelecommute(): boolean {
    return this.workplaceType === "remote";
  }

  get countryCode(): string {
    const loc = this.rawLocation.toLowerCase();
    if (loc.includes("us only") || loc.includes("united states") || loc === "us") return "US";
    if (loc.includes("canada") || loc === "ca") return "CA";
    if (loc.includes("uk only") || loc.includes("united kingdom")) return "GB";
    if (loc.includes("europe") || loc === "eu") return "EU";
    if (loc.includes("latin america") || loc === "latam") return "LATAM";
    if (loc.includes("asia")) return "ASIA";
    return "WW";
  }
}

export class JobSlug {
  static create(title: string, company: string): string {
    const combined = `${company}-${title}`;
    return combined
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
