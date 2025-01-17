0
import { z } from "zod";

export const clientSchema = z.object({
  firstname: z.string({
    required_error: "First name is required.",
    invalid_type_error: "First name must be a string.",
  }),
  lastname: z.string({
    required_error: "Last name is required.",
    invalid_type_error: "Last name must be a string.",
  }),
  cedula: z.string({
    required_error: "Cedula is required.",
    invalid_type_error: "Cedula must be a string.",
  }),
  email: z.string().optional(),
  phone: z.string(),
  address: z.string(),
  expiredDate: z.string({
    invalid_type_error: "Expired date must be a string.",
  }),
});