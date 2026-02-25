"use client";

import React from "react";
import { Id } from "@/convex/_generated/dataModel";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  assignee: string;
  status: string;
  updatedAt: number;
  ticketId?: string;
  projectId?: string;
  milestone?: string;
  strategyNote?: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  pending: "Pending",
  "in-progress": "In Progress",
  review: "Review",
  blocked: "Blocked",
  done: "Done",
  recurring: "Recurring",
};

const STATUS_COLORS: Record<string, string> = {
  backlog: "var(--color-backlog)",
  pending: "var(--color-pending)",
  "in-progress": "var(--color-in-progress)",
  review: "var(--color-review)",
  blocked: "var(--color-error)",
  done: "var(--color-done)",
  recurring: "var(--color-recurring)",
};

const ASSIGNEE_CONFIG: Record<
  string,
  { bg: string; text: string; initial: string }
> = {
  Kuro: { bg: "var(--color-kuro-bg)", text: "#7d3d62", initial: "K" },
  snail: { bg: "var(--color-snail-bg)", text: "#2b5a82", initial: "S" },
};

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
}: TaskDetailModalProps) => {
  if (!isOpen || !task) return null;

  const assigneeStyle = ASSIGNEE_CONFIG[task.assignee] || ASSIGNEE_CONFIG.Kuro;
  const statusColor = STATUS_COLORS[task.status] || "var(--color-text-tertiary)";
  const statusLabel = STATUS_LABELS[task.status] || task.status;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 animate-scale-in border border-[var(--color-border-subtle)]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--color-border-subtle)]">
          <div className="flex-1 pr-4">
            {/* 티켓 ID와 상태 */}
            <div className="flex items-center gap-2 mb-2">
              {task.ticketId && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] font-mono font-semibold text-[var(--color-text-tertiary)]">
                  {task.ticketId}
                </span>
              )}
              <span
                className="text-[11px] px-2 py-0.5 rounded font-semibold"
                style={{ color: statusColor, backgroundColor: `${statusColor}15` }}
              >
                {statusLabel}
              </span>
            </div>
            {/* 제목 */}
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] leading-snug">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors p-1 hover:bg-[var(--color-bg-hover)] rounded-md"
          >
            <svg
              className="w-5 h-5"
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

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Description - 전체 표시 */}
          {task.description && (
            <div>
              <h3 className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Strategy Note */}
          {task.strategyNote && (
            <div>
              <h3 className="text-[12px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">
                Strategy Note
              </h3>
              <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">
                {task.strategyNote}
              </p>
            </div>
          )}

          {/* 메타 정보 그리드 */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--color-border-subtle)]">
            {/* Assignee */}
            <div>
              <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Assignee
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                <div
                  className="flex items-center justify-center w-[24px] h-[24px] rounded-md text-[11px] font-bold"
                  style={{
                    backgroundColor: assigneeStyle.bg,
                    color: assigneeStyle.text,
                  }}
                >
                  {assigneeStyle.initial}
                </div>
                <span className="text-[14px] font-medium text-[var(--color-text-primary)]">
                  {task.assignee}
                </span>
              </div>
            </div>

            {/* Project */}
            {task.projectId && (
              <div>
                <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Project
                </span>
                <p className="text-[14px] font-medium text-[var(--color-text-primary)] mt-1.5 capitalize">
                  {task.projectId}
                </p>
              </div>
            )}

            {/* Milestone */}
            {task.milestone && (
              <div>
                <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Milestone
                </span>
                <p className="text-[14px] font-medium mt-1.5" style={{ color: statusColor }}>
                  {task.milestone}
                </p>
              </div>
            )}

            {/* Ticket ID */}
            {task.ticketId && (
              <div>
                <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  Ticket ID
                </span>
                <p className="text-[14px] font-mono font-medium text-[var(--color-text-primary)] mt-1.5">
                  {task.ticketId}
                </p>
              </div>
            )}

            {/* Updated At */}
            <div className="col-span-2">
              <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Last Updated
              </span>
              <p className="text-[13px] text-[var(--color-text-secondary)] mt-1.5">
                {formatDate(task.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
