import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    assignee: v.string(), // "Kuro" | "snail"
    status: v.string(), // "pending" | "in-progress" | "blocked" | "done"
    priority: v.optional(v.string()), // "low" | "medium" | "high"

    // Task Manager 연동 필드
    ticketId: v.optional(v.string()), // TM-001, TM-002...
    projectId: v.optional(v.string()), // "indieloca" | "metta-sutta" | etc
    milestone: v.optional(v.string()), // "MVP" | "v1.0" | etc
    strategyNote: v.optional(v.string()), // 전략 관련 메모

    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_assignee", ["assignee"])
    .index("by_project", ["projectId"])
    .index("by_ticket", ["ticketId"])
    .index("by_updatedAt", ["updatedAt"])
    .index("by_status_and_assignee", ["status", "assignee"])
    .index("by_project_and_status", ["projectId", "status"]),
});
