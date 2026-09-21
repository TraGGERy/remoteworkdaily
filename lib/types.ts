export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  companySlug: string;
  companyLogo?: string;
  companyWebsite?: string;
  verified?: boolean;
  featured?: boolean; // Highlighted row
  sticky?: boolean;   // Pinned to top
  location: string;   // e.g. "Worldwide", "North America", "Europe", "US Only", "Berlin, Germany"
  locationCode?: string; // e.g. "WW", "US", "EU"
  workplaceType?: "remote" | "hybrid" | "on-site"; // e.g. "remote", "hybrid", "on-site"
  category: "dev" | "design" | "marketing" | "sales" | "ops" | "exec" | "support" | "finance" | "medical" | "other";
  tags: string[];     // e.g. ["React", "TypeScript", "Next.js", "Full Stack"]
  benefits: string[]; // e.g. ["401k", "async", "unlimited_vacation", "health_insurance"]
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string; // e.g. "USD"
  description: string;    // Markdown/HTML job description
  requirements?: string[];
  applyUrl: string;
  postedAt: string;       // ISO date
  viewsCount: number;
  appliesCount: number;
  source: "direct" | "apify" | "feed";
  status?: "active" | "pending_payment" | "archived";
  employerEmail?: string;
  canonicalHash?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string;
  website: string;
  description: string;
  location: string;
  verified: boolean;
  jobsCount: number;
}

export interface FilterState {
  query: string;
  location: string;
  category: string;
  workplaceType?: "all" | "remote" | "hybrid" | "on-site";
  minSalary: number;
  benefits: string[];
  tags: string[];
  sortBy: "default" | "date" | "salary" | "views" | "applied" | "hot" | "benefits";
}

export interface BenefitOption {
  id: string;
  label: string;
  icon: string;
}

export interface TagCategory {
  id: string;
  label: string;
  icon: string;
  tag: string;
}
