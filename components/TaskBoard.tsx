"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { FormEvent, useState } from "react";

type Task = {
  _id: Id<"tasks">;
  title: string;
  assignee: string;
  status: string;
  updatedAt: number;
};

const ASSIGNEES = ["Kuro", "snail"] as const;

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
    if (confirm("Abandon this quest?")) {
      await deleteTask({ id: taskId });
    }
  };

  const inProgressTasks = tasks.filter((t: Task) => t.status === "in-progress");
  const doneTasks = tasks.filter((t: Task) => t.status === "done");
  const pendingBlockedTasks = tasks.filter(
    (t: Task) => t.status === "pending" || t.status === "blocked"
  );

  return (
    <div className="min-h-screen p-6 md:p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-12 animate-fade-in">
          <div className="parchment-card rounded-lg p-8 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-bronze flex items-center justify-center shadow-lg border-4 border-bronze/30">
                <svg className="w-10 h-10 text-wood" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L9 9H2l6 4-2 7 6-4 6 4-2-7 6-4h-7z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-gold ink-text mb-2">
                  Quest Board
                </h1>
                <p className="text-parchment/80 font-crimson text-sm italic">
                  &quot;For glory and honor, we undertake these noble quests&quot;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-bronze/30">
              <div className="flex items-center gap-6 font-crimson text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600" />
                  <span className="text-parchment/80">Tavern Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-parchment/80">Quest Givers Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-crimson text-sm">
                <span className="text-parchment/60">Total Quests:</span>
                <span className="text-gold font-bold text-lg">{tasks.length}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Add Quest Form */}
        <form onSubmit={handleSubmit} className="mb-12 animate-slide-up delay-100">
          <div className="parchment-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-8 h-8 text-gold" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 4l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
              </svg>
              <h2 className="text-xl font-cinzel font-semibold text-gold tracking-wide">
                Inscribe New Quest
              </h2>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter quest name..."
                  className="w-full px-4 py-3 rounded bg-wood/50 border-2 border-bronze/30 text-primary placeholder-parchment/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all font-crimson"
                />
              </div>

              <div className="relative">
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="px-4 py-3 rounded bg-wood/50 border-2 border-bronze/30 text-primary focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all appearance-none pr-10 font-crimson cursor-pointer"
                >
                  {ASSIGNEES.map((assignee) => (
                    <option key={assignee} value={assignee}>
                      {assignee}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none">
                  ▼
                </div>
              </div>

              <div className="relative">
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  className="px-4 py-3 rounded bg-wood/50 border-2 border-bronze/30 text-primary focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all appearance-none pr-10 font-crimson cursor-pointer"
                >
                  <option value="pending">Available</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Complete</option>
                  <option value="blocked">Blocked</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold pointer-events-none">
                  ▼
                </div>
              </div>

              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-bronze to-gold hover:from-gold hover:to-bronze text-wood font-cinzel font-semibold rounded transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-gold/50 shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"/>
                </svg>
                <span>Accept Quest</span>
              </button>
            </div>
          </div>
        </form>

        {/* Quest Board Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* In Progress Column */}
          <div className="animate-slide-up delay-200">
            <div className="parchment-card rounded-lg p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-orange-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-700 to-amber-700 flex items-center justify-center border-2 border-gold/30">
                  <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-cinzel font-bold text-gold tracking-wide">
                    Active
                  </h2>
                  <p className="text-xs text-parchment/70 font-crimson">Quests in Progress</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-gold/50 flex items-center justify-center bg-gold/10">
                  <span className="text-gold font-cinzel font-bold text-lg">{inProgressTasks.length}</span>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {inProgressTasks.map((task: Task, index: number) => (
                  <QuestCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    delay={index}
                  />
                ))}
                {inProgressTasks.length === 0 && (
                  <EmptyState message="No active quests" />
                )}
              </div>
            </div>
          </div>

          {/* Done Column */}
          <div className="animate-slide-up delay-300">
            <div className="parchment-card rounded-lg p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-700 via-emerald-600 to-green-700" />
              <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-green-700 to-emerald-700 flex items-center justify-center border-2 border-gold/30">
                  <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3 6h6l-5 4 2 6-6-3-6 3 2-6-5-4h6z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-cinzel font-bold text-gold tracking-wide">
                    Complete
                  </h2>
                  <p className="text-xs text-parchment/70 font-crimson">Finished Quests</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-gold/50 flex items-center justify-center bg-gold/10">
                  <span className="text-gold font-cinzel font-bold text-lg">{doneTasks.length}</span>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {doneTasks.map((task: Task, index: number) => (
                  <QuestCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    delay={index}
                  />
                ))}
                {doneTasks.length === 0 && (
                  <EmptyState message="No completed quests" />
                )}
              </div>
            </div>
          </div>

          {/* Pending/Blocked Column */}
          <div className="animate-slide-up delay-400">
            <div className="parchment-card rounded-lg p-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-800 via-slate-600 to-blue-800" />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-slate-700 to-blue-800 flex items-center justify-center border-2 border-gold/30">
                  <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-cinzel font-bold text-gold tracking-wide">
                    Available
                  </h2>
                  <p className="text-xs text-parchment/70 font-crimson">Pending or Blocked</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-gold/50 flex items-center justify-center bg-gold/10">
                  <span className="text-gold font-cinzel font-bold text-lg">{pendingBlockedTasks.length}</span>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {pendingBlockedTasks.map((task: Task, index: number) => (
                  <QuestCard
                    key={task._id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    delay={index}
                  />
                ))}
                {pendingBlockedTasks.length === 0 && (
                  <EmptyState message="No available quests" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestCard({
  task,
  onStatusChange,
  onDelete,
  delay = 0,
}: {
  task: Task;
  onStatusChange: (id: Id<"tasks">, status: string) => Promise<void>;
  onDelete: (id: Id<"tasks">) => Promise<void>;
  delay?: number;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    if (confirm("Abandon this quest?")) {
      setIsDeleting(true);
      await onDelete(task._id);
    }
  };

  const statusConfig: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    "in-progress": {
      icon: "⚔",
      color: "text-orange-400",
      bg: "bg-orange-900/30",
      border: "border-orange-700/50",
    },
    done: {
      icon: "★",
      color: "text-green-400",
      bg: "bg-green-900/30",
      border: "border-green-700/50",
    },
    pending: {
      icon: "⚑",
      color: "text-blue-400",
      bg: "bg-blue-900/30",
      border: "border-blue-700/50",
    },
    blocked: {
      icon: "⚠",
      color: "text-red-400",
      bg: "bg-red-900/30",
      border: "border-red-700/50",
    },
  };

  const config = statusConfig[task.status] || statusConfig.pending;

  return (
    <div
      className={`group relative bg-parchment-light/80 rounded-lg p-4 border-2 ${config.border} hover:border-gold/50 transition-all duration-300 hover:shadow-lg animate-slide-up ${isDeleting ? "opacity-50 scale-95" : ""}`}
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gold/30 rounded-tl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-gold/30 rounded-tr opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-gold/30 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gold/30 rounded-br opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-primary font-cinzel text-sm tracking-wide ink-text">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs font-crimson">
              <span className={`px-2 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
                {config.icon} {task.status.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={handleDeleteClick}
            className="w-8 h-8 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-all duration-200 flex items-center justify-center border border-red-700/50 hover:border-red-500"
            aria-label="Abandon quest"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between text-xs font-crimson">
          <span className="text-parchment/80">
            <span className="text-gold">♦</span> {task.assignee}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(["in-progress", "done", "pending", "blocked"] as const).map(
            (status) => {
              const btnConfig = statusConfig[status];
              const isActive = task.status === status;
              return (
                <button
                  key={status}
                  onClick={() => onStatusChange(task._id, status)}
                  className={`text-[10px] px-2 py-1 rounded font-crimson transition-all duration-200 border ${
                    isActive
                      ? `${btnConfig.bg} ${btnConfig.color} ${btnConfig.border} shadow`
                      : "bg-wood/30 text-parchment/60 border-bronze/30 hover:border-gold/50 hover:text-parchment"
                  }`}
                >
                  {btnConfig.icon}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-parchment/60 font-crimson">
      <svg className="w-12 h-12 mx-auto mb-3 opacity-40" viewBox="0 0 48 48" fill="currentColor">
        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zm0-28c-6.63 0-12 5.37-12 12s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
      <p className="text-sm tracking-wide italic opacity-70">{message}</p>
    </div>
  );
}
