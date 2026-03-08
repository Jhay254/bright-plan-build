import { describe, it, expect } from "vitest";
import { generateAvatarSvg } from "@/lib/avatar";

describe("generateAvatarSvg", () => {
  it("returns a data URI string", () => {
    const result = generateAvatarSvg("test-seed");
    expect(result).toMatch(/^data:image\/svg\+xml,/);
  });

  it("is deterministic for the same seed", () => {
    const a = generateAvatarSvg("hello");
    const b = generateAvatarSvg("hello");
    expect(a).toBe(b);
  });

  it("produces different output for different seeds", () => {
    const a = generateAvatarSvg("seed-one");
    const b = generateAvatarSvg("seed-two");
    expect(a).not.toBe(b);
  });

  it("uses custom size", () => {
    const result = generateAvatarSvg("test", 120);
    expect(decodeURIComponent(result)).toContain('width="120"');
    expect(decodeURIComponent(result)).toContain('height="120"');
  });

  it("defaults to size 80", () => {
    const result = generateAvatarSvg("test");
    expect(decodeURIComponent(result)).toContain('width="80"');
  });
});
