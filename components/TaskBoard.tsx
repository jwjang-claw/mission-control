"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FormEvent, useState } from "react";

type Task = {
  _id: Id<"tasks">;
  title: string;
  description?: string; // 상세 계획/본문
  assignee: string;
  status: string;
  updatedAt: number;
  // Task Manager 연동 필드
  ticketId?: string;
  projectId?: string;
  milestone?: string;
  strategyNote?: string;
};

const PROJECTS = [
  { id: "all", label: "All Projects" },
  { id: "indieloca", label: "IndieLoca" },
  { id: "metta-sutta", label: "Metta Sutta" },
] as const;

const COLUMNS = [
  {
    id: "backlog",
    title: "Backlog",
    color: "var(--color-backlog)",
    bgColor: "var(--color-backlog-bg)",
  },
  {
    id: "pending",
    title: "Pending",
    color: "var(--color-pending)",
    bgColor: "var(--color-pending-bg)",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "var(--color-in-progress)",
    bgColor: "var(--color-in-progress-bg)",
  },
  {
    id: "review",
    title: "Review",
    color: "var(--color-review)",
    bgColor: "var(--color-review-bg)",
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "var(--color-error)",
    bgColor: "var(--color-error-bg)",
  },
  {
    id: "done",
    title: "Done",
    color: "var(--color-done)",
    bgColor: "var(--color-done-bg)",
  },
  {
    id: "recurring",
    title: "Recurring",
    color: "var(--color-recurring)",
    bgColor: "var(--color-recurring-bg)",
  },
] as const;

export default function TaskBoard() {
  const tasks = (useQuery(api.tasks.list) as Task[] | undefined) || [];
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const [selectedProject, setSelectedProject] = useState<string>("all");

  // 프로젝트 필터링
  const filteredTasks =
    selectedProject === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === selectedProject);

  const handleStatusChange = async (taskId: Id<"tasks">, newStatus: string) => {
    await updateTask({ id: taskId, status: newStatus });
  };

  const handleDelete = async (taskId: Id<"tasks">) => {
    await deleteTask({ id: taskId });
  };

  const handleCreateTask = async (title: string, status: string) => {
    await createTask({
      title,
      assignee: "Kuro",
      status,
    });
  };

  const stats = {
    total: filteredTasks.length,
    inProgress: filteredTasks.filter((t) => t.status === "in-progress").length,
    done: filteredTasks.filter((t) => t.status === "done").length,
  };

  return (
    <div className="flex flex-col gap-12 animate-fade-in">
      {/* Stats row — Notion-style subtle metadata */}
      <div className="flex items-center gap-6 text-sm text-[var(--color-text-tertiary)]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            {stats.total}
          </span>
          <span className="text-[13px]">tasks</span>
        </div>
        <div className="w-px h-3.5 bg-[var(--color-border-default)]" />
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--color-in-progress)]">
            {stats.inProgress}
          </span>
          <span className="text-[13px]">in progress</span>
        </div>
        <div className="w-px h-3.5 bg-[var(--color-border-default)]" />
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--color-text-secondary)]">
            {stats.done}
          </span>
          <span className="text-[13px]">completed</span>
        </div>

        {/* 프로젝트 필터 */}
        <div className="ml-auto">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-[12px] px-3 py-1.5 rounded-lg border border-[var(--color-border-subtle)] bg-white text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-in-progress)] cursor-pointer"
          >
            {PROJECTS.map((project) => (
              <option key={project.id} value={project.id}>
                {project.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Board Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          return (
            <Column
              key={col.id}
              column={col}
              tasks={colTasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onCreateTask={handleCreateTask}
            />
          );
        })}
      </div>
    </div>
  );
}

