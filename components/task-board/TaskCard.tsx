"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { STATUS_CONFIG, ASSIGNEE_CONFIG, TASK_STATUSES } from "@/lib/constants";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";

interface TaskCardProps {
  id: Id<"tasks">;
  title: string;
  description?: string;
  assignee: string;
  status: string;
  priority?: string;
  tags?: string[];
}

export const TaskCard = ({
  id,
  title,
  description,
  assignee,
  status,
  priority,
  tags,
}: TaskCardProps) => {
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const assigneeConfig =
    ASSIGNEE_CONFIG[assignee as keyof typeof ASSIGNEE_CONFIG];

  const handleStatusChange = (newStatus: string) => {
    updateTask({
      id,
      status: newStatus,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      removeTask({ id });
    }
  };

  return (
    <div className="bg-white border border-[var(--color-border-subtle)] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2">
          {title}
        </h3>
        <button
          onClick={handleDelete}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-[var(--color-text-secondary)] mb-3 line-clamp-2">
          {description}
        </p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <Badge
              key={tag}
              color="var(--color-text-tertiary)"
              bgColor="var(--color-bg-secondary)"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={assigneeConfig.label} size="sm" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            {assigneeConfig.label}
          </span>
        </div>

        {priority && (
          <Badge
            color={
              priority === "high"
                ? "var(--color-priority-high)"
                : priority === "medium"
                ? "var(--color-priority-medium)"
                : "var(--color-priority-low)"
            }
            bgColor={
              priority === "high"
                ? "var(--color-priority-high-bg)"
                : priority === "medium"
                ? "var(--color-priority-medium-bg)"
                : "var(--color-priority-low-bg)"
            }
          >
            {priority}
          </Badge>
        )}
      </div>

      {/* Status Actions */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full text-xs px-2 py-1.5 border border-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-in-progress)]"
        >
          {Object.entries(TASK_STATUSES).map(([key, value]) => (
            <option key={value} value={value}>
              {STATUS_CONFIG[value as keyof typeof STATUS_CONFIG].label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
