# Product Marketing & Customer Research: Remote Work Daily

## 1. Executive Summary & Brand Positioning
- **Product**: Remote Work Daily (https://remoteworkdaily.com)
- **Positioning**: The #1 trusted global remote career platform delivering spam-free, verified remote tech opportunities daily with 100% transparent compensation and direct ATS applications.
- **Brand Identity**: Clean, modern, high-trust. Replaced confusing legacy "#OpenSalaries" hashtag text with clear "100% Transparent Salaries" and "Verified Remote Jobs".

## 2. Ideal Customer Profiles (ICPs)

### ICP 1: The Remote Tech Professional (Job Seeker)
- **Roles**: Senior Fullstack / Backend / Frontend Engineers, Product Designers, Product Managers, Growth / SEO Marketers, DevOps.
- **Primary Job to Be Done**: Find legitimate, high-paying remote roles with upfront compensation bands and apply directly to the company ATS without wading through ghost jobs, recruiter spam, or fake hybrid postings.
- **Top Pains**:
  1. *Salary opacity*: Spending 4+ rounds of interviews only to receive an offer below current pay.
  2. *Ghost jobs*: Applying on LinkedIn or Indeed to listings that were filled months ago or created just for talent pooling.
  3. *Fake remote*: Job titles listed as "remote" but requiring 2-3 office days per week.
- **Desired Outcomes**:
  - Exact salary bands visible immediately (USD/EUR/GBP).
  - 1-click access to direct ATS links (Greenhouse, Lever, Ashby, Workable).
  - 100% verified telecommute roles with worldwide or clear regional eligibility.
- **Key Vocabulary**: "100% Remote", "Transparent Pay", "Direct ATS Apply", "Zero Ghost Jobs", "Work From Anywhere".

### ICP 2: The Remote-First Employer (Hiring Manager / Founder)
- **Profile**: Founders, VPs of Engineering, and Head of Talent at remote-first companies (Series A to Public).
- **Primary Job to Be Done**: Reach pre-vetted, high-caliber remote talent fast without corporate credit card friction or recurring subscription traps.
- **Top Pains**:
  1. *Low applicant quality*: Getting 1,000 spam resumes from LinkedIn/Indeed quick-apply bots.
  2. *Contract lock-ins*: Enterprise recruiting platforms demanding $10k+ annual subscriptions.
- **Desired Outcomes**:
  - One-time simple post ($249) with high signal, 30 days active visibility, and candidate newsletter distribution.
  - Multi-rail payment support (instant Stripe credit card + Plaid ACH bank transfer).

## 3. Social Media Distribution & Viral Thumbnail Strategy
- **Mechanism**: Every job URL (`/jobs/[id]/[slug]`) serves dynamic, high-contrast 1200x630 OpenGraph cards (`/api/og/job?id=...`).
- **Platforms Targeted**: X/Twitter (`summary_large_image`), LinkedIn (`og:image` 1.91:1 ratio), Facebook, Slack, Discord, Reddit, iMessage, and WhatsApp.
- **Elements Highlighted**:
  - Job Title (54px bold typography)
  - Company Name & Logo/Monogram with blue verified checkmark
  - Highlighted emerald salary pill (e.g. `💰 $140,000 – $180,000 / yr`)
  - Location pill & Remote status
  - Verified Direct ATS badge
  - Remote Work Daily branding

## 4. Search Engine Indexing (SEO & GEO / AI Bots)
- **JSON-LD Structured Data**:
  - `JobPosting` schema with `directApply: true` (Google Jobs direct apply badge), salary range (`MonetaryAmount`), `jobLocationType: "TELECOMMUTE"`, and validThrough timestamps.
  - `BreadcrumbList` schema for Google search breadcrumb rich snippets (`Home > Category > Job`).
  - `WebSite` and `Organization` schemas referencing the official app icon.
- **Crawl Architecture**:
  - Dynamic `sitemap.xml` with priority hierarchy (1.0 for homepage, 0.9 for hire-remotely, 0.85 for categories, 0.8 for individual active jobs).
  - Permissive `robots.txt` welcoming Googlebot, Bingbot, GPTBot, PerplexityBot, and ClaudeBot.
  - Fast server-side rendering with instant edge caching.
