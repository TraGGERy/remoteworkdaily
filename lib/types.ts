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
  category: "dev" | "design" | "marketing" | "sales" | "ops" | "exec" | "support" | "finance" | "medical" | "education" | "farming" | "trades" | "hospitality" | "other";
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
  source: "direct" | "apify" | "feed" | "ats";
  atsProvider?: "greenhouse" | "lever" | "ashby" | "workday" | "direct";
  isDirectCompanyPost?: boolean;
  status?: "active" | "pending_payment" | "archived";
  employerEmail?: string;
  canonicalHash?: string;
  workArrangement?: "remote_global" | "remote_regional" | "hybrid_high_pay" | "on_site";
  hybridCity?: string;
  hybridCountry?: string;
  daysInOffice?: string;
  externalId?: string;
  isFeatured?: boolean;
  isActive?: boolean;

  // Public Sector, Civil Service & International Governance Metadata
  isGovernment?: boolean;
  isPublicSector?: boolean;
  agency?: string; // e.g. "European Commission - DG CNECT", "UNICEF", "UK Foreign Office"
  agencyLogo?: string; // official crest / emblem url
  jurisdiction?: "EU" | "UN" | "UK" | "US" | "ZA" | "ZW" | "AU" | "National" | "Regional" | "International" | "Other";
  publicSectorType?: "eu_institutions" | "national_government" | "un_international" | "regional_local";
  grade?: string; // e.g. "AD 5", "AD 7", "AST 3", "P-4", "GS-14", "Grade 7", "MMS/SMS Level 13"
  eligibilityType?: "open_worldwide" | "citizenship_required" | "visa_sponsored";
  citizenshipRequirements?: string[]; // e.g. ["EU Member State", "South African Citizen", "Zimbabwean Citizen", "US Citizen"]
  securityClearanceRequired?: boolean;
  securityClearanceLevel?: string; // e.g. "EU SECRET", "State Security Vetting", "SC", "DV"
  applicationDeadline?: string; // Strict UTC ISO timestamp
  languagesRequired?: string[]; // e.g. ["English (C1)", "French (B2)"]
  requiredDocuments?: string[]; // e.g. ["Europass CV", "Z83 Application Form", "Motivation Letter", "Certified Degree Copy"]
  originalApplyUrl?: string; // Direct deep-link to exact portal vacancy notice
  selectionRef?: string; // e.g. "EPSO/AD/412/24", "DPSA/CIRCULAR/2026/14", "PSC/ZW/2026/04"
  europassReady?: boolean;
  p11Ready?: boolean;
  portalType?: "epso" | "un_inspira" | "eures" | "usajobs" | "uk_civil_service" | "french_pep" | "bund_de" | "dpsa_gov_za" | "psc_gov_zw" | "general_gov";
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
  company?: string;
  location: string;
  category: string;
  workplaceType?: "all" | "remote" | "hybrid" | "on-site";
  minSalary: number;
  benefits: string[];
  tags: string[];
  sortBy: "default" | "date" | "salary" | "views" | "applied" | "hot" | "benefits";
  freshness?: "all" | "1h" | "6h" | "24h" | "7d";
  directAtsOnly?: boolean;
  transparentPayOnly?: boolean;
  worldwideOnly?: boolean;
  lowCompetitionOnly?: boolean;

  // Public Sector Filter Controls
  publicSectorOnly?: boolean;
  sector?: "all" | "eu_institutions" | "national_government" | "un_international" | "regional_local";
  eligibility?: "all" | "open_worldwide" | "citizenship_required" | "visa_sponsored";
  languageReq?: "all" | "en_only" | "multilingual";
  deadlineUrgency?: "all" | "closing_48h" | "next_7d";
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "Native";

export interface CandidateLanguageProficiency {
  language: string;
  level: CefrLevel;
  certified?: boolean;
}

export interface PublicSectorCandidateData {
  fullName: string;
  email: string;
  phone?: string;
  citizenship: string; // e.g. "FR", "DE", "IT", "UK", "US", "CA", etc.
  secondaryCitizenships?: string[];
  currentResidence?: string;
  degreeLevel: string; // e.g. "Doctorate (EQF 8)", "Masters (EQF 7)", "Bachelors (EQF 6)"
  degreeTitle?: string;
  institution?: string;
  graduationYear?: string;
  yearsOfExperience: number;
  securityClearance?: string; // "None" | "EU SECRET" | "NATO SECRET" | "SC / DV" | "Secret"
  languages: CandidateLanguageProficiency[];
  currentTitle?: string;
  currentEmployer?: string;
  summary?: string;
  skills?: string[];
  experiences?: Array<{
    title: string;
    company: string;
    location?: string;
    period: string;
    duties?: string;
    grade?: string;
  }>;
}

export interface EligibilityCriterionCheck {
  status: "pass" | "warning" | "fail";
  title: string;
  requirement: string;
  candidateValue: string;
  message: string;
}

export interface EligibilityEvaluation {
  status: "eligible" | "warning" | "ineligible";
  matchScore: number; // 0 - 100
  criteria: {
    citizenship: EligibilityCriterionCheck;
    degree: EligibilityCriterionCheck;
    languages: EligibilityCriterionCheck;
    clearance: EligibilityCriterionCheck;
    experience: EligibilityCriterionCheck;
  };
  warnings: string[];
  actionItems: string[];
  eligibleJurisdictions: string[];
}

export interface DocumentChecklistItem {
  id: string;
  label: string;
  description: string;
  mandatory: boolean;
  completed?: boolean;
  acceptedFormats: string[];
}

export interface PublicSectorApplicationPackage {
  jobId: string;
  jobTitle: string;
  agency: string;
  jurisdiction: string;
  formatType: "europass" | "un_p11" | "standard_ats";
  selectionRef?: string;
  evaluation: EligibilityEvaluation;
  motivationLetter: string;
  requiredDocuments: DocumentChecklistItem[];
  prefilledFormData: Record<string, unknown>;
  bookmarkletCode: string;
  autofillScript: string;
  portalApplyUrl: string;
}

export interface GovernmentApplication {
  id: string;
  clerkUserId?: string;
  candidateEmail: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  agency: string;
  formatType: "europass" | "un_p11" | "standard_ats";
  eligibilityStatus: "eligible" | "warning" | "ineligible";
  eligibilityDetails: EligibilityEvaluation;
  prefilledPackage: Record<string, unknown>;
  motivationLetter?: string;
  status: "draft" | "prefilled" | "submitted" | "archived";
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
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
