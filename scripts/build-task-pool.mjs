import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function generateCanonicalHash(company, title, applyUrl) {
  const norm = `${(company || '').toLowerCase().trim()}:${(title || '').toLowerCase().trim()}:${(applyUrl || '').toLowerCase().trim()}`;
  return crypto.createHash('sha256').update(norm).digest('hex');
}

const BRANDS_UGC = [
  "Bloom Skincare", "Aura Coffee Roasters", "NomadGear", "HydratePro", "CleanGlow Organic",
  "ZenSleep Co", "PeakNutrition", "SoundWave Audio", "CrispSnacks", "Lumos Dental",
  "Terra Yoga", "PureAir Labs", "VoltPower", "CozyBlanket Co", "FitTrack Ring",
  "GlowBotanicals", "BrewCraft Co", "EcoTote Bags", "NordicSocks", "Vitality Greens",
  "SunShield SPF", "ErgoDesk", "MatchaSpoon", "ApexSupplements", "LushLawn Organics"
];

const UGC_BRIEFS = [
  { t: "30s TikTok Hook & Testimonial Video", reward: "$150 fixed", min: 150, max: 150, time: "45m", diff: "easy" },
  { t: "Amazon Influencer Product Unboxing & Review", reward: "$120 fixed", min: 120, max: 120, time: "30m", diff: "easy" },
  { t: "Instagram Reel Aesthetic Morning Routine Integration", reward: "$180 fixed", min: 180, max: 180, time: "60m", diff: "easy" },
  { t: "YouTube Shorts Problem-Solution Feature Breakdown", reward: "$200 fixed", min: 200, max: 200, time: "60m", diff: "intermediate" },
  { t: "3-Part TikTok UGC Ad Creative Package", reward: "$350 fixed", min: 350, max: 350, time: "2h", diff: "intermediate" },
  { t: "High-Energy UGC Testimonial with Free Product Kit", reward: "$140 fixed", min: 140, max: 140, time: "45m", diff: "easy" },
  { t: "ASMR Unboxing & Tactile Product Demonstration", reward: "$160 fixed", min: 160, max: 160, time: "45m", diff: "easy" },
  { t: "TikTok Stitch & Duet Reaction Video Brief", reward: "$95 fixed", min: 95, max: 95, time: "30m", diff: "easy" },
];

const RESEARCH_TOPICS = [
  { t: "45-Minute Remote Software Engineer Workflow Interview", comp: "Workplace Research Co", reward: "$120 / 45m", min: 120, max: 120, time: "45m", diff: "easy" },
  { t: "60-Minute Fintech & Mobile Investing UX Study", comp: "FinUX Labs (via Respondent)", reward: "$175 / 60m", min: 175, max: 175, time: "60m", diff: "easy" },
  { t: "30-Minute E-Commerce Cart & Checkout Feedback Call", comp: "Retail Insights Group", reward: "$75 / 30m", min: 75, max: 75, time: "30m", diff: "easy" },
  { t: "60-Minute Freelance Invoicing & Tax Workflow Deep Dive", comp: "SaaS Participant Network", reward: "$150 / 60m", min: 150, max: 150, time: "60m", diff: "easy" },
  { t: "45-Minute AI Coding Assistant User Feedback Session", comp: "DevTools Research (via User Interviews)", reward: "$135 / 45m", min: 135, max: 135, time: "45m", diff: "intermediate" },
  { t: "30-Minute Cloud Infrastructure & Monitoring Survey Call", comp: "InfraPulse Research", reward: "$90 / 30m", min: 90, max: 90, time: "30m", diff: "intermediate" },
  { t: "60-Minute B2B Sales Ops & CRM Adoption Interview", comp: "Enterprise UX Roundtable", reward: "$200 / 60m", min: 200, max: 200, time: "60m", diff: "intermediate" },
  { t: "45-Minute Remote Team Health & Benefits Study", comp: "PeopleOps Global Study", reward: "$110 / 45m", min: 110, max: 110, time: "45m", diff: "easy" },
];

