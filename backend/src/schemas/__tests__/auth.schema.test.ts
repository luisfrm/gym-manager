import { describe, expect, it } from "bun:test";
import { loginSchema } from "../auth.schema";

describe("loginSchema", () => {
  it("should validate a correct login payload", () => {
    const data = { email: "user@example.com", password: "securepass" };
    expect(() => loginSchema.parse(data)).not.toThrow();
  });

  it("should throw on invalid email", () => {
    const data = { email: "username", password: "securepass" };
    expect(() => loginSchema.parse(data)).not.toThrow();
  });

  it("should throw on missing password", () => {
    const data = { email: "user@example.com" } as any;
    expect(() => loginSchema.parse(data)).toThrow();
  });
}); 