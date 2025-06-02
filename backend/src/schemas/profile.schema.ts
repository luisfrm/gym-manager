import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string({
      required_error: "Username is required.",
      invalid_type_error: "Username must be a string.",
    })
    .min(2, { message: "Username must be at least 2 characters long." })
    .max(50, { message: "Username must be at most 50 characters long." }),
  email: z
    .string({
      required_error: "Email is required.",
      invalid_type_error: "Email must be a string.",
    })
    .email({ message: "Email must be a valid email address." }),
});

export const changePasswordProfileSchema = z.object({
  currentPassword: z.string({
    required_error: "Current password is required",
    invalid_type_error: "Current password must be a string",
  }),
  newPassword: z
    .string({
      required_error: "New password is required",
      invalid_type_error: "New password must be a string",
    })
    .min(6, { message: "New password must be at least 6 characters long." }),
}); 