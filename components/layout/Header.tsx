"use client";

import React from "react";

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export const Header = ({ title, actions }: HeaderProps) => {
  return (
    <header className="bg-transparent sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center justify-between px-10 py-4 h-16">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-[13px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] px-2 py-1 rounded cursor-pointer transition-colors shrink-0 font-medium">
            Mission Control
          </span>
          <span className="text-[var(--color-text-tertiary)] opacity-50 shrink-0 text-xs">
            /
          </span>
          <h1 className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>
    </header>
  );
};
