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
      assignee: "Kuro 🐱",
      status: "in-progress",
      updatedAt: 1234567890,
    },
    {
      _id: "2",
      title: "Update documentation",
      assignee: "snail 👤",
      status: "done",
      updatedAt: 1234567891,
    },
    {
      _id: "3",
      title: "Add unit tests",
      assignee: "Kuro 🐱",
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

    expect(screen.getByText("🚀 Mission Control")).toBeInTheDocument();
    expect(screen.getByText("Real-time Task Board")).toBeInTheDocument();
  });

  it("renders empty state when no tasks", () => {
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    expect(screen.getByText("No tasks in progress")).toBeInTheDocument();
    expect(screen.getByText("No completed tasks yet")).toBeInTheDocument();
    expect(screen.getByText("No pending or blocked tasks")).toBeInTheDocument();
  });

  it("renders tasks in correct columns", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // In Progress column
    const inProgressColumn = screen.getByText("In Progress").closest("div")?.parentElement;
    expect(within(inProgressColumn!).getByText("Fix navigation bug")).toBeInTheDocument();

    // Done column
    const doneColumn = screen.getByText("Done").closest("div")?.parentElement;
    expect(within(doneColumn!).getByText("Update documentation")).toBeInTheDocument();

    // Pending/Blocked column
    const pendingColumn = screen.getByText("Pending / Blocked").closest("div")?.parentElement;
    expect(within(pendingColumn!).getByText("Add unit tests")).toBeInTheDocument();
  });

  it("displays correct task counts", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    const counts = screen.getAllByText(/1/);
    expect(counts.length).toBeGreaterThanOrEqual(3);
  });

  it("creates a new task when form is submitted", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "4" });
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(mockCreate);

    render(<TaskBoard />);

    const titleInput = screen.getByPlaceholderText("Task title...");
    const addButton = screen.getByRole("button", { name: "Add Task" });

    await userEvent.type(titleInput, "New task from test");
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        title: "New task from test",
        assignee: "Kuro 🐱",
        status: "pending",
      });
    });
  });

  it("changes task status when status button is clicked", async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    mockUseQuery.mockReturnValue([mockTasks[0]]);
    mockUseMutation.mockReturnValue(mockUpdate);

    render(<TaskBoard />);

    const statusButton = screen.getByRole("button", { name: /✅ done/ });
    await userEvent.click(statusButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: "1",
        status: "done",
      });
    });
  });

  it("deletes a task when delete button is clicked", async () => {
    // Mock confirm dialog
    global.confirm = vi.fn(() => true);

    const mockDelete = vi.fn().mockResolvedValue(undefined);
    mockUseQuery.mockReturnValue([mockTasks[0]]);
    mockUseMutation.mockReturnValue(mockDelete);

    render(<TaskBoard />);

    const deleteButton = screen.getByLabelText("Delete task");
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith("Are you sure you want to delete this task?");
      expect(mockDelete).toHaveBeenCalledWith({ id: "1" });
    });
  });

  it("does not create task with empty title", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "4" });
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(mockCreate);

    render(<TaskBoard />);

    const addButton = screen.getByRole("button", { name: "Add Task" });
    await userEvent.click(addButton);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("filters tasks correctly by status", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check that tasks are in correct columns
    const inProgressColumn = screen.getByText("In Progress").closest("div")?.parentElement;
    const doneColumn = screen.getByText("Done").closest("div")?.parentElement;
    const pendingColumn = screen.getByText("Pending / Blocked").closest("div")?.parentElement;

    // In progress should only have in-progress tasks
    expect(within(inProgressColumn!).queryByText("Update documentation")).not.toBeInTheDocument();
    expect(within(inProgressColumn!).queryByText("Add unit tests")).not.toBeInTheDocument();

    // Done should only have done tasks
    expect(within(doneColumn!).queryByText("Fix navigation bug")).not.toBeInTheDocument();
    expect(within(doneColumn!).queryByText("Add unit tests")).not.toBeInTheDocument();

    // Pending should only have pending/blocked tasks
    expect(within(pendingColumn!).queryByText("Fix navigation bug")).not.toBeInTheDocument();
    expect(within(pendingColumn!).queryByText("Update documentation")).not.toBeInTheDocument();
  });
});
