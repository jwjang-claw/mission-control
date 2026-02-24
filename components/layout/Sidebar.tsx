"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR } from "@/lib/constants";

const navItems = [
  { href: "/tasks", label: "Task Board", icon: "📋" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/memory", label: "Memory", icon: "📚" },
  { href: "/dashboard", label: "Dashboard", icon: "📊", disabled: true },
  { href: "/settings", label: "Settings", icon: "⚙️", disabled: true },
];

interface SidebarProps {
  width?: number;
  onClose?: () => void; // 모바일용 닫기 콜백
}

export const Sidebar = ({
  width = SIDEBAR.DEFAULT_WIDTH,
  onClose,
}: SidebarProps) => {
  const pathname = usePathname();

  const handleNavClick = () => {
    // 페이지 이동 후 사이드바 닫기 (모바일)
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className="h-screen bg-[var(--color-bg-secondary)] flex flex-col select-none border-r border-[var(--color-border-subtle)] p-3 relative"
      style={{ width: `${width}px` }}
    >
      {/* 모바일 닫기 버튼 */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors touch-target z-10"
          aria-label="Close menu"
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
      )}

      {/* Workspace Selector */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors group touch-target">
          <div className="w-5 h-5 rounded-md bg-[var(--color-in-progress)] flex items-center justify-center text-[10px] text-white font-bold flex-shrink-0">
            M
          </div>
          <span className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">
            Mission Control
          </span>
          {!onClose && (
            <svg
              className="w-3 h-3 text-[var(--color-text-tertiary)] ml-auto flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4 4 4-4"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto py-1">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.disabled;

            return (
              <li key={item.href} className="list-none">
                {isDisabled ? (
                  <span className="flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] text-[var(--color-text-tertiary)] cursor-not-allowed opacity-40 min-h-[44px]">
                    <span className="w-5 text-center text-sm leading-none">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] transition-colors min-h-[44px] touch-active ${
                      isActive
                        ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] font-medium"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span className="w-5 text-center text-sm leading-none">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </div>

        {/* Favorites section */}
        <div className="mt-8">
          <p className="px-3 mb-2 text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-[0.08em]">
            Favorites
          </p>
          <ul className="space-y-1 text-[13px] text-[var(--color-text-secondary)]">
            <li className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors min-h-[44px] touch-active">
              <span className="w-5 text-center text-xs leading-none">⭐</span>
              <span>Project Alpha</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors opacity-40 min-h-[44px] touch-active">
              <span className="w-5 text-center text-xs leading-none">⭐</span>
              <span>Roadmap 2024</span>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer / User Profile */}
      <div className="px-4 py-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors touch-target">
          <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center text-[10px] text-orange-700 font-bold flex-shrink-0">
            J
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
              User Name
            </p>
          </div>
          {!onClose && (
            <svg
              className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          )}
        </div>
      </div>
    </aside>
  );
};
