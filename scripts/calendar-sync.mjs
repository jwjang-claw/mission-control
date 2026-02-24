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
 * 잡 이름 파싱 - @openclaw 접두사 제거 및 말줄임표 처리
 *
 * @param {string} rawName - 원본 잡 이름
 * @returns {string} 파싱된 잡 이름
 */
function parseJobName(rawName) {
  // @openclaw 접두사 제거
  let name = rawName.replace(/^@openclaw\s*/, "");
  // 말줄임표 제거
  name = name.replace(/\.\.\.+$/, "").trim();
  return name || rawName;
}

/**
 * 전체 이름 추출 - JSON 응답에서 전체 이름을 가져옴
 * 
 * @param {object} job - cron job 객체 (JSON에서 파싱됨)
 * @returns {string} 전체 이름
 */
function extractFullTitle(job) {
  // 1. name 필드에서 @openclaw 접두사 제거
  let fullTitle = job.name?.replace(/^@openclaw\s*/, "") || "";
  
  // 2. payload.message가 있으면 첫 문장을 사용 (더 완전한 이름)
  if (job.payload?.kind === "agentTurn" && job.payload?.message) {
    // 첫 문장 또는 첫 줄바꿈 이전까지 추출
    const message = job.payload.message.replace(/^@openclaw\s*/, "");
    const firstLine = message.split('\n')[0];
    // 마침표로 끝나면 그대로 사용, 아니면 첫 문장만
    if (firstLine.includes('.')) {
      fullTitle = firstLine.split('.').slice(0, -1).join('.') + '.';
    } else {
      fullTitle = firstLine;
    }
  }
  
  return fullTitle.trim() || job.name || "Untitled";
}

/**
 * 짧은 이름 생성 - 전체 이름에서 첫 50자 정도로 축약
 * 
 * @param {string} fullTitle - 전체 이름
 * @returns {string} 짧은 이름
 */
function createShortName(fullTitle) {
  if (fullTitle.length <= 50) return fullTitle;
  
  // 50자에서 마지막 공백 또는 마침표 이후 자르기
  const truncated = fullTitle.slice(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');
  const lastDot = truncated.lastIndexOf('.');
  
  const cutPoint = Math.max(lastSpace, lastDot);
  if (cutPoint > 30) {
    return truncated.slice(0, cutPoint) + '...';
  }
  
  return truncated + '...';
}

/**
 * OpenClaw cron list 실행 및 파싱 (JSON 모드)
 * 
 * JSON 출력 형식:
 * {
 *   "jobs": [{
 *     "id": "uuid",
 *     "name": "@openclaw This is a s...",
 *     "schedule": { "expr": "0 9 * * *", "kind": "cron", "tz": "Asia/Seoul" },
 *     "state": { "nextRunAtMs": 123, "lastRunAtMs": 123, "lastStatus": "ok" }
 *   }]
 * }
 */
function getCronJobs() {
  try {
    // JSON 모드로 실행하여 전체 정보 가져오기
    const output = execSync("/home/jwjang/.local/bin/openclaw cron list --json 2>/dev/null", {
      encoding: "utf-8",
      timeout: 30000,
    });

    const data = JSON.parse(output);
    const jobs = [];

    for (const job of data.jobs || []) {
      const fullTitle = extractFullTitle(job);
      const shortName = createShortName(fullTitle);
      
      // schedule 포맷팅: "0 9 * * * @ Asia/Seoul"
      const schedule = job.schedule 
        ? `${job.schedule.expr} @ ${job.schedule.tz || 'UTC'}`
        : "unknown";

      // 프롬프트 추출 (전체 메시지 내용)
      const prompt = job.payload?.kind === "agentTurn" && job.payload?.message
        ? job.payload.message.replace(/^@openclaw\s*/, "")
        : null;

      jobs.push({
        id: job.id,
        name: shortName,
        fullTitle: fullTitle,
        schedule: schedule,
        next: job.state?.nextRunAtMs ? `in ${Math.round((job.state.nextRunAtMs - Date.now()) / 3600000)}h` : "-",
        last: job.state?.lastRunAtMs ? `${Math.round((Date.now() - job.state.lastRunAtMs) / 3600000)}h ago` : "-",
        nextRun: job.state?.nextRunAtMs || Date.now(),
        lastRun: job.state?.lastRunAtMs,
        status: job.state?.lastStatus || "ok",
        prompt: prompt,
      });
    }

    return jobs;
  } catch (error) {
    console.error("Failed to get cron jobs:", error.message);
    return [];
  }
}

/**
 * Convex에 cron 잡 동기화
 */
async function syncToConvex(jobs) {
  const { spawn } = await import("child_process");

  for (const job of jobs) {
    const args = {
      cronId: job.id,
      name: job.name,
      fullTitle: job.fullTitle,
      schedule: job.schedule,
      nextRun: job.nextRun,
      lastRun: job.lastRun,
      status: job.status,
    };

    // prompt가 있으면 추가 (null/undefined인 경우 제외)
    if (job.prompt != null) {
      args.prompt = job.prompt;
    }

    try {
      // spawn을 사용하여 인자를 배열로 전달 (쉘 인자 분리 문제 해결)
      const result = await new Promise((resolve, reject) => {
        const proc = spawn("npx", ["convex", "run", "scheduled:upsertCron", "--prod", JSON.stringify(args)], {
          cwd: CONVEX_DIR,
          encoding: "utf-8",
        });
        
        let stdout = "";
        let stderr = "";
        
        proc.stdout.on("data", (data) => { stdout += data; });
        proc.stderr.on("data", (data) => { stderr += data; });
        
        proc.on("close", (code) => {
          if (code === 0) {
            resolve(stdout);
          } else {
            reject(new Error(stderr || `Exit code ${code}`));
          }
        });
        
        proc.on("error", reject);
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
  console.log("📅 Fetching cron jobs from OpenClaw (JSON mode)...");

  const jobs = getCronJobs();
  console.log(`📋 Found ${jobs.length} cron job(s)`);

  // 자기 자신(30분마다 실행)도 추가
  jobs.push({
    id: "calendar-sync-script",
    name: "Calendar Sync",
    fullTitle: "Calendar Sync - Mission Control과 OpenClaw cron 동기화",
    schedule: "*/30 * * * * @ Asia/Seoul",
    next: "in 30m",
    last: "-",
    nextRun: Date.now() + 30 * 60 * 1000,
    lastRun: undefined,
    status: "ok",
    prompt: null,
  });

  console.log("📤 Syncing to Convex...");
  await syncToConvex(jobs);

  console.log("✅ Calendar Sync Complete");
}

main().catch(console.error);
