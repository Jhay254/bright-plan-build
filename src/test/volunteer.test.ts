import { describe, it, expect } from "vitest";
import {
  TRAINING_MODULES,
  TRAINING_CONTENT,
  SPECIALISATIONS,
  DAY_LABELS,
  HOUR_LABELS,
} from "@/lib/volunteer";

describe("TRAINING_MODULES", () => {
  it("has 7 modules", () => {
    expect(TRAINING_MODULES).toHaveLength(7);
  });

  it("every module has required fields", () => {
    for (const mod of TRAINING_MODULES) {
      expect(mod.key).toBeTruthy();
      expect(mod.title).toBeTruthy();
      expect(mod.description).toBeTruthy();
      expect(mod.duration).toBeTruthy();
      expect(mod.category).toBeTruthy();
    }
  });

  it("all module keys have corresponding content", () => {
    for (const mod of TRAINING_MODULES) {
      expect(TRAINING_CONTENT[mod.key]).toBeDefined();
      expect(TRAINING_CONTENT[mod.key].material.length).toBeGreaterThan(0);
      expect(TRAINING_CONTENT[mod.key].takeaways.length).toBeGreaterThan(0);
    }
  });
});

describe("TRAINING_CONTENT assessments", () => {
  it("assessments have valid correctIndex", () => {
    for (const [, content] of Object.entries(TRAINING_CONTENT)) {
      if (content.assessment) {
        const { options, correctIndex } = content.assessment;
        expect(correctIndex).toBeGreaterThanOrEqual(0);
        expect(correctIndex).toBeLessThan(options.length);
      }
    }
  });
});

describe("Constants", () => {
  it("SPECIALISATIONS is non-empty", () => {
    expect(SPECIALISATIONS.length).toBeGreaterThan(0);
  });

  it("DAY_LABELS has 7 days", () => {
    expect(DAY_LABELS).toHaveLength(7);
  });

  it("HOUR_LABELS has 24 hours", () => {
    expect(HOUR_LABELS).toHaveLength(24);
    expect(HOUR_LABELS[0]).toBe("00:00");
    expect(HOUR_LABELS[23]).toBe("23:00");
  });
});
