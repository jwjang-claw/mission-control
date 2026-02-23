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
