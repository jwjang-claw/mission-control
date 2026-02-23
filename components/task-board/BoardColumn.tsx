"use client";

import React from "react";
import { STATUS_CONFIG, type TaskStatus } from "@/lib/constants";
import { TaskCard } from "./TaskCard";
import { Id } from "@/convex/_generated/dataModel";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Array<{
    _id: Id<"tasks">;
    title: string;
    description?: string;
    assignee: string;
    status: string;
    priority?: string;
    tags?: string[];
  }>;
}

export const BoardColumn = ({ status, tasks }: BoardColumnProps) => {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-subtle)]">
      {/* Column Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {config.label}
          </h2>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              color: config.color,
              backgroundColor: config.bgColor,
            }}
          >
            {tasks.length}
          </span>
        </div>
        {config.description && (
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            {config.description}
          </p>
        )}
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-[var(--color-text-tertiary)]">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              id={task._id}
              title={task.title}
              description={task.description}
              assignee={task.assignee}
              status={task.status}
              priority={task.priority}
              tags={task.tags}
            />
          ))
        )}
      </div>
    </div>
  );
};
