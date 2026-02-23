import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// 예정된 작업 조회 (scheduledAt 기준)
export const listScheduled = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const start = args.startTime ?? now;
    const end = args.endTime ?? now + 7 * 24 * 60 * 60 * 1000; // 기본 1주일

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_scheduledAt", (q) =>
        q.gte("scheduledAt", start).lt("scheduledAt", end)
      )
      .collect();

    return tasks.sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0));
  },
});

// 반복 작업 조회
export const listRecurring = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.filter((t) => t.isRecurring === true);
  },
});

// 예약 작업 생성
export const createScheduled = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledAt: v.number(),
    recurrence: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    eventType: v.optional(v.string()),
    assignee: v.string(),
    projectId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      scheduledAt: args.scheduledAt,
      recurrence: args.recurrence,
      isRecurring: args.isRecurring ?? false,
      eventType: args.eventType ?? "reminder",
      assignee: args.assignee,
      projectId: args.projectId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    return taskId;
  },
});

// 다가오는 작업 조회
export const listUpcoming = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const limit = args.limit ?? 5;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_scheduledAt", (q) => q.gte("scheduledAt", now))
      .take(limit);

    return tasks.sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0));
  },
});
