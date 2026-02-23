import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = {
      primary:
        "bg-[var(--color-in-progress)] text-white hover:bg-[#0c6356] focus-visible:ring-[var(--color-in-progress)]",
      secondary:
        "bg-white border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] focus-visible:ring-[var(--color-border-subtle)]",
      ghost:
        "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] focus-visible:ring-[var(--color-border-subtle)]",
      danger:
        "bg-[var(--color-error)] text-white hover:bg-[#c53030] focus-visible:ring-[var(--color-error)]",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-5 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