function Column({
  column,
  tasks,
  onStatusChange,
  onDelete,
  onCreateTask,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  onStatusChange: (id: Id<"tasks">, status: string) => Promise<void>;
  onDelete: (id: Id<"tasks">) => Promise<void>;
  onCreateTask: (title: string, status: string) => Promise<void>;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (newTitle.trim()) {
      await onCreateTask(newTitle.trim(), column.id);
      setNewTitle("");
      setIsAdding(false);
    } else {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col min-w-0 group/column">
      {/* Column Header — Notion-style: dot + label + count, with bottom divider */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-[13px] font-semibold text-[var(--color-text-secondary)] tracking-tight whitespace-nowrap">
            {column.title}
          </h3>
          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ color: column.color, backgroundColor: column.bgColor }}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] opacity-0 group-hover/column:opacity-100 transition-all p-1 rounded hover:bg-[var(--color-bg-hover)]"
          title={`Add to ${column.title}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}

        {/* Empty state */}
        {tasks.length === 0 && !isAdding && (
          <div className="py-8 text-center text-[12px] text-[var(--color-text-tertiary)]">
            No tasks
          </div>
        )}

        {/* Inline New Task Input */}
        {isAdding ? (
          <div className="bg-white rounded-xl border border-[var(--color-border-default)] shadow-sm p-6 animate-scale-in">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              onBlur={handleSubmit}
              placeholder="What needs to be done?"
              className="w-full bg-transparent border-none p-0 text-[14px] focus:ring-0 placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)]"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-2.5 px-3 py-3 text-[13px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)] rounded-lg transition-colors group/new mt-1"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>New</span>
          </button>
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
  const [showMenu, setShowMenu] = useState(false);

  const assigneeColors: Record<
    string,
    { bg: string; text: string; initial: string }
  > = {
    Kuro: { bg: "var(--color-kuro-bg)", text: "#7d3d62", initial: "K" },
    snail: { bg: "var(--color-snail-bg)", text: "#2b5a82", initial: "S" },
  };

  const assigneeStyle = assigneeColors[task.assignee] || assigneeColors.Kuro;

  return (
    <div
      className="group relative bg-white rounded-xl border border-[var(--color-border-subtle)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-[var(--color-border-default)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-150 p-6 cursor-pointer"
      onClick={() => setShowMenu(!showMenu)}
    >
      <div className="flex flex-col gap-4">
        {/* 티켓 ID와 마일스톤 */}
        {(task.ticketId || task.milestone) && (
          <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
            {task.ticketId && (
              <span className="px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] font-mono font-semibold">
                {task.ticketId}
              </span>
            )}
            {task.milestone && (
              <span className="text-[var(--color-in-progress)] font-medium">
                {task.milestone}
              </span>
            )}
          </div>
        )}

        <h4 className="text-[14px] font-medium text-[var(--color-text-primary)] leading-[1.6] line-clamp-3">
          {task.title}
        </h4>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-[22px] h-[22px] rounded-md text-[10px] font-bold select-none flex-shrink-0"
              style={{
                backgroundColor: assigneeStyle.bg,
                color: assigneeStyle.text,
              }}
            >
              {assigneeStyle.initial}
            </div>
            <span className="text-[12px] text-[var(--color-text-tertiary)] font-medium">
              {task.assignee}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] rounded-md hover:bg-[var(--color-error-bg)] transition-colors"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] space-y-3">
          {/* 상세 설명 */}
          {task.description && (
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          )}

          {/* 전략 메모 */}
          {task.strategyNote && (
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
              {task.strategyNote}
            </p>
          )}

          {/* 메타 정보 */}
          <div className="flex flex-col gap-1.5">
            {task.projectId && (
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-[var(--color-text-tertiary)] w-16">
                  Project
                </span>
                <span className="font-medium text-[var(--color-text-primary)] capitalize">
                  {task.projectId}
                </span>
              </div>
            )}
            {task.milestone && (
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-[var(--color-text-tertiary)] w-16">
                  Milestone
                </span>
                <span className="font-medium text-[var(--color-in-progress)]">
                  {task.milestone}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-[var(--color-text-tertiary)] w-16">
                Assignee
              </span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {task.assignee}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
