0
import { z } from "zod";

export const clientSchema = z.object({
  firstName: z.string({
    required_error: "First name is required.",
    invalid_type_error: "First name must be a string.",
  }),
  lastName: z.string({
    required_error: "Last name is required.",
    invalid_type_error: "Last name must be a string.",
  }),
  email: z.string({
    required_error: "Email is required.",
    invalid_type_error: "Email must be a string.",
  }).email({
    message: "Invalid email format.",
  }),
  phone: z.string(),
  address: z.string(),
});