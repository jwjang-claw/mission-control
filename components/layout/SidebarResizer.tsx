"use client";

import React, { useCallback, useEffect, useState } from "react";

interface SidebarResizerProps {
  onWidthChange: (delta: number) => void;
}

export function SidebarResizer({ onWidthChange }: SidebarResizerProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      // movementX를 사용하여 상대적 이동량 전달
      onWidthChange(e.movementX);
    },
    [isDragging, onWidthChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 키보드 접근성 지원
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 20 : 5;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onWidthChange(-step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onWidthChange(step);
      }
    },
    [onWidthChange]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // 드래그 중 텍스트 선택 방지
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="사이드바 크기 조절"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className={`
        w-1 h-full flex-shrink-0 cursor-col-resize
        transition-colors duration-150
        ${isDragging ? "bg-[var(--color-in-progress)]" : "hover:bg-[var(--color-border)]"}
      `}
      style={{
        backgroundColor: isDragging ? undefined : "transparent",
      }}
    />
  );
}
