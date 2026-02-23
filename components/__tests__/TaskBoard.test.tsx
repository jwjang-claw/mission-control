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

    expect(screen.getByText("Quest Board")).toBeInTheDocument();
    // Use a more flexible matcher for the subtitle with smart quotes
    expect(
      screen.getByText((content) =>
        content.includes("For glory and honor, we undertake these noble quests")
      )
    ).toBeInTheDocument();
  });

  it("renders empty state when no tasks", () => {
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    expect(screen.getByText("No active quests")).toBeInTheDocument();
    expect(screen.getByText("No completed quests")).toBeInTheDocument();
    expect(screen.getByText("No available quests")).toBeInTheDocument();
  });

  it("renders tasks in correct columns", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Active column (formerly In Progress)
    const activeColumn = screen.getByText("Quests in Progress").closest("div")
      ?.parentElement?.parentElement?.parentElement;
    expect(
      within(activeColumn!).getByText("Fix navigation bug")
    ).toBeInTheDocument();

    // Complete column (formerly Done)
    const completeColumn = screen.getByText("Finished Quests").closest("div")
      ?.parentElement?.parentElement?.parentElement;
    expect(
      within(completeColumn!).getByText("Update documentation")
    ).toBeInTheDocument();

    // Available column (formerly Pending/Blocked)
    const availableColumn = screen
      .getByText("Pending or Blocked")
      .closest("div")?.parentElement?.parentElement?.parentElement;
    expect(
      within(availableColumn!).getByText("Add unit tests")
    ).toBeInTheDocument();
  });

  it("displays correct task counts", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check that the total quests count is displayed
    expect(screen.getByText("Total Quests:")).toBeInTheDocument();
    const totalCountElement = screen
      .getAllByText(/3/)
      .find((el) => el.textContent === "3");
    expect(totalCountElement).toBeInTheDocument();
  });

  it("creates a new task when form is submitted", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "4" });
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(mockCreate);

    render(<TaskBoard />);

    const titleInput = screen.getByPlaceholderText("Enter quest name...");
    const addButton = screen.getByRole("button", { name: /accept quest/i });

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

  it("changes task status when status button is clicked", async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);
    mockUseQuery.mockReturnValue([mockTasks[0]]);
    mockUseMutation.mockReturnValue(mockUpdate);

    render(<TaskBoard />);

    // Click on the done status button (★ icon)
    const statusButton = screen.getByRole("button", { name: /★/ });
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

    const deleteButton = screen.getByLabelText("Abandon quest");
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith("Abandon this quest?");
      expect(mockDelete).toHaveBeenCalledWith({ id: "1" });
    });
  });

  it("does not create task with empty title", async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: "4" });
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(mockCreate);

    render(<TaskBoard />);

    const addButton = screen.getByRole("button", { name: /accept quest/i });
    await userEvent.click(addButton);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("filters tasks correctly by status", () => {
    mockUseQuery.mockReturnValue(mockTasks);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    // Check that tasks are in correct columns
    const activeColumn = screen.getByText("Quests in Progress").closest("div")
      ?.parentElement?.parentElement?.parentElement;
    const completeColumn = screen.getByText("Finished Quests").closest("div")
      ?.parentElement?.parentElement?.parentElement;
    const availableColumn = screen
      .getByText("Pending or Blocked")
      .closest("div")?.parentElement?.parentElement?.parentElement;

    // Active should only have in-progress tasks
    expect(
      within(activeColumn!).queryByText("Update documentation")
    ).not.toBeInTheDocument();
    expect(
      within(activeColumn!).queryByText("Add unit tests")
    ).not.toBeInTheDocument();

    // Complete should only have done tasks
    expect(
      within(completeColumn!).queryByText("Fix navigation bug")
    ).not.toBeInTheDocument();
    expect(
      within(completeColumn!).queryByText("Add unit tests")
    ).not.toBeInTheDocument();

    // Available should only have pending/blocked tasks
    expect(
      within(availableColumn!).queryByText("Fix navigation bug")
    ).not.toBeInTheDocument();
    expect(
      within(availableColumn!).queryByText("Update documentation")
    ).not.toBeInTheDocument();
  });

  it("displays tavern status indicators", () => {
    mockUseQuery.mockReturnValue([]);
    mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue(undefined));

    render(<TaskBoard />);

    expect(screen.getByText("Tavern Open")).toBeInTheDocument();
    expect(screen.getByText("Quest Givers Ready")).toBeInTheDocument();
  });
});
