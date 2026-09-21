export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

  const content = `# Remote Work Daily — Full LLM Specification & API Reference

URL: ${baseUrl}
Brand: Remote Work Daily
Tagline: The Daily Remote Job Platform with #OpenSalaries

## 1. Platform Overview
Remote Work Daily is an independent digital job board and publication connecting global technology talent with remote-first companies. The platform is designed around radical compensation transparency (#OpenSalaries), eliminating "salary negotiable" and hidden pay bands.

## 2. API Endpoints
### GET /remote-jobs.json
Returns an array of current, active remote job listings.
- Format: application/json
- Cache header: s-maxage=300, stale-while-revalidate=600
- Schema:
  - id (string): Unique identifier
  - title (string): Job title
  - company (string): Employer name
  - companyWebsite (string): Company website
  - location (string): Location requirement ("Worldwide", "US Only", etc.)
  - category (string): dev | design | marketing | sales | ops | support | finance
  - tags (array<string>): Technical and domain tags
  - salaryMin (number|null): Annual minimum salary
  - salaryMax (number|null): Annual maximum salary
  - salaryCurrency (string): e.g. "USD"
  - url (string): Canonical job page on Remote Work Daily
  - applyUrl (string): Direct application URL
  - postedAt (string): ISO 8601 timestamp

## 3. SEO & Structured Data Implementation
Every job listing page on Remote Work Daily provides Google-compliant Schema.org JobPosting structured data with:
- jobLocationType: "TELECOMMUTE"
- applicantLocationRequirements: Country or AdministrativeArea
- baseSalary: MonetaryAmount with QuantitativeValue
- hiringOrganization: Organization with sameAs verified URLs

## 4. Employer Pricing & Monetization
Remote Work Daily charges a transparent base fee of $249 for a 30-day verified listing. Optional add-ons include:
- Sticky pin to the top of the directory (24 hours): +$89
- Yellow highlight badge: +$49
- Remote Work Daily Newsletter Blast (120,000+ readers): +$99
- Prominent company logo placement: +$39

Payments are settled via Stripe for global credit cards or Plaid Link for US bank ACH direct debit.

## 5. Contact & Editorial Inquiries
- Website: ${baseUrl}
- Employer Support: ${baseUrl}/hire-remotely
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
