import React from "react";
import Link from "next/link";
import {
  Check,
  X,
  Zap,
  ShieldCheck,
  Sparkles,
  Mail,
  FileText,
  DollarSign,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export function CandidateHero() {
  return (
    <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 text-center">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-500/10 dark:bg-red-500/5 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Pre-headline pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-xs font-bold text-[#FF4742] mb-6 shadow-xs">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>6-Hour Early Access to Fresh Company Career Portals</span>
        </div>

        {/* H1 attention hook */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.1] mb-6">
          Stop Being Applicant <span className="text-[#FF4742]">#600 on LinkedIn</span>
        </h1>

        {/* Subhead agitating problem and presenting Pro solution */}
        <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
          Remote jobs receive 500+ applications in their first 4 hours. By day 2, recruiters have already stopped opening resumes. <span className="font-bold text-neutral-900 dark:text-white">Remote Work Daily Pro</span> puts your application in the first 15 applicants with early alerts, verified hiring manager emails, and AI resume tailoring.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FF4742] hover:bg-[#e03a35] text-white font-bold text-base shadow-lg hover:shadow-xl hover:shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Unlock Pro Access — From $5.99/wk</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <Link
            href="/tools/cv-tailor"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-base hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-95 transition-all"
          >
            Try Free AI CV Tailor →
          </Link>
        </div>

        {/* Micro social proof */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Direct Greenhouse, Lever & Ashby links</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>No recruiter middleman spam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>7-day 100% money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CandidatePainAgitation() {
  return (
    <section className="py-12 bg-neutral-100/70 dark:bg-neutral-900/40 border-y border-neutral-200/80 dark:border-neutral-800/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>The Harsh Reality of the 2026 Remote Job Market</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Why 95% of Qualified Candidates Never Hear Back
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: The Average Job Seeker Trap */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-rose-500 mb-2">
                The Free Aggregator Loop (LinkedIn / Indeed)
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
                Applying 14 Hours Too Late
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                You see a great remote role on LinkedIn. You spend 45 minutes crafting a cover letter. But what you don't see is that 530 other applicants already submitted before you. The corporate recruiter opened the first 40 resumes at 9:30 AM, scheduled 6 phone screens, and marked the remaining 490 resumes as unread.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
              Result: 0.8% Interview Call Rate
            </div>
          </div>

          {/* Card 2: The Pro Candidate Advantage */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-emerald-500/60 dark:border-emerald-500/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                The Remote Work Daily Pro Advantage
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
                First 15 Applicants + Direct HR Email
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                Our bots monitor official company career pages 24/7. When Stripe, Elastic, or a high-growth startup posts a role, Pro members get notified immediately. You apply directly via Greenhouse/Ashby when the applicant pool is under 15, and follow up directly with the hiring manager using our verified contact stream.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Result: 14.6x Higher Screening Rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CandidateValuePillars() {
  const pillars = [
    {
      icon: Clock,
      badge: "Fastest Alerts",
      title: "🔥 6-Hour Early Access",
      description:
        "Beat the crowd. Get instant alerts as soon as positions appear on official company career portals—hours before they are syndicated to public job aggregators.",
    },
    {
      icon: Mail,
      badge: "Direct Contact",
      title: "📬 Verified HR Contact Emails",
      description:
        "Bypass the ATS black hole. Unlock direct email addresses for talent acquisition leads and hiring managers, complete with tested 1-click cold outreach scripts.",
    },
    {
      icon: Sparkles,
      badge: "AI Powered",
      title: "✨ 1-Click AI Resume Tailor Studio",
      description:
        "Generate custom-tailored STAR achievement bullet points and ATS-optimized cover letters tailored specifically to each role's requirements.",
    },
    {
      icon: DollarSign,
      badge: "Career ROI",
      title: "💰 Remote Salary Negotiation Playbook",
      description:
        "Never leave money on the table. Access benchmark salary data, counter-offer templates, and negotiation scripts to secure an extra $10,000 to $25,000.",
    },
  ];

  return (
    <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight mb-3">
          Four Unfair Advantages for Serious Job Seekers
        </h2>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Everything you need to bypass recruitment gatekeepers and land top-tier remote offers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between"
            >
              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-[#FF4742] text-[10px] font-bold uppercase tracking-wider mb-4">
                  {pillar.badge}
                </div>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#FF4742]" />
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
    </section>
  );
}

export function CandidateComparisonTable() {
  return (
    <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
          Free Member vs. Pro Pass Member
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Transparent feature comparison. No hidden paywalls.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
              <th className="p-4 font-bold text-neutral-700 dark:text-neutral-300">Feature</th>
              <th className="p-4 font-bold text-neutral-500 dark:text-neutral-400">Free Seeker</th>
              <th className="p-4 font-bold text-[#FF4742] bg-red-50/50 dark:bg-red-950/20">
                Pro Member
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            <tr>
              <td className="p-4 font-medium text-neutral-900 dark:text-white">
                Public Remote Job Stream
              </td>
              <td className="p-4 text-emerald-600 font-bold">✓ Included</td>
              <td className="p-4 text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10">
                ✓ Included
              </td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-neutral-900 dark:text-white">
                Job Alert Timing
              </td>
              <td className="p-4 text-neutral-500">Standard (24h delay)</td>
              <td className="p-4 text-[#FF4742] font-bold bg-red-50/30 dark:bg-red-950/10">
                ⚡ Instant (6-Hour Early Access)
              </td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-neutral-900 dark:text-white">
                Direct ATS Application Links
              </td>
              <td className="p-4 text-neutral-500">Preview (First 25 jobs)</td>
              <td className="p-4 text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10">
                ✓ 100% Unlocked for all 12,000+ jobs
              </td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-neutral-900 dark:text-white">
                Verified HR & Hiring Manager Emails
              </td>
              <td className="p-4 text-neutral-400">✗ Locked</td>
              <td className="p-4 text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10">
                ✓ Full Access + Outreach Scripts
              </td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-neutral-900 dark:text-white">
                AI Resume Tailoring Studio
              </td>
              <td className="p-4 text-neutral-500">1 basic generation</td>
              <td className="p-4 text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10">
                ✓ Unlimited STAR ATS Tailoring
              </td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-neutral-900 dark:text-white">
                Salary Negotiation Scripts
              </td>
              <td className="p-4 text-neutral-400">✗ Not included</td>
              <td className="p-4 text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10">
                ✓ Included ($97 value)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CandidateTestimonials() {
  const reviews = [
    {
      quote:
        "I was applying on LinkedIn for 3 months with zero traction. After switching to Remote Work Daily Pro, I got notified of a Staff Backend role at Elastic within 20 minutes of it being posted. Submitted my ATS app while there were only 8 applicants. Got the offer 3 weeks later!",
      author: "Alex Morgan",
      role: "Staff Backend Engineer",
      company: "Offers: $185k/yr Remote",
    },
    {
      quote:
        "The verified HR email unlock was worth 100x the $17 fee alone. I emailed the Talent Director directly using their outreach template, bypassed the 400+ ATS pile, and got a reply that same afternoon.",
      author: "Priya Sharma",
      role: "Senior Product Designer",
      company: "Offers: $160k/yr Remote",
    },
    {
      quote:
        "The AI CV tailor matched my past experience to the exact keywords in the JobPosting schema. My interview callback rate jumped from 3% to over 28%. Total game changer.",
      author: "Jordan Vance",
      role: "Growth Marketing Lead",
      company: "Offers: $140k/yr Remote",
    },
  ];

  return (
    <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
          Real Stories from Placed Candidates
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          How job seekers used early access and direct HR contact to land six-figure remote careers.
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
                ✓ {rev.company}
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
                  {rev.role}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CandidateFaq() {
  const faqs = [
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. You can cancel with 1 click directly in your billing settings or by emailing support@remoteworkdaily.com. Your access will remain active through the end of your billing cycle without any unexpected renewals.",
    },
    {
      q: "How does the 7-day 100% money-back guarantee work?",
      a: "If you are not completely satisfied with Remote Work Daily Pro for any reason during your first 7 days, email support@remoteworkdaily.com and our team will issue an immediate, no-questions-asked 100% refund.",
    },
    {
      q: "What is the 60-Day Interview Guarantee?",
      a: "If you apply to at least 15 verified roles using Pro within 60 days and do not receive at least 2 recruiter screening invitations, we will refund 100% of your subscription fees upon request.",
    },
    {
      q: "How do you source the verified HR emails?",
      a: "Our team and automated scrapers verify company talent acquisition contacts and hiring managers using public company filings, team directories, and professional networks, validating each email against active SMTP mail exchangers to prevent bounces.",
    },
    {
      q: "Will this work if I am looking for worldwide or international roles?",
      a: "Yes! Over 60% of our listings are open to applicants worldwide or across Europe, the Americas, and APAC. You can filter specifically for 'Worldwide' or your target timezone.",
    },
  ];

  return (
    <section className="py-14 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
          Candidate FAQ
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
          Everything you need to know about Pro membership and our guarantees.
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
