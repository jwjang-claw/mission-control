"use client";

import React, { useEffect, useCallback } from "react";
import { cronToHumanReadable } from "@/lib/cron";

interface CronDetailModalProps {
  task: {
    _id: string;
    title: string;
    fullTitle?: string;
    description?: string;
    recurrence?: string;
    scheduledAt?: number;
    status?: string;
    eventType?: string;
    ticketId?: string;
    prompt?: string;
  } | null;
  onClose: () => void;
}

// 포맷팅 함수들
function formatTimestamp(timestamp?: number): string {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRecurrence(recurrence?: string): string {
  if (!recurrence) return "Once";
  return cronToHumanReadable(recurrence);
}

function getStatusColor(status?: string): string {
  switch (status) {
    case "ok":
      return "text-[var(--color-success)]";
    case "error":
      return "text-[var(--color-error)]";
    default:
      return "text-[var(--color-text-secondary)]";
  }
}

function getStatusLabel(status?: string): string {
  switch (status) {
    case "ok":
      return "Running";
    case "error":
      return "Error";
    default:
      return status || "Unknown";
  }
}

// 프롬프트 내용을 간단한 마크다운 스타일로 렌더링
function PromptContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    // Bold text
    let processed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Code
    processed = processed.replace(
      /\`([^\`]+)\`/g,
      "<code class='bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded text-xs font-mono'>$1</code>"
    );

    // List items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 my-1">
          <span className="text-[var(--color-text-tertiary)] mt-1">•</span>
          <span
            className="text-[var(--color-text-secondary)] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processed.slice(2) }}
          />
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.+)/);
      if (match) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1">
            <span className="text-[var(--color-text-tertiary)] shrink-0 mt-0.5">
              {match[1]}.
            </span>
            <span
              className="text-[var(--color-text-secondary)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: match[2] }}
            />
          </div>
        );
      }
    } else if (line.trim() === "") {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(
        <p
          key={idx}
          className="text-[var(--color-text-secondary)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    }
  });

  return <>{elements}</>;
}

export function CronDetailModal({ task, onClose }: CronDetailModalProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // 배경 클릭으로 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-bg-primary)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Cron Job Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] transition-colors min-h-[44px] min-w-[44px] touch-active"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
              {task.fullTitle || task.title}
            </h3>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {task.ticketId?.replace("cron:", "") || task._id}
            </p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              label="Schedule"
              value={
                task.description ? cronToHumanReadable(task.description) : "-"
              }
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <InfoCard
              label="Next Run"
              value={formatTimestamp(task.scheduledAt)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />
            <InfoCard
              label="Recurrence"
              value={formatRecurrence(task.recurrence)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            />
            <InfoCard
              label="Status"
              value={getStatusLabel(task.status)}
              valueClassName={getStatusColor(task.status)}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* Event Type */}
          {task.eventType && (
            <div className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-subtle)] px-4 py-2">
              <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide">
                Event Type: {task.eventType}
              </span>
            </div>
          )}

          {/* Prompt Section */}
          {task.prompt && (
            <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-tertiary)]">
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-[var(--color-text-tertiary)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Prompt
                </h4>
              </div>
              <div className="p-5">
                <div className="text-sm">
                  <PromptContent content={task.prompt} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors min-h-[44px] touch-active"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Info Card 컴포넌트
function InfoCard({
  label,
  value,
  valueClassName,
  icon,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-subtle)] p-3">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`text-sm font-medium ${valueClassName || "text-[var(--color-text-primary)]"}`}
      >
        {value}
      </p>
    </div>
  );
}
