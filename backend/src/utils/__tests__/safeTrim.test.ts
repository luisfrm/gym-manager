import { describe, expect, it } from "bun:test";
import safeTrim from "../safeTrim";

describe("safeTrim", () => {
  it("should trim regular strings", () => {
    expect(safeTrim("  hello  ")).toBe("hello");
    expect(safeTrim("  world  ")).toBe("world");
    expect(safeTrim("test")).toBe("test");
  });

  it("should handle null values", () => {
    expect(safeTrim(null)).toBe("");
  });

  it("should handle undefined values", () => {
    expect(safeTrim(undefined)).toBe("");
  });

  it("should handle empty strings", () => {
    expect(safeTrim("")).toBe("");
    expect(safeTrim("   ")).toBe("");
  });

  it("should convert and trim non-string values", () => {
    expect(safeTrim(123)).toBe("123");
    expect(safeTrim(true)).toBe("true");
    expect(safeTrim(false)).toBe("false");
  });

  it("should handle numbers with spaces when converted", () => {
    // This is edge case - numbers don't have spaces but testing the conversion
    expect(safeTrim(0)).toBe("0");
    expect(safeTrim(456.78)).toBe("456.78");
  });

  it("should handle objects by converting to string", () => {
    expect(safeTrim({ test: "value" })).toBe("[object Object]");
  });

  it("should handle arrays by converting to string", () => {
    expect(safeTrim([1, 2, 3])).toBe("1,2,3");
  });
}); 