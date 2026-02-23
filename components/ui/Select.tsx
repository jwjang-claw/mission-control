import React from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", options, ...props }, ref) => {
    const id = React.useId();
    const baseStyles =
      "w-full px-3 py-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";

    const statusStyles = error
      ? "border-[var(--color-error)] focus:ring-[var(--color-error)] focus:ring-[var(--color-error-bg)]"
      : "border-[var(--color-border-default)] focus:ring-[var(--color-in-progress)] focus:ring-[rgba(15,123,108,0.1)]";

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--color-text-primary)]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`${baseStyles} ${statusStyles} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-xs text-[var(--color-error)]">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
