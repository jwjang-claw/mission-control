"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MemoryEntry } from "@/lib/memory";

interface MemoryDetailProps {
  slug: string | null;
  onSelectNext?: () => void;
  onSelectPrev?: () => void;
}

function formatBytes(content: string): string {
  const bytes = new Blob([content]).size;
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).length;
}

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    // Bold text
    let processed = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Code
    processed = processed.replace(
      /`([^`]+)`/g,
      "<code class='bg-[var(--color-bg-secondary)] px-1.5 py-0.5 rounded text-xs font-mono'>$1</code>"
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

function SectionCard({
  section,
  index,
}: {
  section: { time: string; title: string; content: string };
  index: number;
}) {
  return (
    <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Time badge */}
          <div className="flex items-center gap-2 shrink-0">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {section.time && (
              <span className="text-xs font-mono text-[var(--color-text-tertiary)] bg-[var(--color-bg-primary)] px-2 py-1 rounded">
                {section.time}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
              {section.title}
            </h3>
            <div className="text-sm">
              <MarkdownContent content={section.content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MemoryDetail({
  slug,
  onSelectNext,
  onSelectPrev,
}: MemoryDetailProps) {
  const memory = useQuery(api.memories.getBySlug, slug ? { slug } : "skip");
  const seedMemories = useMutation(api.memories.seed);

  // Loading state
  if (slug && memory === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-3">📚</div>
          <p className="text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // No selection
  if (!slug || !memory) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            Select a Memory
          </h2>
          <p className="text-[var(--color-text-secondary)]">
            Choose an entry from the sidebar to view its contents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header - Navigation + Meta */}
      <div className="sticky top-0 bg-[var(--color-bg-primary)] z-10 px-6 py-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSelectPrev}
              className="p-2 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] transition-colors min-h-[44px] min-w-[44px] touch-active"
              title="Previous"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={onSelectNext}
              className="p-2 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-tertiary)] transition-colors min-h-[44px] min-w-[44px] touch-active"
              title="Next"
            >
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <span className="ml-3 text-sm font-medium text-[var(--color-text-primary)]">
              {memory.isLongTerm ? "Long-Term Memory" : memory.title}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
            <span>{formatBytes(memory.content)}</span>
            <span>{countWords(memory.content)} words</span>
            <span>Modified {formatRelativeTime(memory.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {memory.sections.length > 0 ? (
          memory.sections.map((section, idx) => (
            <SectionCard key={idx} section={section} index={idx} />
          ))
        ) : (
          <div className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-subtle)] p-6">
            <MarkdownContent content={memory.content} />
          </div>
        )}
      </div>
    </div>
  );
}
