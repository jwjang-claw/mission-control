import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Seed data for development and testing
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingTasks = await ctx.db.query("tasks").collect();
    if (existingTasks.length > 0) {
      return {
        message: "Database already seeded",
        count: existingTasks.length,
      };
    }

    const now = Date.now();
    const tasks = [
      // Recurring tasks
      {
        title: "Daily Standup",
        description: "Team daily sync meeting",
        assignee: "Kuro",
        status: "recurring",
        priority: "high",
        tags: ["meeting", "daily"],
        createdAt: now - 86400000 * 7,
        updatedAt: now - 3600000,
      },
      {
        title: "Weekly Review",
        description: "Review weekly progress and plan next week",
        assignee: "snail",
        status: "recurring",
        priority: "medium",
        tags: ["meeting", "weekly"],
        createdAt: now - 86400000 * 14,
        updatedAt: now - 7200000,
      },

      // Backlog tasks
      {
        title: "Research new database options",
        description: "Evaluate PostgreSQL vs MongoDB for next project",
        assignee: "Kuro",
        status: "backlog",
        priority: "low",
        tags: ["research", "database"],
        createdAt: now - 86400000 * 5,
        updatedAt: now - 86400000 * 3,
      },
      {
        title: "Design system documentation",
        description: "Document all UI components and their usage",
        assignee: "snail",
        status: "backlog",
        priority: "medium",
        tags: ["documentation", "design"],
        createdAt: now - 86400000 * 6,
        updatedAt: now - 86400000 * 2,
      },
      {
        title: "API rate limiting implementation",
        description: "Add rate limiting to public API endpoints",
        assignee: "Kuro",
        status: "backlog",
        priority: "high",
        tags: ["backend", "security"],
        createdAt: now - 86400000 * 4,
        updatedAt: now - 86400000,
      },

      // In Progress tasks
      {
        title: "User authentication flow",
        description: "Implement OAuth2 login with Google and GitHub",
        assignee: "Kuro",
        status: "in-progress",
        priority: "high",
        tags: ["frontend", "auth"],
        createdAt: now - 86400000 * 3,
        updatedAt: now - 1800000,
      },
      {
        title: "Dashboard redesign",
        description: "Redesign dashboard with new UI components",
        assignee: "snail",
        status: "in-progress",
        priority: "medium",
        tags: ["frontend", "design"],
        createdAt: now - 86400000 * 2,
        updatedAt: now - 900000,
      },
      {
        title: "Performance optimization",
        description: "Optimize database queries and add caching",
        assignee: "Kuro",
        status: "in-progress",
        priority: "high",
        tags: ["backend", "performance"],
        createdAt: now - 86400000,
        updatedAt: now - 600000,
      },

      // Review tasks
      {
        title: "Feature flag system PR",
        description: "Code review for feature flag implementation",
        assignee: "snail",
        status: "review",
        priority: "medium",
        tags: ["review", "backend"],
        createdAt: now - 43200000,
        updatedAt: now - 300000,
      },
      {
        title: "Mobile responsive fixes",
        description: "Review and test mobile responsive design changes",
        assignee: "Kuro",
        status: "review",
        priority: "high",
        tags: ["review", "frontend", "mobile"],
        createdAt: now - 86400000 / 2,
        updatedAt: now - 600000,
      },

      // Done tasks
      {
        title: "Setup CI/CD pipeline",
        description:
          "Configure GitHub Actions for automated testing and deployment",
        assignee: "Kuro",
        status: "done",
        priority: "high",
        tags: ["devops"],
        createdAt: now - 86400000 * 10,
        updatedAt: now - 86400000 * 7,
      },
      {
        title: "Write unit tests for auth module",
        description: "Add comprehensive unit tests for authentication",
        assignee: "snail",
        status: "done",
        priority: "medium",
        tags: ["testing", "auth"],
        createdAt: now - 86400000 * 8,
        updatedAt: now - 86400000 * 6,
      },
      {
        title: "Update dependencies",
        description: "Update all npm packages to latest versions",
        assignee: "Kuro",
        status: "done",
        priority: "low",
        tags: ["maintenance"],
        createdAt: now - 86400000 * 7,
        updatedAt: now - 86400000 * 5,
      },
      {
        title: "Design new landing page",
        description: "Create mockups for the new landing page",
        assignee: "snail",
        status: "done",
        priority: "medium",
        tags: ["design"],
        createdAt: now - 86400000 * 6,
        updatedAt: now - 86400000 * 4,
      },
      {
        title: "Implement search functionality",
        description: "Add full-text search to the application",
        assignee: "Kuro",
        status: "done",
        priority: "high",
        tags: ["backend", "search"],
        createdAt: now - 86400000 * 5,
        updatedAt: now - 86400000 * 3,
      },
    ] as const;

    for (const task of tasks) {
      await ctx.db.insert("tasks", {
        ...task,
        tags: task.tags ? [...task.tags] : undefined,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      });
    }

    return { message: "Database seeded successfully", count: tasks.length };
  },
});

// Clear all data (useful for testing)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    return { message: "All data cleared", count: tasks.length };
  },
});
