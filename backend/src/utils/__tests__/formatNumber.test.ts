import { describe, expect, it } from "bun:test";
import formatNumber from "../formatNumber";

describe("formatNumber", () => {
  it("should format numbers with thousand separators", () => {
    expect(formatNumber("1000")).toBe("1.000");
    expect(formatNumber("1000000")).toBe("1.000.000");
  });
}); 