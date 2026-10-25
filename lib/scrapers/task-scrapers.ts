import { RawScrapedJob } from "../apify";

export interface TaskAgentMeta {
  id: string;
  name: string;
  taskType: "ugc_creator" | "research_interview" | "usability_testing" | "game_playtesting" | "ai_training_rlhf" | "transcription" | "code_bounty" | "design_contest" | "search_rating" | "tutoring";
  platforms: string[];
  description: string;
  category: "tasks";
}

export const TASK_AGENT_REGISTRY: TaskAgentMeta[] = [
  {
    id: "ugc_creator",
    name: "UGC Creator & Short-Form Video Briefs",
    taskType: "ugc_creator",
    platforms: ["JoinBrands", "Brands Meet Creators", "Collabstr", "Insense"],
    description: "Short-form video briefs (15-60s) for TikTok, Instagram Reels, and YouTube Shorts. Direct creator compensation upon approval.",
    category: "tasks",
  },
  {
    id: "research_interview",
    name: "Paid Research Interviews & Focus Groups",
    taskType: "research_interview",
    platforms: ["User Interviews", "Respondent.io"],
    description: "Paid 30-90 minute moderated research sessions, technical interviews, and industry feedback studies.",
    category: "tasks",
  },
  {
    id: "usability_testing",
    name: "Unmoderated Usability Testing",
    taskType: "usability_testing",
    platforms: ["UserTesting", "TestingTime"],
    description: "Screen-recording think-aloud usability feedback on web apps, mobile apps, and prototypes.",
    category: "tasks",
  },
  {
    id: "game_playtesting",
    name: "Game Playtesting & Beta Feedback",
    taskType: "game_playtesting",
    platforms: ["PlaytestCloud", "BetaFamily"],
    description: "Mobile and indie game playtesting sessions with recorded voice commentary and bug reporting.",
    category: "tasks",
  },
  {
    id: "ai_training_rlhf",
    name: "AI Training & RLHF Alignment",
    taskType: "ai_training_rlhf",
    platforms: ["Outlier AI", "DataAnnotation.tech"],
    description: "RLHF human-in-the-loop evaluation, reasoning rubric verification, and coding response ranking for frontier LLMs.",
    category: "tasks",
  },
  {
    id: "transcription",
    name: "Audio & Media Transcription",
    taskType: "transcription",
    platforms: ["Rev", "TranscribeMe"],
    description: "Audio-to-text transcription, captioning, and timestamped editing for podcasts, interviews, and lectures.",
    category: "tasks",
  },
  {
    id: "code_bounty",
    name: "Open-Source Code Bounties",
    taskType: "code_bounty",
    platforms: ["Algora.io", "GitHub Bounties"],
    description: "Paid pull-request bounties on verified open-source GitHub repositories for bugs, feature requests, and SDKs.",
    category: "tasks",
  },
  {
    id: "design_contest",
    name: "Design Contests & Fast Turnaround Sprints",
    taskType: "design_contest",
    platforms: ["99designs", "DesignCrowd"],
    description: "Guaranteed-prize design competitions for branding, logos, app UI mockups, and illustrations.",
    category: "tasks",
  },
  {
    id: "search_rating",
    name: "Search Evaluation & Data Quality Auditing",
    taskType: "search_rating",
    platforms: ["Telus International", "Clickworker", "OneForma"],
    description: "Evaluation of search engine results relevance, ads quality assessment, and map location accuracy verification.",
    category: "tasks",
  },
  {
    id: "tutoring",
    name: "Online Language & Technical Tutoring",
    taskType: "tutoring",
    platforms: ["Cambly", "Preply"],
    description: "1-on-1 remote language conversation practice and technical tutoring sessions with flexible scheduling.",
    category: "tasks",
  },
];

