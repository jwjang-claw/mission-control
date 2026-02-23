"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const MainLayout = ({ children, title, subtitle }: MainLayoutProps) => {
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
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {title && <Header title={title} actions={headerActions} />}
        <div className="flex-1 overflow-auto">
          {/* Title area — Notion-style narrow centered block */}
          {title && (
            <div className="max-w-[860px] px-16 pt-10 pb-2">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4 group">
                  <span className="text-5xl group-hover:scale-105 transition-transform cursor-default select-none">
                    📋
                  </span>
                </div>
                <h2 className="text-[40px] font-bold text-[var(--color-text-primary)] tracking-tight leading-[1.15]">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[15px] text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Board content — centered with comfortable side margins */}
          <div className="max-w-[1100px] mx-auto w-full px-16 pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
