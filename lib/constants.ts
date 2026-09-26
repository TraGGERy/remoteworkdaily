import { BenefitOption, TagCategory } from "./types";

export const ROLE_CATEGORIES: TagCategory[] = [
  { id: "all", label: "All Jobs", icon: "🌐", tag: "" },
  { id: "dev", label: "Developer", icon: "🤓", tag: "dev" },
  { id: "design", label: "Design", icon: "🎨", tag: "design" },
  { id: "exec", label: "Executive", icon: "💼", tag: "exec" },
  { id: "support", label: "Customer Support", icon: "🎧", tag: "support" },
  { id: "marketing", label: "Marketing", icon: "🚥", tag: "marketing" },
  { id: "ops", label: "Ops & DevOps", icon: "♾️", tag: "ops" },
  { id: "finance", label: "Finance", icon: "💰", tag: "finance" },
  { id: "education", label: "Education", icon: "👨‍🏫", tag: "education" },
  { id: "medical", label: "Medical & Health", icon: "🚑", tag: "medical" },
];

export const POPULAR_TAGS = [
  "React",
  "TypeScript",
  "Python",
  "Node.js",
  "Go",
  "Rust",
  "AI / ML",
  "Next.js",
  "Tailwind CSS",
  "Full Stack",
  "Backend",
  "Frontend",
  "PostgreSQL",
  "AWS",
  "GraphQL",
  "Kubernetes",
  "UI/UX",
  "Product Manager",
  "Solidity / Web3",
  "Senior",
  "Staff Engineer",
  "Lead",
];

export const BENEFITS_LIST: BenefitOption[] = [
  { id: "distributed_team", label: "Distributed team", icon: "🌎" },
  { id: "async", label: "Async workflow", icon: "⏰" },
  { id: "401k", label: "401(k) / Pension", icon: "💰" },
  { id: "unlimited_vacation", label: "Unlimited vacation", icon: "🏖" },
  { id: "paid_time_off", label: "Paid time off", icon: "🏖" },
  { id: "4_day_workweek", label: "4 day workweek", icon: "📆" },
  { id: "medical_insurance", label: "Medical insurance", icon: "🚑" },
  { id: "dental_insurance", label: "Dental insurance", icon: "🦷" },
  { id: "vision_insurance", label: "Vision insurance", icon: "🤓" },
  { id: "learning_budget", label: "Learning & books budget", icon: "📚" },
  { id: "home_office_budget", label: "Home office budget", icon: "🖥" },
  { id: "coworking_budget", label: "Coworking space budget", icon: "🏬" },
  { id: "free_gym_membership", label: "Free gym / wellness", icon: "💪" },
  { id: "mental_wellness_budget", label: "Mental wellness budget", icon: "🧘" },
  { id: "company_retreats", label: "Company retreats", icon: "🏔" },
  { id: "equity_compensation", label: "Equity compensation", icon: "📈" },
  { id: "profit_sharing", label: "Profit sharing", icon: "💰" },
  { id: "pay_in_crypto", label: "Pay in crypto option", icon: "🥧" },
  { id: "no_whiteboard", label: "No whiteboard interview", icon: "⬜️" },
  { id: "no_monitoring", label: "No spyware/monitoring", icon: "👀" },
];

