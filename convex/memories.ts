import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all memories, sorted by date (newest first)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("memories").order("desc").collect();
  },
});

// Get memory by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get only long-term memories
export const getLongTerm = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_isLongTerm", (q) => q.eq("isLongTerm", true))
      .collect();
  },
});

// Upsert a memory (insert or update if exists) - Used by sync action
export const upsert = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    date: v.string(),
    content: v.string(),
    sections: v.array(
      v.object({
        time: v.string(),
        title: v.string(),
        preview: v.string(),
        content: v.string(),
      })
    ),
    isLongTerm: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if memory with this slug already exists
    const existing = await ctx.db
      .query("memories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      // Update existing memory
      await ctx.db.patch(existing._id, {
        title: args.title,
        date: args.date,
        content: args.content,
        sections: args.sections,
        updatedAt: args.updatedAt,
      });
      return { action: "updated", id: existing._id };
    } else {
      // Insert new memory
      const id = await ctx.db.insert("memories", args);
      return { action: "created", id };
    }
  },
});

// Clear all memories
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const memories = await ctx.db.query("memories").collect();
    for (const memory of memories) {
      await ctx.db.delete(memory._id);
    }
    return { message: "All memories cleared", count: memories.length };
  },
});
