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
 * 
 * 출력 형식:
 * ID                                   Name                     Schedule                         Next       Last       Status    Target    Agent     
 * 40713dc7-bf98-4e6a-a02e-67eb23614ed5 @openclaw This is a s... cron 0 9 * * * @ Asia/Seoul (... in 21h     3h ago     ok        isolated  main
 */
function getCronJobs() {
  try {
    const output = execSync("openclaw cron list 2>/dev/null", {
      encoding: "utf-8",
      timeout: 30000,
    });

    const lines = output.trim().split("\n");
    const jobs = [];

    for (const line of lines) {
      // 헤더 건너뛰기
      if (line.includes("ID") && line.includes("Name")) continue;
      if (!line.trim()) continue;

      // UUID 패턴으로 ID 추출 (36자: 8-4-4-4-12 형식)
      const idMatch = line.match(/^([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
      if (!idMatch) continue;

      const id = idMatch[1];
      const rest = line.slice(id.length).trim();

      // "cron" 키워드를 기준으로 name과 schedule 분리
      const cronIdx = rest.indexOf("cron ");
      if (cronIdx === -1) continue;

      const name = rest.slice(0, cronIdx).trim();
      const afterCron = rest.slice(cronIdx + 5); // "cron " 이후

      // schedule은 괄호까지 포함: "0 9 * * * @ Asia/Seoul (expr: "0 9 * * *")"
      // 괄호 닫힘 ')'을 찾아서 schedule 끝을 결정
      const parenDepth = { count: 0 };
      let scheduleEnd = -1;
      for (let i = 0; i < afterCron.length; i++) {
        if (afterCron[i] === '(') parenDepth.count++;
        if (afterCron[i] === ')') {
          parenDepth.count--;
          if (parenDepth.count === 0) {
            scheduleEnd = i + 1;
            break;
          }
        }
      }

      let schedule, remaining;
      if (scheduleEnd > 0) {
        schedule = afterCron.slice(0, scheduleEnd).trim();
        remaining = afterCron.slice(scheduleEnd).trim();
      } else {
        // 괄호가 없으면 공백으로 분리 (fallback)
        const parts = afterCron.split(/\s+/);
        schedule = parts.slice(0, 6).join(" "); // "0 9 * * * @ Asia/Seoul"
        remaining = parts.slice(6).join(" ");
      }

      // remaining에서 Next, Last, Status 추출
      // 형식: "in 21h 3h ago ok isolated main"
      const remainingParts = remaining.split(/\s+/).filter(Boolean);
      
      // Next: "in 21h" 또는 날짜 형식
      let next = "";
      let last = "";
      let status = "ok";
      let idx = 0;

      // Next 파싱 ("in Xh" 또는 단일 토큰)
      if (remainingParts[idx] === "in" && remainingParts[idx + 1]) {
        next = `in ${remainingParts[idx + 1]}`;
        idx += 2;
      } else if (remainingParts[idx]) {
        next = remainingParts[idx];
        idx++;
      }

      // Last 파싱 ("Xh ago")
      if (remainingParts[idx + 1] === "ago" && remainingParts[idx]) {
        last = `${remainingParts[idx]} ago`;
        idx += 2;
      } else if (remainingParts[idx] === "-") {
        last = "-";
        idx++;
      }

      // Status
      if (remainingParts[idx]) {
        status = remainingParts[idx];
      }

      jobs.push({ id, name, schedule, next, last, status });
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

  // 자기 자신(30분마다 실행)도 추가
  jobs.push({
    id: "calendar-sync-script",
    name: "Calendar Sync",
    schedule: "*/30 * * * *",
    next: "in 30m",
    last: "-",
    status: "ok",
  });

  console.log("📤 Syncing to Convex...");
  await syncToConvex(jobs);

  console.log("✅ Calendar Sync Complete");
}

main().catch(console.error);
