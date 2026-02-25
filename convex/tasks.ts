import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const listByAssignee = query({
  args: { assignee: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_assignee", (q) => q.eq("assignee", args.assignee))
      .collect();
    return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const filter = query({
  args: {
    status: v.optional(v.string()),
    assignee: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tasks;

    // Apply filters based on provided arguments
    if (args.status && args.assignee) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_status_and_assignee", (q) =>
          q.eq("status", args.status!).eq("assignee", args.assignee!)
        )
        .collect();
    } else if (args.status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else if (args.assignee) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_assignee", (q) => q.eq("assignee", args.assignee!))
        .collect();
    } else {
      tasks = await ctx.db.query("tasks").collect();
    }

    // Apply search filter if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    assignee: v.string(),
    status: v.string(),
    priority: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    // Task Manager 연동 필드
    ticketId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    milestone: v.optional(v.string()),
    strategyNote: v.optional(v.string()),
    // Calendar/Scheduled Task 필드
    scheduledAt: v.optional(v.number()),
    recurrence: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    eventType: v.optional(v.string()),
    fullTitle: v.optional(v.string()),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const newTaskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      assignee: args.assignee,
      status: args.status,
      priority: args.priority,
      tags: args.tags,
      ticketId: args.ticketId,
      projectId: args.projectId,
      milestone: args.milestone,
      strategyNote: args.strategyNote,
      scheduledAt: args.scheduledAt,
      recurrence: args.recurrence,
      isRecurring: args.isRecurring,
      eventType: args.eventType,
      fullTitle: args.fullTitle,
      prompt: args.prompt,
      createdAt: now,
      updatedAt: now,
    });
    return newTaskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    assignee: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    // Task Manager 연동 필드
    ticketId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    milestone: v.optional(v.string()),
    strategyNote: v.optional(v.string()),
    // Calendar/Scheduled Task 필드
    scheduledAt: v.optional(v.number()),
    recurrence: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
    eventType: v.optional(v.string()),
    fullTitle: v.optional(v.string()),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Task Manager 연동 쿼리

export const getByProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getByTicket = query({
  args: { ticketId: v.string() },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();
    return tasks[0] || null; // 티켓 ID는 고유하므로 첫 번째만 반환
  },
});

export const listByProjectAndStatus = query({
  args: {
    projectId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let tasks;

    if (args.status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project_and_status", (q) =>
          q.eq("projectId", args.projectId).eq("status", args.status!)
        )
        .collect();
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    }

    return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
