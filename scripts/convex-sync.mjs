#!/usr/bin/env node
/**
 * convex-sync.mjs - Sync task-manager tickets with Convex
 * 
 * Usage:
 *   node convex-sync.mjs create <ticketId> <title> [options]
 *   node convex-sync.mjs update <ticketId> <status>
 * 
 * Options (JSON string):
 *   projectId, milestone, priority, strategyNote, assignee
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://giddy-shepherd-504.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "create": {
        const [ticketId, title, optionsJson = "{}"] = args;
        const options = JSON.parse(optionsJson);

        const taskId = await client.mutation(api.tasks.create, {
          title,
          assignee: options.assignee || "Kuro",
          status: "pending",
          priority: options.priority || "medium",
          ticketId,
          projectId: options.projectId,
          milestone: options.milestone,
          strategyNote: options.strategyNote,
        });

        console.log(JSON.stringify({ success: true, taskId, ticketId }));
        break;
      }

      case "update": {
        const [ticketId, status] = args;

        // First find the task by ticketId
        const task = await client.query(api.tasks.getByTicket, { ticketId });
        
        if (!task) {
          console.error(JSON.stringify({ success: false, error: "Task not found" }));
          process.exit(1);
        }

        await client.mutation(api.tasks.update, {
          id: task._id,
          status,
        });

        console.log(JSON.stringify({ success: true, ticketId, status }));
        break;
      }

      case "get": {
        const [ticketId] = args;
        const task = await client.query(api.tasks.getByTicket, { ticketId });
        console.log(JSON.stringify(task, null, 2));
        break;
      }

      default:
        console.error("Unknown command:", command);
        console.error("Usage: convex-sync.mjs <create|update|get> ...");
        process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({ success: false, error: error.message }));
    process.exit(1);
  }
}

main();
