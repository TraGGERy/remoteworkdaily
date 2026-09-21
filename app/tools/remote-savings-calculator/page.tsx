import { Metadata } from "next";
import { RemoteSavingsCalculator } from "@/components/tools/remote-savings-calculator";
import Link from "next/link";
import { ArrowLeft, Sparkles, HelpCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Remote Work Savings Calculator: Commute Cost & WFH Savings | Remote Work Daily",
  description:
    "Calculate how much money and time you save working from home vs commuting to an office. Compare fuel, transit, car maintenance, lunches, and hours saved with #OpenSalaries.",
  keywords: [
    "remote work savings calculator",
    "cost of commute calculator",
    "work from home savings",
    "commute cost vs wfh",
    "wfh salary raise equivalent",
    "remote salary calculator",
  ],
  openGraph: {
    title: "How Much Do You Actually Save Working From Home? | Free WFH Calculator",
    description:
      "Find out your exact annual cash savings, hours of life reclaimed, and effective salary raise percentage by working remotely.",
    url: "https://remoteworkdaily.com/tools/remote-savings-calculator",
    siteName: "Remote Work Daily",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Remote Work Savings Calculator",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Remote Work Commute Savings Calculator",
    description: "Calculate your annual commute costs vs working from home.",
  },
};

export default function RemoteSavingsCalculatorPage() {
  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Remote Work Commute Savings Calculator",
    url: "https://remoteworkdaily.com/tools/remote-savings-calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Interactive financial calculator estimating annual money and commute time saved by working from home compared to working in an office.",
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much money does working from home save per year on average?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The average American employee saves between $8,000 and $16,000 per year by working from home full-time. These savings come from reduced fuel expenses, vehicle depreciation and maintenance, public transit fares, parking and toll fees, dry cleaning, and daily dining out.",
        },
      },
      {
        "@type": "Question",
        name: "Is working from home equivalent to a pay raise?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Saving $10,000 to $14,000 in post-tax commuting and office-related expenses is equivalent to receiving an 8% to 15% pre-tax salary increase, without having to negotiate with an employer.",
        },
      },
      {
        "@type": "Question",
        name: "How many hours of commuting does remote work save?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "With an average round-trip commute of 54 to 75 minutes, a remote worker reclaims approximately 250 to 380 hours per year—equivalent to 10 to 16 full 24-hour days of personal life reclaimed from traffic.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Job Board</span>
            </Link>

            <span className="text-xs text-neutral-400 font-mono">
              Free Engineering-as-Marketing Tool
            </span>
          </div>

          {/* Interactive Calculator */}
          <RemoteSavingsCalculator />

          {/* SEO Content & In-Depth Guide Section */}
          <div className="max-w-4xl mx-auto pt-12 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                The Hidden Economics of Going to an Office
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                When comparing job offers, most professionals look only at base salary. However, accepting a $130,000 on-site job with a 45-minute commute can actually result in <em>lower take-home cash</em> and dramatically less free time than a $118,000 remote job.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Marginal Car Depreciation
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Fuel is only 35% of driving expenses. IRS standard mileage benchmarks show tire wear, brake pads, frequent oil changes, and rapid vehicle value depreciation cost $0.18 to $0.30 per mile.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Convenience Premium
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Between $14 salads, $6 morning lattes, and takeout dinners caused by exhaustion after 6 PM gridlock, office commuters spend an extra $2,400 to $4,500 every single year.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Unpaid Life Hours
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Spending 75 minutes commuting each day equates to 300 unpaid hours per year. Reclaiming that time provides mental clarity, exercise, family time, and freelance opportunities.
                </p>
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="space-y-4 pt-6">
              <h3 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FF4742]" />
                <span>Frequently Asked Questions</span>
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    How accurate is this WFH savings calculation?
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    The calculations use conservative real-world benchmarks derived from AAA vehicle cost averages, IRS mileage deductions ($0.18/mi marginal wear), and US Bureau of Labor Statistics consumer expenditure data for metropolitan commuters.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Where can I find verified remote positions with transparent pay?
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    Remote Work Daily indexes 110+ verified live remote positions adhering to the #OpenSalaries standard, with 100% upfront salary ranges, zero spam, and no subscription paywalls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
