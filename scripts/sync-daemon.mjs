#!/usr/bin/env node

/**
 * Remote Work Daily — Continuous 2-Hour Job Ingestion Daemon
 *
 * Runs the universal multi-sector scraper immediately upon boot,
 * then continuously triggers every 2 hours (120 minutes) to ingest
 * thousands of fresh listings across all industries (farming, trades, tech, etc.).
 *
 * Usage:
 *   node scripts/sync-daemon.mjs [--interval=120] [--target=5000]
 */

import { spawn } from "child_process";
import path from "path";

const args = process.argv.slice(2);
const intervalArg = args.find((a) => a.startsWith("--interval="));
const INTERVAL_MINUTES = intervalArg ? parseInt(intervalArg.split("=")[1], 10) || 120 : 120;
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;

const targetArg = args.find((a) => a.startsWith("--target="));
const TARGET_COUNT = targetArg ? parseInt(targetArg.split("=")[1], 10) || 5000 : 5000;

const SCRIPT_PATH = path.join(process.cwd(), "scripts", "sync-jobs.mjs");

let isRunning = false;
let runCount = 0;

function formatTime(d = new Date()) {
  return d.toISOString().replace("T", " ").substring(0, 19) + " UTC";
}

function runScrapeJob() {
  if (isRunning) {
    console.warn(`[${formatTime()}] ⚠️ Previous ingestion run is still in progress. Skipping overlapping trigger.`);
    return;
  }

  isRunning = true;
  runCount++;
  console.log(`\n============================================================`);
  console.log(`⏱️ [${formatTime()}] Ingestion Cycle #${runCount} Started`);
  console.log(`   Schedule: Every ${INTERVAL_MINUTES} minutes (2-hour cadence)`);
  console.log(`   Target: ~${TARGET_COUNT} listings across all sectors`);
  console.log(`============================================================\n`);

  const child = spawn(
    process.execPath,
    [SCRIPT_PATH, `--target=${TARGET_COUNT}`, "--force"],
    { stdio: "inherit", cwd: process.cwd() }
  );

  child.on("close", (code) => {
    isRunning = false;
    const nextRunTime = new Date(Date.now() + INTERVAL_MS);
    if (code === 0) {
      console.log(`\n✅ [${formatTime()}] Cycle #${runCount} completed successfully.`);
    } else {
      console.error(`\n❌ [${formatTime()}] Cycle #${runCount} exited with code ${code}.`);
    }
    console.log(`⏰ Next scheduled cycle will run at ${formatTime(nextRunTime)} (in ${INTERVAL_MINUTES}m).\n`);
  });

  child.on("error", (err) => {
    isRunning = false;
    console.error(`[${formatTime()}] Ingestion process error:`, err);
  });
}

console.log(`\n╔════════════════════════════════════════════════════════════╗`);
console.log(`║      RemoteWorkDaily Continuous Ingestion Daemon           ║`);
console.log(`║      Cadence: Every ${INTERVAL_MINUTES} Minutes | Target: ${TARGET_COUNT} jobs      ║`);
console.log(`╚════════════════════════════════════════════════════════════╝\n`);

// 1. Initial run immediately on daemon startup
runScrapeJob();

// 2. Schedule recurring execution every 2 hours
const timer = setInterval(runScrapeJob, INTERVAL_MS);

// 3. Heartbeat status logging every 15 minutes
setInterval(() => {
  if (!isRunning) {
    console.log(`[${formatTime()}] 💓 Daemon active. Waiting for next 2-hour schedule trigger.`);
  }
}, 15 * 60 * 1000);

// Graceful termination handling
process.on("SIGINT", () => {
  console.log(`\n[${formatTime()}] Daemon received SIGINT. Shutting down gracefully...`);
  clearInterval(timer);
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log(`\n[${formatTime()}] Daemon received SIGTERM. Shutting down gracefully...`);
  clearInterval(timer);
  process.exit(0);
});
