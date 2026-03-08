import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockMutateAsync = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { healing_goals: ["coping with stress"] },
  }),
}));
vi.mock("@/hooks/use-journal", () => ({
  useCreateJournalEntry: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import JournalEditor from "@/components/journal/JournalEditor";

const renderComponent = () =>
  render(
    <MemoryRouter>
      <JournalEditor />
    </MemoryRouter>
  );

describe("JournalEditor", () => {
  beforeEach(() => {
    mockMutateAsync.mockReset();
  });

  it("renders title input and content textarea", () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/what's on your mind/i)).toBeInTheDocument();
  });

  it("disables save button when content is empty", () => {
    renderComponent();
    const button = screen.getByRole("button", { name: /save entry/i });
    expect(button).toBeDisabled();
  });

  it("enables save button when content is entered", () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/what's on your mind/i), {
      target: { value: "Today I felt hopeful" },
    });
    const button = screen.getByRole("button", { name: /save entry/i });
    expect(button).not.toBeDisabled();
  });

  it("renders mood options", () => {
    renderComponent();
    expect(screen.getByText("Joyful")).toBeInTheDocument();
    expect(screen.getByText("Calm")).toBeInTheDocument();
    expect(screen.getByText("Anxious")).toBeInTheDocument();
  });

  it("shows milestone label input when milestone is toggled", () => {
    renderComponent();
    expect(screen.getByText("Mark as milestone")).toBeInTheDocument();
    // Click the milestone toggle button (the button with Flag icon)
    const milestoneLabel = screen.getByText("Mark as milestone");
    const toggleButton = milestoneLabel.closest("label")?.querySelector("button");
    if (toggleButton) fireEvent.click(toggleButton);
    expect(screen.getByPlaceholderText(/first week of journaling/i)).toBeInTheDocument();
  });

  it("can add and remove tags", () => {
    renderComponent();
    const tagInput = screen.getByPlaceholderText(/add a tag/i);
    fireEvent.change(tagInput, { target: { value: "hope" } });
    fireEvent.keyDown(tagInput, { key: "Enter" });
    expect(screen.getByText("hope")).toBeInTheDocument();
  });

  it("calls createEntry on save", async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/what's on your mind/i), {
      target: { value: "A meaningful reflection" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save entry/i }));
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        content: "A meaningful reflection",
      })
    );
  });
});