export const REGIONS_AND_COUNTRIES = [
  { group: "Regions", items: [
    { code: "Worldwide", name: "Worldwide (Anywhere)", icon: "🌏" },
    { code: "region_NA", name: "North America", icon: "⛰️" },
    { code: "region_EU", name: "Europe", icon: "🇪🇺" },
    { code: "region_LA", name: "Latin America", icon: "💃" },
    { code: "region_AS", name: "Asia", icon: "⛩" },
    { code: "region_OC", name: "Oceania", icon: "🌊" },
    { code: "region_AF", name: "Africa", icon: "🦁" },
    { code: "region_ME", name: "Middle East", icon: "🕌" },
  ]},
  { group: "Top Countries", items: [
    { code: "US", name: "United States", icon: "🇺🇸" },
    { code: "CA", name: "Canada", icon: "🇨🇦" },
    { code: "UK", name: "United Kingdom", icon: "🇬🇧" },
    { code: "DE", name: "Germany", icon: "🇩🇪" },
    { code: "NL", name: "Netherlands", icon: "🇳🇱" },
    { code: "AU", name: "Australia", icon: "🇦🇺" },
    { code: "PT", name: "Portugal", icon: "🇵🇹" },
    { code: "ES", name: "Spain", icon: "🇪🇸" },
    { code: "FR", name: "France", icon: "🇫🇷" },
    { code: "BR", name: "Brazil", icon: "🇧🇷" },
    { code: "IN", name: "India", icon: "🇮🇳" },
    { code: "SG", name: "Singapore", icon: "🇸🇬" },
    { code: "JP", name: "Japan", icon: "🇯🇵" },
    { code: "CH", name: "Switzerland", icon: "🇨🇭" },
    { code: "SE", name: "Sweden", icon: "🇸🇪" },
  ]},
];

/**
 * Employer job posting pricing and promotional add-on catalog.
 *
 * Designed around a strict one-time payment model (zero recurring subscriptions)
 * to remove cancellation friction and reduce corporate card expense resistance.
 */
export const JOB_POSTING_PRICING = {
  currency: "USD",
  billingType: "one-time" as const,
  basePrice: 249,
  packages: [
    {
      id: "starter",
      name: "Starter Listing",
      price: 249,
      description: "Standard 30-day listing broadcast to 2.5M+ remote workers",
      badge: "Standard",
      isPopular: false,
      includedAddOns: {
        sticky: false,
        highlight: false,
        newsletter: false,
        social: false,
        verifiedBadge: true,
      },
    },
    {
      id: "accelerator",
      name: "Featured Accelerator",
      price: 399,
      description: "Maximum visibility bundle: 30 days pinned sticky, highlighted accent, and newsletter blast",
      badge: "Most Popular",
      isPopular: true,
      includedAddOns: {
        sticky: true,
        highlight: true,
        newsletter: true,
        social: true,
        verifiedBadge: true,
      },
    },
  ],
  addOns: {
    sticky: {
      price: 89,
      title: "Pin to top for 30 days",
      description: "Keep your post pinned at the top of the job board for 30 days (5x more views)",
      badge: "5X VIEWS",
    },
    highlight: {
      price: 49,
      title: "Highlight in coral accent",
      description: "Stand out in vibrant coral background and high-contrast border",
      badge: "STAND OUT",
    },
    newsletter: {
      price: 99,
      title: "Blast to 120,000+ remote workers",
      description: "Included in our weekly remote job newsletter digest (38% open rate)",
      badge: "120K REACH",
    },
    social: {
      price: 69,
      title: "Promote on X/Twitter & LinkedIn",
      description: "Broadcasted to our 250,000+ social followers on Twitter & LinkedIn",
      badge: "VIRAL REACH",
    },
    verifiedBadge: {
      price: 39,
      title: "Verified Company Badge",
      description: "Displays a blue verified checkmark next to your company logo & name",
      badge: "TRUSTED",
    },
  },
  bundles: [
    { quantity: 1, discount: 0, label: "Single Job Post", pricePerJob: 249, totalPrice: 249 },
    { quantity: 3, discount: 0.20, label: "3-Job Bundle (Save 20%)", pricePerJob: 199, totalPrice: 597 },
    { quantity: 5, discount: 0.30, label: "5-Job Bundle (Save 30%)", pricePerJob: 174, totalPrice: 870 },
    { quantity: 10, discount: 0.40, label: "10-Job Bundle (Save 40%)", pricePerJob: 149, totalPrice: 1490 },
  ],
  guarantee: {
    durationDays: 14,
    minQualifiedApplicants: 5,
    remedyText: "If you do not receive at least 5 qualified applicants within 14 days, we will re-pin your job post to the top for 30 additional days at no charge.",
  },
};
export type CandidatePlanId = "weekly" | "monthly" | "lifetime";

