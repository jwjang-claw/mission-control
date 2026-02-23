"use client";

import React from "react";
import { Button } from "../ui/Button";
import { ASSIGNEES, type Assignee } from "@/lib/constants";

interface FilterBarProps {
  selectedAssignee: Assignee | "all";
  onAssigneeChange: (assignee: Assignee | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FilterBar = ({
  selectedAssignee,
  onAssigneeChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Assignee Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-text-secondary)]">
          Filter by:
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={selectedAssignee === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onAssigneeChange("all")}
          >
            All
          </Button>
          <Button
            variant={selectedAssignee === ASSIGNEES.KURO ? "primary" : "ghost"}
            size="sm"
            onClick={() => onAssigneeChange(ASSIGNEES.KURO)}
          >
            Kuro
          </Button>
          <Button
            variant={selectedAssignee === ASSIGNEES.SNAIL ? "primary" : "ghost"}
            size="sm"
            onClick={() => onAssigneeChange(ASSIGNEES.SNAIL)}
          >
            snail
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64 pl-9 pr-4 py-2 text-sm border border-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-in-progress)] focus:ring-[rgba(15,123,108,0.1)]"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};
