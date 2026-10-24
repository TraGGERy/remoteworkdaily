"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JOB_POSTING_PRICING, ROLE_CATEGORIES } from "@/lib/constants";
import { JobRow } from "../job-board/job-row";
import { Job } from "@/lib/types";
import {
  Check,
  Sparkles,
  Shield,
  ArrowLeft,
  Upload,
  X,
  CreditCard,
  Landmark,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

export function JobPostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url">("upload");
  const [logoFileName, setLogoFileName] = useState("");
  const [logoError, setLogoError] = useState("");

  const [paymentRail, setPaymentRail] = useState<"stripe_card" | "plaid_ach">("stripe_card");
  const [plaidLoading, setPlaidLoading] = useState(false);
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [plaidBankName, setPlaidBankName] = useState("");
  const [plaidItemId, setPlaidItemId] = useState("");
  const [showPlaidModal, setShowPlaidModal] = useState(false);
  const [plaidError, setPlaidError] = useState("");

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo file must be under 2MB in size.");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setLogoError("Please upload a PNG, JPEG, SVG, or WebP image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCompanyLogo(result);
        setLogoFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogo = () => {
    setCompanyLogo("");
    setLogoFileName("");
    setLogoError("");
  };

  const handleConnectPlaidBank = async (bankName: string) => {
    setPlaidLoading(true);
    setPlaidError("");
    try {
      const email = userEmail || "hiring@company.com";
      // 1. Initialize link token session
      const tokenRes = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: email,
          userEmail: email,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error || "Failed to create Plaid session");

      // 2. Exchange public token for ACH verification
      const exchangeRes = await fetch("/api/plaid/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicToken: `public-token-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: email,
          institutionName: bankName,
        }),
      });
      const exchangeData = await exchangeRes.json();
      if (!exchangeRes.ok) throw new Error(exchangeData.error || "Failed to link corporate bank");

      setPlaidConnected(true);
      setPlaidBankName(bankName);
      setPlaidItemId(exchangeData.itemId || `plaid-item-${Date.now()}`);
      setShowPlaidModal(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect bank via Plaid";
      setPlaidError(msg);
    } finally {
      setPlaidLoading(false);
    }
  };
  const [userEmail, setUserEmail] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Job["category"]>("dev");
  const [workplaceType, setWorkplaceType] = useState<"remote" | "hybrid" | "on-site">("remote");
  const [location, setLocation] = useState("Worldwide");
  const [salaryMin, setSalaryMin] = useState(130000);
  const [salaryMax, setSalaryMax] = useState(180000);
  const [applyUrl, setApplyUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["React", "TypeScript", "Remote"]);
  const [selectedBenefits] = useState<string[]>([
    "distributed_team",
    "async",
    "unlimited_vacation",
  ]);
  const [description, setDescription] = useState(
    `### About the Role\nWe are looking for an exceptional person to join our distributed team.\n\n### What You Will Do\n- Build high-performance applications\n- Collaborate with an international team asynchronously\n\n### Qualifications\n- Strong track record of shipping software\n- Self-starter mindset`
  );

  /**
   * Promotional add-on toggles.
   *
   * Defaults reflect the 'Featured Accelerator' configuration to anchor maximum visibility
   * while allowing complete manual customization.
   */
  const [sticky, setSticky] = useState(true);
  const [highlight, setHighlight] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [social, setSocial] = useState(false);
  const [verifiedBadge, setVerifiedBadge] = useState(true);

  /**
   * Applies preset promotional packages to simplify buyer decision-making (Hick's Law).
   */
  const handleSelectPackage = (packageId: "starter" | "accelerator") => {
    if (packageId === "starter") {
      setSticky(false);
      setHighlight(false);
      setNewsletter(false);
      setSocial(false);
      setVerifiedBadge(true);
    } else if (packageId === "accelerator") {
      setSticky(true);
      setHighlight(true);
      setNewsletter(true);
      setSocial(true);
      setVerifiedBadge(true);
    }
  };

  /**
   * Computes the final one-time total without recurring subscription commitments.
   */
  let totalPrice = JOB_POSTING_PRICING.basePrice;
  if (sticky) totalPrice += JOB_POSTING_PRICING.addOns.sticky.price;
  if (highlight) totalPrice += JOB_POSTING_PRICING.addOns.highlight.price;
  if (newsletter) totalPrice += JOB_POSTING_PRICING.addOns.newsletter.price;
  if (social) totalPrice += JOB_POSTING_PRICING.addOns.social.price;
  if (verifiedBadge) totalPrice += JOB_POSTING_PRICING.addOns.verifiedBadge.price;

  /**
   * Real-time dummy projection for the sticky preview card.
   * Leverages the psychological endowment effect by allowing hiring managers
   * to see their branded listing take form prior to payment.
   */
  const previewJob: Job = {
    id: "preview-job",
    slug: "preview",
    title: title || "Senior Full Stack Engineer",
    company: companyName || "Your Company",
    companySlug: "your-company",
    companyLogo: companyLogo || undefined,
    companyWebsite: companyWebsite || "https://example.com",
    verified: verifiedBadge,
    featured: highlight,
    sticky: sticky,
    location: location || "Worldwide",
    workplaceType,
    category,
    tags: tags.length > 0 ? tags : ["Remote", "Tech"],
    benefits: selectedBenefits,
    salaryMin,
    salaryMax,
    salaryCurrency: "USD",
    description,
    applyUrl: applyUrl || "https://example.com/apply",
    postedAt: new Date().toISOString(),
    viewsCount: 1,
    appliesCount: 0,
    source: "direct",
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentRail === "plaid_ach" && !plaidConnected) {
      setShowPlaidModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: title,
          companyName,
          companyLogo,
          companyWebsite,
          userEmail,
          category,
          workplaceType,
          location,
          salaryMin,
          salaryMax,
          tags,
          benefits: selectedBenefits,
          description,
          applyUrl,
          paymentRail,
          plaidItemId: paymentRail === "plaid_ach" ? plaidItemId : undefined,
          plaidInstitution: paymentRail === "plaid_ach" ? plaidBankName : undefined,
          addOns: {
            sticky,
            highlight,
            newsletter,
            social,
            verifiedBadge,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process job checkout");
      }

      // Trigger celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else if (paymentRail === "plaid_ach") {
        alert(`Success! Corporate ACH transfer pre-authorized via Plaid (${plaidBankName}). Your job posting is live!`);
        router.push("/?posted=true&method=plaid_ach");
      } else {
        // Successfully published
        alert("Job post successfully created!");
        router.push("/?posted=true");
      }
    } catch (err: unknown) {
      console.error("Failed to post job:", err);
      const msg = err instanceof Error ? err.message : "Failed to submit job. Please try again.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all remote jobs</span>
      </Link>

      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF4742] px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/40 inline-block mb-3">
          Hire Top Remote Talent
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
          Post a remote job in 5 minutes
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm sm:text-base">
          Reach 2,500,000+ monthly remote engineers, designers, marketers, and leaders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Post a Job Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Company Details */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <h2 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-[#FF4742] text-xs flex items-center justify-center font-bold">1</span>
              <span>Company Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Work Email (for receipts & edit access) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="hiring@acme.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Company Website
                </label>
                <input
                  type="url"
                  placeholder="https://acme.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Company Logo (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoInputMode(logoInputMode === "upload" ? "url" : "upload");
                      setLogoError("");
                    }}
                    className="text-[11px] font-semibold text-[#FF4742] hover:underline cursor-pointer"
                  >
                    {logoInputMode === "upload" ? "Paste URL instead" : "Upload File instead"}
                  </button>
                </div>

                {logoInputMode === "upload" ? (
                  <div>
                    {companyLogo ? (
                      <div className="flex items-center justify-between p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={companyLogo}
                            alt="Logo preview"
                            className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shrink-0"
                          />
                          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                            {logoFileName || "Custom logo attached"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearLogo}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                          title="Remove logo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#FF4742] dark:hover:border-[#FF4742] bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-[#FF4742] cursor-pointer transition-colors text-xs font-medium">
                        <Upload className="w-4 h-4 text-[#FF4742]" />
                        <span>Upload Logo (PNG, SVG, JPG &lt; 2MB)</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {logoError && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{logoError}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={companyLogo}
                      onChange={(e) => {
                        setCompanyLogo(e.target.value);
                        setLogoFileName("");
                      }}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Job Position Details */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <h2 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-[#FF4742] text-xs flex items-center justify-center font-bold">2</span>
              <span>Job Details</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Job Title / Position *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer (Next.js & TypeScript)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
              />
            </div>

            {/* Workplace Type Option */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Workplace Model *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWorkplaceType("remote");
                    if (location === "On-site" || location === "In-Person") setLocation("Worldwide");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workplaceType === "remote"
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500 font-bold"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                  }`}
                >
                  <div className="text-xs font-extrabold flex items-center gap-1">
                    <span>🌐</span> Remote
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    100% Anywhere / WFH
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorkplaceType("on-site");
                    if (location === "Worldwide") setLocation("New York, NY");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workplaceType === "on-site"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500 font-bold"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                  }`}
                >
                  <div className="text-xs font-extrabold flex items-center gap-1">
                    <span>🏢</span> On-site
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Office / In-Person
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkplaceType("hybrid")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    workplaceType === "hybrid"
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-1 ring-purple-500 font-bold"
                      : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                  }`}
                >
                  <div className="text-xs font-extrabold flex items-center gap-1">
                    <span>🔀</span> Hybrid
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Split Remote & Office
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Primary Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Job["category"])}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                >
                  {ROLE_CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {workplaceType === "remote" ? "Location Restriction" : "Office City & Location *"}
                </label>
                <input
                  type="text"
                  placeholder={workplaceType === "remote" ? "e.g. Worldwide, or US Only" : "e.g. Berlin, Germany or New York, NY"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Annual Salary Range (USD)
                </label>
                <span className="text-xs font-bold text-[#FF4742] tabular-nums">
                  ${salaryMin / 1000}k - ${salaryMax / 1000}k USD
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="5000"
                  min="30000"
                  max="500000"
                  placeholder="Min USD"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <input
                  type="number"
                  step="5000"
                  min="30000"
                  max="500000"
                  placeholder="Max USD"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Skills / Tags (Press Enter or Add)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js, GraphQL, Kubernetes"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Application Link */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Application URL or ATS Link *
              </label>
              <input
                type="url"
                required
                placeholder="https://jobs.lever.co/acme/1234 or https://greenhouse.io/acme/..."
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Job Description (Markdown supported)
              </label>
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742] font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Section 3: High-Converting Add-ons (RemoteOK Model) */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-[#FF4742] text-xs flex items-center justify-center font-bold">3</span>
                <span>Select Visibility Package</span>
              </h2>
              <span className="text-xs font-semibold text-neutral-400">One-Time Fee</span>
            </div>

            {/* Package Preset Selector (Good-Better-Best Framework) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => handleSelectPackage("starter")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  !sticky && !highlight && !newsletter && !social
                    ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20 ring-1 ring-[#FF4742]"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-neutral-900 dark:text-white">Starter Listing</span>
                  <span className="font-bold text-xs text-neutral-500">$249 once</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Standard 30-day broadcast with Google Jobs schema.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPackage("accelerator")}
                className={`p-3.5 rounded-xl border text-left relative transition-all ${
                  sticky && highlight && newsletter && social
                    ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20 ring-2 ring-[#FF4742]"
                    : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF4742] text-white shadow-sm">
                  ⭐ Most Popular
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-neutral-900 dark:text-white">Featured Accelerator</span>
                  <span className="font-bold text-xs text-[#FF4742]">$399 once</span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Sticky top pin, coral highlight, newsletter blast & social reach.
                </p>
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block mb-2">
                Or customize individual add-ons:
              </span>
            </div>

            <div className="space-y-3">
              {/* Sticky Pin */}
              <label className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                sticky ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={sticky}
                    onChange={(e) => setSticky(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#FF4742]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        📌 {JOB_POSTING_PRICING.addOns.sticky.title}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        {JOB_POSTING_PRICING.addOns.sticky.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {JOB_POSTING_PRICING.addOns.sticky.description}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#FF4742] tabular-nums shrink-0 ml-2">
                  +${JOB_POSTING_PRICING.addOns.sticky.price}
                </span>
              </label>

              {/* Highlight Coral */}
              <label className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                highlight ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={highlight}
                    onChange={(e) => setHighlight(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#FF4742]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        🎨 {JOB_POSTING_PRICING.addOns.highlight.title}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                        {JOB_POSTING_PRICING.addOns.highlight.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {JOB_POSTING_PRICING.addOns.highlight.description}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#FF4742] tabular-nums shrink-0 ml-2">
                  +${JOB_POSTING_PRICING.addOns.highlight.price}
                </span>
              </label>

              {/* Newsletter Blast */}
              <label className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                newsletter ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#FF4742]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        🚀 {JOB_POSTING_PRICING.addOns.newsletter.title}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                        {JOB_POSTING_PRICING.addOns.newsletter.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {JOB_POSTING_PRICING.addOns.newsletter.description}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#FF4742] tabular-nums shrink-0 ml-2">
                  +${JOB_POSTING_PRICING.addOns.newsletter.price}
                </span>
              </label>

              {/* Social Media Push */}
              <label className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                social ? "border-[#FF4742] bg-red-50/40 dark:bg-red-950/20" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
              }`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={social}
                    onChange={(e) => setSocial(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#FF4742]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        🐦 {JOB_POSTING_PRICING.addOns.social.title}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {JOB_POSTING_PRICING.addOns.social.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {JOB_POSTING_PRICING.addOns.social.description}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#FF4742] tabular-nums shrink-0 ml-2">
                  +${JOB_POSTING_PRICING.addOns.social.price}
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Checkout Summary & Submit */}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-sm text-neutral-400 font-medium">Standard 30-Day Listing</span>
              <span className="font-bold tabular-nums">${JOB_POSTING_PRICING.basePrice}</span>
            </div>
            {sticky && (
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>Pinned to Top (30 days)</span>
                <span className="tabular-nums">+${JOB_POSTING_PRICING.addOns.sticky.price}</span>
              </div>
            )}
            {highlight && (
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>Highlighted Coral Accent</span>
                <span className="tabular-nums">+${JOB_POSTING_PRICING.addOns.highlight.price}</span>
              </div>
            )}
            {newsletter && (
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>Newsletter Blast (120k subscribers)</span>
                <span className="tabular-nums">+${JOB_POSTING_PRICING.addOns.newsletter.price}</span>
              </div>
            )}
            {social && (
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>Twitter & LinkedIn Distribution</span>
                <span className="tabular-nums">+${JOB_POSTING_PRICING.addOns.social.price}</span>
              </div>
            )}

            {/* Explicit One-Time Payment Reassurance Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-emerald-300 text-xs font-semibold">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Strictly One-Time Payment • No Subscription • Never Auto-Renews</span>
            </div>

            {/* 14-Day Candidate Quality Guarantee Card */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                <span>🛡️ 14-Day Candidate Quality Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-400/90">
                {JOB_POSTING_PRICING.guarantee.remedyText}
              </p>
            </div>

            {/* Payment Rail Selector */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-bold text-neutral-300">
                Payment Rail
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentRail("stripe_card")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentRail === "stripe_card"
                      ? "border-[#FF4742] bg-red-950/30 text-white ring-1 ring-[#FF4742]"
                      : "border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CreditCard className="w-4 h-4 text-[#FF4742]" />
                    <span>Credit / Debit Card</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Instant via Stripe (Visa, MC, Amex, Apple Pay)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentRail("plaid_ach")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentRail === "plaid_ach"
                      ? "border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500"
                      : "border-neutral-800 bg-neutral-800/40 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span>Corporate ACH Transfer</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Plaid instant bank link • 0% card fee
                  </p>
                </button>
              </div>
            </div>

            {/* Plaid ACH Connection Box */}
            {paymentRail === "plaid_ach" && (
              <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-800/50 space-y-2">
                {plaidConnected ? (
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <span>{plaidBankName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200">
                            Verified
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Corporate Checking (•••• 4242) pre-authorized for ACH
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPlaidModal(true)}
                      className="text-[11px] text-neutral-400 hover:text-white underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                        <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Enterprise Bank Account</span>
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-400">Powered by Plaid</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mb-3">
                      Direct account-to-account transfer for corporate recruiting budgets. Zero card processing fees.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPlaidModal(true)}
                      disabled={plaidLoading}
                      className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                    >
                      <Landmark className="w-4 h-4 text-emerald-400" />
                      <span>{plaidLoading ? "Connecting to Plaid..." : "Connect Corporate Bank Account"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-lg font-black">
              <div>
                <span>Total USD</span>
                <span className="block text-[11px] font-normal text-neutral-400">One-time payment</span>
              </div>
              <span className="text-2xl text-[#FF4742] tabular-nums">${totalPrice}</span>
            </div>

            <button
              type="submit"
              disabled={loading || plaidLoading}
              className="w-full py-4 rounded-xl text-base font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                {loading
                  ? "Processing..."
                  : paymentRail === "plaid_ach"
                  ? plaidConnected
                    ? `Authorize $${totalPrice} ACH Transfer & Publish →`
                    : `Connect Bank & Pay $${totalPrice} via ACH →`
                  : `Pay $${totalPrice} Once & Publish Job →`}
              </span>
            </button>
            <div className="space-y-1 text-center">
              <p className="text-[11px] text-neutral-400">
                Instant live activation • No recurring monthly charges • 100% tax-deductible recruiting expense
              </p>
              <p className="text-[10px] text-neutral-500">
                {paymentRail === "plaid_ach"
                  ? "Official Plaid corporate ACH transfer receipt issued immediately."
                  : "Official Stripe VAT/Tax receipt issued immediately upon checkout."}
              </p>
            </div>
          </div>
        </form>

        {/* Plaid Link Modal */}
        {showPlaidModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
              <button
                type="button"
                onClick={() => setShowPlaidModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-200 dark:border-emerald-800">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Select Your Corporate Bank
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Plaid connects securely with 12,000+ financial institutions. Select your organization's bank:
                </p>
              </div>

              {plaidError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{plaidError}</span>
                </div>
              )}

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {[
                  { name: "Silicon Valley Bank (SVB)", type: "Commercial Checking", icon: "🏛️" },
                  { name: "Mercury Corporate", type: "Fintech Business", icon: "💎" },
                  { name: "JPMorgan Chase", type: "Treasury & Commercial", icon: "🏦" },
                  { name: "Brex Commercial", type: "Corporate Cash", icon: "💳" },
                  { name: "Bank of America", type: "Business Advantage", icon: "🏢" },
                ].map((bank) => (
                  <button
                    key={bank.name}
                    type="button"
                    onClick={() => handleConnectPlaidBank(bank.name)}
                    disabled={plaidLoading}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4742] dark:hover:border-emerald-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{bank.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-[#FF4742] dark:group-hover:text-emerald-400">
                          {bank.name}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {bank.type}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white">
                      Connect →
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>End-to-end 256-bit encrypted with Plaid. Credentials are never stored.</span>
              </div>
            </div>
          </div>
        )}

        {/* Right column: Sticky Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF4742]" />
                <span>Live Card Preview</span>
              </span>
              <span className="text-[11px] text-neutral-400">Updates in real time</span>
            </div>

            <div className="p-1 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
              <JobRow
                job={previewJob}
                isSelected={false}
                onToggleSelect={() => {}}
              />
            </div>

            <div className="mt-6 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400 space-y-2.5">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Why post on Remote Work Daily?
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Reach 2.5M+ active remote job seekers worldwide</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Google Jobs Schema automatically included for SERP ranking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct link to your existing ATS (Lever, Greenhouse, Workable)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Syndicated to our JSON API and partner distribution networks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
