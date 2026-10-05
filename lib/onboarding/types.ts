export type PricingPlanId = "lifetime" | "monthly" | "weekly";

export interface OnboardingState {
  // Step 1: Desired Job Title(s)
  jobTitles: string[];
  
  // Step 2: Target Experience Level
  experienceLevel: string;
  
  // Step 3: Job Types (Remote, Hybrid, In-office)
  jobTypes: string[];
  
  // Step 4: Salary Expectations
  salaryExpectation: string;
  
  // Step 5: How long have you been looking for a job?
  jobSearchDuration: string;

  // Step 6: What have you tried so far?
  platformsTried: string[];

  // Step 7: What makes Career Hound different (scanning websites vs LinkedIn)
  hasViewedDifference: boolean;

  // Step 8: Do you currently have a resume?
  hasResume: string;

  // Step 9: Do you tailor your resume for each job?
  tailorsResume: string;

  // Step 10: Did you know ATS scanning info
  hasViewedAtsInfo: boolean;

  // Step 11: What makes Career Hound different (AI Keyword Match 100%)
  hasViewedAiTailoring: boolean;

  // Step 12: Paywall & plan selection
  selectedPricingPlan: PricingPlanId;
  candidateEmail: string;
  
  // Current active step (1 through 12)
  currentStep: number;
}

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  jobTitles: [],
  experienceLevel: "",
  jobTypes: [],
  salaryExpectation: "",
  jobSearchDuration: "",
  platformsTried: [],
  hasViewedDifference: false,
  hasResume: "",
  tailorsResume: "",
  hasViewedAtsInfo: false,
  hasViewedAiTailoring: false,
  selectedPricingPlan: "lifetime",
  candidateEmail: "",
  currentStep: 1,
};

export const EXPERIENCE_LEVELS = [
  "Entry-level",
  "Mid-level",
  "Senior/Lead",
  "Director",
  "Executive",
] as const;

export const JOB_TYPE_OPTIONS = [
  { id: "remote", label: "Remote", icon: "home" },
  { id: "hybrid", label: "Hybrid", icon: "shuffle" },
  { id: "in_office", label: "In-office", icon: "building" },
] as const;

export const SALARY_OPTIONS = [
  "$30k - $60k per year",
  "$60k - $90k per year",
  "$90k - $120k per year",
  "$120k - $150k per year",
  "$150k+ per year",
] as const;

export const SEARCH_DURATION_OPTIONS = [
  { id: "just_started", label: "I just started", icon: "sprout" },
  { id: "few_weeks", label: "A few weeks ago", icon: "clock" },
  { id: "few_months", label: "A few months ago", icon: "hourglass" },
  { id: "too_long", label: "Too long", icon: "turtle" },
] as const;

export const JOB_TITLE_EXAMPLES = [
  "software developer",
  "accountant",
  "project manager",
  "graphic designer",
] as const;

export const PLATFORMS_TRIED_OPTIONS = [
  "LinkedIn",
  "Indeed",
  "Other",
] as const;

export const YES_NO_OPTIONS = [
  "Yes",
  "No",
] as const;

export interface TestimonialItem {
  name: string;
  avatarInitials: string;
  avatarColor: string; // Tailwind bg color class
  text: string;
  rating: number;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    name: "Marcus H.",
    avatarInitials: "MH",
    avatarColor: "bg-indigo-600",
    rating: 5,
    text: "These are amazing results and so much easier than LinkedIn job searches. Thank you, I think I am sold!",
  },
  {
    name: "Victor H.",
    avatarInitials: "VH",
    avatarColor: "bg-blue-600",
    rating: 5,
    text: "Your approach of scraping career pages and linking directly to the original job listings is a much better and more valuable solution for me than everything out there.",
  },
  {
    name: "Ryan D.",
    avatarInitials: "RD",
    avatarColor: "bg-teal-600",
    rating: 5,
    text: "Great job on the site.",
  },
  {
    name: "Adrian K.",
    avatarInitials: "AK",
    avatarColor: "bg-amber-600",
    rating: 5,
    text: "Aggregating postings from different job boards is a great idea, something I'm incorporating in my strategy to save time in the job search.",
  },
  {
    name: "Alexis R.",
    avatarInitials: "AR",
    avatarColor: "bg-emerald-600",
    rating: 5,
    text: "I found a job back in December on Career Hound, which led me to being invited back in July for another position at the same company and I ended up getting that!",
  },
  {
    name: "Nathan B.",
    avatarInitials: "NB",
    avatarColor: "bg-teal-500",
    rating: 5,
    text: "I found Career Hound through Reddit, and I must say I prefer this platform over LinkedIn; it's so much more productive now.",
  },
  {
    name: "Amir G.",
    avatarInitials: "AG",
    avatarColor: "bg-rose-600",
    rating: 5,
    text: "I just checked out your post regarding your platform Career Hound. It looks great, great work!",
  },
  {
    name: "Carter M.",
    avatarInitials: "CM",
    avatarColor: "bg-amber-500",
    rating: 5,
    text: "Finding job postings has been a breeze since switching over. The direct links save hours of searching.",
  },
  {
    name: "Lauren M.",
    avatarInitials: "LM",
    avatarColor: "bg-sky-600",
    rating: 5,
    text: "I have enjoyed the experience thus far.",
  },
  {
    name: "Rachel D.",
    avatarInitials: "RD",
    avatarColor: "bg-purple-600",
    rating: 5,
    text: "Such a refreshing way to search for jobs without getting lost in ghost posts.",
  },
];
