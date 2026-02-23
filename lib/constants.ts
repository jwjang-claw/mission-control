// Assignee constants
export const ASSIGNEES = {
  KURO: "Kuro",
  SNAIL: "snail",
} as const;

export type Assignee = (typeof ASSIGNEES)[keyof typeof ASSIGNEES];

// Task status constants
export const TASK_STATUSES = {
  RECURRING: "recurring",
  BACKLOG: "backlog",
  IN_PROGRESS: "in-progress",
  REVIEW: "review",
  DONE: "done",
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

// Status order for columns
export const STATUS_ORDER: TaskStatus[] = [
  "recurring",
  "backlog",
  "in-progress",
  "review",
  "done",
];

// Priority constants
export const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type Priority = (typeof PRIORITIES)[keyof typeof PRIORITIES] | undefined;

// Status display configuration
export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; description: string }
> = {
  recurring: {
    label: "Recurring",
    color: "var(--color-recurring)",
    bgColor: "var(--color-recurring-bg)",
    description: "Recurring tasks",
  },
  backlog: {
    label: "Backlog",
    color: "var(--color-backlog)",
    bgColor: "var(--color-backlog-bg)",
    description: "Tasks to do later",
  },
  "in-progress": {
    label: "In Progress",
    color: "var(--color-in-progress)",
    bgColor: "var(--color-in-progress-bg)",
    description: "Currently working on",
  },
  review: {
    label: "Review",
    color: "var(--color-review)",
    bgColor: "var(--color-review-bg)",
    description: "Ready for review",
  },
  done: {
    label: "Done",
    color: "var(--color-done)",
    bgColor: "var(--color-done-bg)",
    description: "Completed tasks",
  },
};

// Assignee configuration
export const ASSIGNEE_CONFIG: Record<
  Assignee,
  { label: string; color: string; bgColor: string; initials: string }
> = {
  Kuro: {
    label: "Kuro",
    color: "var(--color-kuro)",
    bgColor: "var(--color-kuro-bg)",
    initials: "K",
  },
  snail: {
    label: "snail",
    color: "var(--color-snail)",
    bgColor: "var(--color-snail-bg)",
    initials: "S",
  },
};

// Priority configuration
export const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; value: number }
> = {
  high: {
    label: "High",
    color: "var(--color-priority-high)",
    bgColor: "var(--color-priority-high-bg)",
    value: 3,
  },
  medium: {
    label: "Medium",
    color: "var(--color-priority-medium)",
    bgColor: "var(--color-priority-medium-bg)",
    value: 2,
  },
  low: {
    label: "Low",
    color: "var(--color-priority-low)",
    bgColor: "var(--color-priority-low-bg)",
    value: 1,
  },
};
