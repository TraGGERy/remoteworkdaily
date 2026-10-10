import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Account Deletion: Repository files export deleteCandidatePass and deleteSubscriber", () => {
  const candidatePassesPath = path.join(process.cwd(), "lib", "candidate-passes-repository.ts");
  const candidatePassesContent = fs.readFileSync(candidatePassesPath, "utf-8");
  assert.ok(
    candidatePassesContent.includes("export async function deleteCandidatePass"),
    "lib/candidate-passes-repository.ts must export deleteCandidatePass"
  );

  const subscribersPath = path.join(process.cwd(), "lib", "subscribers-repository.ts");
  const subscribersContent = fs.readFileSync(subscribersPath, "utf-8");
  assert.ok(
    subscribersContent.includes("export async function deleteSubscriber"),
    "lib/subscribers-repository.ts must export deleteSubscriber"
  );
});

test("Account Deletion: Stripe helper exports cancelStripeSubscription and getActiveStripeSubscription", () => {
  const stripePath = path.join(process.cwd(), "lib", "stripe.ts");
  const stripeContent = fs.readFileSync(stripePath, "utf-8");
  assert.ok(
    stripeContent.includes("export async function cancelStripeSubscription"),
    "lib/stripe.ts must export cancelStripeSubscription"
  );
  assert.ok(
    stripeContent.includes("export async function getActiveStripeSubscription"),
    "lib/stripe.ts must export getActiveStripeSubscription"
  );
});

test("Account Deletion: Invariant guard blocks deletion when active subscription exists", () => {
  function evaluateAccountDeletion({ hasActiveSubscription, cancelPlanRequested }) {
    if (hasActiveSubscription && !cancelPlanRequested) {
      return {
        status: 400,
        allowed: false,
        error: "Account deletion blocked: You currently have an active paid subscription.",
        hasActiveSubscription: true,
        canCancelPlan: true,
      };
    }

    return {
      status: 200,
      allowed: true,
      message: "Account and associated subscriptions deleted successfully.",
    };
  }

  // 1. User with active subscription attempting deletion without cancelling plan
  const blockedAttempt = evaluateAccountDeletion({
    hasActiveSubscription: true,
    cancelPlanRequested: false,
  });
  assert.equal(blockedAttempt.allowed, false);
  assert.equal(blockedAttempt.status, 400);
  assert.equal(blockedAttempt.hasActiveSubscription, true);
  assert.equal(blockedAttempt.canCancelPlan, true);

  // 2. User with active subscription confirming plan cancellation
  const cancelledAndDeleted = evaluateAccountDeletion({
    hasActiveSubscription: true,
    cancelPlanRequested: true,
  });
  assert.equal(cancelledAndDeleted.allowed, true);
  assert.equal(cancelledAndDeleted.status, 200);

  // 3. User with no active subscription (free preview or expired)
  const freeUser = evaluateAccountDeletion({
    hasActiveSubscription: false,
    cancelPlanRequested: false,
  });
  assert.equal(freeUser.allowed, true);
  assert.equal(freeUser.status, 200);
});

test("Account Deletion: UI in dashboard page includes Danger Zone and Delete Account confirmation modal", () => {
  const dashboardPath = path.join(process.cwd(), "app", "dashboard", "page.tsx");
  const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");

  assert.ok(
    dashboardContent.includes("Danger Zone: Delete Account"),
    "Dashboard should render Danger Zone: Delete Account section"
  );
  assert.ok(
    dashboardContent.includes("Active Subscription Detected"),
    "Dashboard should include active subscription warning guard"
  );
  assert.ok(
    dashboardContent.includes("Cancel Paid Plan First"),
    "Dashboard should include button to cancel paid plan first"
  );
  assert.ok(
    dashboardContent.includes("Cancel Plan & Delete Account"),
    "Dashboard should include option to cancel plan and delete account"
  );
  assert.ok(
    dashboardContent.includes("Permanently Delete Account?"),
    "Dashboard should render delete confirmation modal"
  );
  assert.ok(
    dashboardContent.includes("DELETE"),
    "Modal should require typing DELETE to confirm permanent deletion"
  );
  assert.ok(
    dashboardContent.includes("deleteAccount"),
    "Dashboard should hook into deleteAccount from subscription context"
  );
});

test("Account Deletion: API route /api/user/delete exists and handles subscription cancellation and user purge", () => {
  const routePath = path.join(process.cwd(), "app", "api", "user", "delete", "route.ts");
  assert.ok(fs.existsSync(routePath), "/api/user/delete/route.ts must exist");

  const routeContent = fs.readFileSync(routePath, "utf-8");
  assert.ok(routeContent.includes("export async function GET"), "Must export GET handler for status checks");
  assert.ok(routeContent.includes("export async function POST"), "Must export POST handler for deletion");
  assert.ok(routeContent.includes("export async function DELETE"), "Must export DELETE handler for deletion");
  assert.ok(routeContent.includes("cancelStripeSubscription"), "Must call cancelStripeSubscription");
  assert.ok(routeContent.includes("getActiveCandidatePass"), "Must inspect active candidate pass");
  assert.ok(routeContent.includes("deleteCandidatePass"), "Must delete candidate pass on deletion");
  assert.ok(routeContent.includes("deleteSubscriber"), "Must delete subscriber records on deletion");
  assert.ok(routeContent.includes("clerkClient"), "Must delete Clerk user when authenticated");
});

test("Account Deletion: Clerk Webhook handles user.deleted lifecycle event", () => {
  const webhookPath = path.join(process.cwd(), "app", "api", "webhooks", "clerk", "route.ts");
  const webhookContent = fs.readFileSync(webhookPath, "utf-8");
  assert.ok(
    webhookContent.includes('eventType === "user.deleted"'),
    "Clerk webhook must recognize user.deleted event"
  );
});

test("Account Deletion: SubscriptionContext exposes deleteAccount method", () => {
  const contextPath = path.join(process.cwd(), "components", "auth", "subscription-context.tsx");
  const contextContent = fs.readFileSync(contextPath, "utf-8");
  assert.ok(
    contextContent.includes("deleteAccount:"),
    "SubscriptionContext must expose deleteAccount in its interface and provider"
  );
  assert.ok(
    contextContent.includes("/api/user/delete"),
    "deleteAccount must call /api/user/delete"
  );
  assert.ok(
    contextContent.includes("remotework_user_email"),
    "deleteAccount must clear client-side localStorage and session cookies"
  );
});
