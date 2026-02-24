"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { MemoryCard } from "@/components/MemoryCard";
import { fetchMemories, MemoryEntry } from "@/lib/memory";
import { useState, useMemo, useEffect } from "react";

export default function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch memories on mount
  useEffect(() => {
    fetchMemories()
      .then((data) => {
        setMemories(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load memories:", err);
        setError("Failed to load memories");
        setIsLoading(false);
      });
  }, []);

  // Filter memories based on search query
  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;

    const query = searchQuery.toLowerCase();
    return memories.filter((memory) => {
      // Search in title
      if (memory.title.toLowerCase().includes(query)) return true;

      // Search in sections
      return memory.sections.some(
        (section) =>
          section.title.toLowerCase().includes(query) ||
          section.content.toLowerCase().includes(query)
      );
    });
  }, [memories, searchQuery]);

  return (
    <MainLayout title="Memory" subtitle="Your journal and long-term memory">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]"
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
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-border-default)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Memory Stats */}
      <div className="mb-6 flex items-center gap-4 text-sm text-[var(--color-text-tertiary)]">
        <span>
          {filteredMemories.length}{" "}
          {filteredMemories.length === 1 ? "entry" : "entries"}
        </span>
        {searchQuery && (
          <span className="text-amber-500">
            {memories.length - filteredMemories.length} filtered out
          </span>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-pulse text-4xl mb-3">📚</div>
          <p className="text-[var(--color-text-secondary)]">
            Loading memories...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Memory List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-[var(--color-text-secondary)]">
                {searchQuery
                  ? "No memories found matching your search"
                  : "No memories yet"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-sm text-[var(--color-accent)] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredMemories.map((memory) => (
              <MemoryCard
                key={memory.slug}
                memory={memory}
                searchQuery={searchQuery}
              />
            ))
          )}
        </div>
      )}
    </MainLayout>
  );
}
