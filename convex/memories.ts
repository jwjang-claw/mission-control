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

// Seed dummy data for testing
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existing = await ctx.db.query("memories").first();
    if (existing) {
      return { message: "Memories already seeded", skipped: true };
    }

    const now = Date.now();
    const yesterday = now - 86400000;
    const twoDaysAgo = now - 86400000 * 2;

    const dummyMemories = [
      // Long-term memory
      {
        slug: "MEMORY",
        title: "Long-Term Memory",
        date: new Date(now).toISOString(),
        content: `# Long-Term Memory

## Project Architecture
- Next.js 14 with App Router
- Convex for backend/database
- Tailwind CSS for styling

## Coding Preferences
- Functional components with hooks
- Immutable state updates
- Small, focused files (max 800 lines)

## Key Decisions
- Using Convex instead of traditional REST API
- Real-time sync for collaborative features`,
        sections: [
          {
            time: "",
            title: "Project Architecture",
            preview: "Next.js 14 with App Router, Convex for backend...",
            content:
              "- Next.js 14 with App Router\n- Convex for backend/database\n- Tailwind CSS for styling",
          },
          {
            time: "",
            title: "Coding Preferences",
            preview: "Functional components with hooks, immutable updates...",
            content:
              "- Functional components with hooks\n- Immutable state updates\n- Small, focused files (max 800 lines)",
          },
          {
            time: "",
            title: "Key Decisions",
            preview: "Using Convex instead of traditional REST API...",
            content:
              "- Using Convex instead of traditional REST API\n- Real-time sync for collaborative features",
          },
        ],
        isLongTerm: true,
        createdAt: now,
        updatedAt: now,
      },
      // Today's memory
      {
        slug: "2026-02-24",
        title: "Monday, February 24, 2026",
        date: new Date(now).toISOString(),
        content: `# February 24, 2026

## 09:00 AM — Morning Planning
Reviewed the sprint backlog and prioritized tasks for the week. Focus on Memory page implementation.

## 02:30 PM — Code Review
Reviewed PR for sidebar drag resize feature. Looks good, minor suggestions for cleanup.

## 05:00 PM — Architecture Discussion
Discussed moving Memory data from local filesystem to Convex. Agreed on the approach.`,
        sections: [
          {
            time: "09:00 AM",
            title: "Morning Planning",
            preview: "Reviewed the sprint backlog and prioritized tasks...",
            content:
              "Reviewed the sprint backlog and prioritized tasks for the week. Focus on Memory page implementation.",
          },
          {
            time: "02:30 PM",
            title: "Code Review",
            preview: "Reviewed PR for sidebar drag resize feature...",
            content:
              "Reviewed PR for sidebar drag resize feature. Looks good, minor suggestions for cleanup.",
          },
          {
            time: "05:00 PM",
            title: "Architecture Discussion",
            preview:
              "Discussed moving Memory data from local filesystem to Convex...",
            content:
              "Discussed moving Memory data from local filesystem to Convex. Agreed on the approach.",
          },
        ],
        isLongTerm: false,
        createdAt: now,
        updatedAt: now,
      },
      // Yesterday's memory
      {
        slug: "2026-02-23",
        title: "Sunday, February 23, 2026",
        date: new Date(yesterday).toISOString(),
        content: `# February 23, 2026

## 10:00 AM — Weekly Review
Completed weekly review and updated project status. Good progress on Calendar page.

## 03:00 PM — Learning Session
Studied Convex real-time subscriptions and optimistic updates pattern.`,
        sections: [
          {
            time: "10:00 AM",
            title: "Weekly Review",
            preview: "Completed weekly review and updated project status...",
            content:
              "Completed weekly review and updated project status. Good progress on Calendar page.",
          },
          {
            time: "03:00 PM",
            title: "Learning Session",
            preview: "Studied Convex real-time subscriptions...",
            content:
              "Studied Convex real-time subscriptions and optimistic updates pattern.",
          },
        ],
        isLongTerm: false,
        createdAt: yesterday,
        updatedAt: yesterday,
      },
      // Two days ago
      {
        slug: "2026-02-22",
        title: "Saturday, February 22, 2026",
        date: new Date(twoDaysAgo).toISOString(),
        content: `# February 22, 2026

## 11:00 AM — Feature Development
Implemented weekly view for Calendar page. Added navigation between weeks.

## 04:00 PM — Bug Fixes
Fixed sidebar resize flickering issue. Added smooth transition animations.`,
        sections: [
          {
            time: "11:00 AM",
            title: "Feature Development",
            preview: "Implemented weekly view for Calendar page...",
            content:
              "Implemented weekly view for Calendar page. Added navigation between weeks.",
          },
          {
            time: "04:00 PM",
            title: "Bug Fixes",
            preview: "Fixed sidebar resize flickering issue...",
            content:
              "Fixed sidebar resize flickering issue. Added smooth transition animations.",
          },
        ],
        isLongTerm: false,
        createdAt: twoDaysAgo,
        updatedAt: twoDaysAgo,
      },
    ];

    for (const memory of dummyMemories) {
      await ctx.db.insert("memories", memory);
    }

    return {
      message: "Memories seeded successfully",
      count: dummyMemories.length,
    };
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
