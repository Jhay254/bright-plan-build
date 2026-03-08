import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    signOut: vi.fn(),
  }),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ error: null }),
  },
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "profile.deletion.title": "Delete Account",
        "profile.deletion.desc": "Permanently delete your account.",
        "profile.deletion.button": "Delete My Account",
        "profile.deletion.warning": "This will permanently delete everything.",
        "profile.deletion.typeDelete": "Type DELETE to confirm:",
        "profile.deletion.confirmButton": "Permanently Delete",
        "profile.deletion.success": "Account deleted",
        "common.error": "Error",
        "common.cancel": "Cancel",
        "common.loading": "Loading…",
      };
      return map[key] ?? key;
    },
  }),
}));

import AccountDeletion from "@/components/profile/AccountDeletion";

describe("AccountDeletion", () => {
  it("renders the initial delete button", () => {
    render(<AccountDeletion />);
    expect(screen.getByText("Delete Account")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete my account/i })
    ).toBeInTheDocument();
  });

  it("shows confirmation flow when delete button is clicked", () => {
    render(<AccountDeletion />);
    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));
    expect(screen.getByText("Type DELETE to confirm:")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("DELETE")).toBeInTheDocument();
  });

  it("disables confirm button until DELETE is typed", () => {
    render(<AccountDeletion />);
    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));
    const confirmBtn = screen.getByRole("button", { name: /permanently delete/i });
    expect(confirmBtn).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText("DELETE"), {
      target: { value: "DELETE" },
    });
    expect(confirmBtn).not.toBeDisabled();
  });

  it("keeps confirm disabled for partial text", () => {
    render(<AccountDeletion />);
    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));
    fireEvent.change(screen.getByPlaceholderText("DELETE"), {
      target: { value: "DELE" },
    });
    const confirmBtn = screen.getByRole("button", { name: /permanently delete/i });
    expect(confirmBtn).toBeDisabled();
  });

  it("cancel button returns to initial state", () => {
    render(<AccountDeletion />);
    fireEvent.click(screen.getByRole("button", { name: /delete my account/i }));
    expect(screen.getByPlaceholderText("DELETE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByPlaceholderText("DELETE")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete my account/i })
    ).toBeInTheDocument();
  });
});
