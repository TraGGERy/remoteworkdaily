# Remotework Codebase & Review Guidelines

This project is a high-performance remote job marketplace built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Clerk Auth, Stripe Payments, and Plaid Fintech ACH integrations.

## Commit messages (Vibers Review Specification)

Every commit MUST include a "How to test" section in the body:
- Live URL to open and verify the change
- Step-by-step what to click/check
- Test credentials if login is required
- Expected result for each step

Example:
  feat: Add Plaid Link ACH payment rail

  How to test:
  - Open http://localhost:3000/hire-remotely
  - Fill in job title, company name, work email, and application link
  - Verify real-time card preview matches input
  - Select ACH bank payment option
  - Verify Link session initializes and connects

## Development Commands
- `npm run dev`: Start local development server on port 3000
- `npm run build`: Compile production Next.js build
- `npm run start`: Run production server
- `npm test`: Run automated test suites