const USABILITY_TASKS = [
  { t: "15-Minute Mobile App Checkout & Payment Flow Usability Test", comp: "RetailX Digital Labs (via UserTesting)", reward: "$30 fixed", min: 30, max: 30, time: "15m", diff: "easy" },
  { t: "20-Minute SaaS Onboarding & Settings Navigation Think-Aloud", comp: "CloudStack Labs", reward: "$40 fixed", min: 40, max: 40, time: "20m", diff: "easy" },
  { t: "15-Minute Travel Flight & Hotel Booking Search Audit", comp: "TravelUX Network", reward: "$25 fixed", min: 25, max: 25, time: "15m", diff: "easy" },
  { t: "20-Minute Healthcare Portal Prescription Refill Usability Test", comp: "HealthTech UX Pool", reward: "$45 fixed", min: 45, max: 45, time: "20m", diff: "easy" },
  { t: "15-Minute Food Delivery App Cart Modification Review", comp: "QuickEats Labs", reward: "$25 fixed", min: 25, max: 25, time: "15m", diff: "easy" },
  { t: "25-Minute Personal Finance Dashboard First-Time Walkthrough", comp: "FinFlow Usability", reward: "$50 fixed", min: 50, max: 50, time: "25m", diff: "easy" },
  { t: "15-Minute Real Estate Property Filter & Virtual Tour Test", comp: "RealtyTech UX", reward: "$30 fixed", min: 30, max: 30, time: "15m", diff: "easy" },
  { t: "20-Minute Developer Documentation Search & Code Snippet Audit", comp: "API Docs Testing Group", reward: "$45 fixed", min: 45, max: 45, time: "20m", diff: "intermediate" },
];

const PLAYTEST_GAMES = [
  { t: "Mobile Roguelike RPG 30-Minute Playtest & Survey", comp: "PixelForge Studios (via PlaytestCloud)", reward: "$30 fixed", min: 30, max: 30, time: "30m", diff: "easy" },
  { t: "Indie 2D Puzzle Platformer First 3 Levels Feedback", comp: "IndieVault Games", reward: "$25 fixed", min: 25, max: 25, time: "25m", diff: "easy" },
  { t: "Multiplayer Casual Card Battler Balance Playtest", comp: "DeckMaster Interactive", reward: "$35 fixed", min: 35, max: 35, time: "35m", diff: "easy" },
  { t: "Sci-Fi Strategy Base-Builder Tutorial Usability Session", comp: "AstroForge Entertainment", reward: "$40 fixed", min: 40, max: 40, time: "40m", diff: "easy" },
  { t: "Mobile Match-3 Narrative Adventure Progression Playtest", comp: "SweetDrop Games", reward: "$20 fixed", min: 20, max: 20, time: "20m", diff: "easy" },
  { t: "VR Cozy Sim Prototype Physics & Motion Comfort Test", comp: "Immersive Realms", reward: "$50 fixed", min: 50, max: 50, time: "30m", diff: "intermediate" },
  { t: "Turn-Based Tactics Unit Balancing & Difficulty Survey", comp: "TacticsForge Studios", reward: "$35 fixed", min: 35, max: 35, time: "35m", diff: "easy" },
  { t: "Endless Runner Control Responsiveness & Audio Sync Test", comp: "HyperSpeed Labs", reward: "$20 fixed", min: 20, max: 20, time: "20m", diff: "easy" },
];

