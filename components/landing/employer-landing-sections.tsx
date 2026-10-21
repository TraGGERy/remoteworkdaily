import React from "react";
import Link from "next/link";
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  TrendingUp,
  Users,
  Building2,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  ExternalLink,
} from "lucide-react";

export function EmployerHero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 text-center">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-500/10 dark:bg-red-500/5 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Social proof metric badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs font-bold text-[#FF4742] mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#FF4742] animate-pulse" />
          <span>Over 2,500,000+ Monthly Remote Job Searches</span>
        </div>

        {/* Attention-grabbing headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.1] mb-6">
          Hire Senior Remote Talent Without{" "}
          <span className="text-[#FF4742]">$20,000 Recruiter Fees</span>
        </h1>

        {/* Subhead agitating pain and presenting solution */}
        <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
          Skip the 600+ AI bot applications on LinkedIn. Put your opening in front of vetted
          senior engineers, designers, and operators with <span className="font-bold text-neutral-900 dark:text-white">direct ATS redirection</span> straight to your Greenhouse, Lever, or Ashby portal.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <a
            href="#post-job"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-bold text-base shadow-lg hover:shadow-xl hover:shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Post a Job — From $249</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#comparison"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-base hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition-all"
          >
            See ROI Comparison ↓
          </a>
        </div>

        {/* Trust pill strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Direct link to your existing ATS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Google Jobs Schema automatically included</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>14-day candidate quality guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EmployerTrustLogos() {
  const companies = [
    { name: "Stripe", slug: "stripe" },
    { name: "OpenAI", slug: "openai" },
    { name: "GitLab", slug: "gitlab" },
    { name: "Elastic", slug: "elastic" },
    { name: "Docker", slug: "docker" },
    { name: "Cloudflare", slug: "cloudflare" },
    { name: "Linear", slug: "linear" },
    { name: "Shopify", slug: "shopify" },
  ];

  return (
    <section className="py-8 border-y border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs uppercase tracking-widest font-extrabold text-neutral-400 dark:text-neutral-500 mb-5">
          Candidates on Remote Work Daily have built software and teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-70 dark:opacity-80">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/companies/${company.slug}`}
              className="text-base sm:text-lg font-black tracking-tight text-neutral-600 dark:text-neutral-400 hover:text-[#FF4742] dark:hover:text-[#FF4742] transition-colors"
            >
              {company.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmployerComparisonTable() {
  return (
    <section id="comparison" className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
          Why Modern Remote Teams Avoid Agencies & LinkedIn Spam
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Compare the real cost, candidate signal quality, and hiring velocity across traditional recruiting channels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Headhunter Agencies */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-3">
              Recruitment Agencies
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              The 20% Markup
            </h3>
            <div className="text-3xl font-black text-neutral-900 dark:text-white mb-4">
              $15,000 – $30,000+
              <span className="block text-xs font-normal text-neutral-500 mt-1">per single engineering hire</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Heavy 20% to 25% first-year base salary fee</span>
              </li>
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>6 to 8 week turnaround time before first interview</span>
              </li>
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Non-exclusive candidates pitched to multiple rivals</span>
              </li>
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Endless recruiter sales calls and locked contracts</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 text-center">
            Massive cash drag on early-stage runway
          </div>
        </div>

        {/* Column 2: LinkedIn & Job Aggregators */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-3">
              LinkedIn & Generic Boards
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              The AI Bot Swamp
            </h3>
            <div className="text-3xl font-black text-neutral-900 dark:text-white mb-4">
              $500 – $1,500/mo
              <span className="block text-xs font-normal text-neutral-500 mt-1">recurring pay-per-click charges</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>600+ AI bot applications within 48 hours</span>
              </li>
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Overwhelms internal talent teams with noise</span>
              </li>
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Must learn yet another proprietary applicant dashboard</span>
              </li>
              <li className="flex items-start gap-2 text-rose-600 dark:text-rose-400">
                <X className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Pay-per-click charges spike even when leads bounce</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 text-center">
            Drowns your team in unvetted resumes
          </div>
        </div>

        {/* Column 3: Remote Work Daily (Highlighted Winner) */}
        <div className="rounded-2xl border-2 border-[#FF4742] bg-white dark:bg-neutral-900 p-6 flex flex-col justify-between shadow-xl ring-4 ring-red-500/10 relative">
          <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#FF4742] text-white text-xs font-black uppercase tracking-wider shadow-sm">
            Best ROI
          </div>
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-xs font-bold text-[#FF4742] mb-3">
              Remote Work Daily
            </div>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
              Direct Senior ATS Traffic
            </h3>
            <div className="text-3xl font-black text-[#FF4742] mb-4">
              $249
              <span className="block text-xs font-normal text-neutral-500 mt-1">flat fee · 30 days active · zero commissions</span>
            </div>
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-700 dark:text-neutral-200">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 font-bold" />
                <span><strong>Direct ATS Links:</strong> Candidates apply straight in your Greenhouse, Lever, or Ashby portal</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 font-bold" />
                <span><strong>2.5M+ Reach:</strong> Targeted remote engineers, product managers, and growth leaders</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 font-bold" />
                <span><strong>Google Jobs Schema:</strong> Automatic indexing at top of search results</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 font-bold" />
                <span><strong>14-Day Guarantee:</strong> Free repost extension if you don't find a great candidate</span>
              </li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <a
              href="#post-job"
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span>Post Your Job for $249</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EmployerValuePillars() {
  const pillars = [
    {
      icon: ExternalLink,
      title: "1-Click Direct ATS Redirection",
      description:
        "No separate employer dashboards or portal logins. When candidates click 'Apply', they land directly on your existing Greenhouse, Lever, Ashby, or Workable job application page.",
    },
    {
      icon: Search,
      title: "Automated Google Jobs Schema",
      description:
        "Every listing generates compliant JobPosting JSON-LD structured data with transparent salary metadata, allowing your opening to rank at the top of Google Search across thousands of geo-intent queries.",
    },
    {
      icon: Zap,
      title: "120k+ Daily Newsletter Blast",
      description:
        "Featured listings are syndicated directly into our morning remote career newsletter, landing in the personal inboxes of active senior specialists looking for their next move.",
    },
    {
      icon: ShieldCheck,
      title: "14-Day Candidate Quality Guarantee",
      description:
        "We stand by our audience quality. If you don't receive qualified, interview-ready applicant traffic within 14 days, email us and we will renew or feature your posting free of charge.",
    },
  ];

  return (
    <section className="py-14 bg-neutral-50/70 dark:bg-neutral-900/40 border-y border-neutral-200/60 dark:border-neutral-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
            Built for Fast-Moving Remote Engineering & Product Teams
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Everything you need to hire senior talent without administrative friction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#FF4742] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function EmployerTestimonials() {
  const reviews = [
    {
      quote:
        "We listed our Senior Distributed Systems role on Remote Work Daily and had our first interview booked in 36 hours. Hired the candidate in 12 days. The direct ATS integration kept our hiring team completely aligned.",
      author: "Marcus Lindqvist",
      role: "VP of Engineering",
      company: "CloudScale Infra",
      hire: "Hired Senior Go/Rust Engineer",
    },
    {
      quote:
        "On LinkedIn we were drowning in 800+ automated bot applications from unqualified candidates. Remote Work Daily sent 24 targeted applicants, of which 5 reached the final onsite round. Night and day difference in signal-to-noise.",
      author: "Sarah Jenkins",
      role: "Head of Talent & People",
      company: "Vektor Labs",
      hire: "Hired Staff Product Designer",
    },
    {
      quote:
        "The flat $249 pricing saved us over $18,000 compared to the recruiter commission we were quoted. We've made Remote Work Daily our primary posting channel for every remote opening.",
      author: "David Chen",
      role: "Co-Founder & CTO",
      company: "Modus AI",
      hire: "Hired Lead ML Engineer",
    },
  ];

  return (
    <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
          Trusted by Engineering & People Leaders
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Real hiring teams who saved thousands in recruiter markups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between"
          >
            <div className="mb-4">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold mb-3 border border-emerald-200 dark:border-emerald-900/60">
                ✓ {rev.hire}
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
                "{rev.quote}"
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 font-bold text-xs flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                {rev.author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-xs text-neutral-900 dark:text-white">
                  {rev.author}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {rev.role} · {rev.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmployerFaq() {
  const faqs = [
    {
      q: "How long does my job posting remain live?",
      a: "Every listing stays active on Remote Work Daily for a full 30 days. You can also extend or renew the posting at any time, or add the 'Sticky Pin' upgrade to keep your post at the very top of search results and homepage feeds.",
    },
    {
      q: "Where do candidate applications go?",
      a: "Directly into your company's existing ATS (such as Greenhouse, Lever, Ashby, Workable, BambooHR, or your own custom careers page URL). You do not need to check a separate dashboard or download resumes from another system.",
    },
    {
      q: "What is your 14-Day Candidate Quality Guarantee?",
      a: "If your job posting does not receive qualified, interview-ready applicant traffic within the first 14 days, simply email support@remoteworkdaily.com and our team will extend your listing for an extra 30 days or apply a free promotional boost to our newsletter.",
    },
    {
      q: "Does posting include Google Jobs Schema indexing?",
      a: "Yes. Every job listing automatically includes validated JobPosting JSON-LD structured data with transparent salary bands and workplace location metadata, ensuring your opening gets indexed by Google Jobs and displayed prominently on SERPs.",
    },
    {
      q: "Can I pay by corporate card or receive a tax invoice?",
      a: "Yes. All transactions are securely processed through Stripe. Immediately after checkout, you will receive an itemized receipt and VAT-compliant tax invoice sent directly to your billing email address.",
    },
  ];

  return (
    <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Everything you need to know about posting and hiring on Remote Work Daily.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
          >
            <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white mb-2">
              {faq.q}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
