import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "profile.upgrade.title": "Secure Your Account",
        "profile.upgrade.desc": "Add an email and password.",
        "profile.upgrade.button": "Secure Account",
        "profile.upgrade.passwordMin": "Password must be at least 6 characters",
        "auth.email": "Email",
        "auth.password": "Password",
        "common.loading": "Loading…",
        "common.error": "Error",
        "profile.upgrade.success": "Account secured!",
        "profile.upgrade.successDesc": "Linked to email.",
      };
      return map[key] ?? key;
    },
  }),
}));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { updateUser: vi.fn() },
    from: () => ({ update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({}) }),
  },
}));

// Mock with anonymous user (is_anonymous = true)
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", is_anonymous: true },
    refreshProfile: vi.fn(),
  }),
}));

import AccountUpgrade from "@/components/profile/AccountUpgrade";

describe("AccountUpgrade", () => {
  it("renders upgrade form for anonymous users", () => {
    render(<AccountUpgrade />);
    expect(screen.getByText("Secure Your Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("disables button when fields are empty", () => {
    render(<AccountUpgrade />);
    const button = screen.getByRole("button", { name: /secure account/i });
    expect(button).toBeDisabled();
  });
});
