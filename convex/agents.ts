import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 모든 에이전트 조회
export const list = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").order("desc").take(10);
    return agents;
  },
});

// agentId로 단일 에이전트 조회
export const getByAgentId = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    return agent;
  },
});

// 상태별 에이전트 조회
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    const agents = await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return agents;
  },
});

// 에이전트 상태 업데이트
export const updateStatus = mutation({
  args: {
    agentId: v.string(),
    status: v.string(), // "active" | "idle" | "offline"
    currentTask: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 기존 에이전트 찾기
    const existingAgent = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    if (existingAgent) {
      // 기존 에이전트 업데이트
      await ctx.db.patch(existingAgent._id, {
        status: args.status,
        lastSeenAt: now,
        ...(args.currentTask !== undefined && {
          currentTask: args.currentTask,
        }),
        ...(args.sessionKey !== undefined && { sessionKey: args.sessionKey }),
      });
      return existingAgent._id;
    } else {
      // 새 에이전트 생성 (agentId에서 정보 추출)
      const agentInfo = getAgentInfo(args.agentId);
      await ctx.db.insert("agents", {
        agentId: args.agentId,
        name: agentInfo.name,
        role: agentInfo.role,
        status: args.status,
        lastSeenAt: now,
        ...(args.currentTask !== undefined && {
          currentTask: args.currentTask,
        }),
        ...(args.sessionKey !== undefined && { sessionKey: args.sessionKey }),
      });
      return null;
    }
  },
});

// 에이전트 초기 데이터 생성 (seed)
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const defaultAgents = [
      {
        agentId: "kuro",
        name: "Kuro",
        role: "Chief of Staff",
        status: "idle" as const,
        lastSeenAt: now,
      },
      {
        agentId: "robo",
        name: "Robo",
        role: "Lead Developer",
        status: "offline" as const,
        lastSeenAt: now - 3600000, // 1시간 전
      },
      {
        agentId: "scout",
        name: "Scout",
        role: "Researcher",
        status: "offline" as const,
        lastSeenAt: now - 7200000, // 2시간 전
      },
      {
        agentId: "quill",
        name: "Quill",
        role: "Writer",
        status: "offline" as const,
        lastSeenAt: now - 10800000, // 3시간 전
      },
    ];

    for (const agent of defaultAgents) {
      const existing = await ctx.db
        .query("agents")
        .withIndex("by_agentId", (q) => q.eq("agentId", agent.agentId))
        .first();

      if (!existing) {
        await ctx.db.insert("agents", agent);
      }
    }

    return { success: true, count: defaultAgents.length };
  },
});

// agentId로 에이전트 정보를 가져오는 헬퍼 함수
function getAgentInfo(agentId: string): { name: string; role: string } {
  const agentMap: Record<string, { name: string; role: string }> = {
    kuro: { name: "Kuro", role: "Chief of Staff" },
    robo: { name: "Robo", role: "Lead Developer" },
    scout: { name: "Scout", role: "Researcher" },
    quill: { name: "Quill", role: "Writer" },
  };

  return (
    agentMap[agentId] || {
      name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
      role: "Agent",
    }
  );
}

// Kuro가 활성 상태임을 알림 (heartbeat에서 호출)
export const heartbeat = mutation({
  args: {
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const kuro = await ctx.db
      .query("agents")
      .withIndex("by_agentId", (q) => q.eq("agentId", "kuro"))
      .first();

    if (kuro) {
      await ctx.db.patch(kuro._id, {
        status: "active",
        lastSeenAt: now,
        ...(args.currentTask !== undefined && {
          currentTask: args.currentTask,
        }),
      });
    }

    return { success: true, lastSeenAt: now };
  },
});
