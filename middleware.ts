import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured =
  publishableKey &&
  !publishableKey.includes("placeholder") &&
  (publishableKey.startsWith("pk_test_") || publishableKey.startsWith("pk_live_"));

// Public-First strategy: Only protect routes that strictly require authentication (e.g. private dashboard).
// All public content pages, articles, guides, feeds, and 404s pass through cleanly without 307 sign-in redirects.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

const middleware = isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }

      const { userId, sessionClaims } = await auth();
      if (userId) {
        const claims = sessionClaims as Record<string, unknown> | undefined;
        const metadata = (claims?.metadata || claims?.publicMetadata) as Record<string, unknown> | undefined;
        const cookieCompleted =
          req.cookies.get("onboarding_completed")?.value === "true" ||
          req.cookies.get("rwd_onboarding_completed")?.value === "true";
        const isOnboardingCompleted = metadata?.onboardingComplete === true || cookieCompleted;

        const pathname = req.nextUrl.pathname;
        const isExcluded =
          pathname.startsWith("/onboarding") ||
          pathname.startsWith("/api") ||
          pathname.startsWith("/trpc") ||
          pathname.startsWith("/sign-in") ||
          pathname.startsWith("/sign-up") ||
          pathname.startsWith("/_next");

        if (!isOnboardingCompleted && !isExcluded) {
          const onboardingUrl = new URL("/onboarding", req.url);
          return NextResponse.redirect(onboardingUrl);
        }
      }
    })
  : function defaultMiddleware() {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
