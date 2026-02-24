#!/usr/bin/env node
/**
 * agent-status-sync.mjs - Sync agent status with Convex
 *
 * Usage:
 *   node agent-status-sync.mjs [--dry-run]
 *
 * Checks session files in each agent's directory to determine status:
 *   - active: last activity < 5 minutes ago
 *   - idle: last activity < 30 minutes ago
 *   - offline: last activity >= 30 minutes ago
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://giddy-shepherd-504.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

const DRY_RUN = process.argv.includes("--dry-run");

// Status thresholds (in milliseconds)
const ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const IDLE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

// Agent configurations
const AGENTS = [
  { id: "kuro", name: "Kuro", role: "Chief of Staff", sessionDir: "/home/jwjang/.openclaw/agents/main/sessions" },
  { id: "robo", name: "Robo", role: "Lead Developer", sessionDir: "/home/jwjang/.openclaw/agents/developer/sessions" },
  { id: "scout", name: "Scout", role: "Researcher", sessionDir: null }, // Not implemented yet
  { id: "quill", name: "Quill", role: "Writer", sessionDir: null }, // Not implemented yet
];

/**
 * Get the most recent modification time of session files in a directory
 */
async function getLastActivity(sessionDir) {
  if (!sessionDir) return null;

  try {
    const files = await readdir(sessionDir);
    let maxTime = 0;

    for (const file of files) {
      if (!file.endsWith(".jsonl")) continue;
      const filePath = join(sessionDir, file);
      const fileStat = await stat(filePath);
      if (fileStat.mtimeMs > maxTime) {
        maxTime = fileStat.mtimeMs;
      }
    }

    return maxTime || null;
  } catch (error) {
    // Directory doesn't exist or can't be read
    return null;
  }
}

/**
 * Determine agent status based on last activity
 */
function determineStatus(lastActivityMs) {
  if (!lastActivityMs) return "offline";

  const now = Date.now();
  const elapsed = now - lastActivityMs;

  if (elapsed < ACTIVE_THRESHOLD) return "active";
  if (elapsed < IDLE_THRESHOLD) return "idle";
  return "offline";
}

/**
 * Format elapsed time for display
 */
function formatElapsed(ms) {
  if (!ms) return "never";
  const elapsed = Date.now() - ms;
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

async function main() {
  console.log("🔄 Agent Status Sync");
  console.log(`   Time: ${new Date().toISOString()}`);
  if (DRY_RUN) console.log("   Mode: DRY RUN (no updates)\n");

  const results = [];

  for (const agent of AGENTS) {
    const lastActivity = await getLastActivity(agent.sessionDir);
    const status = determineStatus(lastActivity);

    const result = {
      agentId: agent.id,
      name: agent.name,
      status,
      lastActivity: formatElapsed(lastActivity),
    };

    results.push(result);

    if (!DRY_RUN) {
      try {
        const id = await client.mutation(api.agents.updateStatus, {
          agentId: agent.id,
          status,
        });
        result.convexId = id;
      } catch (error) {
        result.error = error.message;
      }
    }

    // Display result
    const statusEmoji =
      status === "active" ? "🟢" : status === "idle" ? "🟡" : "⚫";
    console.log(
      `   ${statusEmoji} ${agent.name.padEnd(6)} ${status.padEnd(8)} (last: ${result.lastActivity})`
    );
  }

  console.log("");
  return results;
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
