import { describe, expect, it } from "bun:test";

// Simple utility functions for testing components logic
const getButtonClasses = (variant: "primary" | "secondary" = "primary", disabled: boolean = false): string => {
  const baseClasses = "px-4 py-2 rounded font-medium";
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return `${baseClasses} ${variantClasses[variant]} ${disabledClasses}`.trim();
};

const validateButtonProps = (props: { 
  children?: string; 
  disabled?: boolean; 
  variant?: "primary" | "secondary" 
}): boolean => {
  if (!props.children || props.children.length === 0) return false;
  if (props.variant && !["primary", "secondary"].includes(props.variant)) return false;
  return true;
};

describe("Button Component Logic", () => {
  describe("getButtonClasses", () => {
    it("should return correct classes for primary variant", () => {
      const classes = getButtonClasses("primary", false);
      expect(classes).toContain("bg-blue-500");
      expect(classes).toContain("px-4 py-2 rounded font-medium");
      expect(classes).not.toContain("opacity-50");
    });

    it("should return correct classes for secondary variant", () => {
      const classes = getButtonClasses("secondary", false);
      expect(classes).toContain("bg-gray-500");
      expect(classes).toContain("px-4 py-2 rounded font-medium");
    });

    it("should add disabled classes when disabled", () => {
      const classes = getButtonClasses("primary", true);
      expect(classes).toContain("opacity-50");
      expect(classes).toContain("cursor-not-allowed");
    });
  });

  describe("validateButtonProps", () => {
    it("should validate correct button props", () => {
      expect(validateButtonProps({ 
        children: "Click me", 
        variant: "primary" 
      })).toBe(true);
      
      expect(validateButtonProps({ 
        children: "Test", 
        variant: "secondary", 
        disabled: true 
      })).toBe(true);
    });

    it("should invalidate incorrect button props", () => {
      expect(validateButtonProps({ 
        children: "" 
      })).toBe(false);
      
      expect(validateButtonProps({})).toBe(false);
    });
  });
}); 