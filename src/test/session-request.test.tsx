import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock dependencies before importing component
const mockMutateAsync = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    profile: { language: "en" },
    role: "seeker",
  }),
}));
vi.mock("@/hooks/use-sessions", () => ({
  useCreateSession: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import SessionRequest from "@/components/cocoon/SessionRequest";

const renderComponent = () =>
  render(
    <MemoryRouter>
      <SessionRequest />
    </MemoryRouter>
  );

describe("SessionRequest", () => {
  beforeEach(() => {
    mockMutateAsync.mockReset();
  });

  it("renders topic options and urgency options", () => {
    renderComponent();
    expect(screen.getByText("Anxiety & worry")).toBeInTheDocument();
    expect(screen.getByText("Grief & loss")).toBeInTheDocument();
    expect(screen.getByText("I'm okay")).toBeInTheDocument();
    expect(screen.getByText("Could use support")).toBeInTheDocument();
    expect(screen.getByText("Struggling")).toBeInTheDocument();
  });

  it("disables submit button when no topic is selected", () => {
    renderComponent();
    const button = screen.getByRole("button", { name: /request session/i });
    expect(button).toBeDisabled();
  });

  it("enables submit button after selecting a topic", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Anxiety & worry"));
    const button = screen.getByRole("button", { name: /request session/i });
    expect(button).not.toBeDisabled();
  });

  it("calls createSession on submit with selected topic and urgency", async () => {
    mockMutateAsync.mockResolvedValueOnce({ id: "session-1" });
    renderComponent();

    fireEvent.click(screen.getByText("Grief & loss"));
    fireEvent.click(screen.getByText("Struggling"));
    fireEvent.click(screen.getByRole("button", { name: /request session/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        seeker_id: "user-1",
        topic: "Grief & loss",
        urgency: "high",
        language: "en",
      })
    );
  });

  it("renders the preferences textarea", () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/any preferences/i)).toBeInTheDocument();
  });
});
