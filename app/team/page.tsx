"use client";

import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";

const teamMembers = [
  {
    id: "kuro",
    name: "Kuro",
    role: "Chief of Staff",
    description: "Main agent, manager role — orchestrates tasks and communication",
    avatar: "🦊",
    tags: ["Planning", "Task Management", "Communication"],
  },
  {
    id: "robo",
    name: "Robo",
    role: "Lead Developer",
    description: "Coding specialist — implements features and fixes bugs",
    avatar: "🤖",
    tags: ["Coding", "Debugging", "Refactoring"],
  },
  {
    id: "scout",
    name: "Scout",
    role: "Researcher",
    description: "Information gatherer — searches and analyzes data",
    avatar: "🔍",
    tags: ["Web Search", "Analysis", "Monitoring"],
  },
  {
    id: "quill",
    name: "Quill",
    role: "Writer",
    description: "Content creator — writes blogs, docs, and translations",
    avatar: "✒️",
    tags: ["Blog", "Docs", "Translation"],
  },
];

function TeamMemberCard({ member }: { member: typeof teamMembers[0] }) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border-subtle)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[var(--color-border-default)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-150 p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center text-xl flex-shrink-0">
          {member.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
              {member.name}
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
              {member.role}
            </span>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-3 line-clamp-2">
            {member.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {member.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const lead = teamMembers.find((m) => m.id === "kuro")!;
  const workers = teamMembers.filter((m) => m.id !== "kuro");

  return (
    <MainLayout title="Team" subtitle="4 AI agents working for IndieLoca">
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-[var(--color-text-tertiary)]">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              4
            </span>
            <span className="text-[13px]">agents</span>
          </div>
          <div className="w-px h-3.5 bg-[var(--color-border-default)]" />
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[var(--color-in-progress)]">
              1
            </span>
            <span className="text-[13px]">lead</span>
          </div>
          <div className="w-px h-3.5 bg-[var(--color-border-default)]" />
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-[var(--color-text-secondary)]">
              3
            </span>
            <span className="text-[13px]">workers</span>
          </div>
        </div>

        {/* Lead */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--color-in-progress)]" />
            <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Lead
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-[var(--color-border-subtle)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[var(--color-border-default)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-150 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-kuro-bg)] flex items-center justify-center text-2xl flex-shrink-0">
                {lead.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[16px] font-semibold text-[var(--color-text-primary)]">
                    {lead.name}
                  </h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--color-kuro-bg)] text-[var(--color-kuro)]">
                    {lead.role}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] mb-3">
                  {lead.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workers */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)]" />
            <h2 className="text-[13px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Workers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
