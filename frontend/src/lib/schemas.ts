import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Requerido",
    })
    .email({
      message: "Invalid email format",
    }),
  password: z.string().nonempty("Requerido"),
});
