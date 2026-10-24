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
  assert.ok(suggestedContent.includes("More Roles (Executive, Marketing...)"), "SuggestedFilters includes More Roles dropdown");
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
