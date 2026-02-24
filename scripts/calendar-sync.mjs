#!/usr/bin/env node
/**
 * Calendar Sync Script
 * OpenClaw cron jobs를 Mission Control 캘린더에 동기화
 * 
 * Usage: node scripts/calendar-sync.mjs
 * Schedule: Every 30 minutes
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Convex 프로젝트 경로 (mission-control 루트)
const CONVEX_DIR = projectRoot;

/**
 * OpenClaw cron list 실행 및 파싱
 */
function getCronJobs() {
  try {
    const output = execSync("openclaw cron list --json 2>/dev/null || openclaw cron list 2>/dev/null", {
      encoding: "utf-8",
      timeout: 30000,
    });

    // 테이블 형식 파싱
    const lines = output.trim().split("\n");
    const jobs = [];

    // 헤더 건너뛰기
    for (const line of lines) {
      if (line.includes("ID") && line.includes("Name")) continue;
      if (!line.trim()) continue;

      // 공백으로 분리
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length >= 5) {
        jobs.push({
          id: parts[0],
          name: parts[1] || "Cron Job",
          schedule: parts[2] || "",
          next: parts[3] || "",
          last: parts[4] || "",
          status: parts[5] || "ok",
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error("Failed to get cron jobs:", error.message);
    return [];
  }
}

/**
 * 시간 문자열을 timestamp로 변환
 */
function parseTimeToTimestamp(timeStr) {
  if (!timeStr || timeStr === "-" || timeStr === "never") {
    return Date.now();
  }

  // "in 1h", "in 30m" 등의 형식 처리
  const now = Date.now();
  
  if (timeStr.includes("in")) {
    const match = timeStr.match(/in\s+(\d+)([hm])/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      if (unit === "h") return now + value * 60 * 60 * 1000;
      if (unit === "m") return now + value * 60 * 1000;
    }
  }

  // "2h ago" 등의 형식
  if (timeStr.includes("ago")) {
    const match = timeStr.match(/(\d+)([hm])\s+ago/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      if (unit === "h") return now - value * 60 * 60 * 1000;
      if (unit === "m") return now - value * 60 * 1000;
    }
  }

  return now;
}

/**
 * Convex에 cron 잡 동기화
 */
async function syncToConvex(jobs) {
  for (const job of jobs) {
    const nextRun = parseTimeToTimestamp(job.next);
    const lastRun = parseTimeToTimestamp(job.last);

    const args = JSON.stringify({
      cronId: job.id,
      name: job.name,
      schedule: job.schedule,
      nextRun: nextRun,
      lastRun: lastRun === Date.now() ? undefined : lastRun,
      status: job.status,
    });

    try {
      execSync(`npx convex run scheduled:upsertCron --url https://avid-kudu-765.convex.cloud -- '${args}'`, {
        cwd: CONVEX_DIR,
        encoding: "utf-8",
        timeout: 30000,
      });
      console.log(`✓ Synced: ${job.name}`);
    } catch (error) {
      console.error(`✗ Failed to sync ${job.name}:`, error.message);
    }
  }
}

/**
 * 메인
 */
async function main() {
  console.log("🔄 Calendar Sync Started");
  console.log("📅 Fetching cron jobs from OpenClaw...");

  const jobs = getCronJobs();
  console.log(`📋 Found ${jobs.length} cron job(s)`);

  if (jobs.length === 0) {
    console.log("No cron jobs to sync");
    return;
  }

  console.log("📤 Syncing to Convex...");
  await syncToConvex(jobs);

  console.log("✅ Calendar Sync Complete");
}

main().catch(console.error);
