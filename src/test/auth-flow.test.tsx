import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Import after mock
import ProtectedRoute from "@/components/app/ProtectedRoute";

const TestApp = ({ initialRoute = "/app" }) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    <Routes>
      <Route path="/auth" element={<div>Auth Page</div>} />
      <Route path="/onboarding" element={<div>Onboarding Page</div>} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  </MemoryRouter>
);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, profile: null, loading: true });
    render(<TestApp />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("redirects to /auth when no user", () => {
    mockUseAuth.mockReturnValue({ user: null, profile: null, loading: false });
    render(<TestApp />);
    expect(screen.getByText("Auth Page")).toBeInTheDocument();
  });

  it("redirects to /onboarding when onboarding incomplete", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1" },
      profile: { onboarding_complete: false },
      loading: false,
    });
    render(<TestApp />);
    expect(screen.getByText("Onboarding Page")).toBeInTheDocument();
  });

  it("renders children when authenticated and onboarding complete", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1" },
      profile: { onboarding_complete: true },
      loading: false,
    });
    render(<TestApp />);
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
