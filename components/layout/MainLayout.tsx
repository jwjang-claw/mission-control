"use client";

import React, { useCallback, useState } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarResizer } from "./SidebarResizer";
import { Header } from "./Header";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  fullWidth?: boolean; // padding 없이 꽉 찬 레이아웃
  showResizer?: boolean; // 사이드바 리사이저 표시 여부
}

export const MainLayout = ({
  children,
  title,
  subtitle,
  fullWidth,
  showResizer = true,
}: MainLayoutProps) => {
  const { width, setWidth } = useSidebarWidth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleWidthChange = useCallback(
    (delta: number) => {
      setWidth(width + delta);
    },
    [width, setWidth]
  );

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const headerActions = (
    <div className="flex items-center gap-1">
      <button className="px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors">
        Share
      </button>
      <button className="px-2 py-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <button className="px-2 py-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded transition-colors">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
      {/* 데스크톱: 고정 사이드바 + 리사이저 */}
      {!isMobile && (
        <>
          <Sidebar width={width} />
          {showResizer && <SidebarResizer onWidthChange={handleWidthChange} />}
        </>
      )}

      {/* 모바일: 햄버거 메뉴 버튼 */}
      {isMobile && (
        <button
          onClick={openSidebar}
          className="fixed top-4 left-4 z-30 p-2.5 bg-[var(--color-bg-secondary)] rounded-lg shadow-sm border border-[var(--color-border-subtle)] touch-target"
          aria-label="Open menu"
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
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* 모바일: 오버레이 + 드로어 사이드바 */}
      {isMobile && isSidebarOpen && (
        <>
          {/* 오버레이 배경 */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          {/* 드로어 사이드바 */}
          <div className="fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-out animate-slide-in-left">
            <Sidebar onClose={closeSidebar} />
          </div>
        </>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {title && <Header title={title} actions={headerActions} />}
        {fullWidth ? (
          // Full width mode - title area only, then full-width content
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Title area — Notion-style */}
            {title && (
              <div className="px-4 sm:px-8 md:px-8 pt-6 sm:pt-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl">
                    {title === "Task Board"
                      ? "📋"
                      : title === "Memory"
                        ? "📚"
                        : title === "Scheduled Tasks"
                          ? "📅"
                          : "📋"}
                  </span>
                </div>
                <h2 className="text-[24px] sm:text-[32px] font-bold text-[var(--color-text-primary)] tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[13px] sm:text-[14px] text-[var(--color-text-secondary)] mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            <div className="flex-1 overflow-hidden">{children}</div>
          </div>
        ) : (
          // Default mode - with padding and max-width
          <div className="flex-1 overflow-auto">
            {/* Title area — Notion-style narrow centered block */}
            {title && (
              <div className="max-w-[860px] px-4 sm:px-8 md:px-12 lg:px-16 pt-6 sm:pt-8 md:pt-10 pb-2">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4 group">
                    <span className="text-4xl sm:text-5xl group-hover:scale-105 transition-transform cursor-default select-none">
                      📋
                    </span>
                  </div>
                  <h2 className="text-[28px] sm:text-[36px] md:text-[40px] font-bold text-[var(--color-text-primary)] tracking-tight leading-[1.15]">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-[14px] sm:text-[15px] text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
            {/* Board content — centered with comfortable side margins */}
            <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-8 md:px-12 lg:px-16 pb-8 md:pb-12">
              {children}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
