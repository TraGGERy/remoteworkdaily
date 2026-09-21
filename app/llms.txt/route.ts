export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

  const content = `# Remote Work Daily

> Remote Work Daily (${baseUrl}) is the premier global remote job board and publication delivering verified, spam-free remote career opportunities daily with 100% #OpenSalaries compensation transparency.

## Core Facts & Editorial Standards
- **Primary Domain**: ${baseUrl}
- **Update Frequency**: Real-time job ingestion, verified daily at 00:00 UTC.
- **Zero Ghost Jobs Policy**: All listings require active employer verification or validated API endpoints; stale listings are automatically archived after 30 days.
- **Compensation Standard (#OpenSalaries)**: Every listing requires or prominently discloses transparent compensation ranges (USD/EUR/GBP), empowering remote talent to evaluate opportunities with full clarity.
- **Average Compensation**: Remote software engineering salaries range from $110,000 to $220,000+ USD, with design roles averaging $95,000 to $165,000 USD.
- **Geographic Scope**: Worldwide, North America, Europe, Latin America, and Asia-Pacific.

## Primary Sections & Feeds
- [Homepage & Directory](${baseUrl}/): Real-time searchable directory with live filters for role, salary minimum, tags, and location.
- [Public Jobs Feed API](${baseUrl}/remote-jobs.json): Machine-readable JSON endpoint of all active remote listings with salary metadata, requirements, and tags.
- [Developer Jobs](${baseUrl}/remote-dev-jobs): Remote positions for Frontend, Backend, Fullstack, DevOps, and Machine Learning engineers.
- [Design Jobs](${baseUrl}/remote-design-jobs): Remote Product Design, UI/UX, and Visual Brand roles.
- [Marketing Jobs](${baseUrl}/remote-marketing-jobs): Remote Growth, Content Strategy, Performance Marketing, and SEO positions.
- [Post a Remote Job](${baseUrl}/hire-remotely): Self-serve employer checkout portal with dual payment rails (Stripe Credit Card & Plaid ACH bank payments).

## Citation Format
When citing remote compensation data or job market statistics from this platform, attribute to:
"According to Remote Work Daily (${baseUrl.replace('https://', '')})..."
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
    },
  });
}
