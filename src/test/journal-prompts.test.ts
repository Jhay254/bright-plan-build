import { describe, it, expect } from "vitest";
import { getRandomPrompts, getPostSessionPrompt, JOURNAL_PROMPTS } from "@/lib/journal-prompts";

describe("journal-prompts", () => {
  it("has at least 20 prompts", () => {
    expect(JOURNAL_PROMPTS.length).toBeGreaterThanOrEqual(20);
  });

  it("getRandomPrompts returns the requested count", () => {
    const prompts = getRandomPrompts(3);
    expect(prompts).toHaveLength(3);
  });

  it("getRandomPrompts excludes post-session by default", () => {
    const prompts = getRandomPrompts(50);
    prompts.forEach((p) => {
      expect(p.category).not.toBe("post-session");
    });
  });

  it("getRandomPrompts filters by category", () => {
    const prompts = getRandomPrompts(3, "gratitude");
    prompts.forEach((p) => {
      expect(p.category).toBe("gratitude");
    });
  });

  it("getPostSessionPrompt returns a post-session prompt", () => {
    const prompt = getPostSessionPrompt();
    expect(prompt.category).toBe("post-session");
    expect(prompt.text).toBeTruthy();
  });

  it("all prompts have unique IDs", () => {
    const ids = JOURNAL_PROMPTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
