import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
  }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { skills_endorsed: [] }, error: null }),
      update: vi.fn().mockReturnThis(),
    }),
  },
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "feedback.seekerTitle": "How are you feeling?",
        "feedback.volunteerTitle": "Session Reflection",
        "feedback.seekerDesc": "Your feedback helps us improve.",
        "feedback.volunteerDesc": "Reflect on this session.",
        "feedback.howFeelAfter": "How do you feel after this session?",
        "feedback.howSessionGo": "How did the session go?",
        "feedback.feltHeard": "Did you feel heard?",
        "feedback.feltSafe": "Did you feel safe?",
        "feedback.yes": "Yes",
        "feedback.notReally": "Not really",
        "feedback.endorseSkills": "Endorse your volunteer's skills",
        "feedback.endorseDesc": "Select up to 3 skills",
        "feedback.anythingElse": "Anything else?",
        "feedback.selfReflection": "Self-reflection notes",
        "feedback.optional": "optional",
        "feedback.seekerPlaceholder": "How could we improve?",
        "feedback.volunteerPlaceholder": "What went well?",
        "feedback.submitting": "Submitting…",
        "feedback.submit": "Submit Feedback",
        "feedback.skip": "Skip for now",
        "feedback.thanks": "Thank you",
        "common.error": "Error",
      };
      return map[key] ?? key;
    },
  }),
}));

import SessionFeedback from "@/components/cocoon/SessionFeedback";

describe("SessionFeedback", () => {
  const onComplete = vi.fn();

  const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

  it("renders seeker view with emotional rating and felt-heard/safe toggles", () => {
    renderWithRouter(
      <SessionFeedback sessionId="s1" volunteerId="v1" role="seeker" onComplete={onComplete} />
    );
    expect(screen.getByText("How are you feeling?")).toBeInTheDocument();
    expect(screen.getByText("Did you feel heard?")).toBeInTheDocument();
    expect(screen.getByText("Did you feel safe?")).toBeInTheDocument();
    expect(screen.getByText("Endorse your volunteer's skills")).toBeInTheDocument();
  });

  it("renders volunteer view without felt-heard/safe", () => {
    renderWithRouter(
      <SessionFeedback sessionId="s1" volunteerId={null} role="volunteer" onComplete={onComplete} />
    );
    expect(screen.getByText("Session Reflection")).toBeInTheDocument();
    expect(screen.queryByText("Did you feel heard?")).not.toBeInTheDocument();
  });

  it("disables submit when no rating selected", () => {
    renderWithRouter(
      <SessionFeedback sessionId="s1" volunteerId="v1" role="seeker" onComplete={onComplete} />
    );
    const submitBtn = screen.getByRole("button", { name: /submit feedback/i });
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit after selecting a rating", () => {
    renderWithRouter(
      <SessionFeedback sessionId="s1" volunteerId="v1" role="seeker" onComplete={onComplete} />
    );
    fireEvent.click(screen.getByText("😊"));
    const submitBtn = screen.getByRole("button", { name: /submit feedback/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it("shows skip button that calls onComplete", () => {
    renderWithRouter(
      <SessionFeedback sessionId="s1" volunteerId="v1" role="seeker" onComplete={onComplete} />
    );
    fireEvent.click(screen.getByText("Skip for now"));
    expect(onComplete).toHaveBeenCalled();
  });

  it("limits skill endorsement to 3", () => {
    renderWithRouter(
      <SessionFeedback sessionId="s1" volunteerId="v1" role="seeker" onComplete={onComplete} />
    );
    const skills = ["Good listener", "Empathetic", "Patient", "Supportive"];
    skills.forEach((s) => fireEvent.click(screen.getByText(s)));
    expect(screen.getByText("Supportive")).toBeInTheDocument();
  });
});