export interface CandidateSubscriptionPlan {
  id: CandidatePlanId;
  name: string;
  price: number;
  interval: "week" | "month" | "lifetime";
  billingType: "subscription" | "one-time";
  billingTerms: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  features: string[];
}

/**
 * Job seeker candidate subscription and access catalog.
 *
 * Implements CareerHound.io's subscription-based model:
 * - Weekly Sprint ($6.99/week, auto-renews, cancel anytime)
 * - Monthly Pro ($17.99/month, auto-renews, cancel anytime, Most Popular)
 * - Lifetime Access ($49.99, one-time payment, perpetual access)
 *
 * Backed by a 7-day unconditional money-back refund policy.
 */
export const CANDIDATE_PRICING = {
  currency: "USD",
  plans: {
    weekly: {
      id: "weekly" as CandidatePlanId,
      name: "Weekly Sprint",
      price: 6.99,
      interval: "week" as const,
      billingType: "subscription" as const,
      billingTerms: "$6.99 billed weekly • Auto-renews • Cancel anytime",
      badge: "Sprint Search",
      isPopular: false,
      description: "Ideal for active applicants conducting a fast 1-2 week job search sprint.",
      features: [
        "Direct ATS Application Links unlocked immediately",
        "Direct Company Careers & 'Hidden Jobs' stream",
        "2-Hour Early-Bird Alerts (Instant email & push)",
        "Search & filter jobs posted in the last 24 hours",
      ],
    },
    monthly: {
      id: "monthly" as CandidatePlanId,
      name: "Monthly Pro",
      price: 17.99,
      interval: "month" as const,
      billingType: "subscription" as const,
      billingTerms: "$17.99 billed monthly • Auto-renews • Cancel anytime",
      badge: "Most Popular",
      isPopular: true,
      description: "Our most popular plan for active candidates through multi-stage interview rounds.",
      features: [
        "Direct ATS Application Links unlocked immediately",
        "Direct Company Careers & 'Hidden Jobs' stream",
        "2-Hour Early-Bird Alerts (Instant email & push)",
        "Search & filter jobs posted in the last 24 hours",
        "Remote Salary Negotiation Playbook & Scripts ($97 value)",
        "ATS Keyword Resume Optimization Tool",
      ],
    },
    lifetime: {
      id: "lifetime" as CandidatePlanId,
      name: "Lifetime Access",
      price: 49.99,
      interval: "lifetime" as const,
      billingType: "one-time" as const,
      billingTerms: "$49.99 one-time payment • Never renews • Perpetual access",
      badge: "Best Value",
      isPopular: false,
      description: "Pay once and monitor the remote job market continuously throughout your entire career.",
      features: [
        "Perpetual access to all current and future features",
        "Direct ATS Application Links unlocked permanently",
        "Priority Early-Bird Alerts & Reverse Candidate Spotlight",
        "Full Remote Salary Negotiation Playbook & Templates",
        "Never pay another subscription fee or renewal charge",
      ],
    },
  },
  guarantees: {
    refundDays: 7,
    refundText: "7-day unconditional 100% money-back guarantee. Email support@remoteworkdaily.com for an immediate full refund.",
    interviewGuaranteeDays: 60,
    interviewGuaranteeText: "60-day interview guarantee if you do not land at least 2 recruiter screening calls.",
  },
  // Backward compatibility alias
  hunterPass: {
    id: "lifetime" as CandidatePlanId,
    name: "Lifetime Access",
    price: 49.99,
    description: "Perpetual direct ATS application links, 2-hour early-bird alerts, and salary negotiation playbook.",
    billingTerms: "One-time payment • Never auto-renews • Valid for your entire career",
    features: [
      "Direct ATS Application Links unlocked permanently",
      "2-Hour Early-Bird Alerts (Email before public feed)",
      "Remote Salary Negotiation Playbook & Email Scripts ($97 value)",
      "ATS Keyword Analyzer for Markdown Resumes",
    ],
    guarantee: "7-day 100% money-back guarantee + 60-day interview guarantee",
  },
};

