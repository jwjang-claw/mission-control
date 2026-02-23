"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/tasks", label: "Task Board", icon: "📋" },
  { href: "/dashboard", label: "Dashboard", icon: "📊", disabled: true },
  { href: "/settings", label: "Settings", icon: "⚙️", disabled: true },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-subtle)] flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Mission Control
        </h1>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
          Task Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isDisabled = item.disabled;

            return (
              <li key={item.href}>
                {isDisabled ? (
                  <span className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--color-text-tertiary)] cursor-not-allowed opacity-50">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] font-medium"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border-subtle)]">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Built with Next.js + Convex
        </p>
      </div>
    </aside>
  );
};
