"use client";

import React from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header = ({ title, subtitle, actions }: HeaderProps) => {
  return (
    <header className="border-b border-[var(--color-border-subtle)] bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};
