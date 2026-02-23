import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, color, bgColor, className = "" }, ref) => {
    const defaultColor = "var(--color-text-secondary)";
    const defaultBgColor = "var(--color-bg-secondary)";

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${className}`}
        style={{
          color: color || defaultColor,
          backgroundColor: bgColor || defaultBgColor,
        }}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
