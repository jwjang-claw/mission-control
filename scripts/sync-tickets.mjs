#!/usr/bin/env node
/**
 * sync-tickets.mjs - Sync all local tm tickets to Mission Control
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import fs from "fs";
import path from "path";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://giddy-shepherd-504.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

const VAULT_DIR = `${process.env.HOME}/.openclaw/workspace/IndieLoca_Vault`;
const INBOX_DIR = `${VAULT_DIR}/99_Inbox/Tasks`;
const DOING_DIR = `${VAULT_DIR}/99_Doing`;
const DONE_DIR = `${VAULT_DIR}/99_Done`;

function parseTicketFile(filepath) {
  const filename = path.basename(filepath);

  // Extract ticket ID from filename (Ticket_001_...)
  const match = filename.match(/Ticket_(\d+)_/);
  if (!match) return null;

  const ticketId = `TM-${match[1]}`;

  // Extract title from filename
  const titleMatch = filename.match(/Ticket_\d+_(.+)\.md$/);
  const title = titleMatch ? titleMatch[1].replace(/_/g, " ") : "Untitled";

  // Determine status from directory
  let status = "pending";
  if (filepath.includes("99_Doing")) status = "in-progress";
  else if (filepath.includes("99_Done")) status = "done";

  return { ticketId, title, status, filepath };
}

async function main() {
  console.log("🔄 Syncing local tickets to Mission Control...\n");

  const directories = [
    { path: INBOX_DIR, status: "pending" },
    { path: DOING_DIR, status: "in-progress" },
    { path: DONE_DIR, status: "done" },
  ];

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const dir of directories) {
    if (!fs.existsSync(dir.path)) {
      console.log(`⚠️  Directory not found: ${dir.path}`);
      continue;
    }

    const files = fs.readdirSync(dir.path).filter((f) => f.startsWith("Ticket_") && f.endsWith(".md"));

    for (const file of files) {
      const filepath = path.join(dir.path, file);
      const ticket = parseTicketFile(filepath);

      if (!ticket) {
        console.log(`⚠️  Skipping invalid file: ${file}`);
        continue;
      }

      try {
        // Check if already exists
        const existing = await client.query(api.tasks.getByTicket, { ticketId: ticket.ticketId });

        if (existing) {
          console.log(`⏭️  ${ticket.ticketId} already exists - skipping`);
          skipped++;
          continue;
        }

        // Create new task
        await client.mutation(api.tasks.create, {
          title: ticket.title,
          assignee: "Kuro",
          status: ticket.status,
          priority: "medium",
          ticketId: ticket.ticketId,
          projectId: "indieloca",
        });

        console.log(`✅ ${ticket.ticketId}: "${ticket.title}" [${ticket.status}]`);
        created++;
      } catch (error) {
        console.error(`❌ ${ticket.ticketId}: ${error.message}`);
        errors++;
      }
    }
  }

  console.log("\n📊 Sync complete:");
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

main().catch(console.error);