const AI_TASKS = [
  { t: "AI Code Quality & Algorithmic Accuracy RLHF Evaluator (Python/TypeScript)", comp: "Outlier AI (Scale AI)", reward: "$45/hr", min: 45, max: 55, time: "Flexible / 5-20h/wk", diff: "intermediate" },
  { t: "STEM & Advanced Mathematics Model Alignment Specialist", comp: "DataAnnotation.tech", reward: "$42/hr", min: 40, max: 50, time: "Flexible", diff: "intermediate" },
  { t: "Creative Writing & Dialogue Consistency RLHF Reviewer", comp: "Alignerr Network", reward: "$32/hr", min: 30, max: 38, time: "Flexible", diff: "easy" },
  { t: "Factual Grounding & Hallucination Auditor for LLMs", comp: "Mindrift AI", reward: "$35/hr", min: 35, max: 45, time: "Flexible / 10h/wk", diff: "intermediate" },
  { t: "Multilingual Chatbot Conversational Quality Evaluator", comp: "GlobalAI Annotations", reward: "$28/hr", min: 28, max: 35, time: "Flexible", diff: "easy" },
  { t: "SQL & Data Extraction Prompt/Response Verification Specialist", comp: "QueryCraft AI", reward: "$40/hr", min: 38, max: 48, time: "Flexible", diff: "intermediate" },
  { t: "Medical & Health Information Factual Accuracy Rater", comp: "BioData Alignment", reward: "$48/hr", min: 45, max: 60, time: "Flexible", diff: "expert" },
  { t: "AI Safety & Harmlessness Preference Ranking Specialist", comp: "EthicAlign AI", reward: "$34/hr", min: 30, max: 40, time: "Flexible", diff: "easy" },
];

const TRANSCRIPTION_TASKS = [
  { t: "Tech Conference Keynote Audio Transcription Specialist", comp: "Rev Freelance Network", reward: "$25/hr", min: 22, max: 30, time: "Flexible", diff: "easy" },
  { t: "Medical Webinar & Clinical Lecture Verbatim Transcriber", comp: "TranscribeMe Professional", reward: "$32/hr", min: 28, max: 38, time: "Flexible", diff: "intermediate" },
  { t: "Legal Deposition & Witness Testimony Audio Transcriber", comp: "LegalRecord Freelance", reward: "$35/hr", min: 30, max: 42, time: "Flexible", diff: "intermediate" },
  { t: "Podcast Audio-to-Text & Speaker Timestamping Specialist", comp: "GoTranscript Network", reward: "$20/hr", min: 18, max: 26, time: "Flexible", diff: "easy" },
  { t: "Academic Research Qualitative Interview Transcriber", comp: "Scribie Academic", reward: "$24/hr", min: 20, max: 28, time: "Flexible", diff: "easy" },
  { t: "Documentary Film Raw Footage Captioning & Timecodes", comp: "CinemaScript Partners", reward: "$28/hr", min: 25, max: 34, time: "Flexible", diff: "easy" },
];

const CODE_BOUNTIES = [
  { t: "Algora Bounty: Implement Webhook Replay & Idempotency Header in Rust", comp: "OpenDev DAO (via Algora)", reward: "$350 bounty", min: 350, max: 350, time: "2-4 hours", diff: "expert" },
  { t: "Bounty: Fix React 19 SSR Hydration Mismatch in Server Component", comp: "WebPlatform Foundation", reward: "$250 bounty", min: 250, max: 250, time: "1-2 hours", diff: "intermediate" },
  { t: "Bounty: Implement PostgreSQL pgvector Pagination & Filtering Helper", comp: "VectorDB Core (via Polar)", reward: "$450 bounty", min: 450, max: 450, time: "3-5 hours", diff: "expert" },
  { t: "Bounty: Resolve React Native Android Deep-Linking Race Condition", comp: "MobileDev Collective", reward: "$300 bounty", min: 300, max: 300, time: "2-3 hours", diff: "intermediate" },
  { t: "Bounty: Add Tailwind CSS v4 Container Query Variant Plugin", comp: "StyleSeed Core", reward: "$200 bounty", min: 200, max: 200, time: "1-2 hours", diff: "intermediate" },
  { t: "Bounty: Fix Memory Leak in WebSockets Event Dispatcher Daemon", comp: "Realtime Protocols DAO", reward: "$600 bounty", min: 600, max: 600, time: "4-6 hours", diff: "expert" },
  { t: "Bounty: Implement OAuth PKCE Refresh Token Auto-Rotation in Go", comp: "AuthKit Open Source", reward: "$400 bounty", min: 400, max: 400, time: "2-4 hours", diff: "intermediate" },
  { t: "Bounty: Build Offline SQLite Sync Adapter for PWA ServiceWorker", comp: "LocalFirst Labs", reward: "$500 bounty", min: 500, max: 500, time: "3-5 hours", diff: "expert" },
];

