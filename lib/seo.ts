import { Job } from "./types";
import { LocationEligibility } from "./domain/catalog";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

export function generateJobPostingSchema(job: Job) {
  const validThroughDate = new Date(new Date(job.postedAt).getTime() + 30 * 24 * 3600 * 1000).toISOString();
  const locationObj = new LocationEligibility(job.location);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    identifier: {
      "@type": "PropertyValue",
      name: job.company,
      value: job.id,
    },
    datePosted: job.postedAt,
    validThrough: validThroughDate,
    employmentType: "FULL_TIME",
    directApply: true,
    image: [`${SITE_URL}/api/og/job?id=${job.id}`],
    hiringOrganization: {
      "@type": "Organization",
      name: job.company,
      sameAs: job.companyWebsite || `${SITE_URL}`,
      logo: job.companyLogo || `${SITE_URL}/icon.png`,
    },
    ...(job.workplaceType === "on-site"
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location || "Office",
            },
          },
        }
      : job.workplaceType === "hybrid"
      ? {
          jobLocationType: "TELECOMMUTE",
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location || "Office / Hybrid",
            },
          },
        }
      : {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": locationObj.isWorldwide ? "Country" : "AdministrativeArea",
            name: job.location || "Worldwide",
          },
        }),
  };

  if (job.salaryMin || job.salaryMax) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency || "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin || undefined,
        maxValue: job.salaryMax || undefined,
        unitText: "YEAR",
      },
    };
  }

  return schema;
}

export function generateJobBreadcrumbSchema(job: Job) {
  const categorySlug = job.category ? `/remote-${job.category}-jobs` : "/";
  const categoryName = job.category
    ? job.category.charAt(0).toUpperCase() + job.category.slice(1) + " Jobs"
    : "Jobs";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Remote Work Daily",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${SITE_URL}${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.title,
        item: `${SITE_URL}/jobs/${job.id}/${job.slug}`,
      },
    ],
  };
}

export function generateWebsiteSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Remote Work Daily",
      url: SITE_URL,
      description: "The #1 verified remote job board with 100% transparent pay. Discover high-paying remote roles updated daily.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Remote Work Daily — Verified Remote Jobs with Transparent Pay",
      url: SITE_URL,
      isAccessibleForFree: false,
      hasPart: {
        "@type": "WebPageElement",
        isAccessibleForFree: false,
        "cssSelector": ".paywall-blurred-jobs",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Remote Work Daily",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      description: "Remote Work Daily is the trusted global platform for remote-first careers, transparent compensation, and verified employer postings.",
      sameAs: [
        "https://twitter.com/remoteworkdaily",
        "https://www.linkedin.com/company/remoteworkdaily",
        "https://github.com/remoteworkdaily",
      ],
    },
  ];
}

export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Remote Work Daily?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Remote Work Daily is a verified remote job platform featuring daily updated remote careers in software engineering, design, marketing, product, and operations, with 100% upfront salary transparency.",
        },
      },
      {
        "@type": "Question",
        name: "How does salary transparency work on Remote Work Daily?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every listing requires or highlights explicit salary ranges, ensuring candidates know the compensation before spending time applying.",
        },
      },
      {
        "@type": "Question",
        name: "How often are remote jobs updated on Remote Work Daily?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Listings are refreshed in real time and verified daily. Outdated and filled listings are archived automatically to ensure zero ghost jobs.",
        },
      },
    ],
  };
}
