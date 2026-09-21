"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { JOB_POSTING_PRICING, ROLE_CATEGORIES, POPULAR_TAGS, BENEFITS_LIST } from "@/lib/constants";
import { JobRow } from "../job-board/job-row";
import { Job } from "@/lib/types";
import { Check, Sparkles, Shield, DollarSign, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

export function JobPostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
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
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([
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

  const handleToggleBenefit = (benefitId: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(benefitId)
        ? prev.filter((b) => b !== benefitId)
        : [...prev, benefitId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Trigger celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        // Successfully published
        alert("Job post successfully created!");
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to post job:", err);
      alert("Failed to submit job. Please try again.");
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
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Company Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#FF4742]"
                />
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

            {/* Salary Range #OpenSalaries */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Annual Salary Range (USD) #OpenSalaries
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

            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-lg font-black">
              <div>
                <span>Total USD</span>
                <span className="block text-[11px] font-normal text-neutral-400">One-time payment</span>
              </div>
              <span className="text-2xl text-[#FF4742] tabular-nums">${totalPrice}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-black bg-[#FF4742] hover:bg-[#e03a35] text-white shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "Processing..." : `Pay $${totalPrice} Once & Publish Job →`}</span>
            </button>
            <div className="space-y-1 text-center">
              <p className="text-[11px] text-neutral-400">
                Instant live activation • No recurring monthly charges • 100% tax-deductible recruiting expense
              </p>
              <p className="text-[10px] text-neutral-500">
                Official Stripe VAT/Tax receipt issued immediately upon checkout.
              </p>
            </div>
          </div>
        </form>

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
                Why post on RemoteOK?
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
