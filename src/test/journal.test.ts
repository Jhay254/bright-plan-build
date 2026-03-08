import { describe, it, expect } from "vitest";
import { getMoodOption, MOOD_OPTIONS, SUGGESTED_TAGS } from "@/lib/journal";

describe("getMoodOption", () => {
  it("returns the correct mood option", () => {
    const result = getMoodOption("joyful");
    expect(result).toBeDefined();
    expect(result!.value).toBe("joyful");
    expect(result!.emoji).toBe("😊");
  });

  it("returns undefined for null", () => {
    expect(getMoodOption(null)).toBeUndefined();
  });

  it("returns undefined for non-existent mood", () => {
    // @ts-expect-error testing invalid input
    expect(getMoodOption("nonexistent")).toBeUndefined();
  });

  it("all mood options have required fields", () => {
    for (const mood of MOOD_OPTIONS) {
      expect(mood.value).toBeTruthy();
      expect(mood.emoji).toBeTruthy();
      expect(mood.label).toBeTruthy();
      expect(mood.color).toBeTruthy();
    }
  });

  it("has 8 mood options", () => {
    expect(MOOD_OPTIONS).toHaveLength(8);
  });
});

describe("SUGGESTED_TAGS", () => {
  it("is a non-empty array of strings", () => {
    expect(SUGGESTED_TAGS.length).toBeGreaterThan(0);
    SUGGESTED_TAGS.forEach((tag) => expect(typeof tag).toBe("string"));
  });
});
