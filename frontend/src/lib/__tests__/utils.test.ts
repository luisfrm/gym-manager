import { describe, expect, it } from "bun:test";
import { isEmailValid, isDateActive } from "../utils";

describe("utils", () => {
  describe("isEmailValid", () => {
    it("should validate correct emails", () => {
      expect(isEmailValid("test@example.com")).toBe(true);
      expect(isEmailValid("user.name+tag@sub.domain.co")).toBe(true);
    });

    it("should invalidate incorrect emails", () => {
      expect(isEmailValid("invalid-email")).toBe(false);
      expect(isEmailValid("another@invalid@domain.com")).toBe(false);
    });
  });

  describe("isDateActive", () => {
    it("should return true when the expiration date is in the future", () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      expect(isDateActive(futureDate)).toBe(true);
    });

    it("should return false when the expiration date is in the past", () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(isDateActive(pastDate)).toBe(false);
    });

    it("should return false when no date is provided", () => {
      expect(isDateActive(undefined)).toBe(false);
    });
  });
}); 