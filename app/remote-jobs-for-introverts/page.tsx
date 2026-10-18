import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Coffee,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  HelpCircle,
  Sparkles,
  Zap,
  Code,
  PenTool,
  BarChart3,
  Palette,
  ShieldAlert,
  Headphones,
} from "lucide-react";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Best Remote Jobs for Introverts (2026): Low-Meeting & High-Paying Roles",
  description:
    "Discover the best remote jobs for introverts with little social interaction, async communication, and 100% upfront salary disclosures. Explore tech, writing, design, and data careers.",
  keywords: [
    "remote jobs for introverts",
    "best remote jobs for introverts",
    "remote jobs for introverts with no experience",
    "quiet remote jobs",
    "remote jobs with little interaction",
    "low stress remote jobs",
    "remote creative jobs for introverts",
    "work from home jobs for introverts",
    "asynchronous remote jobs",
  ],
  alternates: {
    canonical: "https://www.remoteworkdaily.com/remote-jobs-for-introverts",
  },
  openGraph: {
    title: "Best Remote Jobs for Introverts (2026) — Low Stress, High Pay",
    description:
      "Tired of 8 hours of Zoom calls? Discover high-paying remote roles with asynchronous culture, minimal client interaction, and verified direct ATS links.",
    url: "https://www.remoteworkdaily.com/remote-jobs-for-introverts",
    siteName: "Remote Work Daily",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Remote Jobs for Introverts: Low Meetings & High Pay (2026)",
    description:
      "Explore 1,000+ remote jobs for introverts across programming, data analysis, copywriting, and design with zero paywalls.",
  },
};