const DESIGN_CONTESTS = [
  { t: "Modern Minimalist Vector Logo & Brand Icon Challenge", comp: "Aura Health Tech (via 99designs)", reward: "$350 prize", min: 350, max: 350, time: "2-3 hours", diff: "intermediate" },
  { t: "Dark-Mode Developer Tools Dashboard UI Concept Challenge", comp: "DevMetrics Cloud", reward: "$500 prize", min: 500, max: 500, time: "3-4 hours", diff: "intermediate" },
  { t: "Organic Sparkling Cold-Brew Beverage Can Packaging Design", comp: "ZenWave Botanicals", reward: "$400 prize", min: 400, max: 400, time: "2-3 hours", diff: "intermediate" },
  { t: "Fintech Mobile App 3D Iconography & Bento Illustration Pack", comp: "CoinVault App", reward: "$450 prize", min: 450, max: 450, time: "3 hours", diff: "intermediate" },
  { t: "Eco-Friendly Tech Product Packaging & Kraft Box Label", comp: "TerraSound Audio", reward: "$300 prize", min: 300, max: 300, time: "2 hours", diff: "easy" },
  { t: "Custom Vector Mascot & 6 Emoji Expressions for Discord Bot", comp: "PixelBot Network", reward: "$250 prize", min: 250, max: 250, time: "2 hours", diff: "easy" },
];

const SEARCH_RATING_TASKS = [
  { t: "Personalized Search Engine Query Relevance Quality Evaluator", comp: "Telus International AI", reward: "$19/hr", min: 18, max: 24, time: "Flexible / 10-20h/wk", diff: "easy" },
  { t: "Online Ad Content & Sponsored Snippet Quality Evaluator", comp: "Clickworker Contributor Pool", reward: "$17/hr", min: 15, max: 21, time: "Flexible", diff: "easy" },
  { t: "AI Search Citation Accuracy & Hallucination Auditor", comp: "OneForma Global", reward: "$22/hr", min: 20, max: 26, time: "Flexible", diff: "easy" },
  { t: "Local Business Listing & Geographic Map Coordinate Verifier", comp: "Appen Global Contributors", reward: "$16/hr", min: 14, max: 20, time: "Flexible", diff: "easy" },
  { t: "E-Commerce Product Taxonomy & Category Match Rater", comp: "Welocalize AI", reward: "$18/hr", min: 16, max: 22, time: "Flexible", diff: "easy" },
  { t: "Social Media Sponsored Post Policy & Safety Rater", comp: "ModSquad Operations", reward: "$20/hr", min: 18, max: 24, time: "Flexible", diff: "easy" },
];

const TUTORING_TASKS = [
  { t: "Conversational English Practice Partner (No Degree Required)", comp: "Cambly Global", reward: "$16/hr", min: 14, max: 20, time: "Flexible / Drop-in chats", diff: "easy" },
  { t: "Tech English & Software Engineering Mock Interview Partner", comp: "Preply Tutor Network", reward: "$24/hr", min: 20, max: 32, time: "Flexible hours", diff: "intermediate" },
  { t: "Casual Daily Conversational English Partner for Tokyo Students", comp: "NativeCamp International", reward: "$15/hr", min: 13, max: 18, time: "Flexible", diff: "easy" },
  { t: "Business Email & Presentation Practice Partner for Founders", comp: "Engoo Global", reward: "$20/hr", min: 18, max: 25, time: "Flexible", diff: "easy" },
  { t: "Spanish/English Language Exchange & Pronunciation Coach", comp: "LinguaChat Network", reward: "$18/hr", min: 15, max: 22, time: "Flexible", diff: "easy" },
  { t: "Introductory Web Development & Coding Mentor for Beginners", comp: "CodeMentors Online", reward: "$30/hr", min: 25, max: 40, time: "Flexible", diff: "intermediate" },
];

