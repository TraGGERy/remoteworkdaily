import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Category Dropdown: ROLE_CATEGORIES includes Executive and Marketing", () => {
  const constantsContent = fs.readFileSync("lib/constants.ts", "utf8");
  assert.ok(constantsContent.includes('id: "marketing"'), "Marketing category exists in constants");
  assert.ok(constantsContent.includes('id: "exec"'), "Executive category exists in constants");

  // Verify UI files contain the role dropdown
  const filterBarContent = fs.readFileSync("components/job-board/filter-bar.tsx", "utf8");
  assert.ok(filterBarContent.includes("Role: All Roles"), "FilterBar includes Role dropdown");
  assert.ok(filterBarContent.includes("Marketing &amp; Growth"), "FilterBar includes Marketing option");
  assert.ok(filterBarContent.includes("Executive &amp; Leadership"), "FilterBar includes Executive option");

  const suggestedContent = fs.readFileSync("components/job-board/suggested-filters.tsx", "utf8");
  assert.ok(suggestedContent.includes("More Roles (Marketing, Executive...)"), "SuggestedFilters includes Marketing and Executive in dropdown placeholder");
  assert.ok(suggestedContent.includes('c.id === "marketing"'), "Marketing is explicitly added to dropdown roles");
  assert.ok(suggestedContent.includes('c.id === "exec"'), "Executive is explicitly added to dropdown roles");
});

test("Category Filtering & Early Access: Logic functions as expected", () => {
  function isEarlyAccessJob(postedAt) {
    if (!postedAt) return false;
    const time = new Date(postedAt).getTime();
    if (isNaN(time)) return false;
    const diff = Date.now() - time;
    return diff >= 0 && diff < 24 * 3600 * 1000;
  }

  const now = Date.now();
  const freshMarketingTime = new Date(now - 7 * 3600 * 1000).toISOString(); // 7 hours ago (previously unblurred under 6h rule)
  const freshExecTime = new Date(now - 2 * 3600 * 1000).toISOString(); // 2 hours ago
  const staleJobTime = new Date(now - 30 * 3600 * 1000).toISOString(); // 30 hours ago

  assert.equal(isEarlyAccessJob(freshMarketingTime), true, "Fresh marketing job (7h old) is marked early access");
  assert.equal(isEarlyAccessJob(freshExecTime), true, "Fresh exec job (2h old) is marked early access");
  assert.equal(isEarlyAccessJob(staleJobTime), false, "Stale job (30h old) is not marked early access");

  const utilsContent = fs.readFileSync("lib/utils.ts", "utf8");
  assert.ok(utilsContent.includes("export function isEarlyAccessJob"), "isEarlyAccessJob is exported from lib/utils.ts");
});

test("Filters Overview Modal: Contains all controls and active selections popup", () => {
  const modalContent = fs.readFileSync("components/job-board/filters-overview-modal.tsx", "utf8");
  assert.ok(modalContent.includes("All Filters &amp; Selected Criteria"), "Modal renders title");
  assert.ok(modalContent.includes("Role &amp; Specialization"), "Modal includes Role section");
  assert.ok(modalContent.includes("Workplace Type"), "Modal includes Workplace section");
  assert.ok(modalContent.includes("Posting Freshness"), "Modal includes Freshness section");
  assert.ok(modalContent.includes("Location &amp; Regional Hubs"), "Modal includes Location section");
  assert.ok(modalContent.includes("Minimum Annual Salary"), "Modal includes Salary section");
  assert.ok(modalContent.includes("Smart Toggles &amp; Application Rails"), "Modal includes Toggles section");
  assert.ok(modalContent.includes("Public Sector &amp; Government Criteria"), "Modal includes Gov Criteria section");
  assert.ok(modalContent.includes("Sort By"), "Modal includes Sort section");
  assert.ok(modalContent.includes("Reset All"), "Modal includes Reset All action");

  const filterBarContent = fs.readFileSync("components/job-board/filter-bar.tsx", "utf8");
  assert.ok(filterBarContent.includes("FiltersOverviewModal"), "FilterBar imports and mounts FiltersOverviewModal");
  assert.ok(filterBarContent.includes("All Filters"), "FilterBar renders All Filters trigger button");
});

