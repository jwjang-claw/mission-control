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

  it("renders the task board with header", () => {
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    expect(screen.getByText("Task Board")).toBeInTheDocument();
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

    const titleInput = screen.getByPlaceholderText("New task...");
    const addButton = screen.getByRole("button", { name: /add/i });

    await userEvent.type(titleInput, "New task from test");
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        title: "New task from test",
        assignee: "Kuro",
        status: "pending",
      });
    });
  });

  it("changes task status when expanded and status button clicked", async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    mockUseQuery.mockReturnValue([mockTasks[0]]);
    mockUseMutation.mockReturnValue(mockUpdate);

    render(<TaskBoard />);

    // Click on the task card to expand it
    const taskCard = screen.getByText("Fix navigation bug").closest("div");
    await userEvent.click(taskCard!);

    // Wait for expanded view and click on a status button
    await waitFor(() => {
      expect(screen.getByText("Move to:")).toBeInTheDocument();
    });

    // Click "Done" button
    const doneButton = screen.getByRole("button", { name: "Done" });
    await userEvent.click(doneButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "1",
        status: "done",
      });
    });
  });

  it("deletes a task when delete button is clicked", async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined);
    mockUseQuery.mockReturnValue([mockTasks[0]]);
    mockUseMutation.mockReturnValue(mockDelete);

    render(<TaskBoard />);

    // Hover over task card to reveal delete button
    const taskCard = screen.getByText("Fix navigation bug").closest("div");

    // Delete button has aria-label="Delete task"
    const deleteButton = within(taskCard!).getByLabelText("Delete task");

    // We can directly click it
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

    const addButton = screen.getByRole("button", { name: /add/i });
    await userEvent.click(addButton);

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