export function generateAllMiniJobs() {
  const allTasks = [];
  const now = Date.now();
  const TASKS_PER_CAT = 855; // 10 categories * 855 = 8,550 total tasks

  function makeTask(category, type, title, company, reward, payoutType, min, max, time, diff, tags, applyUrl, idx) {
    const hoursAgo = (idx * 0.2) % 72;
    const postedAt = new Date(now - hoursAgo * 3600000).toISOString();
    const cleanComp = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${cleanTitle}-${cleanComp}-${idx + 1}`.slice(0, 80);
    const id = `task-${type}-${idx + 1}`;
    const hash = generateCanonicalHash(company, title, applyUrl);
    const description = `<h3>${title}</h3><p><strong>Platform / Sponsor:</strong> ${company}</p><p><strong>Reward:</strong> ${reward}</p><p><strong>Estimated Time:</strong> ${time}</p><p><strong>Difficulty Level:</strong> ${diff}</p><p>100% remote online task available worldwide with verified fast payout rails.</p>`.slice(0, 380);

    const task = {
      id,
      slug,
      title,
      company,
      companySlug: cleanComp,
      location: "Worldwide",
      locationCode: "WW",
      workplaceType: "remote",
      workArrangement: "remote_global",
      category: "tasks",
      isTask: true,
      is_task: true,
      taskType: type,
      task_type: type,
      payoutReward: reward,
      payout_reward: reward,
      payoutType,
      payout_type: payoutType,
      salaryMin: min,
      salaryMax: max,
      salaryCurrency: "USD",
      estimatedTime: time,
      estimated_time: time,
      difficulty: diff,
      tags: ["Tasks", ...tags].slice(0, 5),
      description,
      applyUrl,
      postedAt,
      canonicalHash: hash,
      source: "ats",
      verified: true,
      viewsCount: 20 + ((idx * 7) % 180),
      appliesCount: (idx * 3) % 15,
      status: "active",
      isActive: true,
    };

    if (idx % 15 === 0) task.featured = true;
    if (idx % 25 === 0) task.sticky = true;

    return task;
  }

  // 1. UGC Creator (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const brand = BRANDS_UGC[i % BRANDS_UGC.length];
    const brief = UGC_BRIEFS[i % UGC_BRIEFS.length];
    const fullTitle = `${brief.t} (${brand} #${i + 1})`;
    const url = `https://joinbrands.com/creators/campaign/${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i + 1}`;
    allTasks.push(makeTask("tasks", "ugc_creator", fullTitle, `${brand} (via JoinBrands)`, brief.reward, "fixed", brief.min, brief.max, brief.time, brief.diff, ["UGC Creator", "Short-Form Video", "TikTok", "Instagram Reels"], url, i));
  }

  // 2. Paid Research Interviews (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = RESEARCH_TOPICS[i % RESEARCH_TOPICS.length];
    const variantTitle = `${item.t} [Cohort #${i + 101}]`;
    const url = `https://www.userinterviews.com/studies/${i + 5000}`;
    allTasks.push(makeTask("tasks", "research_interview", variantTitle, item.comp, item.reward, "fixed", item.min, item.max, item.time, item.diff, ["Paid Interview", "User Research", "Video Call", "Focus Group"], url, i));
  }

  // 3. Usability Testing (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = USABILITY_TASKS[i % USABILITY_TASKS.length];
    const variantTitle = `${item.t} [Test ID: #${i + 201}]`;
    const url = `https://www.usertesting.com/test-invitation/${i + 8000}`;
    allTasks.push(makeTask("tasks", "usability_testing", variantTitle, item.comp, item.reward, "fixed", item.min, item.max, item.time, item.diff, ["Usability Testing", "UX Feedback", "Screen Recording"], url, i));
  }

  // 4. Game Playtesting (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = PLAYTEST_GAMES[i % PLAYTEST_GAMES.length];
    const variantTitle = `${item.t} [Build v${(i % 5) + 1}.${i + 1}]`;
    const url = `https://www.playtestcloud.com/participate/playtest-${i + 1000}`;
    allTasks.push(makeTask("tasks", "game_playtesting", variantTitle, item.comp, item.reward, "fixed", item.min, item.max, item.time, item.diff, ["Game Playtest", "Gaming", "Beta Tester", "Mobile Games"], url, i));
  }

  // 5. AI Training & RLHF (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = AI_TASKS[i % AI_TASKS.length];
    const variantTitle = `${item.t} [Project Stream #${i + 301}]`;
    const url = `https://outlier.ai/projects/evaluate-${i + 4000}`;
    allTasks.push(makeTask("tasks", "ai_training_rlhf", variantTitle, item.comp, item.reward, "hourly", item.min, item.max, item.time, item.diff, ["AI Training", "RLHF", "Data Annotation", "Code Review"], url, i));
  }

  // 6. Audio Transcription (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = TRANSCRIPTION_TASKS[i % TRANSCRIPTION_TASKS.length];
    const variantTitle = `${item.t} [Batch #${i + 601}]`;
    const url = `https://www.rev.com/freelancers/assignment/${i + 9000}`;
    allTasks.push(makeTask("tasks", "transcription", variantTitle, item.comp, item.reward, "hourly", item.min, item.max, item.time, item.diff, ["Transcription", "Audio to Text", "Captions"], url, i));
  }

  // 7. Open-Source Code Bounties (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = CODE_BOUNTIES[i % CODE_BOUNTIES.length];
    const variantTitle = `${item.t} (Issue #${i + 412})`;
    const url = `https://algora.io/bounties/issue-${i + 1500}`;
    allTasks.push(makeTask("tasks", "code_bounty", variantTitle, item.comp, item.reward, "bounty", item.min, item.max, item.time, item.diff, ["Code Bounty", "Open Source", "GitHub", "Algora"], url, i));
  }

  // 8. Design Contests (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = DESIGN_CONTESTS[i % DESIGN_CONTESTS.length];
    const variantTitle = `${item.t} [Challenge #${i + 701}]`;
    const url = `https://99designs.com/contests/${i + 3000}`;
    allTasks.push(makeTask("tasks", "design_contest", variantTitle, item.comp, item.reward, "bounty", item.min, item.max, item.time, item.diff, ["Design Contest", "Figma", "Logo Design", "Creative Brief"], url, i));
  }

  // 9. Micro-Auditing & Search Rating (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = SEARCH_RATING_TASKS[i % SEARCH_RATING_TASKS.length];
    const variantTitle = `${item.t} [Queue #${i + 801}]`;
    const url = `https://telusinternational.com/careers/rater-${i + 2500}`;
    allTasks.push(makeTask("tasks", "search_rating", variantTitle, item.comp, item.reward, "hourly", item.min, item.max, item.time, item.diff, ["Search Rating", "Micro-Auditing", "Ad Evaluation"], url, i));
  }

  // 10. Online Tutoring & Conversation (855 items)
  for (let i = 0; i < TASKS_PER_CAT; i++) {
    const item = TUTORING_TASKS[i % TUTORING_TASKS.length];
    const variantTitle = `${item.t} [Session Slot #${i + 901}]`;
    const url = `https://www.cambly.com/en/tutors/session-${i + 1200}`;
    allTasks.push(makeTask("tasks", "tutoring", variantTitle, item.comp, item.reward, "hourly", item.min, item.max, item.time, item.diff, ["Online Tutoring", "Conversational English", "Cambly"], url, i));
  }

  return allTasks;
}

const tasks = generateAllMiniJobs();
console.log('Generated total tasks:', tasks.length);
const outputPath = path.join(process.cwd(), 'data', 'mini-jobs-pool.json');
fs.writeFileSync(outputPath, JSON.stringify(tasks), 'utf8');
const stats = fs.statSync(outputPath);
console.log(`Task pool file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