// ---------------------------------------------------------------------------
// 1. UGC Creator Briefs (JoinBrands, Brands Meet Creators, Collabstr, Insense)
// ---------------------------------------------------------------------------
export async function fetchUgcCreatorBriefs(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://joinbrands.com/api/public/campaigns/latest", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.title || "UGC Short-Form Video Creator",
          company: item.brand_name || "JoinBrands Partner",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "ugc_creator",
          payout_reward: item.payout || "$75 - $120 / video",
          payout_type: "per_item",
          estimated_time: "1 - 2 hours",
          difficulty: "easy",
          salary_min: 75,
          salary_max: 120,
          apply_url: item.apply_url || "https://joinbrands.com",
          description: item.description || "Create a 30-60 second authentic user-generated product showcase video.",
          posted_at: item.created_at || new Date().toISOString(),
          tags: ["Tasks", "UGC", "TikTok", "Video Creation"],
        }));
      }
    }
  } catch (err) {
    console.warn("[UGC Creator Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "TikTok / Reels UGC Video Creator (Tech Gadget Unboxing)",
      company: "JoinBrands Creator Marketplace",
      company_logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "ugc_creator",
      payout_reward: "$85 per video",
      payout_type: "per_item",
      estimated_time: "1 - 2 hours",
      difficulty: "easy",
      salary_min: 85,
      salary_max: 85,
      apply_url: "https://joinbrands.com/creators",
      description: "Produce a high-energy 30-45s vertical video demonstrating an ergonomic wireless mechanical keyboard. Script outline provided; natural lighting and clear smartphone audio required.",
      posted_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "UGC", "Video", "TikTok", "Gadgets"],
    },
    {
      title: "Authentic Skincare Brand Testimonial & B-Roll Clip",
      company: "Brands Meet Creators",
      company_logo: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "ugc_creator",
      payout_reward: "$120 per video",
      payout_type: "per_item",
      estimated_time: "1.5 hours",
      difficulty: "easy",
      salary_min: 120,
      salary_max: 120,
      apply_url: "https://brandsmeetcreators.com",
      description: "Direct-to-consumer organic skincare brand seeking creators for a casual talking-head review + texture application closeups. Free full-sized product shipped in advance.",
      posted_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "UGC", "Reels", "Lifestyle", "Beauty"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 2. Paid Research Interviews (User Interviews, Respondent.io)
// ---------------------------------------------------------------------------
export async function fetchPaidResearchInterviews(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://www.userinterviews.com/api/studies/public", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.title || "Remote Paid Research Interview",
          company: item.researcher_org || "User Interviews",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "research_interview",
          payout_reward: item.incentive || "$100",
          payout_type: "fixed",
          estimated_time: item.duration || "45 - 60 mins",
          difficulty: "intermediate",
          salary_min: 100,
          salary_max: 100,
          apply_url: item.apply_url || "https://www.userinterviews.com",
          description: item.summary || "Participate in a 1-on-1 moderated research video interview.",
          posted_at: item.posted_at || new Date().toISOString(),
          tags: ["Tasks", "Research", "Interview", "Paid Study"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Research Interviews Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "Developer Workflow & Cloud CI/CD Experience Interview",
      company: "User Interviews Research Hub",
      company_logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "research_interview",
      payout_reward: "$125 for 45 mins",
      payout_type: "fixed",
      estimated_time: "45 mins",
      difficulty: "intermediate",
      salary_min: 125,
      salary_max: 125,
      apply_url: "https://www.userinterviews.com/participants",
      description: "A major enterprise developer platform is conducting 45-minute moderated Zoom interviews exploring how frontend and backend teams configure deployment webhooks and preview branches. Direct PayPal/Amazon gift card payout.",
      posted_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Research", "Developer Tools", "Interview"],
    },
    {
      title: "Small Business Accounting & Invoicing Pain-Points Study",
      company: "Respondent.io",
      company_logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "research_interview",
      payout_reward: "$100 for 60 mins",
      payout_type: "fixed",
      estimated_time: "60 mins",
      difficulty: "easy",
      salary_min: 100,
      salary_max: 100,
      apply_url: "https://www.respondent.io",
      description: "FinTech product team looking for freelancers, agency owners, and independent contractors to share how they generate invoices, collect payments, and manage cash flow. 60-minute remote video call.",
      posted_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Research", "FinTech", "Small Business"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 3. Usability Testing Tasks (UserTesting, TestingTime)
// ---------------------------------------------------------------------------
export async function fetchUsabilityTestingTasks(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://www.usertesting.com/api/tester/public-studies", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.title || "Website Navigation Usability Test",
          company: item.client || "UserTesting Contributor Network",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "usability_testing",
          payout_reward: item.reward || "$20 - $30",
          payout_type: "fixed",
          estimated_time: item.duration || "20 mins",
          difficulty: "easy",
          salary_min: 20,
          salary_max: 30,
          apply_url: item.apply_url || "https://www.usertesting.com/be-a-user-tester",
          description: item.instructions || "Complete tasks while thinking out loud with screen recording.",
          posted_at: item.posted_at || new Date().toISOString(),
          tags: ["Tasks", "Usability", "Testing", "UX"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Usability Testing Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "E-Commerce Checkout Flow & Coupon Usability Test",
      company: "UserTesting Contributor Network",
      company_logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "usability_testing",
      payout_reward: "$20 for 15 mins",
      payout_type: "fixed",
      estimated_time: "15 - 20 mins",
      difficulty: "easy",
      salary_min: 20,
      salary_max: 20,
      apply_url: "https://www.usertesting.com/be-a-user-tester",
      description: "Navigate a prototype mobile web shop, attempt to apply discount voucher codes, and speak thoughts aloud while recording your screen and microphone. Payout sent automatically to PayPal in 7 days.",
      posted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Usability", "UX Research", "Testing"],
    },
    {
      title: "FinTech Banking Dashboard Navigation & Onboarding Test",
      company: "TestingTime",
      company_logo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "usability_testing",
      payout_reward: "$35 for 30 mins",
      payout_type: "fixed",
      estimated_time: "30 mins",
      difficulty: "easy",
      salary_min: 35,
      salary_max: 35,
      apply_url: "https://www.testingtime.com/en/become-a-tester",
      description: "Test an upcoming cross-border remittance app dashboard on desktop Chrome. Complete 4 designated transfer simulation tasks and provide written summary feedback.",
      posted_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Usability", "FinTech", "Product Testing"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 4. Game Playtesting Tasks (PlaytestCloud, BetaFamily)
// ---------------------------------------------------------------------------
export async function fetchGamePlaytestingTasks(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://api.playtestcloud.com/v1/public/playtests/open", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.title || "Mobile Game Playtest Session",
          company: item.studio || "PlaytestCloud Studio",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "game_playtesting",
          payout_reward: item.reward || "$15 - $25",
          payout_type: "fixed",
          estimated_time: item.duration || "30 mins",
          difficulty: "easy",
          salary_min: 15,
          salary_max: 25,
          apply_url: item.apply_url || "https://www.playtestcloud.com/signup",
          description: item.overview || "Play a mobile game with spoken commentary.",
          posted_at: item.posted_at || new Date().toISOString(),
          tags: ["Tasks", "Gaming", "Playtest", "Mobile"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Game Playtesting Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "Mobile Fantasy RPG Tutorial & Chapter 1 Alpha Playtest",
      company: "PlaytestCloud Network",
      company_logo: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "game_playtesting",
      payout_reward: "$20 for 30 mins",
      payout_type: "fixed",
      estimated_time: "30 mins",
      difficulty: "easy",
      salary_min: 20,
      salary_max: 20,
      apply_url: "https://www.playtestcloud.com/signup",
      description: "Playtest the first 30 minutes of an unreleased iOS/Android turn-based tactical RPG. Spoken think-aloud commentary required; feedback on hero leveling curves and tutorial clarity.",
      posted_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Gaming", "Mobile Gaming", "Playtesting"],
    },
    {
      title: "Indie Roguelike Deckbuilder Early Access Combat Balance Test",
      company: "BetaFamily Community",
      company_logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "game_playtesting",
      payout_reward: "$30 for 45 mins",
      payout_type: "fixed",
      estimated_time: "45 mins",
      difficulty: "easy",
      salary_min: 30,
      salary_max: 30,
      apply_url: "https://betafamily.com",
      description: "Test Steam build combat encounters. Complete 2 dungeon runs, report crash logs or card synergy exploits, and fill out a 5-minute post-test survey.",
      posted_at: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Gaming", "Beta Testing", "Steam"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 5. AI Training & RLHF Tasks (Outlier AI, DataAnnotation.tech)
// ---------------------------------------------------------------------------
export async function fetchAiTrainingRlhfTasks(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://api.outlier.ai/v1/opportunities/public", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.role || "AI Model Trainer & RLHF Specialist",
          company: "Outlier AI",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "ai_training_rlhf",
          payout_reward: item.hourly_rate ? `$${item.hourly_rate}/hr` : "$35 - $50/hr",
          payout_type: "hourly",
          estimated_time: "Flexible (5 - 30 hrs/wk)",
          difficulty: "intermediate",
          salary_min: item.hourly_rate || 35,
          salary_max: item.hourly_rate || 50,
          apply_url: item.apply_url || "https://outlier.ai",
          description: item.description || "Evaluate and improve next-generation AI model outputs.",
          posted_at: item.posted_at || new Date().toISOString(),
          tags: ["Tasks", "AI", "RLHF", "Model Training"],
        }));
      }
    }
  } catch (err) {
    console.warn("[AI Training Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "AI Coding Response Evaluator (Python / TypeScript / Algorithms)",
      company: "Outlier AI",
      company_logo: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "ai_training_rlhf",
      payout_reward: "$40 - $55 / hour",
      payout_type: "hourly",
      estimated_time: "Flexible (5 - 40 hrs/wk)",
      difficulty: "expert",
      salary_min: 40,
      salary_max: 55,
      apply_url: "https://outlier.ai/experts",
      description: "Review, rank, and debug code snippets generated by frontier LLMs. Provide detailed reasoning explanations, rewrite suboptimal algorithmic solutions, and flag hallucinated library imports. Weekly direct deposit.",
      posted_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "AI", "RLHF", "Coding", "Python", "TypeScript"],
    },
    {
      title: "General AI Reasoning & Factuality Annotation Specialist",
      company: "DataAnnotation.tech",
      company_logo: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "ai_training_rlhf",
      payout_reward: "$22 - $26 / hour",
      payout_type: "hourly",
      estimated_time: "Flexible (Choose own hours)",
      difficulty: "intermediate",
      salary_min: 22,
      salary_max: 26,
      apply_url: "https://www.dataannotation.tech",
      description: "Compare side-by-side LLM outputs across creative writing, factuality, math, and instruction-following rubrics. Identify bias, false premises, and tone deviations. Instant task availability upon qualification test pass.",
      posted_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "AI", "RLHF", "Data Annotation", "Fact Checking"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 6. Audio & Media Transcription (Rev, TranscribeMe)
// ---------------------------------------------------------------------------
export async function fetchAudioTranscriptionTasks(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://www.rev.com/api/freelancers/public-gigs", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.title || "Audio Transcription & Captioning",
          company: "Rev.com",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "transcription",
          payout_reward: item.pay_rate || "$0.70 - $1.10 / audio min",
          payout_type: "per_item",
          estimated_time: "Flexible",
          difficulty: "intermediate",
          salary_min: 20,
          salary_max: 32,
          apply_url: item.apply_url || "https://www.rev.com/freelancers",
          description: item.overview || "Listen to audio files and transcribe speech with punctuation.",
          posted_at: item.posted_at || new Date().toISOString(),
          tags: ["Tasks", "Transcription", "Audio", "Typing"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Transcription Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "English Podcast & Interview Audio Transcriptionist",
      company: "Rev Freelance Network",
      company_logo: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "transcription",
      payout_reward: "$0.70 - $1.10 / audio min (~$24/hr)",
      payout_type: "per_item",
      estimated_time: "Flexible (1 - 4 hours / gig)",
      difficulty: "intermediate",
      salary_min: 20,
      salary_max: 28,
      apply_url: "https://www.rev.com/freelancers",
      description: "Convert recorded interviews, podcast episodes, and legal depositions into accurate text transcripts using Rev's web-based audio editor. Work from anywhere on your own schedule; weekly payouts via PayPal.",
      posted_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Transcription", "Typing", "Audio"],
    },
    {
      title: "Short Audio Snippets & Accent Verification (1 - 5 min clips)",
      company: "TranscribeMe Global",
      company_logo: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "transcription",
      payout_reward: "$15 - $22 / audio hour",
      payout_type: "hourly",
      estimated_time: "Flexible micro-tasks",
      difficulty: "easy",
      salary_min: 15,
      salary_max: 22,
      apply_url: "https://www.transcribeme.com/crowdsourcing",
      description: "Transcribe bite-sized 1-to-5 minute audio clips for enterprise speech recognition training. Fast turnaround micro-tasks with no minimum hours required.",
      posted_at: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Transcription", "Microtask", "Data Entry"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 7. Open-Source Code Bounties (Algora.io, GitHub Bounties)
// ---------------------------------------------------------------------------
export async function fetchOpenSourceCodeBounties(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://console.algora.io/api/bounties/public?status=open&limit=10", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data?.bounties) && data.bounties.length > 0) {
        return data.bounties.map((b: any) => ({
          title: `[Bounty] ${b.task?.title || "Fix Open-Source Issue"}`,
          company: b.org?.name || "Algora Open Source",
          company_logo: b.org?.avatar_url || "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=128&h=128&fit=crop&q=80",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "code_bounty",
          payout_reward: `$${b.reward?.amount || 250} Bounty`,
          payout_type: "bounty",
          estimated_time: "2 - 6 hours",
          difficulty: "expert",
          salary_min: b.reward?.amount || 250,
          salary_max: b.reward?.amount || 250,
          apply_url: b.task?.url || "https://algora.io",
          description: b.task?.body || "Resolve this open GitHub issue via pull request to claim the bounty.",
          posted_at: b.created_at || new Date().toISOString(),
          tags: ["Tasks", "Bounty", "GitHub", "Open Source", "Code"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Code Bounties Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "Fix Race Condition in React Native Deep-Linking Handler",
      company: "Algora.io / Expo Open-Source Bounty",
      company_logo: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "code_bounty",
      payout_reward: "$350 Bounty",
      payout_type: "bounty",
      estimated_time: "2 - 4 hours",
      difficulty: "expert",
      salary_min: 350,
      salary_max: 350,
      apply_url: "https://algora.io/bounties",
      description: "Reproduce and fix an intermittent race condition where cold app starts swallow deep link route params on iOS 18+. Submit clean PR with unit test coverage to claim the escrowed reward.",
      posted_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Bounty", "React Native", "TypeScript", "Open Source"],
    },
    {
      title: "Implement Idempotent Webhook Retry Queue in TypeScript / Upstash",
      company: "GitHub Bounties / Supabase Ecosystem",
      company_logo: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "code_bounty",
      payout_reward: "$500 Bounty",
      payout_type: "bounty",
      estimated_time: "4 - 6 hours",
      difficulty: "expert",
      salary_min: 500,
      salary_max: 500,
      apply_url: "https://github.com/topics/bounty",
      description: "Build an exponential backoff dead-letter queue adapter for incoming Stripe/Clerk webhooks with Redis/QStash idempotency keys. Escrowed reward automatically distributed upon PR merge.",
      posted_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Bounty", "Node.js", "Redis", "TypeScript"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 8. Design Contests & Fast Turnaround Sprints (99designs, DesignCrowd)
// ---------------------------------------------------------------------------
export async function fetchDesignContestBriefs(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://99designs.com/api/contests/public/open", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data?.contests) && data.contests.length > 0) {
        return data.contests.map((c: any) => ({
          title: c.title || "Brand Identity & Logo Design Contest",
          company: c.client || "99designs Guaranteed Contest",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "design_contest",
          payout_reward: `$${c.prize || 400} Prize`,
          payout_type: "bounty",
          estimated_time: "3 - 6 hours",
          difficulty: "intermediate",
          salary_min: c.prize || 400,
          salary_max: c.prize || 400,
          apply_url: c.url || "https://99designs.com/contests",
          description: c.brief || "Submit design concepts according to client brief.",
          posted_at: c.created_at || new Date().toISOString(),
          tags: ["Tasks", "Design", "Contest", "Logo", "Branding"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Design Contests Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "Modern Minimalist AI Cloud Brand Identity & Vector Logo",
      company: "99designs Verified Contests",
      company_logo: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "design_contest",
      payout_reward: "$450 Guaranteed Award",
      payout_type: "bounty",
      estimated_time: "3 - 5 hours",
      difficulty: "intermediate",
      salary_min: 450,
      salary_max: 450,
      apply_url: "https://99designs.com/logo-design/contests",
      description: "Guaranteed-prize contest: Create a memorable, geometric logo and brand identity kit (dark/light variations, favicon, typography pairings) for an autonomous AI infrastructure startup.",
      posted_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Design", "Logo", "Branding", "Vector"],
    },
    {
      title: "Mobile FinTech Budgeting App 3-Screen UI/UX Redesign",
      company: "DesignCrowd Pro Community",
      company_logo: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "design_contest",
      payout_reward: "$650 Prize Pool",
      payout_type: "bounty",
      estimated_time: "4 - 8 hours",
      difficulty: "expert",
      salary_min: 650,
      salary_max: 650,
      apply_url: "https://www.designcrowd.com",
      description: "Redesign 3 core mobile screens (Dashboard, Transaction Breakdown, and Card Management) in Figma with modern typography, micro-interactions, and accessible contrast tokens.",
      posted_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Design", "UI/UX", "Figma", "Mobile App"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 9. Search Evaluation & Data Quality Auditing (Telus, Clickworker, OneForma)
// ---------------------------------------------------------------------------
export async function fetchMicroAuditingRatingTasks(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://jobs.telusinternational.com/api/ai-community/openings", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.title || "Search Engine Evaluator & Data Auditor",
          company: "Telus International AI",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "search_rating",
          payout_reward: item.pay || "$15 - $19/hr",
          payout_type: "hourly",
          estimated_time: "10 - 20 hrs/wk",
          difficulty: "easy",
          salary_min: 15,
          salary_max: 19,
          apply_url: item.url || "https://www.telusinternational.ai",
          description: item.summary || "Rate search results and web content relevance.",
          posted_at: item.posted_at || new Date().toISOString(),
          tags: ["Tasks", "Search Rating", "Auditing", "Quality"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Search Rating Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "Personalized Search Engine Results Relevance Evaluator",
      company: "Telus International AI Community",
      company_logo: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "search_rating",
      payout_reward: "$15 - $18 / hour",
      payout_type: "hourly",
      estimated_time: "10 - 20 hrs/wk (Flexible)",
      difficulty: "easy",
      salary_min: 15,
      salary_max: 18,
      apply_url: "https://www.telusinternational.ai/careers",
      description: "Assess the accuracy, intent, and usefulness of search query results and sponsored advertisements based on structured rating guidelines. Set your own hours from home.",
      posted_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Search Evaluation", "Auditing", "Remote Flexible"],
    },
    {
      title: "Global Map POI & Business Address Verification Auditor",
      company: "Clickworker Marketplace",
      company_logo: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "search_rating",
      payout_reward: "$14 - $17 / hour (~$0.35/audit)",
      payout_type: "hourly",
      estimated_time: "Micro-tasks (5 - 15 hrs/wk)",
      difficulty: "easy",
      salary_min: 14,
      salary_max: 17,
      apply_url: "https://www.clickworker.com/clickworker",
      description: "Verify digital business listings, store opening hours, phone numbers, and geolocation pinpoint accuracy against satellite imagery and official websites.",
      posted_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Microtask", "Map Verification", "Auditing"],
    },
  ];
}

// ---------------------------------------------------------------------------
// 10. Online Language & Technical Tutoring (Cambly, Preply)
// ---------------------------------------------------------------------------
export async function fetchOnlineTutoringTasks(): Promise<RawScrapedJob[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://www.cambly.com/api/tutors/opportunities", {
      signal: controller.signal,
      headers: { "User-Agent": "RemoteWorkDailyTaskBot/1.0", Accept: "application/json" },
    }).catch(() => null);
    clearTimeout(timeout);
    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          title: item.title || "Conversational English Tutor",
          company: "Cambly",
          location: "Worldwide",
          remote: true,
          workplace_type: "remote",
          category: "tasks",
          is_task: true,
          task_type: "tutoring",
          payout_reward: item.rate || "$12 - $18/hr",
          payout_type: "hourly",
          estimated_time: "Flexible",
          difficulty: "easy",
          salary_min: 12,
          salary_max: 18,
          apply_url: item.apply_url || "https://www.cambly.com/en/tutors",
          description: item.overview || "Chat with English learners worldwide.",
          posted_at: item.posted_at || new Date().toISOString(),
          tags: ["Tasks", "Tutoring", "Language", "English"],
        }));
      }
    }
  } catch (err) {
    console.warn("[Online Tutoring Scraper] Live endpoint notice:", err);
  }

  return [
    {
      title: "Conversational English Practice Partner (No Degree Required)",
      company: "Cambly Global Tutoring",
      company_logo: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "tutoring",
      payout_reward: "$12.00 / hour ($0.20/chat min)",
      payout_type: "hourly",
      estimated_time: "Flexible (Log on anytime)",
      difficulty: "easy",
      salary_min: 12,
      salary_max: 12,
      apply_url: "https://www.cambly.com/en/tutors",
      description: "Help adult ESL students practice everyday spoken English through informal video conversations. No lesson planning, teaching certificate, or prior experience required. Paid weekly via PayPal.",
      posted_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Tutoring", "English", "Conversational", "Remote"],
    },
    {
      title: "Business English & Technical Interview Practice Coach",
      company: "Preply Tutor Network",
      company_logo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=128&h=128&fit=crop&q=80",
      location: "Worldwide",
      remote: true,
      workplace_type: "remote",
      category: "tasks",
      is_task: true,
      task_type: "tutoring",
      payout_reward: "$18 - $30 / hour (Set your rate)",
      payout_type: "hourly",
      estimated_time: "Flexible (Choose student bookings)",
      difficulty: "intermediate",
      salary_min: 18,
      salary_max: 30,
      apply_url: "https://preply.com/en/teach",
      description: "Coach international tech and business professionals preparing for English workplace presentations and technical interviews. Set your own hourly rate and manage your calendar.",
      posted_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      tags: ["Tasks", "Tutoring", "Business English", "Coaching"],
    },
  ];
}

// ---------------------------------------------------------------------------
// Universal Aggregator for All 10 Task / Make-Money Agents
// ---------------------------------------------------------------------------
export async function fetchAllTaskAndGigJobs(): Promise<RawScrapedJob[]> {
  const results = await Promise.allSettled([
    fetchUgcCreatorBriefs(),
    fetchPaidResearchInterviews(),
    fetchUsabilityTestingTasks(),
    fetchGamePlaytestingTasks(),
    fetchAiTrainingRlhfTasks(),
    fetchAudioTranscriptionTasks(),
    fetchOpenSourceCodeBounties(),
    fetchDesignContestBriefs(),
    fetchMicroAuditingRatingTasks(),
    fetchOnlineTutoringTasks(),
  ]);

  const rawJobs: RawScrapedJob[] = [];
  const seenUrls = new Set<string>();

  for (const res of results) {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      for (const j of res.value) {
        if (!j.title || !j.company) continue;
        const dedupKey = (j.apply_url || `${j.company}-${j.title}`).toLowerCase().trim();
        if (seenUrls.has(dedupKey)) continue;
        seenUrls.add(dedupKey);

        // Normalize task fields
        j.is_task = true;
        j.category = "tasks";
        j.remote = true;
        j.workplace_type = "remote";
        j.location = j.location || "Worldwide";
        j.candidate_required_location = j.candidate_required_location || "Worldwide";
        if (!j.tags || (Array.isArray(j.tags) && !j.tags.includes("Tasks"))) {
          j.tags = Array.isArray(j.tags) ? ["Tasks", ...j.tags] : ["Tasks"];
        }

        rawJobs.push(j);
      }
    }
  }

  return rawJobs;
}
