import { Job } from "./types";

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    slug: "senior-full-stack-engineer-nextjs-vercel",
    title: "Senior Full Stack Engineer (Next.js & Edge Runtime)",
    company: "Vercel",
    companySlug: "vercel",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://vercel.com",
    verified: true,
    featured: true,
    sticky: true,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "dev",
    tags: ["Next.js", "React", "TypeScript", "Node.js", "Edge Computing", "Senior"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "medical_insurance", "dental_insurance", "learning_budget", "home_office_budget", "equity_compensation"],
    salaryMin: 160000,
    salaryMax: 220000,
    salaryCurrency: "USD",
    description: `### About Vercel
Vercel's Frontend Cloud provides the developer experience and infrastructure to build, scale, and secure a faster, more personalized web. Leaders like Under Armour, eBay, The Washington Post, and Nintendo power their digital experiences with Vercel.

### The Role
We are looking for a **Senior Full Stack Engineer** to build next-generation edge rendering primitives and developer workflows for Next.js and the Vercel platform.

#### Key Responsibilities:
- Design and implement resilient serverless and edge infrastructure.
- Collaborate directly with the Next.js core team on performance optimizations.
- Architect high-throughput API systems with low latency global distribution.
- Mentor junior engineers and champion best engineering practices.

#### Requirements:
- 5+ years of experience with React, TypeScript, and modern Node.js ecosystems.
- Deep understanding of HTTP, DNS, CDN caching architectures, and edge computing.
- Strong track record of shipping production-grade open-source or developer tooling.
- Excellent asynchronous communication skills.`,
    requirements: ["5+ years React & TypeScript", "Distributed systems experience", "Strong async communication"],
    applyUrl: "https://vercel.com/careers",
    postedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    viewsCount: 3840,
    appliesCount: 214,
    source: "direct",
  },
  {
    id: "job-2",
    slug: "staff-infrastructure-engineer-stripe",
    title: "Staff Infrastructure Engineer - Global Payments",
    company: "Stripe",
    companySlug: "stripe",
    companyLogo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://stripe.com",
    verified: true,
    featured: true,
    sticky: true,
    location: "North America (US & Canada)",
    locationCode: "region_NA",
    category: "dev",
    tags: ["Go", "Kubernetes", "AWS", "Distributed Systems", "PostgreSQL", "Staff Engineer"],
    benefits: ["distributed_team", "401k", "medical_insurance", "dental_insurance", "learning_budget", "mental_wellness_budget", "equity_compensation"],
    salaryMin: 210000,
    salaryMax: 290000,
    salaryCurrency: "USD",
    description: `### About Stripe
Stripe is a financial infrastructure platform for businesses. Millions of companies—from the world's largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.

### What You'll Do
As a **Staff Infrastructure Engineer**, you will drive reliability and scale across our global settlement and clearing rails, processing hundreds of billions in volume each year.

#### What You Will Build:
- Zero-downtime database migration tooling and multi-region failover automation.
- High-availability distributed consensus pipelines handling millions of TPS.
- Low-latency financial ledger telemetry.

#### You Might Be a Fit If:
- You have 8+ years scaling production infrastructure at web scale.
- Master of Go, distributed database topologies, and Linux network internals.
- Obsession with five-nines uptime, observability, and defensive programming.`,
    requirements: ["8+ years backend infrastructure", "Expert in Go & Kubernetes", "Financial systems experience is a plus"],
    applyUrl: "https://stripe.com/jobs",
    postedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    viewsCount: 5120,
    appliesCount: 342,
    source: "direct",
  },
  {
    id: "job-3",
    slug: "principal-product-designer-linear",
    title: "Principal Product Designer (Desktop & Web App)",
    company: "Linear",
    companySlug: "linear",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://linear.app",
    verified: true,
    featured: true,
    sticky: false,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "design",
    tags: ["Product Design", "Figma", "UI/UX", "Design Systems", "Micro-interactions", "Lead"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "home_office_budget", "coworking_budget", "learning_budget", "equity_compensation"],
    salaryMin: 175000,
    salaryMax: 240000,
    salaryCurrency: "USD",
    description: `### About Linear
Linear is the issue tracker modern software teams love. We build software that feels fast, intuitive, and thoughtfully crafted.

### The Role
We are seeking a **Principal Product Designer** who obsesses over keyboard-first interaction models, buttery smooth 60fps animations, and radical clarity in product UX.

#### Responsibilities:
- Shape core user journeys across our issue tracking, cycles, and roadmap products.
- Work closely with founders and engineers prototyping in code and Figma.
- Refine design tokens and accessibility guidelines across web and native desktop apps.

#### Requirements:
- Exceptional portfolio showcasing meticulous interaction and visual design craft.
- Deep empathy for developers and technical creators.
- Ability to prototype interactive states with realistic timing and tactile feel.`,
    requirements: ["High-craft portfolio", "Figma & design system mastery", "Keyboard navigation & micro-interactions"],
    applyUrl: "https://linear.app/careers",
    postedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    viewsCount: 4290,
    appliesCount: 198,
    source: "direct",
  },
  {
    id: "job-4",
    slug: "senior-database-engineer-supabase",
    title: "Senior Database Engineer (PostgreSQL Internals & Rust)",
    company: "Supabase",
    companySlug: "supabase",
    companyLogo: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://supabase.com",
    verified: true,
    featured: false,
    sticky: false,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "dev",
    tags: ["PostgreSQL", "Rust", "C", "Database Internals", "Open Source", "Senior"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "home_office_budget", "learning_budget", "equity_compensation", "no_whiteboard"],
    salaryMin: 155000,
    salaryMax: 215000,
    salaryCurrency: "USD",
    description: `### About Supabase
Supabase is the open source Firebase alternative. We provide a complete backend suite built on top of Postgres with Realtime, Auth, Storage, and Edge Functions.

### The Role
We are looking for a **Senior Database Engineer** to work on Postgres extensions, connection poolers (Supavisor), and storage engine optimizations.

#### Responsibilities:
- Write robust, high-performance Rust and C extensions for PostgreSQL.
- Debug kernel, memory, and disk I/O bottlenecks under multi-tenant workloads.
- Contribute upstream to open-source PostgreSQL and connection pooling tools.

#### Requirements:
- Deep expertise in PostgreSQL internals, WAL, query planners, and MVCC.
- Strong production experience in Rust or C/C++.
- Open source mindset and remote-first collaboration.`,
    requirements: ["Deep PostgreSQL internals", "Rust or C expertise", "Open-source contributor"],
    applyUrl: "https://supabase.com/careers",
    postedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    viewsCount: 2900,
    appliesCount: 145,
    source: "direct",
  },
  {
    id: "job-5",
    slug: "head-of-growth-marketing-calcom",
    title: "Head of Growth & Product Marketing",
    company: "Cal.com",
    companySlug: "calcom",
    companyLogo: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://cal.com",
    verified: true,
    featured: false,
    sticky: false,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "marketing",
    tags: ["Growth", "SEO", "Product Marketing", "Analytics", "Acquisition", "Exec"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "home_office_budget", "pay_in_crypto", "equity_compensation"],
    salaryMin: 130000,
    salaryMax: 185000,
    salaryCurrency: "USD",
    description: `### About Cal.com
Cal.com is the open-source scheduling platform for everyone. Over 200,000 teams use Cal.com to organize meetings without the back-and-forth emails.

### The Mission
As **Head of Growth**, you will lead our user acquisition engine, viral invite loops, developer community marketing, and programmatic SEO strategy.

#### Responsibilities:
- Scale organic traffic from 500k to 5M monthly visitors via programmatic landing pages.
- Run rigorous conversion optimization experiments on onboarding and pricing funnels.
- Manage community launches on Product Hunt, Hacker News, and developer podcasts.

#### Requirements:
- Proven track record scaling a B2B SaaS or developer tool from $1M to $10M+ ARR.
- Strong technical aptitude: comfortable with SQL, analytics tracking, and web mechanics.`,
    requirements: ["Proven SaaS growth track record", "SEO & conversion funnel mastery", "Analytical mindset"],
    applyUrl: "https://cal.com/jobs",
    postedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    viewsCount: 2180,
    appliesCount: 92,
    source: "direct",
  },
  {
    id: "job-6",
    slug: "lead-ai-research-engineer-openai",
    title: "Lead AI Systems & Inference Engineer",
    company: "OpenAI",
    companySlug: "openai",
    companyLogo: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://openai.com",
    verified: true,
    featured: true,
    sticky: true,
    location: "United States (Remote)",
    locationCode: "US",
    category: "dev",
    tags: ["AI / ML", "Python", "C++", "CUDA", "PyTorch", "LLMs", "Senior"],
    benefits: ["distributed_team", "401k", "medical_insurance", "dental_insurance", "learning_budget", "equity_compensation"],
    salaryMin: 245000,
    salaryMax: 360000,
    salaryCurrency: "USD",
    description: `### About OpenAI
OpenAI's mission is to ensure that artificial general intelligence benefits all of humanity.

### The Role
We are seeking an experienced **AI Systems Engineer** to optimize our global model inference clusters serving billions of token requests daily.

#### Responsibilities:
- Optimize custom CUDA kernels, tensor parallel distribution, and KV cache compaction.
- Build resilient routing layers capable of handling massive query volume spikes.
- Profile and shave microseconds off latency across LLM decoding loops.

#### Requirements:
- Deep expertise in GPU architectures, PyTorch, C++, and low-level CUDA programming.
- Experience serving frontier LLMs at scale with Triton, vLLM, or TensorRT-LLM.`,
    requirements: ["Deep CUDA & C++ experience", "Large-scale inference systems", "PyTorch optimization"],
    applyUrl: "https://openai.com/careers",
    postedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    viewsCount: 8400,
    appliesCount: 520,
    source: "direct",
  },
  {
    id: "job-7",
    slug: "customer-support-lead-automattic",
    title: "Happiness Engineer & Technical Support Lead",
    company: "Automattic",
    companySlug: "automattic",
    companyLogo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://automattic.com",
    verified: true,
    featured: false,
    sticky: false,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "support",
    tags: ["Customer Support", "Technical Support", "WordPress", "PHP", "Remote Work Pioneer"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "home_office_budget", "learning_budget", "coworking_budget", "company_retreats"],
    salaryMin: 78000,
    salaryMax: 110000,
    salaryCurrency: "USD",
    description: `### About Automattic
We believe in making the web a better place. Automattic is the company behind WordPress.com, WooCommerce, Tumblr, Day One, and Pocket Casts. We are a 100% distributed company since day one!

### The Happiness Engineer Role
Happiness Engineers are the heartbeat of Automattic. You will diagnose customer issues, write documentation, debug theme and plugin conflicts, and advocate for user delight.

#### What You Bring:
- Clear, empathetic written English communication.
- Basic understanding of web technologies (HTML, CSS, JavaScript, WordPress, APIs).
- Independence and self-motivation in a truly asynchronous culture.`,
    requirements: ["Outstanding written English", "Tech-savvy and troubleshooting curiosity", "Self-motivated remote worker"],
    applyUrl: "https://automattic.com/work-with-us",
    postedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    viewsCount: 1950,
    appliesCount: 160,
    source: "direct",
  },
  {
    id: "job-8",
    slug: "senior-devops-sre-gitlab",
    title: "Senior Site Reliability Engineer (Kubernetes & Multi-Cloud)",
    company: "GitLab",
    companySlug: "gitlab",
    companyLogo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://gitlab.com",
    verified: true,
    featured: false,
    sticky: false,
    location: "Europe / UK / Americas",
    locationCode: "region_EU",
    category: "ops",
    tags: ["Kubernetes", "Terraform", "SRE", "Go", "GCP", "CI/CD", "Senior"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "learning_budget", "home_office_budget", "equity_compensation"],
    salaryMin: 145000,
    salaryMax: 195000,
    salaryCurrency: "USD",
    description: `### About GitLab
GitLab is the open DevOps platform delivered as a single application. From project planning and source code management to CI/CD and monitoring, GitLab covers the entire software development lifecycle.

### What You'll Do
As a **Senior SRE**, you will ensure the reliability, performance, and scalability of GitLab.com, powering software delivery for millions of developers.

#### Responsibilities:
- Automate cluster provisioning with Terraform and Helm across multi-region Kubernetes.
- Lead blameless incident postmortems and build automated self-healing mechanisms.
- Improve our Prometheus and Thanos metric collection architectures.`,
    requirements: ["5+ years production SRE / DevOps", "Strong Kubernetes & Terraform skills", "Proficiency in Go or Python"],
    applyUrl: "https://about.gitlab.com/jobs",
    postedAt: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
    viewsCount: 2750,
    appliesCount: 115,
    source: "direct",
  },
  {
    id: "job-9",
    slug: "vp-of-finance-posthog",
    title: "VP of Finance & Operations",
    company: "PostHog",
    companySlug: "posthog",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://posthog.com",
    verified: true,
    featured: true,
    sticky: false,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "finance",
    tags: ["Finance", "SaaS Metrics", "Operations", "Legal", "Executive", "VP"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "profit_sharing", "learning_budget", "equity_compensation", "no_whiteboard"],
    salaryMin: 180000,
    salaryMax: 250000,
    salaryCurrency: "USD",
    description: `### About PostHog
PostHog is the all-in-one product analytics and developer OS. We are fully transparent, open source, and default to radical public sharing.

### The Opportunity
We are looking for our first **VP of Finance & Operations** to lead our economic model, compliance, global payroll, financial modeling, and strategic capital allocation.

#### Responsibilities:
- Build transparent, automated financial reporting pipelines.
- Supervise international tax, R&D credits, and treasury management.
- Partner with founders on pricing experiments and margin optimization.`,
    requirements: ["Prior leadership in high-growth B2B SaaS", "Deep financial modeling & forecasting skills", "Enjoys radical transparency and async work"],
    applyUrl: "https://posthog.com/careers",
    postedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    viewsCount: 1890,
    appliesCount: 47,
    source: "direct",
  },
  {
    id: "job-10",
    slug: "frontend-engineer-design-systems-shopify",
    title: "Senior Frontend Engineer - Polaris Design System",
    company: "Shopify",
    companySlug: "shopify",
    companyLogo: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://shopify.com",
    verified: true,
    featured: false,
    sticky: false,
    location: "Americas / Europe (Remote)",
    locationCode: "region_NA",
    category: "dev",
    tags: ["React", "TypeScript", "Accessibility", "Design Systems", "Web Performance", "Senior"],
    benefits: ["distributed_team", "401k", "unlimited_vacation", "medical_insurance", "learning_budget", "home_office_budget"],
    salaryMin: 150000,
    salaryMax: 205000,
    salaryCurrency: "USD",
    description: `### About Shopify
Shopify powers millions of merchants worldwide. Our digital by design culture means you can work anywhere within eligible regions.

### Role Overview
Join the team behind **Polaris**, Shopify's open-source design system used across thousands of interfaces and apps.

#### Key Responsibilities:
- Architect accessible, robust React components conforming to WCAG AAA standards.
- Build automated visual regression and performance benchmarking pipelines.
- Collaborate with designers on fluid motion tokens and layout primitives.`,
    requirements: ["5+ years React & TypeScript", "Deep accessibility (a11y) expertise", "Design systems experience"],
    applyUrl: "https://shopify.com/careers",
    postedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    viewsCount: 3400,
    appliesCount: 230,
    source: "direct",
  },
  {
    id: "job-11",
    slug: "chief-technology-officer-nomad-health",
    title: "Chief Technology Officer (Remote Health Platform)",
    company: "Nomad Health Tech",
    companySlug: "nomad-health",
    companyLogo: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://nomadhealth.com",
    verified: true,
    featured: true,
    sticky: false,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "exec",
    tags: ["CTO", "Executive", "Architecture", "HealthTech", "Security", "Team Building"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "medical_insurance", "dental_insurance", "equity_compensation", "company_retreats"],
    salaryMin: 220000,
    salaryMax: 310000,
    salaryCurrency: "USD",
    description: `### About Nomad Health Tech
We build cross-border healthcare and insurance tech specifically designed for digital nomads and global remote workforces.

### The Role
As **CTO**, you will lead our engineering organization, oversee HIPAA & GDPR compliance architectures, and drive the technical roadmap from Series A to Series B.

#### What We Need:
- Proven technical executive who has scaled engineering teams from 10 to 50+ members.
- Strong grounding in regulated compliance systems, mTLS, and data privacy.
- Inspiring servant leadership style in an international team.`,
    requirements: ["Previous CTO or VP Engineering role", "HealthTech or regulated FinTech experience", "Global distributed leadership"],
    applyUrl: "https://nomadhealth.com/jobs",
    postedAt: new Date(Date.now() - 55 * 3600 * 1000).toISOString(),
    viewsCount: 2980,
    appliesCount: 58,
    source: "direct",
  },
  {
    id: "job-12",
    slug: "senior-rust-core-engineer-docker",
    title: "Senior Core Systems Engineer (Rust & Container Internals)",
    company: "Docker",
    companySlug: "docker",
    companyLogo: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=128&h=128&fit=crop&q=80",
    companyWebsite: "https://docker.com",
    verified: true,
    featured: false,
    sticky: false,
    location: "Worldwide",
    locationCode: "Worldwide",
    category: "dev",
    tags: ["Rust", "Linux", "cgroups", "Containers", "Systems", "Senior"],
    benefits: ["distributed_team", "async", "unlimited_vacation", "home_office_budget", "learning_budget", "equity_compensation"],
    salaryMin: 165000,
    salaryMax: 225000,
    salaryCurrency: "USD",
    description: `### About Docker
Docker helps developers bring their ideas to life by conquering the complexity of app development. Over 20 million developers use Docker daily.

### The Role
We are seeking a **Senior Systems Engineer** fluent in Rust and Linux cgroups/namespaces to evolve our container engine and build cache runtimes.

#### Responsibilities:
- Implement low-overhead virtualization layers and image snapshotting algorithms.
- Optimize filesystem layer diffing for multi-gigabyte container registries.
- Work closely with the open-source containerd and OCI communities.`,
    requirements: ["Expert Rust systems programming", "Linux kernel internals knowledge", "OCI container standards"],
    applyUrl: "https://docker.com/careers",
    postedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    viewsCount: 3100,
    appliesCount: 140,
    source: "direct",
  }
];
