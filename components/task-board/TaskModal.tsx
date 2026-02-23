"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ASSIGNEES, TASK_STATUSES, PRIORITIES } from "@/lib/constants";
import { Button } from "../ui/Button";
import { Select } from "../ui/Select";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  assignee: string;
  status: string;
  priority: string;
}

export const TaskModal = ({ isOpen, onClose }: TaskModalProps) => {
  const createTask = useMutation(api.tasks.create);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    assignee: ASSIGNEES.KURO,
    status: TASK_STATUSES.BACKLOG,
    priority: PRIORITIES.MEDIUM,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a task title");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTask({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assignee: formData.assignee,
        status: formData.status,
        priority: formData.priority || undefined,
        tags: [],
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        assignee: ASSIGNEES.KURO,
        status: TASK_STATUSES.BACKLOG,
        priority: PRIORITIES.MEDIUM,
      });

      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: keyof FormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Title <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-3 py-2 text-sm border border-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-in-progress)] focus:ring-[rgba(15,123,108,0.1)]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-in-progress)] focus:ring-[rgba(15,123,108,0.1)] resize-none"
            />
          </div>

          {/* Assignee */}
          <Select
            label="Assignee"
            value={formData.assignee}
            onChange={(e) => handleChange("assignee", e.target.value)}
            options={[
              { value: ASSIGNEES.KURO, label: "Kuro" },
              { value: ASSIGNEES.SNAIL, label: "snail" },
            ]}
          />

          {/* Status */}
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={[
              { value: TASK_STATUSES.RECURRING, label: "Recurring" },
              { value: TASK_STATUSES.BACKLOG, label: "Backlog" },
              { value: TASK_STATUSES.IN_PROGRESS, label: "In Progress" },
              { value: TASK_STATUSES.REVIEW, label: "Review" },
              { value: TASK_STATUSES.DONE, label: "Done" },
            ]}
          />

          {/* Priority */}
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            options={[
              { value: PRIORITIES.LOW, label: "Low" },
              { value: PRIORITIES.MEDIUM, label: "Medium" },
              { value: PRIORITIES.HIGH, label: "High" },
            ]}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
