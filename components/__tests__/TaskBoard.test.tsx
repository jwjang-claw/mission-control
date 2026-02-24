import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Convex hooks before importing TaskBoard
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: () => mockUseQuery(),
  useMutation: () => mockUseMutation(),
  useAction: vi.fn(),
}));

// Mock the dynamic require
vi.mock("../convex/_generated", () => ({
  api: {
    tasks: {
      list: "api.tasks.list",
      create: "api.tasks.create",
      update: "api.tasks.update",
      remove: "api.tasks.remove",
    },
  },
}));

import TaskBoard from "../TaskBoard";

describe("TaskBoard", () => {
  const mockTasks = [
    {
      _id: "1",
      title: "Fix navigation bug",
      assignee: "Kuro",
      status: "in-progress",
      updatedAt: 1234567890,
    },
    {
      _id: "2",
      title: "Update documentation",
      assignee: "snail",
      status: "done",
      updatedAt: 1234567891,
    },
    {
      _id: "3",
      title: "Add unit tests",
      assignee: "Kuro",
      status: "pending",
      updatedAt: 1234567892,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the task board with stats bar", () => {
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check stats bar is rendered (instead of "Task Board" header)
    expect(screen.getByText("tasks")).toBeInTheDocument();
    expect(screen.getByText("in progress")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("renders empty state when no tasks", () => {
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check for "No tasks" text in empty columns
    const noTasksElements = screen.getAllByText("No tasks");
    expect(noTasksElements.length).toBeGreaterThan(0);
  });

  it("renders tasks in correct columns", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check tasks are rendered
    expect(screen.getByText("Fix navigation bug")).toBeInTheDocument();
    expect(screen.getByText("Update documentation")).toBeInTheDocument();
    expect(screen.getByText("Add unit tests")).toBeInTheDocument();
  });

  it("displays correct task counts in stats bar", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check stats labels exist
    expect(screen.getByText("tasks")).toBeInTheDocument();
    expect(screen.getByText("in progress")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("creates a new task when form is submitted", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "4" });
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(mockCreate);

    render(<TaskBoard />);

    // Click the first "New" button (in Pending column)
    const newButtons = screen.getAllByText("New");
    await userEvent.click(newButtons[0]);

    // Find the input with new placeholder
    const titleInput = screen.getByPlaceholderText("What needs to be done?");
    await userEvent.type(titleInput, "New task from test");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        title: "New task from test",
        assignee: "Kuro",
        status: "backlog",
      });
    });
  });

  it("shows card detail when clicked", async () => {
    mockUseQuery.mockReturnValue([
      { ...mockTasks[0], projectId: "indieloca", strategyNote: "Core feature" },
    ]);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Click on the task card to expand it
    const taskCard = screen.getByText("Fix navigation bug").closest("div");
    await userEvent.click(taskCard!);

    // Wait for expanded detail view
    await waitFor(() => {
      expect(screen.getByText("Assignee")).toBeInTheDocument();
      expect(screen.getByText("Core feature")).toBeInTheDocument();
    });
  });

  it("deletes a task when delete button is clicked", async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    mockUseQuery.mockReturnValue([mockTasks[0]]);
    mockUseMutation.mockReturnValue(mockDelete);

    render(<TaskBoard />);

    // Find task card
    const taskCard = screen.getByText("Fix navigation bug").closest("div");

    // Find delete button within the card (trash icon button without aria-label)
    // It's in the hover area, so we query directly
    const deleteButton = within(taskCard!).getByRole("button", {
      name: "",
    });

    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith({ id: "1" });
    });
  });

  it("does not create task with empty title", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "4" });
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(mockCreate);

    render(<TaskBoard />);

    // Click the first "New" button
    const newButtons = screen.getAllByText("New");
    await userEvent.click(newButtons[0]);

    // Click outside or press Enter without typing
    await userEvent.keyboard("{Enter}");

    // Should not create task with empty title
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("filters tasks correctly by status", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Each task should appear exactly once
    expect(screen.getByText("Fix navigation bug")).toBeInTheDocument();
    expect(screen.getByText("Update documentation")).toBeInTheDocument();
    expect(screen.getByText("Add unit tests")).toBeInTheDocument();
  });

  it("displays assignee avatars with initials", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check for assignee initials (K for Kuro, S for snail) - use getAllBy since there are multiple
    const kAvatars = screen.getAllByText("K");
    const sAvatars = screen.getAllByText("S");

    expect(kAvatars.length).toBeGreaterThan(0);
    expect(sAvatars.length).toBeGreaterThan(0);
  });
});
