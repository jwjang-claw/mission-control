"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface MemoryNavProps {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

function getMonthName(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === yesterday.getTime();
}

function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  return date >= startOfWeek && date <= endOfWeek;
}

function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function MemoryNav({ selectedSlug, onSelect }: MemoryNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const memories = useQuery(api.memories.getAll);

  // Filter memories by search query
  const filteredMemories = useMemo(() => {
    if (!memories) return [];
    if (!searchQuery.trim()) return memories;

    const query = searchQuery.toLowerCase();
    return memories.filter((m) => {
      // Search in title
      if (m.title.toLowerCase().includes(query)) return true;
      // Search in content
      if (m.content.toLowerCase().includes(query)) return true;
      // Search in sections
      return m.sections.some(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.content.toLowerCase().includes(query)
      );
    });
  }, [memories, searchQuery]);

  if (!memories) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-[var(--color-border-subtle)]">
          <div className="animate-pulse h-8 bg-[var(--color-bg-hover)] rounded-lg"></div>
        </div>
        <div className="p-4 flex-1">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-[var(--color-bg-hover)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--color-bg-hover)] rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Separate long-term and daily memories
  const longTermMemory = filteredMemories.find((m) => m.isLongTerm);
  const dailyMemories = filteredMemories.filter((m) => !m.isLongTerm);

  // Group daily memories by time period
  const yesterdayMemories = dailyMemories.filter((m) =>
    isYesterday(new Date(m.date))
  );
  const thisWeekMemories = dailyMemories.filter(
    (m) => isThisWeek(new Date(m.date)) && !isYesterday(new Date(m.date))
  );
  const thisMonthMemories = dailyMemories.filter(
    (m) =>
      isThisMonth(new Date(m.date)) &&
      !isThisWeek(new Date(m.date)) &&
      !isYesterday(new Date(m.date))
  );

  // Group remaining by month
  const olderMemories = dailyMemories.filter(
    (m) =>
      !isThisMonth(new Date(m.date)) &&
      !isThisWeek(new Date(m.date)) &&
      !isYesterday(new Date(m.date))
  );

  const monthGroups: { [key: string]: typeof dailyMemories } = {};
  olderMemories.forEach((m) => {
    const monthKey = getMonthName(new Date(m.date));
    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = [];
    }
    monthGroups[monthKey].push(m);
  });

  // Count words in content
  const countWords = (content: string): number => {
    return content.trim().split(/\s+/).length;
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-tertiary)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search memory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "36px" }}
            className="w-full pr-8 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] rounded-lg text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-default)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            >
              <svg
                className="w-3 h-3"
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
          )}
        </div>
        {searchQuery && (
          <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1.5">
            {filteredMemories.length} result
            {filteredMemories.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Long-Term Memory Section */}
        {longTermMemory && (
          <div className="mb-4">
            <p className="px-4 mb-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em]">
              Long-Term Memory
            </p>
            <button
              onClick={() => onSelect(longTermMemory.slug)}
              className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors min-h-[44px] touch-active ${
                selectedSlug === longTermMemory.slug
                  ? "bg-[var(--color-bg-hover)]"
                  : "hover:bg-[var(--color-bg-hover)]/50"
              }`}
            >
              <span className="text-lg">🧠</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
                  Long-Term Memory
                </p>
                <p className="text-[11px] text-[var(--color-text-tertiary)]">
                  {countWords(longTermMemory.content)} words ·{" "}
                  {formatRelativeTime(longTermMemory.updatedAt.toString())}
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Yesterday */}
        {yesterdayMemories.length > 0 && (
          <div className="mb-3">
            <p className="px-4 mb-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em]">
              Yesterday
            </p>
            {yesterdayMemories.map((memory) => (
              <button
                key={memory._id}
                onClick={() => onSelect(memory.slug)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors min-h-[44px] touch-active ${
                  selectedSlug === memory.slug
                    ? "bg-[var(--color-bg-hover)]"
                    : "hover:bg-[var(--color-bg-hover)]/50"
                }`}
              >
                <span className="text-sm">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--color-text-secondary)] truncate">
                    {memory.title}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {memory.sections.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* This Week */}
        {thisWeekMemories.length > 0 && (
          <div className="mb-3">
            <p className="px-4 mb-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em]">
              This Week
            </p>
            {thisWeekMemories.map((memory) => (
              <button
                key={memory._id}
                onClick={() => onSelect(memory.slug)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors min-h-[44px] touch-active ${
                  selectedSlug === memory.slug
                    ? "bg-[var(--color-bg-hover)]"
                    : "hover:bg-[var(--color-bg-hover)]/50"
                }`}
              >
                <span className="text-sm">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--color-text-secondary)] truncate">
                    {memory.title}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {memory.sections.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* This Month */}
        {thisMonthMemories.length > 0 && (
          <div className="mb-3">
            <p className="px-4 mb-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em]">
              This Month
            </p>
            {thisMonthMemories.map((memory) => (
              <button
                key={memory._id}
                onClick={() => onSelect(memory.slug)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors min-h-[44px] touch-active ${
                  selectedSlug === memory.slug
                    ? "bg-[var(--color-bg-hover)]"
                    : "hover:bg-[var(--color-bg-hover)]/50"
                }`}
              >
                <span className="text-sm">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--color-text-secondary)] truncate">
                    {memory.title}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {memory.sections.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Older months */}
        {Object.entries(monthGroups).map(([month, monthMemories]) => (
          <div key={month} className="mb-3">
            <p className="px-4 mb-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em]">
              {month}
            </p>
            {monthMemories.map((memory) => (
              <button
                key={memory._id}
                onClick={() => onSelect(memory.slug)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors min-h-[44px] touch-active ${
                  selectedSlug === memory.slug
                    ? "bg-[var(--color-bg-hover)]"
                    : "hover:bg-[var(--color-bg-hover)]/50"
                }`}
              >
                <span className="text-sm">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[var(--color-text-secondary)] truncate">
                    {memory.title}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  {memory.sections.length}
                </span>
              </button>
            ))}
          </div>
        ))}

        {/* No results */}
        {searchQuery && filteredMemories.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              No results for &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Empty state */}
        {!searchQuery && memories.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              No memories yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
