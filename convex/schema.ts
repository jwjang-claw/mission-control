import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    assignee: v.string(), // "Kuro" | "snail"
    status: v.string(), // "recurring" | "backlog" | "in-progress" | "review" | "done"
    priority: v.optional(v.string()), // "low" | "medium" | "high"
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_status_and_assignee", ["status", "assignee"]),
});
