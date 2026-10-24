import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  HelpCircle,
  Sparkles,
  Layers,
  TrendingUp,
  Cpu,
  Workflow,
  Search,
} from "lucide-react";
import { getAllJobs, filterJobs } from "@/lib/jobs-repository";
import { JobBoardClient } from "@/components/job-board/job-board-client";
import { generateJobPostingSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Another Word for Project Manager: 40+ Alternative Titles & Levels (2026)",
  description:
    "Explore 40+ project manager titles, synonyms, and career hierarchies. Compare remote salaries from Junior PM to VP of Operations and browse verified remote PM jobs.",
  keywords: [
    "another word for project manager",
    "project manager titles",
    "project management job titles hierarchy",
    "different titles for project manager",
    "technical project manager remote jobs",
    "remote project manager salary",
    "project coordinator vs project manager",
    "scrum master vs project manager",
    "program manager titles",
  ],
  alternates: {
    canonical: "https://remoteworkdaily.com/project-manager-titles",
  },
  openGraph: {
    title: "Another Word for Project Manager: 40+ Job Titles & Salaries (2026)",
    description:
      "Comprehensive breakdown of project management synonyms, hierarchy levels, average remote compensation, and active remote PM openings.",
    url: "https://remoteworkdaily.com/project-manager-titles",
    siteName: "Remote Work Daily",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Manager Titles & Synonyms: Hierarchy & 2026 Salaries",
    description:
      "Find the exact job title to search for on resume ATS filters and explore high-paying remote project management roles.",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ProjectManagerTitlesPage() {
  const allJobs = getAllJobs();

  // Filter for PM, TPM, Scrum Master, and Operations roles
  const pmKeywords = ["project manager", "technical program manager", "program manager", "scrum master", "delivery lead", "operations manager"];
  const matchingJobs = allJobs.filter((job) => {
    const title = job.title.toLowerCase();
    return pmKeywords.some((k) => title.includes(k));
  });

  const jobSchemas = matchingJobs.slice(0, 10).map((job) => generateJobPostingSchema(job));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is another word for Project Manager?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Common synonyms and alternative titles for Project Manager include Delivery Lead, Technical Program Manager (TPM), Scrum Master, Agile Coach, Operations Manager, Implementation Consultant, Production Lead, and Client Solutions Manager.",
        },
      },
      {
        "@type": "Question",
        name: "What is the project management career hierarchy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The standard hierarchy progresses as follows: 1. Project Coordinator / Associate PM ($55,000 - $75,000), 2. Project Manager ($80,000 - $115,000), 3. Senior Project Manager / TPM ($120,000 - $155,000), 4. Lead Program Manager ($150,000 - $185,000), 5. Director of Project Management / VP of Operations ($190,000 - $250,000+).",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between a Project Manager and a Product Manager?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Product Manager owns the 'Why' and 'What' (product strategy, user personas, business value, roadmap). A Project Manager owns the 'How' and 'When' (execution timelines, cross-team dependencies, risk mitigation, resource allocation, and budget tracking).",
        },
      },
      {
        "@type": "Question",
        name: "How much do remote Project Managers make?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Remote Project Managers in tech earn an average base salary of $105,000 to $145,000 per year. Specialized Technical Program Managers (TPMs) with software engineering backgrounds frequently make $160,000 to $210,000+ at remote-first companies.",
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
        item: "https://remoteworkdaily.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Project Manager Titles",
        item: "https://remoteworkdaily.com/project-manager-titles",
      },
    ],
  };

  const titleClusters = [
    {
      category: "Technical & Software Engineering",
      icon: Cpu,
      titles: [
        "Technical Program Manager (TPM)",
        "Technical Project Manager",
        "Engineering Delivery Lead",
        "Implementation Manager",
        "Software Release Coordinator",
        "Cloud Migration Project Lead",
      ],
      salaryRange: "$120k – $185k",
    },
    {
      category: "Agile, Scrum & Frameworks",
      icon: Workflow,
      titles: [
        "Scrum Master / Agile Delivery Lead",
        "Agile Coach",
        "Sprint Coordinator",
        "Product Operations Manager",
        "Transformation Consultant",
        "Flow Master / Kanban Lead",
      ],
      salaryRange: "$95k – $150k",
    },
    {
      category: "Operations & Business Strategy",
      icon: TrendingUp,
      titles: [
        "Program Manager",
        "Business Operations (BizOps) Lead",
        "Operations Project Manager",
        "Strategic Initiatives Manager",
        "PMO Director / PMO Lead",
        "Chief of Staff",
      ],
      salaryRange: "$110k – $175k",
    },
    {
      category: "Creative, Agency & Marketing",
      icon: Layers,
      titles: [
        "Creative Producer",
        "Traffic Manager",
        "Digital Project Manager",
        "Client Delivery Lead",
        "Campaign Operations Manager",
        "Account Delivery Specialist",
      ],
      salaryRange: "$75k – $125k",
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

        {/* Hero Header */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 mb-3">
            <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Career Directory &bull; Synonyms &bull; Hierarchy &bull; Salary Guide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Another Word for Project Manager:{" "}
            <span className="text-[#FF4742]">40+ Titles &amp; Levels</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl leading-relaxed">
            Searching solely for "Project Manager" means you miss more than 60% of
            high-paying remote opportunities. Modern tech and distributed teams
            use titles like Delivery Lead, TPM, and Scrum Master. Explore the
            full synonym directory, career hierarchy ladder, and live openings below.
          </p>
        </header>

        {/* 4 Clusters of Synonyms */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white mb-6">
            Alternative Project Manager Titles by Industry Specialization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {titleClusters.map((cluster, idx) => {
              const Icon = cluster.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[#FF4742] mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">
                      {cluster.category}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 mb-4">
                      {cluster.titles.map((t, tidx) => (
                        <li key={tidx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                      Average Remote Pay:
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {cluster.salaryRange}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Career Progression Hierarchy Ladder */}
        <section className="mb-12 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
            Project Management Hierarchy &amp; 2026 Compensation Ladder
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-xs uppercase tracking-wider font-bold text-neutral-700 dark:text-neutral-300">
                <tr>
                  <th className="p-3">Level / Seniority</th>
                  <th className="p-3">Common Job Titles</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Typical Remote Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs sm:text-sm">
                <tr>
                  <td className="p-3 font-bold text-neutral-900 dark:text-white">L1: Entry / Associate</td>
                  <td className="p-3">Project Coordinator, Associate PM, Junior Scrum Master</td>
                  <td className="p-3 text-neutral-500">0 - 2 years</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$60,000 – $80,000</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-neutral-900 dark:text-white">L2: Mid-Level</td>
                  <td className="p-3">Project Manager, Scrum Master, Delivery Specialist</td>
                  <td className="p-3 text-neutral-500">2 - 5 years</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$85,000 – $120,000</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-neutral-900 dark:text-white">L3: Senior</td>
                  <td className="p-3">Senior Project Manager, Technical Program Manager (TPM)</td>
                  <td className="p-3 text-neutral-500">5 - 8 years</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$125,000 – $165,000</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-neutral-900 dark:text-white">L4: Lead / Principal</td>
                  <td className="p-3">Lead TPM, Agile Coach, Principal Delivery Lead</td>
                  <td className="p-3 text-neutral-500">8+ years</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$160,000 – $200,000</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-neutral-900 dark:text-white">L5: Executive / Director</td>
                  <td className="p-3">Director of Program Management, VP of Delivery, PMO Head</td>
                  <td className="p-3 text-neutral-500">10+ years</td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">$200,000 – $260,000+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Job Board for Project Managers */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                Live Remote Project Management Jobs ({matchingJobs.length})
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Direct ATS links to companies hiring Project Managers, TPMs, and Delivery Leads.
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="py-16 text-center text-sm text-neutral-400">
                <div className="w-8 h-8 border-2 border-[#FF4742] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Loading remote project management jobs...</span>
              </div>
            }
          >
            <JobBoardClient
              initialJobs={allJobs}
              initialQuery="Project Manager"
            />
          </Suspense>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#FF4742]" />
            Frequently Asked Questions: Project Manager Titles &amp; Roles
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                How should I title my resume if I did project management without the formal title?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                If your previous title was "Operations Specialist" or "Account Coordinator" but your day-to-day duties involved sprint planning, tracking budgets, and managing delivery timelines, you can format your resume line as: <em>Operations Specialist (Project Lead)</em>. Then emphasize quantifiable delivery metrics (e.g. "Delivered $500k cloud migration 2 weeks ahead of deadline").
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                What certifications do remote hiring managers actually care about?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                For traditional enterprise and government roles, the <strong>PMP (Project Management Professional)</strong> remains the gold standard. For tech startups and modern software teams, certifications like <strong>Certified ScrumMaster (CSM)</strong> or <strong>PMI-ACP</strong>, combined with hands-on proficiency in Jira, Linear, and Notion, carry the highest weight.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