export default function RemoteJobsForIntrovertsPage() {
  const allJobs = getAllJobs();
  
  // Filter for roles well-suited for introverts (dev, design, writing, data)
  const introvertKeywords = ["engineer", "developer", "writer", "writing", "data", "analyst", "designer", "qa", "copywriter", "editor"];
  const matchingJobs = allJobs.filter((job) => {
    const title = job.title.toLowerCase();
    const tags = job.tags.map((t) => t.toLowerCase()).join(" ");
    return introvertKeywords.some((k) => title.includes(k) || tags.includes(k));
  });

  const jobSchemas = matchingJobs.slice(0, 10).map((job) => generateJobPostingSchema(job));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What are the best remote jobs for introverts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The top remote jobs for introverts include Software Engineering, Technical Writing, Data Analysis, Graphic & UI Design, QA Automation, and SEO Content Writing. These roles focus on deep autonomous work, written asynchronous communication, and minimal back-to-back Zoom meetings.",
        },
      },
      {
        "@type": "Question",
        name: "Can introverts find entry-level remote jobs with no experience?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Entry-level remote roles like Data Entry Specialist, Junior Quality Assurance (QA) Tester, Proofreader, Content Moderator, and Transcriptionist offer low social interaction and allow candidates to get started without extensive prior corporate experience.",
        },
      },
      {
        "@type": "Question",
        name: "How much do introvert-friendly remote jobs pay?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Introvert-friendly remote roles pay between $55,000 to over $180,000 per year. For example, remote Data Analysts average $75,000-$115,000, Technical Writers average $85,000-$130,000, and Senior Software Engineers regularly earn $140,000-$220,000+.",
        },
      },
      {
        "@type": "Question",
        name: "What is an asynchronous remote culture?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An asynchronous remote company emphasizes written documentation (via Notion, GitHub, Linear, or Slack) over real-time meetings. Team members communicate at their own pace without the pressure of instant replies or constant video cameras, which is ideal for introverts who excel in thoughtful, deep focus work.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.remoteworkdaily.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Remote Jobs for Introverts",
        item: "https://www.remoteworkdaily.com/remote-jobs-for-introverts",
      },
    ],
  };

  const roleCategories = [
    {
      title: "Software Engineering & Dev",
      salary: "$90,000 - $190,000/yr",
      desc: "Solve complex technical puzzles, write clean code, and communicate via pull request reviews rather than unending Zoom meetings.",
      icon: Code,
    },
    {
      title: "Technical Writing & Copywriting",
      salary: "$65,000 - $135,000/yr",
      desc: "Turn complex architectures into crystal-clear API docs, knowledge base articles, or high-converting copy in autonomous quiet focus.",
      icon: PenTool,
    },
    {
      title: "Data Analysis & BI Reporting",
      salary: "$70,000 - $140,000/yr",
      desc: "Query SQL databases, build Python automation pipelines, and visualize business trends without client-facing sales pressure.",
      icon: BarChart3,
    },
    {
      title: "UI/UX & Graphic Design",
      salary: "$65,000 - $130,000/yr",
      desc: "Craft beautiful interfaces and design systems in Figma. Asynchronous loom walkthroughs replace stressful live client presentations.",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-[#FF4742] dark:hover:text-[#FF4742] transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>All Remote Jobs</span>
        </Link>

        {/* Hero Banner */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 mb-3">
            <Headphones className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Asynchronous &bull; Low-Meeting &bull; Deep Focus</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Best Remote Jobs for Introverts:{" "}
            <span className="text-[#FF4742]">High Pay, Low Meetings</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
            If 6 consecutive hours of video meetings drain your energy and ruin
            your productivity, you don't need a different attitude — you need an
            asynchronous career. Discover verified remote jobs where independent
            thinking, deep work, and written clarity are valued above constant extroverted presence.
          </p>
        </header>

        {/* Top 4 Introvert Career Pillars */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-6">
            Top 4 Career Paths for Introverted Remote Workers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-1">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                      {cat.salary}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5 Signs a Remote Company is Actually Introvert-Friendly */}
        <section className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-neutral-100 to-white dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-950 border border-purple-200/60 dark:border-purple-900/40">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            How to Spot an Introvert-Friendly Remote Company
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
            <div className="p-3 bg-white/70 dark:bg-neutral-900/70 rounded-xl border border-neutral-200/50 dark:border-neutral-800">
              <strong>1. Documentation-First:</strong> They use tools like Notion, Linear, and GitHub to discuss decisions instead of scheduling quick calls.
            </div>
            <div className="p-3 bg-white/70 dark:bg-neutral-900/70 rounded-xl border border-neutral-200/50 dark:border-neutral-800">
              <strong>2. "No-Meeting" Days:</strong> Designated calendar blocks (like No-Meeting Wednesdays) where team members enjoy uninterrupted deep focus.
            </div>
            <div className="p-3 bg-white/70 dark:bg-neutral-900/70 rounded-xl border border-neutral-200/50 dark:border-neutral-800">
              <strong>3. Output Over Hours:</strong> Performance is judged by delivered code, shipped copy, or resolved tickets — not by whether your Slack dot is green all day.
            </div>
          </div>
        </section>

        {/* Live Filterable Job Board */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Quiet &amp; Async Remote Jobs ({matchingJobs.length})
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Filtered for high-autonomy roles in engineering, data, design, and content.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="py-16 text-center text-sm text-neutral-400">
                <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Loading introvert-friendly remote jobs...</span>
              </div>
            }
          >
            <JobBoardClient
              initialJobs={allJobs}
              initialCategory="dev"
            />
          </Suspense>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#FF4742]" />
            Frequently Asked Questions: Remote Work for Introverts
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Are there remote jobs with zero phone calls or meetings?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                While very few corporate jobs have absolute zero interaction, roles like
                Technical Writer, Data Entry Specialist, QA Automation Engineer, and Freelance
                Copywriter often operate with 95% written communication (email, Slack, GitHub PRs)
                and only a single weekly or bi-weekly check-in call.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                How should introverts interview for remote positions?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Introverts excel when given time to think and organize thoughts. Highlight
                your written communication skills, share links to documented projects or portfolios,
                and proactively send a personalized 60-second Loom recording. In live interviews,
                it's completely acceptable to pause for 3-5 seconds to formulate thoughtful answers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                How do I avoid burnout as an introverted remote employee?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Turn off camera previews during video calls to reduce self-monitoring fatigue,
                batch meetings into specific afternoons to preserve uninterrupted morning focus time,
                and communicate asynchronously whenever possible by writing concise project briefs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
