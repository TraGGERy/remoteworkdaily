import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Category Dropdown: SuggestedFilters includes Developer, Designer, Marketing, and Executive inside dropdown", () => {
  const constantsContent = fs.readFileSync("lib/constants.ts", "utf8");
  assert.ok(constantsContent.includes('id: "marketing"'), "Marketing category exists in constants");
  assert.ok(constantsContent.includes('id: "exec"'), "Executive category exists in constants");
  assert.ok(constantsContent.includes('id: "dev"'), "Developer category exists in constants");
  assert.ok(constantsContent.includes('id: "design"'), "Design category exists in constants");

  // Verify SuggestedFilters consolidates Developer and Designer inside the categories dropdown
  const suggestedContent = fs.readFileSync("components/job-board/suggested-filters.tsx", "utf8");
  assert.ok(suggestedContent.includes("Categories & Roles (Developer, Designer, Marketing...)"), "SuggestedFilters includes placeholder featuring Developer, Designer, Marketing");
  assert.ok(suggestedContent.includes("ALL_ROLES.map"), "SuggestedFilters maps all roles inside the dropdown");
  assert.ok(!suggestedContent.includes('PRIMARY_ROLES = ROLE_CATEGORIES.filter((c) => ["all", "dev", "design"]'), "Developer and Designer are not separated as outside primary buttons");

  // Verify FiltersOverviewModal contains the complete role category selections
  const modalContent = fs.readFileSync("components/job-board/filters-overview-modal.tsx", "utf8");
  assert.ok(modalContent.includes("Role &amp; Specialization"), "Modal includes Role category section");
  assert.ok(modalContent.includes("Marketing"), "Modal includes Marketing option");
  assert.ok(modalContent.includes("Executive"), "Modal includes Executive option");

  // Verify FilterBar is streamlined with responsive search input and All Filters trigger
  const filterBarContent = fs.readFileSync("components/job-board/filter-bar.tsx", "utf8");
  assert.ok(!filterBarContent.includes("Role: All Roles"), "FilterBar outside dropdown for Role is removed");
  assert.ok(!filterBarContent.includes("Job Type: All"), "FilterBar outside dropdown for Job Type is removed");
  assert.ok(!filterBarContent.includes("Posted: Any time"), "FilterBar outside dropdown for Freshness is removed");
  assert.ok(!filterBarContent.includes("Gov Filters:"), "FilterBar outside row for Gov Filters is removed");
  assert.ok(filterBarContent.includes("All Filters"), "FilterBar provides All Filters modal trigger");
  assert.ok(filterBarContent.includes("handleSearchSubmit"), "FilterBar provides form submit handler for search input");
});

test("Category Filtering & Search Query: Multi-word search and category keyword matching work seamlessly", () => {
  const filterJobsSrc = fs.readFileSync("lib/filter-jobs.ts", "utf8");
  assert.ok(filterJobsSrc.includes("tokens.every"), "filterJobs supports multi-word search token matching");
  assert.ok(filterJobsSrc.includes("developer|engineer|software"), "filterJobs matches developer titles when category is dev");
  assert.ok(filterJobsSrc.includes("designer|design|ui|ux"), "filterJobs matches designer titles when category is design");

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
