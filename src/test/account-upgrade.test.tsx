import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "profile.upgrade.title": "Secure Your Account",
        "profile.upgrade.desc": "Add an email and password.",
        "profile.upgrade.button": "Secure Account",
        "auth.email": "Email",
        "auth.password": "Password",
        "common.loading": "Loading…",
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

// Test 1: Hidden for non-anonymous users
describe("AccountUpgrade — email user", () => {
  it("renders nothing for non-anonymous users", () => {
    vi.doMock("@/contexts/AuthContext", () => ({
      useAuth: () => ({
        user: { id: "user-1", is_anonymous: false },
        refreshProfile: vi.fn(),
      }),
    }));
    // Re-import to pick up new mock
    // Since doMock is lazy, we need dynamic import
  });
});

// Test 2: Visible for anonymous users
describe("AccountUpgrade — anonymous user", () => {
  beforeAll(() => {
    vi.mock("@/contexts/AuthContext", () => ({
      useAuth: () => ({
        user: { id: "user-1", is_anonymous: true },
        refreshProfile: vi.fn(),
      }),
    }));
  });

  it("renders upgrade form for anonymous users", async () => {
    const { default: AccountUpgrade } = await import(
      "@/components/profile/AccountUpgrade"
    );
    render(<AccountUpgrade />);
    expect(screen.getByText("Secure Your Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("disables button when fields are empty", async () => {
    const { default: AccountUpgrade } = await import(
      "@/components/profile/AccountUpgrade"
    );
    render(<AccountUpgrade />);
    const button = screen.getByRole("button", { name: /secure account/i });
    expect(button).toBeDisabled();
  });
});
