import { describe, expect, it } from "bun:test";

// Example utility functions for testing
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

describe("Format Utils", () => {
  describe("formatCurrency", () => {
    it("should format numbers as currency", () => {
      // Test that it returns a string with Euro symbol and proper decimal places
      const result1000 = formatCurrency(1000);
      const result15_5 = formatCurrency(15.5);
      const result0 = formatCurrency(0);
      
      expect(result1000).toMatch(/1[\s.]?000,00\s?€/); // Allows for different formatting
      expect(result15_5).toMatch(/15,50\s?€/);
      expect(result0).toMatch(/0,00\s?€/);
      
      // Test that all results contain the Euro symbol
      expect(result1000).toContain('€');
      expect(result15_5).toContain('€');
      expect(result0).toContain('€');
    });
  });

  describe("capitalizeFirstLetter", () => {
    it("should capitalize first letter and lowercase the rest", () => {
      expect(capitalizeFirstLetter("hello")).toBe("Hello");
      expect(capitalizeFirstLetter("WORLD")).toBe("World");
      expect(capitalizeFirstLetter("tEST")).toBe("Test");
    });

    it("should handle edge cases", () => {
      expect(capitalizeFirstLetter("")).toBe("");
      expect(capitalizeFirstLetter("a")).toBe("A");
    });
  });

  describe("truncateText", () => {
    it("should truncate long text", () => {
      expect(truncateText("This is a very long text", 10)).toBe("This is a ...");
      expect(truncateText("Short", 10)).toBe("Short");
      expect(truncateText("Exactly10!", 10)).toBe("Exactly10!");
    });
  });
}); 