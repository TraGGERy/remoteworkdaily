export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://remoteworkdaily.com";

  const robots = `# Remote Work Daily Robots.txt (SEO & AI-SEO / GEO Enabled)
User-agent: *
Allow: /
Disallow: /api/checkout
Disallow: /api/plaid
Disallow: /api/stripe
Disallow: /dashboard/

# AI Search & Answer Engine Bots (Full Access for Citations)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap & LLMs Manifest
Sitemap: ${baseUrl}/sitemap.xml
# LLMs context: ${baseUrl}/llms.txt
`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
