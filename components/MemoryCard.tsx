"use client";

import React, { useState } from "react";
import { MemoryEntry, MemorySection } from "@/lib/memory";

interface MemoryCardProps {
  memory: MemoryEntry;
  searchQuery?: string;
}

function highlightText(text: string, query?: string): React.ReactNode {
  if (!query || query.trim() === "") return text;

  const parts = text.split(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-amber-500/30 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function MemoryCard({ memory, searchQuery }: MemoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border-subtle)] overflow-hidden hover:border-[var(--color-border-default)] transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {memory.isLongTerm ? (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-400 rounded-full">
              장기 기억
            </span>
          ) : (
            <span className="text-xs text-[var(--color-text-tertiary)]">
              {formatDate(memory.date)}
            </span>
          )}
          <span className="text-xs text-[var(--color-text-tertiary)]">
            {formatTime(memory.date)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
          {highlightText(memory.title, searchQuery)}
        </h3>

        {/* Sections Preview */}
        {!isExpanded && memory.sections.length > 0 && (
          <div className="space-y-2">
            {memory.sections.slice(0, 2).map((section, idx) => (
              <div key={idx} className="text-sm">
                {section.time && (
                  <span className="text-[var(--color-text-tertiary)] mr-2 font-mono">
                    {section.time}
                  </span>
                )}
                <span className="text-[var(--color-text-secondary)] font-medium">
                  {highlightText(section.title, searchQuery)}
                </span>
              </div>
            ))}
            {memory.sections.length > 2 && (
              <p className="text-xs text-[var(--color-text-tertiary)]">
                +{memory.sections.length - 2} more sections
              </p>
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]/30">
          {memory.sections.map((section, idx) => (
            <MemorySectionView
              key={idx}
              section={section}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* Expand/Collapse Indicator */}
      <div className="px-5 py-3 border-t border-[var(--color-border-subtle)] flex items-center justify-center text-xs text-[var(--color-text-tertiary)]">
        <span>{isExpanded ? "▲ Collapse" : "▼ Expand"}</span>
      </div>
    </div>
  );
}

interface MemorySectionViewProps {
  section: MemorySection;
  searchQuery?: string;
}

function MemorySectionView({ section, searchQuery }: MemorySectionViewProps) {
  return (
    <div className="p-5 border-b border-[var(--color-border-subtle)] last:border-b-0">
      <div className="flex items-start gap-3 mb-2">
        {section.time && (
          <span className="text-xs font-mono text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded shrink-0">
            {section.time}
          </span>
        )}
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {highlightText(section.title, searchQuery)}
        </h4>
      </div>

      <div className="pl-0 text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
        <MarkdownContent content={section.content} searchQuery={searchQuery} />
      </div>
    </div>
  );
}

interface MarkdownContentProps {
  content: string;
  searchQuery?: string;
}

function MarkdownContent({ content, searchQuery }: MarkdownContentProps) {
  // Simple markdown rendering
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
          <span className="text-[var(--color-text-tertiary)]">•</span>
          <span
            dangerouslySetInnerHTML={{
              __html: highlightTextHtml(processed.slice(2), searchQuery),
            }}
          />
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.+)/);
      if (match) {
        elements.push(
          <div key={idx} className="flex items-start gap-2 my-1">
            <span className="text-[var(--color-text-tertiary)] shrink-0">
              {match[1]}.
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: highlightTextHtml(match[2], searchQuery),
              }}
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
          dangerouslySetInnerHTML={{
            __html: highlightTextHtml(processed, searchQuery),
          }}
        />
      );
    }
  });

  return <>{elements}</>;
}

function highlightTextHtml(html: string, query?: string): string {
  if (!query || query.trim() === "") return html;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return html.replace(
    regex,
    '<mark class="bg-amber-500/30 text-inherit rounded px-0.5">$1</mark>'
  );
}

export default MemoryCard;
