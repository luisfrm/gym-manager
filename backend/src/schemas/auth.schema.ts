import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      required_error: "Name is required.",
      invalid_type_error: "Name must be a string.",
    })
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(20, { message: "Name must be at most 20 characters long." }),
  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be a string.",
    })
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(20, { message: "Username must be at most 20 characters long." }),
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Email must be a valid email address." }),
  password: z.string({
    required_error: "Password is required.",
    invalid_type_error: "Password must be a string.",
  }),
  role: z.enum(["admin", "employee"], {
    required_error: "Role is required.",
    invalid_type_error: "Role must be a string.",
  }),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({
      message: "Invalid email format",
    }),

  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
  newPassword: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});
