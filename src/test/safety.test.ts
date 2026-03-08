import { describe, it, expect } from "vitest";
import { detectCrisisLanguage, EMERGENCY_RESOURCES } from "@/lib/safety";

describe("detectCrisisLanguage", () => {
  it("detects direct suicide mentions", () => {
    expect(detectCrisisLanguage("I want to kill myself")).toBe(true);
    expect(detectCrisisLanguage("thinking about suicide")).toBe(true);
  });

  it("detects desire to die", () => {
    expect(detectCrisisLanguage("I want to die")).toBe(true);
    expect(detectCrisisLanguage("I don't want to live anymore")).toBe(true);
    expect(detectCrisisLanguage("I dont want to be alive")).toBe(true);
  });

  it("detects self-harm language", () => {
    expect(detectCrisisLanguage("I've been cutting myself")).toBe(true);
    expect(detectCrisisLanguage("I want to hurt myself")).toBe(true);
    expect(detectCrisisLanguage("thinking about self-harm")).toBe(true);
  });

  it("detects planning language", () => {
    expect(detectCrisisLanguage("I'm planning to end it")).toBe(true);
    expect(detectCrisisLanguage("writing a goodbye letter")).toBe(true);
    expect(detectCrisisLanguage("better off dead")).toBe(true);
  });

  it("detects method mentions", () => {
    expect(detectCrisisLanguage("overdose on pills")).toBe(true);
    expect(detectCrisisLanguage("jump off the bridge")).toBe(true);
    expect(detectCrisisLanguage("hang myself")).toBe(true);
  });

  it("returns false for non-crisis text", () => {
    expect(detectCrisisLanguage("I'm feeling a bit sad today")).toBe(false);
    expect(detectCrisisLanguage("Work has been stressful")).toBe(false);
    expect(detectCrisisLanguage("I had a bad day")).toBe(false);
    expect(detectCrisisLanguage("")).toBe(false);
  });

  it("EMERGENCY_RESOURCES has entries", () => {
    expect(EMERGENCY_RESOURCES.length).toBeGreaterThan(0);
    expect(EMERGENCY_RESOURCES[0]).toHaveProperty("contact");
  });
});
