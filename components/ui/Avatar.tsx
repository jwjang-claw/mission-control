import React from "react";
import Image from "next/image";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, size = "md", className = "" }, ref) => {
    const sizeStyles = {
      sm: "w-6 h-6 text-xs",
      md: "w-8 h-8 text-sm",
      lg: "w-10 h-10 text-base",
    };

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        ref={ref}
        className={`${sizeStyles[size]} rounded-full flex items-center justify-center font-medium ${className}`}
        style={{
          backgroundColor: "var(--color-bg-hover)",
          color: "var(--color-text-primary)",
        }}
      >
        {src ? (
          <Image
            src={src}
            alt={name}
            width={32}
            height={32}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
