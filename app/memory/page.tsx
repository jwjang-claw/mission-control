"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { MemoryNav } from "@/components/MemoryNav";
import { MemoryDetail } from "@/components/MemoryDetail";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const MEMORY_NAV_WIDTH = 220;

export default function MemoryPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [showNav, setShowNav] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const memories = useQuery(api.memories.getAll);
  const seedMemories = useMutation(api.memories.seed);

  // Auto-seed if no memories
  useEffect(() => {
    if (memories && memories.length === 0) {
      seedMemories({}).catch(console.error);
    }
  }, [memories, seedMemories]);

  // Compute default slug (long-term memory first, then most recent daily)
  const defaultSlug = useMemo(() => {
    if (!memories || memories.length === 0) return null;
    const longTerm = memories.find((m) => m.isLongTerm);
    if (longTerm) return longTerm.slug;
    const dailyMemories = memories.filter((m) => !m.isLongTerm);
    return dailyMemories[0]?.slug || null;
  }, [memories]);

  // Use selectedSlug if set, otherwise fall back to defaultSlug
  const activeSlug = selectedSlug ?? defaultSlug;

  // Get ordered slugs for navigation
  const orderedSlugs = useMemo(() => {
    if (!memories) return [];
    const longTerm = memories.filter((m) => m.isLongTerm);
    const daily = memories.filter((m) => !m.isLongTerm);
    return [...longTerm, ...daily].map((m) => m.slug);
  }, [memories]);

  // Navigate to previous/next
  const handlePrev = () => {
    if (!activeSlug) return;
    const idx = orderedSlugs.indexOf(activeSlug);
    if (idx > 0) {
      setSelectedSlug(orderedSlugs[idx - 1]);
    }
  };

  const handleNext = () => {
    if (!activeSlug) return;
    const idx = orderedSlugs.indexOf(activeSlug);
    if (idx < orderedSlugs.length - 1) {
      setSelectedSlug(orderedSlugs[idx + 1]);
    }
  };

  // Handle memory selection - close nav on mobile after selection
  const handleSelectMemory = (slug: string) => {
    setSelectedSlug(slug);
    if (isMobile) {
      setShowNav(false);
    }
  };

  // Get selected memory title for mobile toggle button
  const selectedMemory = useMemo(() => {
    if (!memories || !activeSlug) return null;
    return memories.find((m) => m.slug === activeSlug);
  }, [memories, activeSlug]);

  return (
    <MainLayout
      title="Memory"
      subtitle="Your journal and knowledge base"
      fullWidth
      showResizer={false}
    >
      {/* 모바일: 네비게이션 토글 버튼 */}
      {isMobile && (
        <button
          onClick={() => setShowNav(!showNav)}
          className="flex items-center gap-2 p-3 bg-[var(--color-bg-secondary)] rounded-lg mb-2 mx-4 min-h-[44px] touch-active border border-[var(--color-border-subtle)]"
        >
          <span className="text-lg">📚</span>
          <span className="flex-1 text-left text-sm font-medium text-[var(--color-text-primary)] truncate">
            {selectedMemory?.isLongTerm
              ? "Long-Term Memory"
              : selectedMemory?.title || "Select Memory"}
          </span>
          <svg
            className={`w-4 h-4 text-[var(--color-text-tertiary)] transition-transform ${showNav ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      <div className="h-full flex flex-col md:flex-row px-4 md:px-6">
        {/* 네비게이션 */}
        <div
          className={`
            ${showNav || !isMobile ? "block" : "hidden"}
            md:block
            h-full border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]
            fixed md:relative inset-0 md:inset-auto z-40 md:z-auto
            md:w-[${MEMORY_NAV_WIDTH}px] md:flex-shrink-0
          `}
          style={{ width: isMobile ? "100%" : `${MEMORY_NAV_WIDTH}px` }}
        >
          {/* 모바일 닫기 버튼 */}
          {isMobile && showNav && (
            <div className="flex items-center justify-between p-3 border-b border-[var(--color-border-subtle)]">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                Memories
              </span>
              <button
                onClick={() => setShowNav(false)}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors touch-target"
                aria-label="Close navigation"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
          <div className="h-full flex flex-col">
            {/* Navigation */}
            <div className="flex-1 overflow-hidden">
              <MemoryNav
                selectedSlug={activeSlug}
                onSelect={handleSelectMemory}
              />
            </div>
          </div>
        </div>

        {/* 오버레이 (모바일에서만) */}
        {isMobile && showNav && (
          <div
            className="fixed inset-0 bg-black/50 z-30 animate-fade-in"
            onClick={() => setShowNav(false)}
            aria-hidden="true"
          />
        )}

        {/* 상세 */}
        <div className="flex-1 h-full overflow-hidden">
          <MemoryDetail
            slug={activeSlug}
            onSelectPrev={handlePrev}
            onSelectNext={handleNext}
          />
        </div>
      </div>
    </MainLayout>
  );
}
