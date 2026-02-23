"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FormEvent, useState } from "react";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";

type Task = {
  _id: Id<"tasks">;
  title: string;
  assignee: string;
  status: string;
  updatedAt: number;
};

const ASSIGNEES = ["Kuro", "snail"] as const;

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

const COLUMNS = [
  { id: "pending", title: "Pending", color: "var(--color-backlog)", bgColor: "var(--color-backlog-bg)" },
  { id: "in-progress", title: "In Progress", color: "var(--color-in-progress)", bgColor: "var(--color-in-progress-bg)" },
  { id: "blocked", title: "Blocked", color: "var(--color-error)", bgColor: "var(--color-error-bg)" },
  { id: "done", title: "Done", color: "var(--color-done)", bgColor: "var(--color-done-bg)" },
] as const;

export default function TaskBoard() {
  const tasks = (useQuery(api.tasks.list) as Task[] | undefined) || [];
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Kuro");
  const [newTaskStatus, setNewTaskStatus] = useState("pending");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await createTask({
      title: newTaskTitle,
      assignee: newTaskAssignee,
      status: newTaskStatus,
    });

    setNewTaskTitle("");
    setNewTaskAssignee("Kuro");
    setNewTaskStatus("pending");
  };

  const handleStatusChange = async (taskId: Id<"tasks">, newStatus: string) => {
    await updateTask({ id: taskId, status: newStatus });
  };

  const handleDelete = async (taskId: Id<"tasks">) => {
    await deleteTask({ id: taskId });
  };

  const inProgressTasks = tasks.filter((t: Task) => t.status === "in-progress");
  const doneTasks = tasks.filter((t: Task) => t.status === "done");

  const stats = {
    total: tasks.length,
    inProgress: inProgressTasks.length,
    done: doneTasks.length,
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header with Stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-6">
          Task Board
        </h1>

        {/* Stats Bar - Notion style */}
        <div className="inline-flex items-center gap-6 px-6 py-4 bg-white rounded-lg border border-[var(--color-border-subtle)] shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
              {stats.total}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              tasks
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--color-border-subtle)]" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold" style={{ color: "var(--color-in-progress)" }}>
              {stats.inProgress}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              in progress
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--color-border-subtle)]" />
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold" style={{ color: "var(--color-done)" }}>
              {stats.done}
            </span>
            <span className="text-sm text-[var(--color-text-secondary)]">
              completed
            </span>
          </div>
        </div>
      </div>

      {/* New Task Form - Compact Notion style */}
      <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white rounded-lg border border-[var(--color-border-subtle)] shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task..."
              className="w-full px-4 py-2.5 rounded-md border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-in-progress)] focus:ring-1 focus:ring-[var(--color-in-progress)] transition-all"
            />
          </div>
          <div className="w-36">
            <Select
              label=""
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value)}
              options={ASSIGNEES.map((a) => ({ value: a, label: a }))}
            />
          </div>
          <div className="w-36">
            <Select
              label=""
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
          <Button
            type="submit"
            className="px-4 py-2.5 text-sm font-medium rounded-md bg-[var(--color-in-progress)] text-white hover:bg-[#0c6356] transition-colors"
          >
            Add
          </Button>
        </div>
      </form>

      {/* Board Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-0">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t: Task) => t.status === col.id);
          return (
            <Column
              key={col.id}
              title={col.title}
              count={colTasks.length}
              color={col.color}
              bgColor={col.bgColor}
              tasks={colTasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          );
        })}
      </div>
    </div>
  );
}

function Column({
  title,
  count,
  color,
  bgColor,
  tasks,
  onStatusChange,
  onDelete,
}: {
  title: string;
  count: number;
  color: string;
  bgColor: string;
  tasks: Task[];
  onStatusChange: (id: Id<"tasks">, status: string) => Promise<void>;
  onDelete: (id: Id<"tasks">) => Promise<void>;
}) {
  return (
    <div className="flex flex-col bg-white rounded-lg border border-[var(--color-border-subtle)] shadow-sm overflow-hidden h-full">
      {/* Header - Compact Notion style */}
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              {title}
            </h3>
          </div>
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: bgColor, color }}
          >
            {count}
          </span>
        </div>
      </div>

      {/* Tasks - More compact spacing */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-sm text-[var(--color-text-tertiary)]">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (id: Id<"tasks">, status: string) => Promise<void>;
  onDelete: (id: Id<"tasks">) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const assigneeColors: Record<string, { bg: string; text: string; initial: string }> = {
    Kuro: { bg: "var(--color-kuro-bg)", text: "var(--color-text-primary)", initial: "K" },
    snail: { bg: "var(--color-snail-bg)", text: "var(--color-text-primary)", initial: "S" },
  };

  const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "var(--color-backlog-bg)", color: "var(--color-backlog)", label: "Pending" },
    "in-progress": { bg: "var(--color-in-progress-bg)", color: "var(--color-in-progress)", label: "In Progress" },
    done: { bg: "var(--color-done-bg)", color: "var(--color-done)", label: "Done" },
    blocked: { bg: "var(--color-error-bg)", color: "var(--color-error)", label: "Blocked" },
  };

  const currentStyle = statusStyles[task.status] || statusStyles.pending;
  const assigneeStyle = assigneeColors[task.assignee] || assigneeColors.Kuro;

  return (
    <div
      className={`group p-4 rounded-md border border-[var(--color-border-subtle)] bg-white transition-all cursor-pointer ${
        isExpanded
          ? "border-[var(--color-border-default)] shadow-sm"
          : "hover:border-[var(--color-border-default)]"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Title with delete button */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-sm font-medium text-[var(--color-text-primary)] leading-snug flex-1">
          {task.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] transition-colors p-1 -m-1 opacity-0 group-hover:opacity-100"
          aria-label="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Badges - Compact inline */}
      <div className="flex items-center gap-2 mb-2">
        {/* Status Badge */}
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          style={{ backgroundColor: currentStyle.bg, color: currentStyle.color }}
        >
          <span className="w-1 h-1 rounded-full mr-1.5" style={{ backgroundColor: currentStyle.color }} />
          {currentStyle.label}
        </span>

        {/* Assignee Avatar - Notion style */}
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-medium"
          style={{ backgroundColor: assigneeStyle.bg, color: assigneeStyle.text }}
        >
          {assigneeStyle.initial}
        </span>
      </div>

      {/* Quick Status Change - Expandable */}
      {isExpanded && (
        <div className="pt-3 mt-3 border-t border-[var(--color-border-subtle)]">
          <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Move to:</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const optStyle = statusStyles[opt.value] || statusStyles.pending;
              return (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task._id, opt.value);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    task.status === opt.value
                      ? "ring-1 ring-[var(--color-in-progress)] ring-offset-1"
                      : "hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: task.status === opt.value ? undefined : optStyle.bg,
                    color: task.status === opt.value ? "var(--color-in-progress)" : optStyle.color,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
