import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "crisis.title": "It sounds like you may be going through something serious",
        "crisis.subtitle": "Your safety matters most.",
      };
      return map[key] ?? key;
    },
  }),
}));

import CrisisBanner from "@/components/cocoon/CrisisBanner";

describe("CrisisBanner", () => {
  it("renders crisis title and emergency resources", () => {
    render(<CrisisBanner />);
    expect(
      screen.getByText("It sounds like you may be going through something serious")
    ).toBeInTheDocument();
    expect(screen.getByText("988")).toBeInTheDocument();
    expect(screen.getByText(/samaritans/i)).toBeInTheDocument();
  });

  it("dismisses when close button is clicked", () => {
    const { container } = render(<CrisisBanner />);
    // There should be content initially
    expect(screen.getByText("988")).toBeInTheDocument();
    // Click the X button (first button in the component)
    const closeBtn = container.querySelector("button");
    if (closeBtn) fireEvent.click(closeBtn);
    expect(screen.queryByText("988")).not.toBeInTheDocument();
  });
});
